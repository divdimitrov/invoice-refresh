import { SavedDocument, deleteDocument, deleteDocumentVersion } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Search, Filter, Archive, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportPDF, type PdfResult } from "@/lib/pdf-export";
import { PdfPreviewDialog } from "@/components/PdfPreviewDialog";
import { VersionHistorySheet } from "@/components/VersionHistorySheet";
import { toast } from "sonner";
import { useState, useMemo } from "react";

interface SavedDocumentsProps {
  documents: SavedDocument[];
  onDocumentsChange: () => void | Promise<void>;
  onEditDocument: (doc: SavedDocument, versionIndex: number) => void;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "short" });
}

export function SavedDocuments({ documents, onDocumentsChange, onEditDocument }: SavedDocumentsProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [pdfPreview, setPdfPreview] = useState<PdfResult | null>(null);
  const [historyDoc, setHistoryDoc] = useState<SavedDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; versionCount: number } | null>(null);

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

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDocument(deleteConfirm.id);
      await onDocumentsChange();
      toast.info("Документът е изтрит");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete";
      toast.error(message);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteVersion = async (docId: string, version: number) => {
    try {
      await deleteDocumentVersion(docId, version);
      await onDocumentsChange();
      // Refresh the history sheet document
      if (historyDoc && historyDoc.id === docId) {
        const updatedDoc = documents.find(d => d.id === docId);
        if (updatedDoc && updatedDoc.versions.length <= 1) {
          setHistoryDoc(null);
        }
      }
      toast.info("Версията е изтрита");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete version";
      toast.error(message);
    }
  };

  const handleExportVersion = (doc: SavedDocument, versionIdx: number) => {
    const v = doc.versions[versionIdx];
    setPdfPreview(exportPDF({
      docType: v.docType, docNumber: v.docNumber, assignor: v.assignor,
      executor: v.executor, object: v.object, startDate: v.startDate,
      endDate: v.endDate, signFor: v.signFor, signBy: v.signBy,
      protocolText: v.protocolText, products: v.products,
    }));
  };

  const closePdfPreview = () => {
    if (pdfPreview) URL.revokeObjectURL(pdfPreview.blobUrl);
    setPdfPreview(null);
  };

  // Keep historyDoc in sync with refreshed documents
  const currentHistoryDoc = historyDoc ? documents.find(d => d.id === historyDoc.id) || null : null;

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
    <>
    <Card className="card-elevated overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">Документи</h2>
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
            const docColor = latest.docType === "protocol" 
              ? "bg-accent text-accent-foreground" 
              : "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400";
            const hasHistory = doc.versions.length > 1;

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
                <div className="flex items-start gap-3 p-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 mt-0.5 ${docColor}`}>
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{doc.title || "Документ"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {latest.docType === "protocol" ? "Протокол" : "Оферта"} • {latest.docNumber}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Последна промяна: {formatShortDate(doc.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center border-t px-3 py-2 gap-1 bg-muted/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-medium flex-1"
                    onClick={() => handleExportVersion(doc, doc.versions.length - 1)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-medium flex-1"
                    onClick={() => onEditDocument(doc, doc.versions.length - 1)}
                  >
                    Промени
                  </Button>
                  {hasHistory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-xs font-medium flex-1 text-muted-foreground"
                      onClick={() => setHistoryDoc(doc)}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      История ({doc.versions.length})
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl opacity-40 hover:opacity-100 shrink-0"
                    onClick={() => setDeleteConfirm({
                      id: doc.id,
                      title: doc.title || "Документ",
                      versionCount: doc.versions.length,
                    })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>

    <VersionHistorySheet
      open={!!currentHistoryDoc}
      onClose={() => setHistoryDoc(null)}
      document={currentHistoryDoc}
      onExportVersion={handleExportVersion}
      onEditVersion={onEditDocument}
      onDeleteVersion={handleDeleteVersion}
    />

    {/* Delete document confirmation */}
    <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
      <AlertDialogContent className="rounded-2xl max-w-[340px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">Изтриване на документ</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Сигурни ли сте, че искате да изтриете <strong>"{deleteConfirm?.title}"</strong>?
            {deleteConfirm && deleteConfirm.versionCount > 1 && (
              <span className="block mt-2 text-destructive font-medium">
                ⚠️ Това ще изтрие всички {deleteConfirm.versionCount} версии на документа безвъзвратно.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Отказ</AlertDialogCancel>
          <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteConfirmed}>
            Изтрий
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {pdfPreview && (
      <PdfPreviewDialog
        open
        onClose={closePdfPreview}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
        blob={pdfPreview.blob}
      />
    )}
    </>
  );
}
