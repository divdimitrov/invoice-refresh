export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
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

const CLIENTS_KEY = "invoice_clients";
const DOCUMENTS_KEY = "invoice_documents";

// Clients
export function getClients(): Client[] {
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || "[]");
  } catch { return []; }
}

export function saveClients(clients: Client[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function addClient(client: Client) {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
  return clients;
}

export function updateClient(client: Client) {
  const clients = getClients().map(c => c.id === client.id ? client : c);
  saveClients(clients);
  return clients;
}

export function deleteClient(id: string) {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
  // Also delete associated documents
  const docs = getDocuments().filter(d => d.clientId !== id);
  saveDocuments(docs);
  return clients;
}

// Documents
export function getDocuments(): SavedDocument[] {
  try {
    return JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || "[]");
  } catch { return []; }
}

export function saveDocuments(docs: SavedDocument[]) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function getClientDocuments(clientId: string): SavedDocument[] {
  return getDocuments().filter(d => d.clientId === clientId);
}

export function saveDocument(doc: SavedDocument) {
  const docs = getDocuments();
  const idx = docs.findIndex(d => d.id === doc.id);
  if (idx >= 0) {
    docs[idx] = doc;
  } else {
    docs.push(doc);
  }
  saveDocuments(docs);
  return docs;
}

export function deleteDocument(id: string) {
  const docs = getDocuments().filter(d => d.id !== id);
  saveDocuments(docs);
  return docs;
}

export function addVersionToDocument(docId: string, version: Omit<DocumentVersion, "version" | "savedAt">): SavedDocument | null {
  const docs = getDocuments();
  const doc = docs.find(d => d.id === docId);
  if (!doc) return null;
  
  const newVersion: DocumentVersion = {
    ...version,
    version: doc.versions.length + 1,
    savedAt: new Date().toISOString(),
  };
  doc.versions.push(newVersion);
  doc.updatedAt = new Date().toISOString();
  doc.title = `${version.docType === "protocol" ? "Протокол" : "Оферта"}${version.docNumber ? ` ${version.docNumber}` : ""}`;
  saveDocuments(docs);
  return doc;
}
