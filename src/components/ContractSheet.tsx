import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { InlineField, InlineSelect, InlineArea, Article, ContractHeading } from "./ContractEditor";

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
  executorOptions: string[];
  assignorOptions?: string[];
  repOptions: string[];
}

export default function ContractSheet(p: ContractSheetProps) {
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
            {p.repOptions.length > 0 ? (
              <InlineSelect value={p.signFor} onChange={p.setSignFor} options={p.repOptions} placeholder="представител" />
            ) : (
              <InlineField value={p.signFor} onChange={p.setSignFor} placeholder="представител" min={14} />
            )}
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
          <Article>
            <b>Чл. 1.</b> (1) ВЪЗЛОЖИТЕЛЯТ възлага, а ИЗПЪЛНИТЕЛЯТ приема да извърши на свой риск и срещу възнаграждение от страна на Възложителя
            следните строително-ремонтни работи: <InlineField value={p.object} onChange={p.setObject} placeholder="описание на обекта" min={24} />, описани
            подробно в приложение 1, неразделна част от договора.
          </Article>
          <Article>
            (2) Количеството, обемът и видовете ремонтни работи и влаганите материали следва да се изпълнят съгласно уговореното в приложение 1 от
            договора. Строително-ремонтните работи ще се осъществят със средства, материали и съответната квалифицирана работна ръка на Изпълнителя.
            Изпълнителят носи отговорност, ако вложените материали не са с нужното качество.
          </Article>

          <ContractHeading>ЦЕНА ПО ДОГОВОРА</ContractHeading>
          <Article>
            <b>Чл. 2.</b> (1) Цената, която Възложителят ще заплати на Изпълнителя за строително-ремонтните работи по чл. 1 от договора, е както следва:{" "}
            <InlineField value={p.contractPrice} onChange={p.setContractPrice} placeholder="12 000 € без ДДС" min={18} />
          </Article>
          <Article>
            (2) Страните договарят плащането (плащанията) да бъде извършено както следва:
            <InlineArea value={p.paymentTerms} onChange={p.setPaymentTerms} placeholder="Напр. 50% авансово, 50% след приемане" />
          </Article>
          <Article>
            (3) Страните договарят плащанията да бъдат извършвани по следната банкова сметка на Изпълнителя:{" "}
            <InlineField value={p.bankAccount} onChange={p.setBankAccount} placeholder="BG00XXXX00000000000000" min={22} />
          </Article>
          <Article>(4) За всички извършени плащания Изпълнителят се задължава да издава на Възложителя съответния счетоводен документ (фактура).</Article>

          <ContractHeading>СРОК ЗА ИЗПЪЛНЕНИЕ</ContractHeading>
          <Article>
            <b>Чл. 3.</b> Сроковете за изпълнение на работата са както следва: от{" "}
            <InlineField type="date" value={p.startDate} onChange={p.setStartDate} /> г. до{" "}
            <InlineField type="date" value={p.endDate} onChange={p.setEndDate} /> г.
          </Article>

          <ContractHeading>ПРАВА И ЗАДЪЛЖЕНИЯ НА СТРАНИТЕ</ContractHeading>
          <Article>
            <b>Чл. 4.</b> ИЗПЪЛНИТЕЛЯТ се задължава да изпълни договорените строително-ремонтни работи качествено и в договорения срок при спазване на
            условията на Възложителя и действащата нормативна уредба, в това число изискванията по охрана на труда, санитарните и противопожарните норми.
          </Article>
          <Article>
            <b>Чл. 5.</b> ИЗПЪЛНИТЕЛЯТ се задължава по време на строителството да извърши всички работи по отстраняване на допуснати от него грешки в
            извършени работи, констатирани от ВЪЗЛОЖИТЕЛЯ, както и да отстранява всички появили се дефекти през гаранционния срок, както и да осигури
            квалифициран технически ръководител на обекта.
          </Article>
          <Article>
            <b>Чл. 6.</b> (1) ИЗПЪЛНИТЕЛЯТ е длъжен своевременно да уведомява ВЪЗЛОЖИТЕЛЯ за всички обстоятелства, които създават реални предпоставки за
            забавяне или спиране изпълнението на строително-ремонтните работи.
          </Article>
          <Article>(2) Всички санкции, наложени от общински и държавни органи във връзка със строителството, са за сметка на Изпълнителя.</Article>
          <Article>(3) Всички вреди, нанесени на трети лица при изпълнение на строителството, се заплащат от Изпълнителя.</Article>
          <Article>
            <b>Чл. 7.</b> (1) ВЪЗЛОЖИТЕЛЯТ е задължен да заплаща сумите по начина и в сроковете, определени в този договор, както и да оказва нужното
            съдействие на ИЗПЪЛНИТЕЛЯ.
          </Article>
          <Article>(2) Възложителят се задължава да приеме извършените строително-ремонтни работи, в случай че са извършени качествено и съгласно договореното.</Article>

          <ContractHeading>ПРИЕМАНЕ НА РАБОТАТА</ContractHeading>
          <Article>
            <b>Чл. 8.</b> Приемането на строително-ремонтните работи се удостоверява с протокол, подписан от двете страни, в който се описва извършената
            работа: количество СРР, качество, стойността на извършената работа и вложените материали, налични недостатъци, както и дали е спазен срокът за
            изпълнение на настоящия договор.
          </Article>
          <Article>
            <b>Чл. 9.</b> ИЗПЪЛНИТЕЛЯТ се задължава да отстранява за своя сметка скритите недостатъци и появилите се впоследствие дефекти в следния
            гаранционен срок: <InlineField value={p.warrantyMonths} onChange={p.setWarrantyMonths} placeholder="12" min={3} /> месеца, който тече от деня на
            предаване на обекта с приемо-предавателен протокол.
          </Article>
          <Article>
            <b>Чл. 10.</b> Ако се появят дефекти при изпълнение на строително-ремонтните работи в гаранционния срок, ВЪЗЛОЖИТЕЛЯТ поканва писмено
            ИЗПЪЛНИТЕЛЯ за съставяне на констативен протокол, в който страните посочват срокове за отстраняване на дефектите.
          </Article>

          <ContractHeading>НЕИЗПЪЛНЕНИЕ. ОТГОВОРНОСТ</ContractHeading>
          <Article>
            <b>Чл. 11.</b> При неизпълнение по този договор всяка от страните дължи обезщетение за причинени вреди при условията на гражданското
            законодателство.
          </Article>
          <Article>
            <b>Чл. 12.</b> (1) При забава за завършване и предаване на работите по този договор в срока по настоящия договор ИЗПЪЛНИТЕЛЯТ дължи неустойка в
            размер на {penalty()}% за всеки просрочен ден, но не повече от 10% от стойността на договора.
          </Article>
          <Article>
            (2) При забава в плащането от страна на ВЪЗЛОЖИТЕЛЯ същият дължи неустойка в размер на {penalty()}% от стойността на фактурата за всеки просрочен
            ден, но не повече от 10% от нея.
          </Article>
          <Article>
            <b>Чл. 13.</b> (1) При виновно некачествено извършване на ремонтните работи, освен задължението за отстраняване на дефектите и другите
            възможности, предвидени в чл. 265 от ЗЗД, ИЗПЪЛНИТЕЛЯТ дължи и неустойка в размер на {penalty()}% от стойността на некачествено извършените
            работи.
          </Article>

          <ContractHeading>ПРЕКРАТЯВАНЕ И РАЗВАЛЯНЕ НА ДОГОВОРА</ContractHeading>
          <Article><b>Чл. 14.</b> Настоящият договор се прекратява:</Article>
          <Article>1. с изпълнение на задълженията на страните по него;</Article>
          <Article>2. по взаимно съгласие между страните;</Article>
          <Article>3. при настъпване на обективна невъзможност за изпълнение на възложената работа.</Article>
          <Article>
            <b>Чл. 15.</b> ВЪЗЛОЖИТЕЛЯТ може по всяко време до завършване и предаване на обекта да се откаже от договора и да прекрати действието му. В този
            случай той е длъжен да заплати на ИЗПЪЛНИТЕЛЯ стойността на извършените до момента на отказа работи.
          </Article>
          <Article><b>Чл. 16.</b> (1) ВЪЗЛОЖИТЕЛЯТ има право да прекрати договора, когато:</Article>
          <Article>1. ИЗПЪЛНИТЕЛЯТ не започне изпълнение на възложените строително-ремонтни работи в уговорения срок;</Article>
          <Article>2. ИЗПЪЛНИТЕЛЯТ бъде обявен в неплатежоспособност или когато бъде открита процедура за обявяване в несъстоятелност или ликвидация.</Article>
          <Article>
            <b>Чл. 17.</b> Ако стане ясно, че ИЗПЪЛНИТЕЛЯТ ще просрочи изпълнението на възложената работа след уговорения срок или няма да извърши
            строително-монтажните работи по уговорения начин и с нужното качество, ВЪЗЛОЖИТЕЛЯТ може да развали договора.
          </Article>

          <ContractHeading>ЗАКЛЮЧИТЕЛНИ РАЗПОРЕДБИ</ContractHeading>
          <Article>
            <b>Чл. 18.</b> Всяка от страните по настоящия договор се задължава да не разпространява информация за другата страна, станала й известна при или
            по повод изпълнението на договора.
          </Article>
          <Article><b>Чл. 19.</b> Нищожността на някоя клауза от настоящия договор не води до нищожност на друга клауза или на договора като цяло.</Article>
          <Article>
            <b>Чл. 20.</b> Всички спорове, породени от този договор или отнасящи се до него, включително споровете относно тълкуване, недействителност,
            неизпълнение или прекратяване, ще бъдат решавани по взаимно съгласие. Ако между страните не бъде постигнато споразумение, спорът се отнася за
            решаване пред компетентния съд.
          </Article>
          <Article><b>Чл. 21.</b> За неуредените в настоящия договор въпроси се прилагат разпоредбите на действащото законодателство на Република България.</Article>
          <Article>
            <b>Чл. 22.</b> Всички съобщения между страните във връзка с настоящия договор следва да бъдат в писмена форма. При промяна на посочените данни
            всяка от страните е длъжна да уведоми другата в седемдневен срок от настъпване на промяната.
          </Article>
          <Article>Настоящият договор се състави в два еднообразни екземпляра — по един за всяка страна.</Article>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 mt-6 border-t border-dashed border-border text-center">
            <div className="space-y-2 rounded-xl bg-muted/40 px-4 py-5">
              <p className="font-bold text-[11px] tracking-[0.1em] text-muted-foreground">ВЪЗЛОЖИТЕЛ</p>
              {p.repOptions.length > 0 ? (
                <InlineSelect value={p.signFor} onChange={p.setSignFor} options={p.repOptions} placeholder="представител" />
              ) : (
                <InlineField value={p.signFor} onChange={p.setSignFor} placeholder="представител" min={14} />
              )}
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
