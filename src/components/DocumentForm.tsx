import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Package, X, FileText, Briefcase, Calendar, Users, ShoppingBag, Search, UserPlus, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { exportPDF } from "@/lib/pdf-export";
import { type Client, type Product, type SavedDocument, saveDocument, addVersionToDocument } from "@/lib/storage";

interface DocumentFormProps {
  clients: Client[];
  selectedClient: Client | null;
  editingDocument: { doc: SavedDocument; versionIndex: number } | null;
  onClearEdit: () => void;
  onDocumentSaved: () => void;
  onAutoCreateClient: (clientData: Omit<Client, "id">) => Client;
  onSelectClient: (id: string) => void;
}

export function DocumentForm({ clients, selectedClient, editingDocument, onClearEdit, onDocumentSaved, onAutoCreateClient, onSelectClient }: DocumentFormProps) {
  const [docType, setDocType] = useState("protocol");
  const [docNumber, setDocNumber] = useState("");
  const [assignor, setAssignor] = useState("");
  const [executor, setExecutor] = useState("Александър Строй ЕООД");
  const [object, setObject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [signFor, setSignFor] = useState("");
  const [signBy, setSignBy] = useState("Александър Караманов");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const generateProtocolText = (date: string, signForName: string, endDateStr: string) => {
    const dateFormatted = date ? new Date(date).toLocaleDateString("bg-BG") : "......................";
    const endDateFormatted = endDateStr ? new Date(endDateStr).toLocaleDateString("bg-BG") : "......................";
    const signForStr = signForName || ".............................................";
    return `Днес ${dateFormatted} Подписаните, представители на Възложителя - ${signForStr} и Александър Караманов - представител на Изпълнителя, след проверка на място установихме, че към ${endDateFormatted} са извършени и подлежат на заплащане въз основа на този протокол, следните натурални видове строително и монтажни работи`;
  };

  const [protocolText, setProtocolText] = useState(() => generateProtocolText("", "", ""));
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", quantity: "" as string | number, unit: "", price: "" as string | number });

  useEffect(() => {
    if (selectedClient && !editingDocument) {
      setAssignor(selectedClient.name);
      setSignFor(selectedClient.contactPerson || "");
      setClientSearch(selectedClient.name);
    }
  }, [selectedClient, editingDocument]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-update protocol text when relevant fields change (only for new docs)
  useEffect(() => {
    if (!editingDocument && docType === "protocol") {
      setProtocolText(generateProtocolText(startDate, signFor, endDate));
    }
  }, [startDate, endDate, signFor, docType, editingDocument]);

  useEffect(() => {
    if (editingDocument) {
      const v = editingDocument.doc.versions[editingDocument.versionIndex];
      setDocType(v.docType);
      setDocNumber(v.docNumber);
      setAssignor(v.assignor);
      setExecutor(v.executor);
      setObject(v.object);
      setStartDate(v.startDate);
      setEndDate(v.endDate);
      setSignFor(v.signFor);
      setSignBy(v.signBy);
      setProtocolText(v.protocolText);
      setProducts(v.products.map(p => ({ ...p })));
    }
  }, [editingDocument]);

  const addProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error("Моля, въведете име на продукта");
      return;
    }
    const qty = Number(newProduct.quantity);
    const prc = Number(newProduct.price);
    if (!qty || qty <= 0) {
      toast.error("Моля, въведете количество");
      return;
    }
    if (!newProduct.unit.trim()) {
      toast.error("Моля, въведете мярка");
      return;
    }
    if (!prc || prc <= 0) {
      toast.error("Моля, въведете цена");
      return;
    }
    setProducts([...products, { name: newProduct.name, quantity: qty, unit: newProduct.unit, price: prc, id: crypto.randomUUID() }]);
    setNewProduct({ name: "", quantity: "", unit: "", price: "" });
    toast.success("Продуктът е добавен");
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.info("Продуктът е премахнат");
  };

  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  const getVersionData = () => ({
    docType, docNumber, assignor, executor, object,
    startDate, endDate, signFor, signBy, protocolText, products,
  });

  const handleExport = () => {
    if (!docNumber.trim()) {
      toast.error("Моля, въведете номер на документа");
      return;
    }
    exportPDF(getVersionData());
    toast.success("PDF файлът е генериран!");
  };

  const resetForm = () => {
    setDocType("protocol");
    setDocNumber("");
    setAssignor(selectedClient?.name || "");
    setClientSearch(selectedClient?.name || "");
    setExecutor("Александър Строй ЕООД");
    setObject("");
    setStartDate("");
    setEndDate("");
    setSignFor(selectedClient?.contactPerson || "");
    setSignBy("Александър Караманов");
    setProtocolText(generateProtocolText("", selectedClient?.contactPerson || "", ""));
    setProducts([]);
    onClearEdit();
  };

  const handleSave = () => {
    if (!docNumber.trim()) {
      toast.error("Моля, въведете номер на документа");
      return;
    }
    let currentClient = selectedClient;
    
    // Auto-create client if no client selected but assignor is filled
    if (!currentClient && assignor.trim()) {
      currentClient = onAutoCreateClient({
        name: assignor.trim(),
        contactPerson: signFor.trim() || undefined,
      });
      toast.success(`Клиентът "${assignor.trim()}" е създаден автоматично`);
    }
    
    if (!currentClient) {
      toast.error("Моля, изберете клиент или въведете Възложител");
      return;
    }
    const versionData = getVersionData();
    if (editingDocument) {
      addVersionToDocument(editingDocument.doc.id, versionData);
      toast.success(`Нова версия v${editingDocument.doc.versions.length + 1} е запазена!`);
      onClearEdit();
    } else {
      const now = new Date().toISOString();
      saveDocument({
        id: crypto.randomUUID(),
        clientId: currentClient.id,
        title: `${docType === "protocol" ? "Протокол" : "Оферта"}${docNumber ? ` ${docNumber}` : ""}`,
        versions: [{ ...versionData, version: 1, savedAt: now }],
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Документът е запазен!");
    }
    onDocumentSaved();
    resetForm();
  };

  const isEditing = !!editingDocument;

  return (
    <div className="space-y-5 pb-28">
      {/* Active client banner */}
      <AnimatePresence>
        {selectedClient && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-primary-foreground font-bold text-sm shrink-0">
              {selectedClient.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{selectedClient.name}</p>
              {selectedClient.contactPerson && (
                <p className="text-xs text-muted-foreground truncate">{selectedClient.contactPerson}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-9 gap-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onSelectClient("");
                setClientSearch("");
                setAssignor("");
                setSignFor("");
                setDocType("protocol");
                setDocNumber("");
                setExecutor("Александър Строй ЕООД");
                setObject("");
                setStartDate("");
                setEndDate("");
                setSignBy("Александър Караманов");
                setProtocolText(generateProtocolText("", "", ""));
                setProducts([]);
                onClearEdit();
                toast.info("Клиентът е премахнат от формата");
              }}
            >
              <X className="h-3.5 w-3.5" />
              Смени
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? "Редакция" : "Нов документ"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  v{editingDocument.doc.versions[editingDocument.versionIndex].version} → v{editingDocument.doc.versions.length + 1}
                </span>
              : selectedClient
                ? "Попълнете данните по-долу"
                : "Изберете или създайте клиент"}
          </p>
        </div>
        {isEditing && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-destructive/10" onClick={resetForm}>
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Document Details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="card-elevated overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-bg">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">Данни за документа</h2>
          </div>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Тип документ</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30 transition-colors"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protocol">Протокол</SelectItem>
                    <SelectItem value="offer">Оферта</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Номер <span className="text-destructive">*</span></Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Напр. 1.2.3.4" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
              </div>
            </div>

            {/* Client Picker */}
            <div className="space-y-1.5" ref={clientSearchRef}>
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />Клиент / Възложител
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <Input
                  className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30 pl-9"
                  placeholder="Търси или въведи нов клиент..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setAssignor(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                />
                {selectedClient && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-destructive/10"
                    onClick={() => {
                      setClientSearch("");
                      setAssignor("");
                      setSignFor("");
                      onSelectClient("");
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <AnimatePresence>
                {showClientDropdown && clientSearch.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-20 mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden"
                  >
                    {(() => {
                      const filtered = clients.filter(c =>
                        c.name.toLowerCase().includes(clientSearch.toLowerCase())
                      );
                      const exactMatch = clients.some(c => c.name.toLowerCase() === clientSearch.toLowerCase());
                      return (
                        <div className="max-h-48 overflow-y-auto">
                          {filtered.map(c => (
                            <button
                              key={c.id}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/60 transition-colors ${
                                selectedClient?.id === c.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => {
                                onSelectClient(c.id);
                                setClientSearch(c.name);
                                setAssignor(c.name);
                                setSignFor(c.contactPerson || "");
                                setShowClientDropdown(false);
                              }}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                                {c.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                {c.contactPerson && (
                                  <p className="text-xs text-muted-foreground truncate">{c.contactPerson}</p>
                                )}
                              </div>
                              {selectedClient?.id === c.id && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                          {!exactMatch && clientSearch.trim() && (
                            <button
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/60 transition-colors border-t"
                              onClick={() => {
                                const newClient = onAutoCreateClient({ name: clientSearch.trim() });
                                setAssignor(newClient.name);
                                setClientSearch(newClient.name);
                                setShowClientDropdown(false);
                                toast.success(`Клиентът "${newClient.name}" е създаден`);
                              }}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg shrink-0">
                                <UserPlus className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Създай „{clientSearch.trim()}"</p>
                                <p className="text-xs text-muted-foreground">Нов клиент</p>
                              </div>
                            </button>
                          )}
                          {filtered.length === 0 && exactMatch && (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center">Няма резултати</div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />Възложител (за PDF)</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Име във документа" value={assignor} onChange={(e) => setAssignor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />Изпълнител</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" value={executor} onChange={(e) => setExecutor(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Обект</Label>
              <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Описание на обекта" value={object} onChange={(e) => setObject(e.target.value)} />
            </div>

            {docType === "protocol" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Начало</Label>
                  <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Завършване</Label>
                  <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Дата на офертата</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />За Възложителя</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Име" value={signFor} onChange={(e) => setSignFor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />За Изпълнителя</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" value={signBy} onChange={(e) => setSignBy(e.target.value)} />
              </div>
            </div>

            {docType === "protocol" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Текст на протокола</Label>
                <Textarea rows={8} value={protocolText} onChange={(e) => setProtocolText(e.target.value)} className="resize-y text-sm rounded-xl bg-muted/40 border-transparent focus:border-primary/30 min-h-[120px]" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Products */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="card-elevated overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
                <ShoppingBag className="h-4 w-4 text-accent-foreground" />
              </div>
              <h2 className="text-[15px] font-semibold text-foreground">Продукти</h2>
              {products.length > 0 && (
                <span className="text-xs text-muted-foreground font-medium">({products.length})</span>
              )}
            </div>
          </div>
          <CardContent className="space-y-4 px-5 pb-5">
            {/* Add product form */}
            <div className="space-y-3 p-4 rounded-2xl bg-accent/50 border border-dashed border-primary/20">
              <Input className="h-12 rounded-xl bg-card border-transparent focus:border-primary/30" placeholder="Име на продукта" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addProduct()} />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">К-во <span className="text-destructive">*</span></Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" type="number" min={1} placeholder="0" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Мярка <span className="text-destructive">*</span></Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" placeholder="бр." value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Цена <span className="text-destructive">*</span></Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" type="number" min={0} step={0.01} placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
              </div>
              <Button onClick={addProduct} className="w-full h-12 gap-2 rounded-xl gradient-bg hover:opacity-90 transition-opacity text-sm font-semibold">
                <Plus className="h-4 w-4" />
                Добави продукт
              </Button>
            </div>

            {/* Product list */}
            <AnimatePresence mode="popLayout">
              {products.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 space-y-3"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                    <Package className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">Няма добавени продукти</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-transparent hover:border-primary/10 hover:bg-muted/50 transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shrink-0 text-sm font-bold text-accent-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.quantity} {p.unit} × {p.price.toFixed(2)} €</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{(p.quantity * p.price).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">€</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => removeProduct(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </motion.div>
                  ))}

                  {/* Total */}
                  <motion.div layout className="flex justify-between items-center pt-4 mt-2 border-t border-dashed px-1">
                    <p className="text-sm font-medium text-muted-foreground">Обща сума</p>
                    <p className="text-2xl font-bold gradient-text">{total.toFixed(2)} €</p>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-bottom">
        <div className="max-w-lg mx-auto p-3 flex gap-2">
          <Button variant="ghost" size="icon" className="h-13 w-13 shrink-0 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" onClick={() => { resetForm(); toast.info("Формата е нулирана"); }} title="Нулирай всичко">
            <RotateCcw className="h-4.5 w-4.5" />
          </Button>
          <Button className="flex-1 h-13 gap-2 rounded-xl text-sm font-semibold gradient-bg hover:opacity-90 transition-opacity glow" onClick={handleSave}>
            <Save className="h-4.5 w-4.5" />
            {isEditing ? `Запази v${editingDocument.doc.versions.length + 1}` : "Запази"}
          </Button>
        </div>
      </div>
    </div>
  );
}
