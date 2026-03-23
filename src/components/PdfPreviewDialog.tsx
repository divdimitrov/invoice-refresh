import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  blobUrl: string;
  fileName: string;
  blob: Blob;
}

export function PdfPreviewDialog({ open, onClose, blobUrl, fileName, blob }: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState(0);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    toast.success("PDF изтеглен");
  }, [blobUrl, fileName]);

  const handleShare = useCallback(async () => {
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (e) {
        if ((e as DOMException).name !== "AbortError") {
          toast.error("Грешка при споделяне");
        }
      }
    } else {
      handleDownload();
    }
  }, [blob, fileName, handleDownload]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden rounded-2xl [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">PDF преглед</DialogTitle>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50 shrink-0">
          <span className="text-sm font-medium truncate max-w-[50%]">{fileName}</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              Сподели
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Изтегли
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF viewer — canvas-rendered, works on all mobile browsers */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <Document
            file={blobUrl}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={<div className="flex items-center justify-center h-full py-20 text-sm text-muted-foreground">Зареждане…</div>}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={Math.min(window.innerWidth * 0.93, 800)}
                className="mx-auto mb-2 shadow-sm"
              />
            ))}
          </Document>
        </div>
      </DialogContent>
    </Dialog>
  );
}
