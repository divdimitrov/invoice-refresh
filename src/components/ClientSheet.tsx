import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Trash2, Users, User, Menu } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface ClientSheetProps {
  clients: Client[];
  selectedClient: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: (name: string) => void;
  onDeleteClient: (id: string) => void;
}

export function ClientSheet({
  clients,
  selectedClient,
  onSelectClient,
  onAddClient,
  onDeleteClient,
}: ClientSheetProps) {
  const [newClientName, setNewClientName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (newClientName.trim()) {
      onAddClient(newClientName.trim());
      setNewClientName("");
      setShowAdd(false);
    }
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="text-sm">Фактуриране</SheetTitle>
              <p className="text-xs text-muted-foreground">Документи & клиенти</p>
            </div>
          </div>
        </SheetHeader>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2 px-1">
            <Users className="h-3 w-3" />
            Клиенти
          </p>

          <div className="space-y-1">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelect(client.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedClient === client.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{client.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClient(client.id);
                  }}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </button>
            ))}
          </div>

          <div className="mt-3">
            {showAdd ? (
              <div className="space-y-2 animate-fade-in p-2 rounded-lg bg-muted/50">
                <Input
                  placeholder="Име на клиента"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-10"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <Button size="sm" className="flex-1 h-9" onClick={handleAdd}>
                    Добави
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9"
                    onClick={() => { setShowAdd(false); setNewClientName(""); }}
                  >
                    Откажи
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                Нов клиент
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
