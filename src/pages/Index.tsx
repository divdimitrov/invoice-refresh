import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvoiceSidebar } from "@/components/InvoiceSidebar";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <InvoiceSidebar
          clients={clients}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          onAddClient={handleAddClient}
          onDeleteClient={handleDeleteClient}
        />

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 gap-3 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-medium text-muted-foreground">Фактуриране</h1>
          </header>

          <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto">
            <DocumentForm selectedClientName={selectedClientName} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
