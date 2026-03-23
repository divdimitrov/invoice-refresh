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

  // === Header info: Възложител, Изпълнител, Обект ===
  doc.setFontSize(10);

  doc.setFont("Roboto", "bold");
  doc.setTextColor(139, 0, 0); // dark red for labels
  doc.text("Възложител: ", margin, y);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 139); // dark blue for values
  doc.text(data.assignor || "—", margin + doc.getTextWidth("Възложител: "), y);
  y += 6;

  doc.setFont("Roboto", "bold");
  doc.setTextColor(139, 0, 0);
  doc.text("Изпълнител: ", margin, y);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 139);
  doc.text(data.executor || "—", margin + doc.getTextWidth("Изпълнител: "), y);
  y += 6;

  doc.setFont("Roboto", "bold");
  doc.setTextColor(139, 0, 0);
  doc.text("Обект: ", margin, y);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 139);
  doc.text(data.object || "—", margin + doc.getTextWidth("Обект: "), y);
  y += 12;

  // === Title ===
  doc.setTextColor(0, 0, 0);
  doc.setFont("Roboto", "bold");

  if (data.docType === "protocol") {
    doc.setFontSize(13);
    doc.text("Приемо-предавателен протокол Акт обр.19", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(11);
    doc.text(`Протокол № ${data.docNumber || ""}`, pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.text("за установяване завършването и за изплащането на натурални видове СМР", pageWidth / 2, y, { align: "center" });
    y += 8;
  } else {
    doc.setFontSize(14);
    doc.text("Оферта", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(11);
    doc.text(`Оферта № ${data.docNumber || ""}`, pageWidth / 2, y, { align: "center" });
    y += 10;
  }

  // === Protocol text (italic) ===
  if (data.protocolText && data.docType === "protocol") {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(data.protocolText, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 6;
  }

  doc.setTextColor(0, 0, 0);

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
      styles: { font: "Roboto", fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        font: "Roboto",
        fontStyle: "bold",
        lineWidth: 0.3,
        lineColor: [150, 150, 150],
      },
      bodyStyles: {
        lineWidth: 0.3,
        lineColor: [150, 150, 150],
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 25, halign: "right" },
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;

    // === Totals: Общо СМР, ДДС, Всичко ===
    const labelX = pageWidth - margin - 70;
    const valueX = pageWidth - margin - 5;
    const yellowBgX = pageWidth - margin - 35;

    const drawTotalRow = (label: string, value: string, bgColor?: number[]) => {
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);

      if (bgColor) {
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(yellowBgX, y - 4, 35, 6, "F");
      }

      doc.setTextColor(0, 0, 0);
      doc.text(label, labelX + 30, y, { align: "right" });
      doc.setTextColor(139, 0, 0);
      doc.text(value, valueX, y, { align: "right" });
      y += 6;
    };

    drawTotalRow("Общо СМР:", total.toFixed(2) + " €", [255, 255, 200]);
    drawTotalRow("ДДС:", vat.toFixed(2) + " €", [255, 255, 200]);
    drawTotalRow("Всичко:", grandTotal.toFixed(2) + " €", [255, 255, 200]);
  }

  // === Signatures ===
  const sigY = Math.max(y + 25, 220);
  const needNewPage = sigY > doc.internal.pageSize.getHeight() - 40;
  if (needNewPage) doc.addPage();
  const finalSigY = needNewPage ? 50 : sigY;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // Left signature
  const leftCenter = margin + contentWidth * 0.25;
  doc.setFont("Roboto", "bold");
  doc.text("За Възложителя:", leftCenter, finalSigY, { align: "center" });
  doc.setDrawColor(0, 0, 0);
  doc.line(leftCenter - 40, finalSigY + 12, leftCenter + 40, finalSigY + 12);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 139);
  const signForText = data.signFor ? `/ ${data.signFor} /` : "/ ......................... /";
  doc.text(signForText, leftCenter, finalSigY + 18, { align: "center" });

  // Right signature
  const rightCenter = margin + contentWidth * 0.75;
  doc.setFont("Roboto", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("За Изпълнителя:", rightCenter, finalSigY, { align: "center" });
  doc.line(rightCenter - 40, finalSigY + 12, rightCenter + 40, finalSigY + 12);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(0, 0, 139);
  const signByText = data.signBy ? `/ ${data.signBy} /` : "/ ......................... /";
  doc.text(signByText, rightCenter, finalSigY + 18, { align: "center" });

  // Save
  const fileName = `${data.docType === "protocol" ? "Протокол" : "Оферта"}${data.docNumber ? `_${data.docNumber}` : ""}.pdf`;
  doc.save(fileName);
}
