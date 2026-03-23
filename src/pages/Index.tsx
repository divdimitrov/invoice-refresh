import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientSheet } from "@/components/ClientSheet";
import { DocumentForm } from "@/components/DocumentForm";
import { SavedDocuments } from "@/components/SavedDocuments";
import { Sparkles, FileText } from "lucide-react";
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
    if (!id) {
      setSelectedClientId(null);
      setClientDocuments([]);
      setEditingDocument(null);
      return;
    }
    setSelectedClientId(id);
    setClientDocuments(getClientDocuments(id));
    setEditingDocument(null);
  };

  const handleAddClient = (clientData: Omit<Client, "id">): Client => {
    const client: Client = { ...clientData, id: crypto.randomUUID() };
    const updated = storageAddClient(client);
    setClients(updated);
    return client;
  };

  const handleAutoCreateClient = (clientData: Omit<Client, "id">): Client => {
    const client = handleAddClient(clientData);
    setSelectedClientId(client.id);
    setClientDocuments(getClientDocuments(client.id));
    return client;
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
    <div className="min-h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <ClientSheet
            clients={clients}
            selectedClient={selectedClientId}
            onSelectClient={handleSelectClient}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onEditClient={handleEditClient}
          />
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-bg">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">Фактуриране</h1>
          </div>
          <AnimatePresence>
            {selectedClient && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-medium truncate max-w-[100px]">{selectedClient.name}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-5 max-w-lg mx-auto space-y-5">
        <DocumentForm
          clients={clients}
          selectedClient={selectedClient}
          editingDocument={editingDocument}
          onClearEdit={() => setEditingDocument(null)}
          onDocumentSaved={refreshDocuments}
          onAutoCreateClient={handleAutoCreateClient}
          onSelectClient={handleSelectClient}
        />

        <AnimatePresence>
          {selectedClientId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pb-24"
            >
              <SavedDocuments
                documents={clientDocuments}
                onDocumentsChange={refreshDocuments}
                onEditDocument={handleEditDocument}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
