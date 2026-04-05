import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientSheet } from "@/components/ClientSheet";
import { DocumentForm } from "@/components/DocumentForm";
import { SavedDocuments } from "@/components/SavedDocuments";
import { ChangePinDialog } from "@/components/ChangePinDialog";
import { Sparkles, FileText, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  type Client, type SavedDocument,
  getClients, addClient as storageAddClient, deleteClient as storageDeleteClient, updateClient,
  getClientDocuments,
} from "@/lib/storage";

const Index = () => {
  const { logout } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDocuments, setClientDocuments] = useState<SavedDocument[]>([]);
  const [editingDocument, setEditingDocument] = useState<{ doc: SavedDocument; versionIndex: number } | null>(null);
  const [changePinOpen, setChangePinOpen] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  useEffect(() => {
    (async () => {
      try {
        const loaded = await getClients();
        setClients(loaded);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load clients";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshDocuments = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      const docs = await getClientDocuments(selectedClientId);
      setClientDocuments(docs);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load documents";
      toast.error(message);
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
    (async () => {
      try {
        const docs = await getClientDocuments(id);
        setClientDocuments(docs);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load documents";
        toast.error(message);
      }
    })();
    setEditingDocument(null);
  };

  const handleAddClient = async (clientData: Omit<Client, "id">): Promise<Client> => {
    const client: Client = { ...clientData, id: crypto.randomUUID() };
    try {
      const updated = await storageAddClient(client);
      setClients(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add client";
      toast.error(message);
      throw e;
    }
    return client;
  };

  const handleAutoCreateClient = async (clientData: Omit<Client, "id">): Promise<Client> => {
    const client = await handleAddClient(clientData);
    setSelectedClientId(client.id);
    try {
      const docs = await getClientDocuments(client.id);
      setClientDocuments(docs);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load documents";
      toast.error(message);
    }
    return client;
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const updated = await storageDeleteClient(id);
      setClients(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete client";
      toast.error(message);
      return;
    }
    if (selectedClientId === id) {
      setSelectedClientId(null);
      setClientDocuments([]);
      setEditingDocument(null);
    }
  };

  const handleEditClient = async (client: Client) => {
    try {
      const updated = await updateClient(client);
      setClients(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update client";
      toast.error(message);
    }
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
          <div className="flex items-center gap-1.5">
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
            <button
              onClick={() => setChangePinOpen(true)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              title="Смяна на PIN"
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={logout}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
              title="Изход"
            >
              <LogOut className="h-4 w-4 text-destructive" />
            </button>
          </div>
        </div>
      </header>

      <ChangePinDialog open={changePinOpen} onOpenChange={setChangePinOpen} />

      {/* Content */}
      <main className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
        <>
        <DocumentForm
          clients={clients}
          selectedClient={selectedClient}
          editingDocument={editingDocument}
          onClearEdit={() => setEditingDocument(null)}
          onDocumentSaved={refreshDocuments}
          onAutoCreateClient={handleAutoCreateClient}
          onSelectClient={handleSelectClient}
          onEditClient={handleEditClient}
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
        </>
        )}
      </main>
    </div>
  );
};

export default Index;
