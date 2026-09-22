import { clauseText } from "@/lib/contract-clauses";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { robotoRegular } from "./roboto-regular";
import { robotoBold } from "./roboto-bold";
import { logoBase64 } from "./logo-base64";
import { logoAlexanderBase64 } from "./logo-alexander-base64";

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
  city?: string;
  assignorEik?: string;
  assignorAddress?: string;
  executorEik?: string;
  executorAddress?: string;
  paymentTerms?: string;
  bankAccount?: string;
  warrantyMonths?: string;
  penaltyPercent?: string;
  contractPrice?: string;
  clauseOverrides?: Record<string, string>;
}

// Color palette
const C = {
  primary: [22, 78, 99] as const,
  accent: [180, 45, 45] as const,
  dark: [30, 30, 30] as const,
  mid: [100, 100, 100] as const,
  light: [170, 170, 170] as const,
  line: [210, 210, 210] as const,
  bgAlt: [247, 248, 250] as const,
  white: [255, 255, 255] as const,
};

function setupFonts(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

function color(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

export function exportPDF(data: DocumentData) {
  if (data.docType === "contract") return exportContractPDF(data);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  setupFonts(doc);

  const pw = doc.internal.pageSize.getWidth(); // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const m = 20; // margin
  const cw = pw - m * 2; // content width
  let y = 18;

  // ── Top line accent ──
  doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
  doc.rect(0, 0, pw, 2.5, "F");

  // ── Logo (depends on executor) ──
  try {
    const isAlexander = /Александър\s+Строй/i.test(data.executor);
    const logo = isAlexander ? logoAlexanderBase64 : logoBase64;
    // Logo is 3:2, render at ~40x26mm — large and clear
    doc.addImage(logo, "PNG", m, y, 40, 26);
  } catch {
    // skip
  }

  // ── Date (top right) ──
  if (data.startDate) {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    color(doc, C.mid);
    const dateStr = new Date(data.startDate).toLocaleDateString("bg-BG");
    doc.text(dateStr, pw - m, y + 5, { align: "right" });
  }

  y += 32;

  // ── Separator ──
  doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
  doc.setLineWidth(0.3);
  doc.line(m, y, pw - m, y);
  y += 6;

  // ── Parties info ──
  const col1X = m;
  const col2X = pw / 2 + 5;

  const drawInfoPair = (label: string, value: string, x: number, yPos: number) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    color(doc, C.accent);
    doc.text(label, x, yPos);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    color(doc, C.dark);
    doc.text(value || "—", x, yPos + 5);
  };

  drawInfoPair("Възложител:", data.assignor, col1X, y);
  drawInfoPair("Изпълнител:", data.executor, col2X, y);
  y += 13;

  if (data.object) {
    drawInfoPair("Обект:", data.object, col1X, y);
    y += 13;
  }

  y += 4;

  // ── Separator ──
  doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
  doc.line(m, y, pw - m, y);
  y += 10;

  // ── Title ──
  color(doc, C.primary);
  doc.setFont("Roboto", "bold");

  if (data.docType === "protocol") {
    doc.setFontSize(14);
    doc.text("Приемо-предавателен протокол Акт обр.19", pw / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(12);
    doc.text(`Протокол № ${data.docNumber || ""}`, pw / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    color(doc, C.mid);
    doc.text("за установяване завършването и за изплащането на натурални видове СМР", pw / 2, y, { align: "center" });
    y += 10;
  } else {
    doc.setFontSize(16);
    doc.text("Оферта", pw / 2, y, { align: "center" });
    y += 9;
    doc.setFontSize(12);
    doc.text(`Оферта № ${data.docNumber || ""}`, pw / 2, y, { align: "center" });
    y += 12;
  }

  // ── Protocol text ──
  if (data.protocolText && data.docType === "protocol") {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    color(doc, C.mid);

    // Left accent bar
    const lines = doc.splitTextToSize(data.protocolText, cw - 6);
    doc.setDrawColor(C.accent[0], C.accent[1], C.accent[2]);
    doc.setLineWidth(0.8);
    doc.line(m, y - 1, m, y + lines.length * 4.2 + 1);

    doc.text(lines, m + 4, y);
    y += lines.length * 4.2 + 8;
  }

  // ── Products table ──
  if (data.products.length > 0) {
    const total = data.products.reduce((s, p) => s + p.quantity * p.price, 0);
    const vat = total * 0.2;
    const grandTotal = total + vat;

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
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
        doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
        doc.rect(0, 0, pw, 2.5, "F");
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

    // ── Totals ──
    const boxW = 80;
    const boxX = pw - m - boxW;

    const drawRow = (label: string, value: string, highlight = false) => {
      if (highlight) {
        doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
        doc.roundedRect(boxX, y - 4.5, boxW, 8, 1.5, 1.5, "F");
        doc.setFont("Roboto", "bold");
        doc.setFontSize(10);
        color(doc, C.white);
      } else {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        color(doc, C.mid);
      }
      doc.text(label, boxX + 5, y);

      if (highlight) {
        doc.setFont("Roboto", "bold");
        color(doc, C.white);
      } else {
        doc.setFont("Roboto", "bold");
        color(doc, C.dark);
      }
      doc.text(value, boxX + boxW - 5, y, { align: "right" });
      y += highlight ? 10 : 6;
    };

    drawRow("Общо СМР:", total.toFixed(2) + " €");
    drawRow("ДДС (20%):", vat.toFixed(2) + " €");
    y += 1;
    drawRow("Всичко:", grandTotal.toFixed(2) + " €", true);
  }

  // ── Signatures ──
  const sigY = Math.max(y + 30, 230);
  const needNewPage = sigY > ph - 50;
  if (needNewPage) doc.addPage();
  const fSigY = needNewPage ? 50 : sigY;

  const leftCx = m + cw * 0.25;
  const rightCx = m + cw * 0.75;

  const drawSig = (cx: number, title: string, name: string) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    color(doc, C.dark);
    doc.text(title, cx, fSigY, { align: "center" });

    doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
    doc.setLineWidth(0.4);
    doc.line(cx - 38, fSigY + 18, cx + 38, fSigY + 18);

    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    color(doc, C.primary);
    const text = name ? `/ ${name} /` : "/ ......................... /";
    doc.text(text, cx, fSigY + 24, { align: "center" });
  };

  drawSig(leftCx, "За Възложителя:", data.signFor);
  drawSig(rightCx, "За Изпълнителя:", data.signBy);

  // ── Bottom accent ──
  doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
  doc.rect(0, ph - 2.5, pw, 2.5, "F");

  // Build result
  const fileName = `${data.docType === "protocol" ? "Протокол" : "Оферта"}${data.docNumber ? `_${data.docNumber}` : ""}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return { blob, blobUrl, fileName };
}

const DOTS = "..............................";

function bgDate(d: string) {
  return d ? new Date(d).toLocaleDateString("bg-BG") : DOTS;
}

export function exportContractPDF(data: DocumentData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  setupFonts(doc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  const cw = pw - m * 2;
  let y = 18;

  const accentBars = () => {
    doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
    doc.rect(0, 0, pw, 2.5, "F");
    doc.rect(0, ph - 2.5, pw, 2.5, "F");
  };
  accentBars();

  const newPage = () => {
    doc.addPage();
    accentBars();
    y = 22;
  };

  const ensure = (needed: number) => {
    if (y + needed > ph - 22) newPage();
  };

  const para = (text: string, opts: { bold?: boolean; size?: number; gap?: number } = {}) => {
    const size = opts.size ?? 9.5;
    doc.setFont("Roboto", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    color(doc, opts.bold ? C.primary : C.dark);
    const lines = doc.splitTextToSize(text, cw) as string[];
    const lh = size * 0.48;
    lines.forEach((ln) => {
      ensure(lh + 2);
      doc.text(ln, m, y);
      y += lh;
    });
    y += opts.gap ?? 2.5;
  };

  const heading = (text: string) => {
    ensure(12);
    y += 2;
    para(text, { bold: true, size: 10, gap: 1.5 });
  };

  // ── Logo ──
  try {
    const isAlexander = /Александър\s+Строй/i.test(data.executor);
    doc.addImage(isAlexander ? logoAlexanderBase64 : logoBase64, "PNG", m, y, 36, 24);
  } catch {
    // skip
  }
  y += 30;

  // ── Title ──
  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  color(doc, C.primary);
  doc.text("ДОГОВОР", pw / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(11);
  doc.text("за извършване на строително-ремонтни работи", pw / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.text(`№ ${data.docNumber || DOTS}`, pw / 2, y, { align: "center" });
  y += 10;

  const assignorRep = data.signFor || DOTS;
  const executorRep = data.signBy || DOTS;
  const CL = (id: string) => clauseText(id, data.clauseOverrides);
  const CLO = (id: string, fallback: string) => data.clauseOverrides?.[id] || fallback;
  const penalty = data.penaltyPercent ? `${data.penaltyPercent}%` : DOTS;

  // ── Preamble ──
  para(
    `Днес, ${bgDate(data.startDate)} г., в гр. ${data.city || DOTS} се сключи настоящият договор между:`
  );
  para(
    `1. ${data.assignor || DOTS}, със седалище и адрес на управление: ${data.assignorAddress || DOTS}, ЕИК (ЕГН): ${data.assignorEik || DOTS}, представлявано от ${assignorRep}, наричано по-долу ВЪЗЛОЖИТЕЛ,`
  );
  para("и");
  para(
    `2. ${data.executor || DOTS}, със седалище и адрес на управление: ${data.executorAddress || DOTS}, ЕИК (ЕГН): ${data.executorEik || DOTS}, представлявано от ${executorRep}, наричано по-долу ИЗПЪЛНИТЕЛ,`
  );
  para("се сключи настоящият договор за следното:");

  heading("ПРЕДМЕТ НА ДОГОВОРА");
  para(
    CLO("c1_1", `Чл. 1. (1) ВЪЗЛОЖИТЕЛЯТ възлага, а ИЗПЪЛНИТЕЛЯТ приема да извърши на свой риск и срещу възнаграждение от страна на Възложителя следните строително-ремонтни работи: ${data.object || DOTS}, описани подробно в приложение 1, неразделна част от договора.`)
  );
  para(CL("c1_2"));

  heading("ЦЕНА ПО ДОГОВОРА");
  para(
    CLO("c2_1", `Чл. 2. (1) Цената, която Възложителят ще заплати на Изпълнителя за строително-ремонтните работи по чл. 1 от договора, е както следва: ${data.contractPrice || DOTS}`)
  );
  para(CLO("c2_2", `(2) Страните договарят плащането (плащанията) да бъде извършено както следва: ${data.paymentTerms || DOTS}`));
  para(
    CLO("c2_3", `(3) Страните договарят плащанията да бъдат извършвани по следната банкова сметка на Изпълнителя: ${data.bankAccount || DOTS}`)
  );
  para(CL("c2_4"));

  heading("СРОК ЗА ИЗПЪЛНЕНИЕ");
  para(
    CLO("c3", `Чл. 3. Сроковете за изпълнение на работата са както следва: от ${bgDate(data.startDate)} г. до ${bgDate(data.endDate)} г.`)
  );

  heading("ПРАВА И ЗАДЪЛЖЕНИЯ НА СТРАНИТЕ");
  para(CL("c4"));
  para(CL("c5"));
  para(CL("c6_1"));
  para(CL("c6_2"));
  para(CL("c6_3"));
  para(CL("c7_1"));
  para(CL("c7_2"));

  heading("ПРИЕМАНЕ НА РАБОТАТА");
  para(CL("c8"));
  para(
    CLO("c9", `Чл. 9. ИЗПЪЛНИТЕЛЯТ се задължава да отстранява за своя сметка скритите недостатъци и появилите се впоследствие дефекти в следния гаранционен срок: ${data.warrantyMonths ? `)${data.warrantyMonths} месеца` : DOTS}, който тече от деня на предаване на обекта с приемо-предавателен протокол.`
  );
  para(CL("c10"));

  heading("НЕИЗПЪЛНЕНИЕ. ОТГОВОРНОСТ");
  para(CL("c11"));
  para(
    CLO("c12_1", `Чл. 12. (1) При забава за завършване и предаване на работите по този договор в срока по настоящия договор ИЗПЪЛНИТЕЛЯТ дължи неустойка в размер на ${penalty} за всеки просрочен ден, но не повече от 10% от стойността на договора.`)
  );
  para(
    CLO("c12_2", `(2) При забава в плащането от страна на ВЪЗЛОЖИТЕЛЯ същият дължи неустойка в размер на ${penalty} от стойността на фактурата за всеки просрочен ден, но не повече от 10% от нея.`)
  );
  para(
    CLO("c13", `Чл. 13. (1) При виновно некачествено извършване на ремонтните работи, освен задължението за отстраняване на дефектите и другите възможности, предвидени в чл. 265 от ЗЗД, ИЗПЪЛНИТЕЛЯТ дължи и неустойка в размер на ${penalty} от стойността на некачествено извършените ремонтни работи.`)
  );

  heading("ПРЕКРАТЯВАНЕ И РАЗВАЛЯНЕ НА ДОГОВОРА");
  para(CL("c14"));
  para(CL("c14_1"));
  para(CL("c14_2"));
  para(CL("c14_3"));
  para(CL("c15"));
  para(CL("c16"));
  para(CL("c16_1"));
  para(CL("c16_2"));
  para(CL("c17"));

  heading("ЗАКЛЮЧИТЕЛНИ РАЗПОРЕДБИ");
  para(CL("c18"));
  para(CL("c19"));
  para(CL("c20"));
  para(CL("c21"));
  para(CL("c22"));
  para(CL("cfinal"));

  // ── Signatures ──
  ensure(44);
  y += 14;
  const leftCx = m + cw * 0.25;
  const rightCx = m + cw * 0.75;
  const drawSig = (cx: number, title: string, name: string) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    color(doc, C.dark);
    doc.text(title, cx, y, { align: "center" });
    doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
    doc.setLineWidth(0.4);
    doc.line(cx - 38, y + 16, cx + 38, y + 16);
    doc.setFont("Roboto", "normal");
    color(doc, C.primary);
    doc.text(name ? `/ ${name} /` : "/ ......................... /", cx, y + 22, { align: "center" });
  };
  drawSig(leftCx, "ВЪЗЛОЖИТЕЛ:", data.signFor);
  drawSig(rightCx, "ИЗПЪЛНИТЕЛ:", data.signBy);

  const fileName = `Договор${data.docNumber ? `_${data.docNumber}` : ""}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return { blob, blobUrl, fileName };
}

export type PdfResult = ReturnType<typeof exportPDF>;
