import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { InlineField, InlineSelect, InlineCombo, InlineArea, Article, ContractHeading, EditableClause, EditableWrap } from "./ContractEditor";
import { CLAUSES, clauseText } from "@/lib/contract-clauses";

export interface ContractSheetProps {
  docNumber: string; setDocNumber: (v: string) => void;
  city: string; setCity: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  assignor: string; setAssignor: (v: string) => void;
  assignorEik: string; setAssignorEik: (v: string) => void;
  assignorAddress: string; setAssignorAddress: (v: string) => void;
  executor: string; setExecutor: (v: string) => void;
  executorEik: string; setExecutorEik: (v: string) => void;
  executorAddress: string; setExecutorAddress: (v: string) => void;
  signFor: string; setSignFor: (v: string) => void;
  signBy: string; setSignBy: (v: string) => void;
  object: string; setObject: (v: string) => void;
  contractPrice: string; setContractPrice: (v: string) => void;
  paymentTerms: string; setPaymentTerms: (v: string) => void;
  bankAccount: string; setBankAccount: (v: string) => void;
  warrantyMonths: string; setWarrantyMonths: (v: string) => void;
  penaltyPercent: string; setPenaltyPercent: (v: string) => void;
  clauseOverrides: Record<string, string>;
  setClauseOverride: (id: string, v: string | null) => void;
  executorOptions: string[];
  assignorOptions?: string[];
  repOptions: string[];
}

export default function ContractSheet(p: ContractSheetProps) {
  const C = (id: string) => (
    <EditableClause
      key={id}
      text={clauseText(id, p.clauseOverrides)}
      original={CLAUSES[id]}
      onChange={(v) => p.setClauseOverride(id, v)}
    />
  );

  const D = "...........................";
  const bg = (d: string) => {
    if (!d) return "..........";
    const [y, m, dd] = d.split("-");
    return `${dd}.${m}.${y}`;
  };
  const W = (id: string, plain: string, children: React.ReactNode) => (
    <EditableWrap
      key={id}
      id={id}
      plain={plain}
      override={p.clauseOverrides[id]}
      onChange={(v) => p.setClauseOverride(id, v)}
    >
      {children}
    </EditableWrap>
  );
  const pct = () => (p.penaltyPercent ? `${p.penaltyPercent}%` : "....%");

  const penalty = () => <InlineField value={p.penaltyPercent} onChange={p.setPenaltyPercent} placeholder="0.5" min={3} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
      <Card className="card-elevated overflow-hidden border-border/70">
        <div className="h-1.5 gradient-bg" />
        <div className="px-5 sm:px-14 py-10 text-[13px] text-foreground/90 space-y-2 bg-card max-w-[860px] mx-auto">
          <div className="text-center space-y-2 pb-8">
            <h2 className="text-2xl font-extrabold text-primary tracking-[0.2em]">ДОГОВОР</h2>
            <p className="text-[13px] font-medium text-muted-foreground">за извършване на строително-ремонтни работи</p>
            <p className="text-[13px] pt-1">
              № <InlineField value={p.docNumber} onChange={p.setDocNumber} placeholder="1.2.3" min={5} />
            </p>
            <div className="mx-auto mt-4 h-px w-24 bg-primary/30" />
          </div>


          <Article>
            Днес, <InlineField type="date" value={p.startDate} onChange={p.setStartDate} /> г., в гр.{" "}
            <InlineField value={p.city} onChange={p.setCity} placeholder="София" min={7} /> се сключи настоящият договор между:
          </Article>

          <Article>
            1.{" "}
            {p.assignorOptions && p.assignorOptions.length > 0 ? (
              <InlineSelect value={p.assignor} onChange={p.setAssignor} options={p.assignorOptions} placeholder="Възложител" />
            ) : (
              <InlineField value={p.assignor} onChange={p.setAssignor} placeholder="Възложител" min={16} />
            )}
            , със седалище и адрес на управление:{" "}

            <InlineField value={p.assignorAddress} onChange={p.setAssignorAddress} placeholder="адрес" min={20} />, ЕИК (ЕГН):{" "}
            <InlineField value={p.assignorEik} onChange={p.setAssignorEik} placeholder="123456789" min={10} />, представлявано от{" "}
            <InlineCombo value={p.signFor} onChange={p.setSignFor} options={p.repOptions} placeholder="представител" />
            , наричано по-долу <b>ВЪЗЛОЖИТЕЛ</b>,
          </Article>

          <Article>и</Article>

          <Article>
            2. <InlineSelect value={p.executor} onChange={p.setExecutor} options={p.executorOptions} />, със седалище и адрес на управление:{" "}
            <InlineField value={p.executorAddress} onChange={p.setExecutorAddress} placeholder="адрес" min={20} />, ЕИК (ЕГН):{" "}
            <InlineField value={p.executorEik} onChange={p.setExecutorEik} placeholder="123456789" min={10} />, представлявано от{" "}
            <InlineField value={p.signBy} onChange={p.setSignBy} placeholder="представител" min={14} />, наричано по-долу <b>ИЗПЪЛНИТЕЛ</b>,
          </Article>

          <Article>се сключи настоящият договор за следното:</Article>

          <ContractHeading>ПРЕДМЕТ НА ДОГОВОРА</ContractHeading>
          {W(
            "c1_1",
            `Чл. 1. (1) ВЪЗЛОЖИТЕЛЯТ възлага, а ИЗПЪЛНИТЕЛЯТ приема да извърши на свой риск и срещу възнаграждение от страна на Възложителя следните строително-ремонтни работи: ${p.object || D}, описани подробно в приложение 1, неразделна част от договора.`,
            <>
              <b>Чл. 1.</b> (1) ВЪЗЛОЖИТЕЛЯТ възлага, а ИЗПЪЛНИТЕЛЯТ приема да извърши на свой риск и срещу възнаграждение от страна на Възложителя
              следните строително-ремонтни работи: <InlineField value={p.object} onChange={p.setObject} placeholder="описание на обекта" min={24} />, описани
              подробно в приложение 1, неразделна част от договора.
            </>
          )}
          {C("c1_2")}

          <ContractHeading>ЦЕНА ПО ДОГОВОРА</ContractHeading>
          {W(
            "c2_1",
            `Чл. 2. (1) Цената, която Възложителят ще заплати на Изпълнителя за строително-ремонтните работи по чл. 1 от договора, е както следва: ${p.contractPrice || D}`,
            <>
              <b>Чл. 2.</b> (1) Цената, която Възложителят ще заплати на Изпълнителя за строително-ремонтните работи по чл. 1 от договора, е както следва:{" "}
              <InlineField value={p.contractPrice} onChange={p.setContractPrice} placeholder="12 000 € без ДДС" min={18} />
            </>
          )}
          {W(
            "c2_2",
            `(2) Страните договарят плащането (плащанията) да бъде извършено както следва: ${p.paymentTerms || D}`,
            <>
              (2) Страните договарят плащането (плащанията) да бъде извършено както следва:
              <InlineArea value={p.paymentTerms} onChange={p.setPaymentTerms} placeholder="Напр. 50% авансово, 50% след приемане" />
            </>
          )}
          {W(
            "c2_3",
            `(3) Страните договарят плащанията да бъдат извършвани по следната банкова сметка на Изпълнителя: ${p.bankAccount || D}`,
            <>
              (3) Страните договарят плащанията да бъдат извършвани по следната банкова сметка на Изпълнителя:{" "}
              <InlineField value={p.bankAccount} onChange={p.setBankAccount} placeholder="BG00XXXX00000000000000" min={22} />
            </>
          )}
          {C("c2_4")}

          <ContractHeading>СРОК ЗА ИЗПЪЛНЕНИЕ</ContractHeading>
          {W(
            "c3",
            `Чл. 3. Сроковете за изпълнение на работата са както следва: от ${bg(p.startDate)} г. до ${bg(p.endDate)} г.`,
            <>
              <b>Чл. 3.</b> Сроковете за изпълнение на работата са както следва: от{" "}
              <InlineField type="date" value={p.startDate} onChange={p.setStartDate} /> г. до{" "}
              <InlineField type="date" value={p.endDate} onChange={p.setEndDate} /> г.
            </>
          )}

          <ContractHeading>ПРАВА И ЗАДЪЛЖЕНИЯ НА СТРАНИТЕ</ContractHeading>
          {C("c4")}
          {C("c5")}
          {C("c6_1")}
          {C("c6_2")}
          {C("c6_3")}
          {C("c7_1")}
          {C("c7_2")}

          <ContractHeading>ПРИЕМАНЕ НА РАБОТАТА</ContractHeading>
          {C("c8")}
          {W(
            "c9",
            `Чл. 9. ИЗПЪЛНИТЕЛЯТ се задължава да отстранява за своя сметка скритите недостатъци и появилите се впоследствие дефекти в следния гаранционен срок: ${p.warrantyMonths ? `${p.warrantyMonths} месеца` : D}, който тече от деня на предаване на обекта с приемо-предавателен протокол.`,
            <>
              <b>Чл. 9.</b> ИЗПЪЛНИТЕЛЯТ се задължава да отстранява за своя сметка скритите недостатъци и появилите се впоследствие дефекти в следния
              гаранционен срок: <InlineField value={p.warrantyMonths} onChange={p.setWarrantyMonths} placeholder="12" min={3} /> месеца, който тече от деня на
              предаване на обекта с приемо-предавателен протокол.
            </>
          )}
          {C("c10")}

          <ContractHeading>НЕИЗПЪЛНЕНИЕ. ОТГОВОРНОСТ</ContractHeading>
          {C("c11")}
          {W(
            "c12_1",
            `Чл. 12. (1) При забава за завършване и предаване на работите по този договор в срока по настоящия договор ИЗПЪЛНИТЕЛЯТ дължи неустойка в размер на ${pct()} за всеки просрочен ден, но не повече от 10% от стойността на договора.`,
            <>
              <b>Чл. 12.</b> (1) При забава за завършване и предаване на работите по този договор в срока по настоящия договор ИЗПЪЛНИТЕЛЯТ дължи неустойка в
              размер на {penalty()}% за всеки просрочен ден, но не повече от 10% от стойността на договора.
            </>
          )}
          {W(
            "c12_2",
            `(2) При забава в плащането от страна на ВЪЗЛОЖИТЕЛЯ същият дължи неустойка в размер на ${pct()} от стойността на фактурата за всеки просрочен ден, но не повече от 10% от нея.`,
            <>
              (2) При забава в плащането от страна на ВЪЗЛОЖИТЕЛЯ същият дължи неустойка в размер на {penalty()}% от стойността на фактурата за всеки просрочен
              ден, но не повече от 10% от нея.
            </>
          )}
          {W(
            "c13",
            `Чл. 13. (1) При виновно некачествено извършване на ремонтните работи, освен задължението за отстраняване на дефектите и другите възможности, предвидени в чл. 265 от ЗЗД, ИЗПЪЛНИТЕЛЯТ дължи и неустойка в размер на ${pct()} от стойността на некачествено извършените работи.`,
            <>
              <b>Чл. 13.</b> (1) При виновно некачествено извършване на ремонтните работи, освен задължението за отстраняване на дефектите и другите
              възможности, предвидени в чл. 265 от ЗЗД, ИЗПЪЛНИТЕЛЯТ дължи и неустойка в размер на {penalty()}% от стойността на некачествено извършените
              работи.
            </>
          )}

          <ContractHeading>ПРЕКРАТЯВАНЕ И РАЗВАЛЯНЕ НА ДОГОВОРА</ContractHeading>
          {C("c14")}
          {C("c14_1")}
          {C("c14_2")}
          {C("c14_3")}
          {C("c15")}
          {C("c16")}
          {C("c16_1")}
          {C("c16_2")}
          {C("c17")}

          <ContractHeading>ЗАКЛЮЧИТЕЛНИ РАЗПОРЕДБИ</ContractHeading>
          {C("c18")}
          {C("c19")}
          {C("c20")}
          {C("c21")}
          {C("c22")}
          {C("cfinal")}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 mt-6 border-t border-dashed border-border text-center">
            <div className="space-y-2 rounded-xl bg-muted/40 px-4 py-5">
              <p className="font-bold text-[11px] tracking-[0.1em] text-muted-foreground">ВЪЗЛОЖИТЕЛ</p>
              <InlineCombo value={p.signFor} onChange={p.setSignFor} options={p.repOptions} placeholder="представител" />
              <div className="border-b border-border pt-5" />
              <p className="text-primary text-[12px] font-medium">/ {p.signFor || "........................."} /</p>
            </div>
            <div className="space-y-2 rounded-xl bg-muted/40 px-4 py-5">
              <p className="font-bold text-[11px] tracking-[0.1em] text-muted-foreground">ИЗПЪЛНИТЕЛ</p>
              <InlineField value={p.signBy} onChange={p.setSignBy} placeholder="представител" min={14} />
              <div className="border-b border-border pt-5" />
              <p className="text-primary text-[12px] font-medium">/ {p.signBy || "........................."} /</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
