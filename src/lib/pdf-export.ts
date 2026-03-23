import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { robotoRegular } from "./roboto-regular";
import { robotoBold } from "./roboto-bold";
import { logoBase64 } from "./logo-base64";

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

// Modern color palette
const C = {
  primary: [22, 78, 99] as const,       // deep teal
  primaryLight: [207, 236, 244] as const, // light teal bg
  accent: [245, 158, 11] as const,        // amber
  accentBg: [255, 251, 235] as const,     // warm cream
  dark: [15, 23, 42] as const,            // slate-900
  mid: [71, 85, 105] as const,            // slate-500
  light: [148, 163, 184] as const,        // slate-400
  line: [226, 232, 240] as const,         // slate-200
  bgAlt: [248, 250, 252] as const,        // slate-50
  white: [255, 255, 255] as const,
};

function setupFonts(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

function setColor(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

export function exportPDF(data: DocumentData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  setupFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // === Top accent bar ===
  doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.rect(0, 0, pageWidth, 3, "F");

  let y = 16;

  // === Logo ===
  try {
    doc.addImage(logoBase64, "PNG", margin, y - 6, 55, 18);
  } catch {
    // skip
  }

  // === Right-aligned date ===
  if (data.startDate) {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8.5);
    setColor(doc, C.mid);
    const dateStr = new Date(data.startDate).toLocaleDateString("bg-BG");
    doc.text(dateStr, pageWidth - margin, y + 2, { align: "right" });
  }

  y += 18;

  // === Thin separator ===
  doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // === Parties info block ===
  const infoBoxY = y;
  doc.setFillColor(C.bgAlt[0], C.bgAlt[1], C.bgAlt[2]);
  doc.roundedRect(margin, infoBoxY - 3, contentWidth, 22, 2, 2, "F");

  doc.setFontSize(8);

  // Left column
  doc.setFont("Roboto", "bold");
  setColor(doc, C.mid);
  doc.text("ВЪЗЛОЖИТЕЛ", margin + 5, y + 1);
  doc.setFont("Roboto", "normal");
  setColor(doc, C.dark);
  doc.setFontSize(9.5);
  doc.text(data.assignor || "—", margin + 5, y + 6);

  // Right column
  doc.setFontSize(8);
  doc.setFont("Roboto", "bold");
  setColor(doc, C.mid);
  doc.text("ИЗПЪЛНИТЕЛ", pageWidth / 2 + 5, y + 1);
  doc.setFont("Roboto", "normal");
  setColor(doc, C.dark);
  doc.setFontSize(9.5);
  doc.text(data.executor || "—", pageWidth / 2 + 5, y + 6);

  // Object row
  if (data.object) {
    doc.setFontSize(8);
    doc.setFont("Roboto", "bold");
    setColor(doc, C.mid);
    doc.text("ОБЕКТ", margin + 5, y + 13);
    doc.setFont("Roboto", "normal");
    setColor(doc, C.dark);
    doc.setFontSize(9.5);
    doc.text(data.object, margin + 22, y + 13);
  }

  y = infoBoxY + 22 + 8;

  // === Title ===
  setColor(doc, C.primary);
  doc.setFont("Roboto", "bold");

  if (data.docType === "protocol") {
    doc.setFontSize(14);
    doc.text("Приемо-предавателен протокол Акт обр.19", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(11);
    setColor(doc, C.primary);
    doc.text(`Протокол № ${data.docNumber || ""}`, pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(8.5);
    doc.setFont("Roboto", "normal");
    setColor(doc, C.mid);
    doc.text("за установяване завършването и за изплащането на натурални видове СМР", pageWidth / 2, y, { align: "center" });
    y += 9;
  } else {
    doc.setFontSize(16);
    doc.text("Оферта", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(11);
    setColor(doc, C.primary);
    doc.text(`Оферта № ${data.docNumber || ""}`, pageWidth / 2, y, { align: "center" });
    y += 10;
  }

  // === Protocol text ===
  if (data.protocolText && data.docType === "protocol") {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8.5);
    setColor(doc, C.mid);
    const lines = doc.splitTextToSize(data.protocolText, contentWidth - 4);
    // Subtle left border accent
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y - 2, margin, y + lines.length * 4 + 1);
    doc.text(lines, margin + 4, y);
    y += lines.length * 4 + 8;
  }

  // === Products table ===
  if (data.products.length > 0) {
    const total = data.products.reduce((s, p) => s + p.quantity * p.price, 0);
    const vat = total * 0.2;
    const grandTotal = total + vat;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["№", "Видове работа", "Ед.мярка", "К-во", "Ед.цена", "Цена"]],
      body: data.products.map((p, i) => [
        String(i + 1),
        p.name,
        p.unit,
        String(p.quantity),
        p.price.toFixed(2) + " €",
        (p.quantity * p.price).toFixed(2) + " €",
      ]),
      styles: {
        font: "Roboto",
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineWidth: 0,
      },
      headStyles: {
        fillColor: [C.primary[0], C.primary[1], C.primary[2]],
        textColor: [255, 255, 255],
        font: "Roboto",
        fontStyle: "bold",
        fontSize: 8.5,
      },
      bodyStyles: {
        textColor: [C.dark[0], C.dark[1], C.dark[2]],
      },
      alternateRowStyles: {
        fillColor: [C.bgAlt[0], C.bgAlt[1], C.bgAlt[2]],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 25, halign: "right" },
      },
      didDrawPage: () => {
        // Redraw top bar on new pages
        doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
        doc.rect(0, 0, pageWidth, 3, "F");
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // === Totals block ===
    const totalsWidth = 75;
    const totalsX = pageWidth - margin - totalsWidth;

    const drawTotalRow = (label: string, value: string, isGrand = false) => {
      if (isGrand) {
        doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
        doc.roundedRect(totalsX, y - 4.5, totalsWidth, 8, 1, 1, "F");
        doc.setFont("Roboto", "bold");
        doc.setFontSize(9.5);
        setColor(doc, C.white);
        doc.text(label, totalsX + 4, y);
        doc.text(value, totalsX + totalsWidth - 4, y, { align: "right" });
      } else {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        setColor(doc, C.mid);
        doc.text(label, totalsX + 4, y);
        doc.setFont("Roboto", "bold");
        setColor(doc, C.dark);
        doc.text(value, totalsX + totalsWidth - 4, y, { align: "right" });
      }
      y += isGrand ? 8 : 6;
    };

    drawTotalRow("Общо СМР:", total.toFixed(2) + " €");
    drawTotalRow("ДДС (20%):", vat.toFixed(2) + " €");
    y += 1;
    drawTotalRow("Всичко:", grandTotal.toFixed(2) + " €", true);
  }

  // === Signatures ===
  const sigY = Math.max(y + 30, 230);
  const needNewPage = sigY > pageHeight - 45;
  if (needNewPage) doc.addPage();
  const finalSigY = needNewPage ? 50 : sigY;

  const leftCenter = margin + contentWidth * 0.25;
  const rightCenter = margin + contentWidth * 0.75;

  const drawSignature = (cx: number, title: string, name: string) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    setColor(doc, C.mid);
    doc.text(title, cx, finalSigY, { align: "center" });

    // Signature line
    doc.setDrawColor(C.light[0], C.light[1], C.light[2]);
    doc.setLineWidth(0.5);
    doc.line(cx - 38, finalSigY + 16, cx + 38, finalSigY + 16);

    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    setColor(doc, C.primary);
    const text = name ? `/ ${name} /` : "/ ......................... /";
    doc.text(text, cx, finalSigY + 22, { align: "center" });
  };

  drawSignature(leftCenter, "За Възложителя:", data.signFor);
  drawSignature(rightCenter, "За Изпълнителя:", data.signBy);

  // === Bottom accent bar ===
  doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.rect(0, pageHeight - 3, pageWidth, 3, "F");

  // Save
  const fileName = `${data.docType === "protocol" ? "Протокол" : "Оферта"}${data.docNumber ? `_${data.docNumber}` : ""}.pdf`;
  doc.save(fileName);
}
