import { useState } from "react";
import { ClientSheet } from "@/components/ClientSheet";
import { DocumentForm } from "@/components/DocumentForm";

interface Client {
  id: string;
  name: string;
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([
    { id: "1", name: "Дени" },
  ]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleAddClient = (name: string) => {
    setClients([...clients, { id: crypto.randomUUID(), name }]);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    if (selectedClient === id) setSelectedClient(null);
  };

  const selectedClientName = clients.find((c) => c.id === selectedClient)?.name || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b">
        <div className="flex items-center gap-2 px-3 h-12">
          <ClientSheet
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
          />
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-medium text-foreground">Фактуриране</h1>
          {selectedClientName && (
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
              {selectedClientName}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-3 py-4 max-w-lg mx-auto">
        <DocumentForm selectedClientName={selectedClientName} />
      </main>
    </div>
  );
};

export default Index;
