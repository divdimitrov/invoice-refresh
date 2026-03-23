import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, FileDown, Package, ClipboardList, FileText } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("details");

  // New product form
  const [newProduct, setNewProduct] = useState({ name: "", quantity: 1, unit: "бр.", price: 0 });

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    setProducts([
      ...products,
      { ...newProduct, id: crypto.randomUUID() },
    ]);
    setNewProduct({ name: "", quantity: 1, unit: "бр.", price: 0 });
    toast.success("Продуктът е добавен");
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.info("Продуктът е премахнат");
  };

  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  const handleSave = () => {
    toast.success("Документът е запазен успешно!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Нов документ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedClientName
              ? `Клиент: ${selectedClientName}`
              : "Изберете клиент от менюто вляво"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            exportPDF({
              docType, docNumber,
              assignor: assignor || selectedClientName || "",
              executor, object, startDate, endDate,
              signFor, signBy, protocolText, products,
            });
            toast.success("PDF файлът е генериран!");
          }}>
            <FileDown className="h-4 w-4" />
            Експорт PDF
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Запази
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Данни
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5">
            <Package className="h-4 w-4" />
            Продукти
            {products.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {products.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Преглед
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="animate-fade-in">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Данни за документа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип документ</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protocol">Протокол</SelectItem>
                      <SelectItem value="offer">Оферта</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Номер на документа</Label>
                  <Input placeholder="Напр. 1.2.3.4" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Възложител</Label>
                  <Input
                    placeholder="Избери/създай клиент"
                    value={assignor || selectedClientName || ""}
                    onChange={(e) => setAssignor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Изпълнител</Label>
                  <Input value={executor} onChange={(e) => setExecutor(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Обект</Label>
                <Input placeholder="Описание на обекта" value={object} onChange={(e) => setObject(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата на протокола</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Дата на завършване</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>За Възложителя</Label>
                  <Input placeholder="Име" value={signFor} onChange={(e) => setSignFor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>За Изпълнителя</Label>
                  <Input value={signBy} onChange={(e) => setSignBy(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Текст на протокола</Label>
                <Textarea
                  rows={4}
                  value={protocolText}
                  onChange={(e) => setProtocolText(e.target.value)}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="animate-fade-in">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Продукти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Add product form */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-muted/50 border border-dashed">
                <div className="md:col-span-4 space-y-1.5">
                  <Label className="text-xs">Наименование</Label>
                  <Input
                    placeholder="Име на продукта"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Количество</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Мярка</Label>
                  <Input
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Цена (лв.)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addProduct} className="w-full gap-1.5">
                    <Plus className="h-4 w-4" />
                    Добави
                  </Button>
                </div>
              </div>

              {/* Product list */}
              {products.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Няма добавени продукти</p>
                  <p className="text-xs text-muted-foreground/70">Добавете продукт чрез формата по-горе</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-4">Наименование</div>
                    <div className="col-span-2 text-right">К-во</div>
                    <div className="col-span-2 text-center">Мярка</div>
                    <div className="col-span-2 text-right">Цена</div>
                    <div className="col-span-1 text-right">Сума</div>
                    <div className="col-span-1" />
                  </div>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-lg bg-card border hover-lift animate-fade-in"
                    >
                      <div className="col-span-4 font-medium text-sm">{p.name}</div>
                      <div className="col-span-2 text-right text-sm">{p.quantity}</div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">{p.unit}</div>
                      <div className="col-span-2 text-right text-sm">{p.price.toFixed(2)} лв.</div>
                      <div className="col-span-1 text-right text-sm font-semibold">
                        {(p.quantity * p.price).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeProduct(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-end pt-3 border-t">
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">Обща сума</p>
                      <p className="text-2xl font-bold text-foreground">{total.toFixed(2)} лв.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="animate-fade-in">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Преглед на документа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-card border rounded-lg p-8 space-y-6 max-w-2xl mx-auto shadow-inner">
                <div className="text-center space-y-1 border-b pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
                    {docType === "protocol" ? "Протокол" : "Оферта"} {docNumber && `№ ${docNumber}`}
                  </h2>
                  {startDate && (
                    <p className="text-sm text-muted-foreground">
                      Дата: {new Date(startDate).toLocaleDateString("bg-BG")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Възложител</p>
                    <p className="font-medium">{assignor || selectedClientName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Изпълнител</p>
                    <p className="font-medium">{executor || "—"}</p>
                  </div>
                </div>

                {object && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase">Обект</p>
                    <p className="font-medium">{object}</p>
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {protocolText}
                </div>

                {products.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-muted-foreground font-medium">Продукти</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2">Наименование</th>
                          <th className="pb-2 text-right">К-во</th>
                          <th className="pb-2 text-center">Мярка</th>
                          <th className="pb-2 text-right">Цена</th>
                          <th className="pb-2 text-right">Сума</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="py-1.5">{p.name}</td>
                            <td className="py-1.5 text-right">{p.quantity}</td>
                            <td className="py-1.5 text-center">{p.unit}</td>
                            <td className="py-1.5 text-right">{p.price.toFixed(2)}</td>
                            <td className="py-1.5 text-right font-medium">
                              {(p.quantity * p.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right pt-2 border-t">
                      <span className="text-sm text-muted-foreground mr-2">Общо:</span>
                      <span className="font-bold">{total.toFixed(2)} лв.</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-6 border-t text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">За Възложителя</p>
                    <p className="mt-6 border-t pt-1 font-medium">{signFor || "________________"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">За Изпълнителя</p>
                    <p className="mt-6 border-t pt-1 font-medium">{signBy || "________________"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
