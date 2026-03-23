import { useState, useCallback } from "react";
import { ClientSheet } from "@/components/ClientSheet";
import { DocumentForm } from "@/components/DocumentForm";
import { SavedDocuments } from "@/components/SavedDocuments";
import {
  type Client, type SavedDocument,
  getClients, addClient as storageAddClient, deleteClient as storageDeleteClient, updateClient,
  getClientDocuments,
} from "@/lib/storage";

const Index = () => {
  const [clients, setClients] = useState<Client[]>(getClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDocuments, setClientDocuments] = useState<SavedDocument[]>([]);
  const [editingDocument, setEditingDocument] = useState<{ doc: SavedDocument; versionIndex: number } | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const refreshDocuments = useCallback(() => {
    if (selectedClientId) {
      setClientDocuments(getClientDocuments(selectedClientId));
    }
  }, [selectedClientId]);

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setClientDocuments(getClientDocuments(id));
    setEditingDocument(null);
  };

  const handleAddClient = (clientData: Omit<Client, "id">) => {
    const client: Client = { ...clientData, id: crypto.randomUUID() };
    const updated = storageAddClient(client);
    setClients(updated);
  };

  const handleDeleteClient = (id: string) => {
    const updated = storageDeleteClient(id);
    setClients(updated);
    if (selectedClientId === id) {
      setSelectedClientId(null);
      setClientDocuments([]);
      setEditingDocument(null);
    }
  };

  const handleEditClient = (client: Client) => {
    const updated = updateClient(client);
    setClients(updated);
  };

  const handleEditDocument = (doc: SavedDocument, versionIndex: number) => {
    setEditingDocument({ doc, versionIndex });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b">
        <div className="flex items-center gap-2 px-3 h-12">
          <ClientSheet
            clients={clients}
            selectedClient={selectedClientId}
            onSelectClient={handleSelectClient}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onEditClient={handleEditClient}
          />
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-medium text-foreground">Фактуриране</h1>
          {selectedClient && (
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
              {selectedClient.name}
            </span>
          )}
        </div>
      </header>

      <main className="px-3 py-4 max-w-lg mx-auto space-y-4">
        <DocumentForm
          selectedClient={selectedClient}
          editingDocument={editingDocument}
          onClearEdit={() => setEditingDocument(null)}
          onDocumentSaved={refreshDocuments}
        />

        {selectedClientId && (
          <div className="pb-20">
            <SavedDocuments
              documents={clientDocuments}
              onDocumentsChange={refreshDocuments}
              onEditDocument={handleEditDocument}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
