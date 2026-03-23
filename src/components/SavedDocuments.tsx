import { SavedDocument, deleteDocument } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Edit, Trash2, FileDown, Clock, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
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
      docType: v.docType,
      docNumber: v.docNumber,
      assignor: v.assignor,
      executor: v.executor,
      object: v.object,
      startDate: v.startDate,
      endDate: v.endDate,
      signFor: v.signFor,
      signBy: v.signBy,
      protocolText: v.protocolText,
      products: v.products,
    });
    toast.success("PDF е генериран");
  };

  if (documents.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Няма запазени документи</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base flex items-center gap-2">
          Запазени документи
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {documents.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 pl-8 text-sm"
              placeholder="Търси по име, номер, обект..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[110px] text-sm">
              <Filter className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="protocol">Протокол</SelectItem>
              <SelectItem value="offer">Оферта</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Няма намерени документи</p>
        ) : filtered.map((doc) => {
          const latest = doc.versions[doc.versions.length - 1];
          const isExpanded = expandedDoc === doc.id;
          
          return (
            <div key={doc.id} className="rounded-lg border bg-card overflow-hidden">
              {/* Main row */}
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shrink-0">
                  <FileText className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title || "Документ"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    v{latest.version} • {new Date(doc.updatedAt).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleExportVersion(doc, doc.versions.length - 1)}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditDocument(doc, doc.versions.length - 1)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {doc.versions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Version history */}
              {isExpanded && (
                <div className="border-t bg-muted/30 px-3 py-2 space-y-1 animate-fade-in">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" /> Версии
                  </p>
                  {doc.versions.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-muted/50">
                      <span className="font-medium">v{v.version}</span>
                      <span className="text-muted-foreground flex-1">
                        {new Date(v.savedAt).toLocaleString("bg-BG")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleExportVersion(doc, idx)}
                      >
                        <FileDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEditDocument(doc, idx)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
