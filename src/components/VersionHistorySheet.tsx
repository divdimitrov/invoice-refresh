import { SavedDocument } from "@/lib/storage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface VersionHistorySheetProps {
  open: boolean;
  onClose: () => void;
  document: SavedDocument | null;
  onExportVersion: (doc: SavedDocument, versionIdx: number) => void;
  onEditVersion: (doc: SavedDocument, versionIdx: number) => void;
  onDeleteVersion: (docId: string, version: number) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
}

export function VersionHistorySheet({ open, onClose, document, onExportVersion, onEditVersion, onDeleteVersion }: VersionHistorySheetProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ version: number; date: string } | null>(null);

  if (!document) return null;

  const versions = [...document.versions].reverse(); // newest first
  const canDeleteVersions = document.versions.length > 1;

  const handleDeleteVersionConfirmed = () => {
    if (!deleteConfirm || !document) return;
    onDeleteVersion(document.id, deleteConfirm.version);
    setDeleteConfirm(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) { onClose(); setDeleteConfirm(null); } }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh] overflow-auto pb-safe">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              История на документа
            </SheetTitle>
            <p className="text-sm text-muted-foreground">{document.title || "Документ"}</p>
          </SheetHeader>

          <div className="space-y-1">
            {versions.map((v, i) => {
              const isLatest = i === 0;
              const originalIdx = document.versions.length - 1 - i;

              return (
                <motion.div
                  key={v.version}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    isLatest ? "bg-primary/5 border border-primary/15" : "hover:bg-muted/40"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`h-3 w-3 rounded-full shrink-0 ${
                      isLatest ? "bg-primary" : "bg-muted-foreground/30"
                    }`} />
                    {i < versions.length - 1 && (
                      <div className="w-px h-full bg-muted-foreground/15 mt-1 min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(v.savedAt)}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Текуща
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatTime(v.savedAt)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {v.docType === "protocol" ? "Протокол" : "Оферта"} {v.docNumber}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-xs font-medium"
                      onClick={() => onExportVersion(document, originalIdx)}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-xs font-medium"
                      onClick={() => {
                        onEditVersion(document, originalIdx);
                        onClose();
                      }}
                    >
                      Промени
                    </Button>
                    {canDeleteVersions && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl opacity-40 hover:opacity-100"
                        onClick={() => setDeleteConfirm({ version: v.version, date: v.savedAt })}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete version confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Изтриване на версия</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Сигурни ли сте, че искате да изтриете версията от{" "}
              <strong>{deleteConfirm ? formatDate(deleteConfirm.date) : ""}</strong>?
              <span className="block mt-2 text-muted-foreground">
                Това действие е необратимо.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Отказ</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteVersionConfirmed}>
              Изтрий версия
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
