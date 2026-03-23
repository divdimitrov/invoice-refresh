import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Trash2, Users, User, Menu, ChevronRight } from "lucide-react";
import { type Client } from "@/lib/storage";

interface ClientSheetProps {
  clients: Client[];
  selectedClient: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: (client: Omit<Client, "id">) => void;
  onDeleteClient: (id: string) => void;
  onEditClient: (client: Client) => void;
}

export function ClientSheet({
  clients, selectedClient, onSelectClient, onAddClient, onDeleteClient, onEditClient,
}: ClientSheetProps) {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", contactPerson: "", address: "", phone: "", email: "" });

  const resetForm = () => {
    setForm({ name: "", contactPerson: "", address: "", phone: "", email: "" });
    setShowAdd(false);
    setEditingClient(null);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAddClient({
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim() || undefined,
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    resetForm();
  };

  const handleEditSave = () => {
    if (!editingClient || !form.name.trim()) return;
    onEditClient({
      ...editingClient,
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim() || undefined,
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    resetForm();
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      contactPerson: client.contactPerson || "",
      address: client.address || "",
      phone: client.phone || "",
      email: client.email || "",
    });
    setShowAdd(false);
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    setOpen(false);
    resetForm();
  };

  const isFormOpen = showAdd || !!editingClient;

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
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

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2 px-1">
            <Users className="h-3 w-3" /> Клиенти
          </p>

          <div className="space-y-1">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  selectedClient === client.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
                onClick={() => handleSelect(client.id)}
              >
                <User className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); startEdit(client); }}>
                  <span className="truncate block">{client.name}</span>
                  {client.contactPerson && (
                    <span className="text-[10px] text-muted-foreground block">{client.contactPerson}</span>
                  )}
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" onClick={(e) => { e.stopPropagation(); startEdit(client); }} />
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {/* Add/Edit form */}
          <div className="mt-3">
            {isFormOpen ? (
              <div className="space-y-2 animate-fade-in p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs font-medium text-foreground">
                  {editingClient ? "Редакция на клиент" : "Нов клиент"}
                </p>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Име *</Label>
                  <Input className="h-9 text-sm" placeholder="Име на клиента" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && (editingClient ? handleEditSave() : handleAdd())}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Лице за контакт</Label>
                  <Input className="h-9 text-sm" placeholder="Име на представител" value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Адрес</Label>
                  <Input className="h-9 text-sm" placeholder="Адрес" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px]">Телефон</Label>
                    <Input className="h-9 text-sm" placeholder="Тел." value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px]">Имейл</Label>
                    <Input className="h-9 text-sm" placeholder="Email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button size="sm" className="flex-1 h-9" onClick={editingClient ? handleEditSave : handleAdd}>
                    {editingClient ? "Запази" : "Добави"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9" onClick={resetForm}>
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
