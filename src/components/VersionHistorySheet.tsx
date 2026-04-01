import { SavedDocument } from "@/lib/storage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface VersionHistorySheetProps {
  open: boolean;
  onClose: () => void;
  document: SavedDocument | null;
  onExportVersion: (doc: SavedDocument, versionIdx: number) => void;
  onEditVersion: (doc: SavedDocument, versionIdx: number) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
}

export function VersionHistorySheet({ open, onClose, document, onExportVersion, onEditVersion }: VersionHistorySheetProps) {
  if (!document) return null;

  const versions = [...document.versions].reverse(); // newest first

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
