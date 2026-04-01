import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Trash2, Users, User, Menu, ChevronRight, Building2 } from "lucide-react";
import { type Client } from "@/lib/storage";

interface ClientSheetProps {
  clients: Client[];
  selectedClient: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: (client: Omit<Client, "id">) => void | Promise<void> | Promise<Client>;
  onDeleteClient: (id: string) => void | Promise<void>;
  onEditClient: (client: Client) => void | Promise<void>;
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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-bg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">Фактуриране</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Документи & клиенти</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5 mb-3 px-1">
            <Users className="h-3 w-3" /> Клиенти
          </p>

          <div className="space-y-1.5">
            <AnimatePresence>
              {clients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                    selectedClient === client.id
                      ? "bg-accent border border-primary/20 shadow-sm"
                      : "hover:bg-muted/60 border border-transparent"
                  }`}
                  onClick={() => handleSelect(client.id)}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    selectedClient === client.id ? "gradient-bg" : "bg-muted"
                  }`}>
                    <Building2 className={`h-4 w-4 ${selectedClient === client.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); startEdit(client); }}>
                    <span className={`truncate block font-medium ${selectedClient === client.id ? "text-accent-foreground" : ""}`}>{client.name}</span>
                    {client.contactPerson && (
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{client.contactPerson}</span>
                    )}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" onClick={(e) => { e.stopPropagation(); startEdit(client); }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-40 hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add/Edit form */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {isFormOpen ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2.5 p-4 rounded-2xl bg-accent/50 border border-primary/10">
                    <p className="text-xs font-semibold text-foreground">
                      {editingClient ? "Редакция на клиент" : "Нов клиент"}
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-medium text-muted-foreground">Име *</Label>
                      <Input className="h-10 rounded-xl bg-card border-transparent text-sm" placeholder="Име на клиента" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && (editingClient ? handleEditSave() : handleAdd())}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-medium text-muted-foreground">Лице за контакт</Label>
                      <Input className="h-10 rounded-xl bg-card border-transparent text-sm" placeholder="Представител" value={form.contactPerson}
                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-medium text-muted-foreground">Адрес</Label>
                      <Input className="h-10 rounded-xl bg-card border-transparent text-sm" placeholder="Адрес" value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-medium text-muted-foreground">Телефон</Label>
                        <Input className="h-10 rounded-xl bg-card border-transparent text-sm" placeholder="Тел." value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-medium text-muted-foreground">Имейл</Label>
                        <Input className="h-10 rounded-xl bg-card border-transparent text-sm" placeholder="Email" value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 h-10 rounded-xl gradient-bg" onClick={editingClient ? handleEditSave : handleAdd}>
                        {editingClient ? "Запази" : "Добави"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-10 rounded-xl" onClick={resetForm}>
                        Откажи
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAdd(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-dashed border-primary/20"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Нов клиент</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
