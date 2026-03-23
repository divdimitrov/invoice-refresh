import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, FileDown, Package } from "lucide-react";
import { toast } from "sonner";
import { exportPDF } from "@/lib/pdf-export";

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface DocumentFormProps {
  selectedClientName: string | null;
}

export function DocumentForm({ selectedClientName }: DocumentFormProps) {
  const [docType, setDocType] = useState("protocol");
  const [docNumber, setDocNumber] = useState("");
  const [assignor, setAssignor] = useState(selectedClientName || "");
  const [executor, setExecutor] = useState("Александър Строй ЕООД");
  const [object, setObject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [signFor, setSignFor] = useState("");
  const [signBy, setSignBy] = useState("Александър Караманов");
  const [protocolText, setProtocolText] = useState(
    "Днес ...................... Подписаните, представители на Възложителя - ............................................. и Александър Караманов - представител на Изпълнителя, съставиха настоящия протокол за следното:"
  );
  const [products, setProducts] = useState<Product[]>([]);

  const [newProduct, setNewProduct] = useState({ name: "", quantity: 1, unit: "бр.", price: 0 });

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

  const handleExport = () => {
    exportPDF({
      docType, docNumber,
      assignor: assignor || selectedClientName || "",
      executor, object, startDate, endDate,
      signFor, signBy, protocolText, products,
    });
    toast.success("PDF файлът е генериран!");
  };

  const handleSave = () => {
    toast.success("Документът е запазен успешно!");
  };

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Нов документ
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedClientName
            ? `Клиент: ${selectedClientName}`
            : "Изберете клиент от менюто"}
        </p>
      </div>

      {/* Section 1: Document Details */}
      <Card className="card-elevated">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base">Данни за документа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Тип документ</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protocol">Протокол</SelectItem>
                  <SelectItem value="offer">Оферта</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Номер</Label>
              <Input className="h-11" placeholder="Напр. 1.2.3.4" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Възложител</Label>
            <Input
              className="h-11"
              placeholder="Избери/създай клиент"
              value={assignor || selectedClientName || ""}
              onChange={(e) => setAssignor(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Изпълнител</Label>
            <Input className="h-11" value={executor} onChange={(e) => setExecutor(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Обект</Label>
            <Input className="h-11" placeholder="Описание на обекта" value={object} onChange={(e) => setObject(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Дата</Label>
              <Input className="h-11" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Завършване</Label>
              <Input className="h-11" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">За Възложителя</Label>
              <Input className="h-11" placeholder="Име" value={signFor} onChange={(e) => setSignFor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">За Изпълнителя</Label>
              <Input className="h-11" value={signBy} onChange={(e) => setSignBy(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Текст на протокола</Label>
            <Textarea
              rows={3}
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
              className="resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Products */}
      <Card className="card-elevated">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            Продукти
            {products.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {products.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          {/* Add product — stacked for mobile */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-dashed">
            <div className="space-y-1.5">
              <Label className="text-xs">Наименование</Label>
              <Input
                className="h-11"
                placeholder="Име на продукта"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">К-во</Label>
                <Input
                  className="h-11"
                  type="number"
                  min={1}
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Мярка</Label>
                <Input
                  className="h-11"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Цена</Label>
                <Input
                  className="h-11"
                  type="number"
                  min={0}
                  step={0.01}
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={addProduct} className="w-full h-11 gap-1.5">
              <Plus className="h-4 w-4" />
              Добави продукт
            </Button>
          </div>

          {/* Product list — card style for mobile */}
          {products.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Няма добавени продукти</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border animate-fade-in"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.quantity} {p.unit} × {p.price.toFixed(2)} лв.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{(p.quantity * p.price).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">лв.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => removeProduct(p.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t px-1">
                <p className="text-sm font-medium text-muted-foreground">Обща сума</p>
                <p className="text-xl font-bold text-foreground">{total.toFixed(2)} лв.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t p-3 flex gap-2 safe-bottom">
        <Button
          variant="outline"
          className="flex-1 h-12 gap-1.5 text-sm"
          onClick={handleExport}
        >
          <FileDown className="h-4 w-4" />
          PDF
        </Button>
        <Button
          className="flex-1 h-12 gap-1.5 text-sm"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          Запази
        </Button>
      </div>
    </div>
  );
}
