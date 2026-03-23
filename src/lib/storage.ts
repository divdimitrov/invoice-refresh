import { supabase } from "@/lib/supabase";

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  representatives?: string[];
  address?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface DocumentVersion {
  version: number;
  savedAt: string;
  docType: string;
  docNumber: string;
  assignor: string;
  executor: string;
  object: string;
  startDate: string;
  endDate: string;
  signFor: string;
  signBy: string;
  protocolText: string;
  products: Product[];
}

export interface SavedDocument {
  id: string;
  clientId: string;
  title: string;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

type DbClientRow = {
  id: string;
  name: string;
  contact_person: string | null;
  representatives: string[] | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

type DbDocumentRow = {
  id: string;
  client_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type DbVersionRow = {
  id: string;
  document_id: string;
  version: number;
  saved_at: string;
  data: Record<string, unknown>;
  created_at: string;
};

function mapClient(row: DbClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || undefined,
    representatives: row.representatives || undefined,
    address: row.address || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
  };
}

function mapVersion(row: DbVersionRow): DocumentVersion {
  const data = row.data as Partial<Omit<DocumentVersion, "version" | "savedAt">>;
  return {
    version: row.version,
    savedAt: row.saved_at,
    docType: data.docType || "protocol",
    docNumber: data.docNumber || "",
    assignor: data.assignor || "",
    executor: data.executor || "",
    object: data.object || "",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    signFor: data.signFor || "",
    signBy: data.signBy || "",
    protocolText: data.protocolText || "",
    products: (data.products as Product[]) || [],
  };
}

function titleFromVersion(v: Pick<DocumentVersion, "docType" | "docNumber">) {
  return `${v.docType === "protocol" ? "Протокол" : "Оферта"}${v.docNumber ? ` ${v.docNumber}` : ""}`;
}

function versionDataPayload(v: Omit<DocumentVersion, "version" | "savedAt">) {
  return {
    docType: v.docType,
    docNumber: v.docNumber,
    assignor: v.assignor,
    executor: v.executor,
    object: v.object,
    startDate: v.startDate,
    endDate: v.endDate,
    signFor: v.signFor,
    signBy: v.signBy,
    protocolText: v.protocolText,
    products: v.products,
  };
}

async function requireOk<T>(
  p: Promise<{ data: T | null; error: { message: string } | null }>,
  context: string
): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(`${context}: ${error.message}`);
  if (data === null) throw new Error(`${context}: empty response`);
  return data;
}

async function requireNoError(
  p: Promise<{ error: { message: string } | null }>,
  context: string
): Promise<void> {
  const { error } = await p;
  if (error) throw new Error(`${context}: ${error.message}`);
}

// Clients
export async function getClients(): Promise<Client[]> {
  const data = await requireOk(
    supabase.from("clients").select("*").order("created_at", { ascending: true }),
    "getClients"
  );
  return (data as DbClientRow[]).map(mapClient);
}

export async function addClient(client: Client): Promise<Client[]> {
  await requireNoError(
    supabase.from("clients").insert({
      id: client.id,
      name: client.name,
      contact_person: client.contactPerson ?? null,
      representatives: client.representatives ?? [],
      address: client.address ?? null,
      phone: client.phone ?? null,
      email: client.email ?? null,
    }),
    "addClient"
  );
  return getClients();
}

export async function updateClient(client: Client): Promise<Client[]> {
  await requireNoError(
    supabase
      .from("clients")
      .update({
        name: client.name,
        contact_person: client.contactPerson ?? null,
        representatives: client.representatives ?? [],
        address: client.address ?? null,
        phone: client.phone ?? null,
        email: client.email ?? null,
      })
      .eq("id", client.id),
    "updateClient"
  );
  return getClients();
}

export async function deleteClient(id: string): Promise<Client[]> {
  await requireNoError(supabase.from("clients").delete().eq("id", id), "deleteClient");
  return getClients();
}

// Documents
export async function getClientDocuments(clientId: string): Promise<SavedDocument[]> {
  // Single round-trip: fetch documents with nested versions via Supabase relation query
  const rows = await requireOk(
    supabase
      .from("documents")
      .select("*, document_versions(*)")
      .eq("client_id", clientId)
      .order("updated_at", { ascending: false }),
    "getClientDocuments"
  );

  type DocWithVersions = DbDocumentRow & { document_versions: DbVersionRow[] };
  const docRows = rows as DocWithVersions[];

  return docRows.map((d) => {
    const sortedVersions = [...d.document_versions]
      .sort((a, b) => a.version - b.version)
      .map(mapVersion);
    return {
      id: d.id,
      clientId: d.client_id,
      title: d.title,
      versions: sortedVersions,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  });
}

export async function saveDocument(doc: SavedDocument): Promise<void> {
  await requireNoError(
    supabase.from("documents").insert({
      id: doc.id,
      client_id: doc.clientId,
      title: doc.title,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt,
    }),
    "saveDocument.documents"
  );

  const versionsToInsert = doc.versions.map((v) => ({
    document_id: doc.id,
    version: v.version,
    saved_at: v.savedAt,
    data: versionDataPayload(v),
  }));

  await requireNoError(
    supabase.from("document_versions").insert(versionsToInsert),
    "saveDocument.versions"
  );
}

export async function deleteDocument(id: string): Promise<void> {
  await requireNoError(supabase.from("documents").delete().eq("id", id), "deleteDocument");
}

export async function addVersionToDocument(
  docId: string,
  version: Omit<DocumentVersion, "version" | "savedAt">
): Promise<{ newVersionNumber: number } | null> {
  const newTitle = titleFromVersion(version);

  // Atomic: version numbering + insert + title update all happen inside Postgres
  const { data, error } = await supabase.rpc("add_document_version", {
    p_document_id: docId,
    p_data: versionDataPayload(version),
    p_title: newTitle,
  });

  if (error) throw new Error(`addVersionToDocument: ${error.message}`);
  const nextVersion = data as number;
  return { newVersionNumber: nextVersion };
}
