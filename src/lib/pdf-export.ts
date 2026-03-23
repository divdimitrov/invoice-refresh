import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { robotoRegular } from "./roboto-regular";
import { robotoBold } from "./roboto-bold";

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface DocumentData {
  docType: string;
  docNumber: string;
  assignor: string;
  executor: string;
  object: string;
  startDate: string;
  endDate: string;
  signFor: string;
  signBy: string;
  protocolText: string;
  products: Product[];
}

function setupFonts(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

export function exportPDF(data: DocumentData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  setupFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Title
  const title = data.docType === "protocol" ? "ПРОТОКОЛ" : "ОФЕРТА";
  doc.setFont("Roboto", "bold");
  doc.setFontSize(18);
  doc.text(title + (data.docNumber ? ` № ${data.docNumber}` : ""), pageWidth / 2, y, { align: "center" });
  y += 8;

  // Date
  if (data.startDate) {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    const dateStr = new Date(data.startDate).toLocaleDateString("bg-BG");
    doc.text(`Дата: ${dateStr}`, pageWidth / 2, y, { align: "center" });
    y += 5;
  }
  if (data.endDate) {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    const dateStr = new Date(data.endDate).toLocaleDateString("bg-BG");
    doc.text(`Дата на завършване: ${dateStr}`, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  // Separator
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Parties
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("Възложител:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text(data.assignor || "—", margin + 30, y);

  doc.setFont("Roboto", "bold");
  doc.text("Изпълнител:", pageWidth / 2, y);
  doc.setFont("Roboto", "normal");
  doc.text(data.executor || "—", pageWidth / 2 + 30, y);
  y += 7;

  // Object
  if (data.object) {
    doc.setFont("Roboto", "bold");
    doc.text("Обект:", margin, y);
    doc.setFont("Roboto", "normal");
    doc.text(data.object, margin + 17, y);
    y += 7;
  }

  // Protocol text
  if (data.protocolText) {
    y += 3;
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(data.protocolText, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 5;
  }

  // Products table
  if (data.products.length > 0) {
    y += 3;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(11);
    doc.text("Продукти:", margin, y);
    y += 3;

    const total = data.products.reduce((s, p) => s + p.quantity * p.price, 0);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["№", "Наименование", "К-во", "Мярка", "Ед. цена", "Сума"]],
      body: [
        ...data.products.map((p, i) => [
          String(i + 1),
          p.name,
          String(p.quantity),
          p.unit,
          p.price.toFixed(2) + " лв.",
          (p.quantity * p.price).toFixed(2) + " лв.",
        ]),
      ],
      foot: [["", "", "", "", "Общо:", total.toFixed(2) + " лв."]],
      styles: { font: "Roboto", fontSize: 9 },
      headStyles: { fillColor: [14, 131, 171], font: "Roboto", fontStyle: "bold" },
      footStyles: { fillColor: [240, 240, 240], textColor: [30, 30, 30], font: "Roboto", fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Signatures
  const sigY = Math.max(y + 20, 240);
  if (sigY > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
  }
  const finalSigY = sigY > doc.internal.pageSize.getHeight() - 30 ? 40 : sigY;

  doc.setDrawColor(180, 180, 180);
  doc.setFontSize(9);
  doc.setFont("Roboto", "normal");

  // Left signature
  doc.text("За Възложителя:", margin, finalSigY);
  doc.line(margin, finalSigY + 15, margin + 60, finalSigY + 15);
  doc.text(data.signFor || "________________", margin, finalSigY + 20);

  // Right signature
  const rightX = pageWidth / 2 + 10;
  doc.text("За Изпълнителя:", rightX, finalSigY);
  doc.line(rightX, finalSigY + 15, rightX + 60, finalSigY + 15);
  doc.text(data.signBy || "________________", rightX, finalSigY + 20);

  // Save
  const fileName = `${data.docType === "protocol" ? "Протокол" : "Оферта"}${data.docNumber ? `_${data.docNumber}` : ""}.pdf`;
  doc.save(fileName);
}
