import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, FileDown, Package, X, FileText, Briefcase, Calendar, Users, ShoppingBag, Search, UserPlus, Check } from "lucide-react";
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
  const generateProtocolText = (date: string, signForName: string) => {
    const dateStr = date ? new Date(date).toLocaleDateString("bg-BG") : "......................";
    const signForStr = signForName || ".............................................";
    return `Днес ${dateStr} Подписаните, ${signForStr} - представител на Възложителя и Александър Караманов - представител на Изпълнителя, съставиха настоящия протокол за следното:`;
  };

  const [protocolText, setProtocolText] = useState(() => generateProtocolText("", ""));
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", quantity: 1, unit: "бр.", price: 0 });

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
      setProtocolText(generateProtocolText(startDate, signFor));
    }
  }, [startDate, signFor, docType, editingDocument]);

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
    if (!newProduct.name.trim()) return;
    setProducts([...products, { ...newProduct, id: crypto.randomUUID() }]);
    setNewProduct({ name: "", quantity: 1, unit: "бр.", price: 0 });
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
    exportPDF(getVersionData());
    toast.success("PDF файлът е генериран!");
  };

  const resetForm = () => {
    setDocType("protocol");
    setDocNumber("");
    setAssignor(selectedClient?.name || "");
    setExecutor("Александър Строй ЕООД");
    setObject("");
    setStartDate("");
    setEndDate("");
    setSignFor(selectedClient?.contactPerson || "");
    setSignBy("Александър Караманов");
    setProtocolText(generateProtocolText("", selectedClient?.contactPerson || ""));
    setProducts([]);
    onClearEdit();
  };

  const handleSave = () => {
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
                ? `Клиент: ${selectedClient.name}`
                : "Изберете клиент от менюто"}
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
                <Label className="text-xs font-medium text-muted-foreground">Номер</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Напр. 1.2.3.4" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />Възложител</Label>
                <Input className="h-12 rounded-xl bg-muted/40 border-transparent focus:border-primary/30" placeholder="Име на клиента" value={assignor} onChange={(e) => setAssignor(e.target.value)} />
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
                <Textarea rows={4} value={protocolText} onChange={(e) => setProtocolText(e.target.value)} className="resize-none text-sm rounded-xl bg-muted/40 border-transparent focus:border-primary/30" />
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
            </div>
            {products.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full gradient-bg text-primary-foreground text-xs font-bold"
              >
                {products.length}
              </motion.span>
            )}
          </div>
          <CardContent className="space-y-4 px-5 pb-5">
            {/* Add product form */}
            <div className="space-y-3 p-4 rounded-2xl bg-accent/50 border border-dashed border-primary/20">
              <Input className="h-12 rounded-xl bg-card border-transparent focus:border-primary/30" placeholder="Име на продукта" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addProduct()} />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">К-во</Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" type="number" min={1} value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Мярка</Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Цена</Label>
                  <Input className="h-11 rounded-xl bg-card border-transparent text-center" type="number" min={0} step={0.01} value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
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
        <div className="max-w-lg mx-auto p-3 flex gap-2.5">
          <Button variant="outline" className="flex-1 h-13 gap-2 rounded-xl text-sm font-semibold border-primary/20 hover:bg-accent" onClick={handleExport}>
            <FileDown className="h-4.5 w-4.5" />
            Експорт PDF
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
