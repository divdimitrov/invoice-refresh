import { SavedDocument, deleteDocument } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Clock, ChevronDown, Search, Filter, Archive } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import { useState, useMemo } from "react";

interface SavedDocumentsProps {
  documents: SavedDocument[];
  onDocumentsChange: () => void;
  onEditDocument: (doc: SavedDocument, versionIndex: number) => void;
}

export function SavedDocuments({ documents, onDocumentsChange, onEditDocument }: SavedDocumentsProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const latest = doc.versions[doc.versions.length - 1];
      const matchesSearch = !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        latest.docNumber.toLowerCase().includes(search.toLowerCase()) ||
        latest.object.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || latest.docType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);

  const handleDelete = (id: string) => {
    deleteDocument(id);
    onDocumentsChange();
    toast.info("Документът е изтрит");
  };

  const handleExportVersion = (doc: SavedDocument, versionIdx: number) => {
    const v = doc.versions[versionIdx];
    exportPDF({
      docType: v.docType, docNumber: v.docNumber, assignor: v.assignor,
      executor: v.executor, object: v.object, startDate: v.startDate,
      endDate: v.endDate, signFor: v.signFor, signBy: v.signBy,
      protocolText: v.protocolText, products: v.products,
    });
    toast.success("PDF е генериран");
  };

  if (documents.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-3">
            <Archive className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">Няма запазени документи</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Запазете документ, за да се появи тук</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">Документи</h2>
          <span className="text-xs text-muted-foreground font-medium">({documents.length})</span>
        </div>
      </div>
      <CardContent className="px-5 pb-5 space-y-3">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-10 pl-9 rounded-xl bg-muted/40 border-transparent focus:border-primary/30 text-sm"
              placeholder="Търси..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[100px] rounded-xl bg-muted/40 border-transparent text-sm">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="protocol">Протокол</SelectItem>
              <SelectItem value="offer">Оферта</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground text-center py-6"
            >
              Няма намерени документи
            </motion.p>
          ) : filtered.map((doc, i) => {
            const latest = doc.versions[doc.versions.length - 1];
            const isExpanded = expandedDoc === doc.id;
            const docColor = latest.docType === "protocol" ? "bg-accent text-accent-foreground" : "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400";

            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="rounded-xl border bg-card overflow-hidden hover:border-primary/10 transition-colors"
              >
                <div className="flex items-center gap-3 p-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${docColor}`}>
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{doc.title || "Документ"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        v{latest.version}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.updatedAt).toLocaleDateString("bg-BG")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-medium gap-1" onClick={() => handleExportVersion(doc, doc.versions.length - 1)}>
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-medium gap-1" onClick={() => onEditDocument(doc, doc.versions.length - 1)}>
                      Промени
                    </Button>
                    {doc.versions.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-50 hover:opacity-100" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t bg-muted/20 px-4 py-3 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                          <Clock className="h-3 w-3" /> История на версиите
                        </p>
                        {doc.versions.map((v, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs py-2 px-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                            <span className="font-bold text-foreground">v{v.version}</span>
                            <span className="text-muted-foreground flex-1">
                              {new Date(v.savedAt).toLocaleString("bg-BG")}
                            </span>
                            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-[11px] font-medium" onClick={() => handleExportVersion(doc, idx)}>
                              PDF
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-[11px] font-medium" onClick={() => onEditDocument(doc, idx)}>
                              Промени
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
