import { useState } from "react";
import ContractSheet from "@/components/ContractSheet";

export default function TmpContractPreview() {
  const [f, setF] = useState<Record<string, string>>({ e: "Караманов Груп ЕООД" });
  const [ov, setOv] = useState<Record<string, string>>({});
  const s = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const g = (k: string) => f[k] || "";
  return (
    <div className="p-4">
      <ContractSheet
        docNumber={g("n")} setDocNumber={s("n")}
        city={g("city")} setCity={s("city")}
        startDate={g("sd")} setStartDate={s("sd")}
        endDate={g("ed")} setEndDate={s("ed")}
        assignor={g("a")} setAssignor={s("a")}
        assignorEik={g("ae")} setAssignorEik={s("ae")}
        assignorAddress={g("aa")} setAssignorAddress={s("aa")}
        executor={g("e")} setExecutor={s("e")}
        executorEik={g("ee")} setExecutorEik={s("ee")}
        executorAddress={g("ea")} setExecutorAddress={s("ea")}
        signFor={g("sf")} setSignFor={s("sf")}
        signBy={g("sb")} setSignBy={s("sb")}
        object={g("o")} setObject={s("o")}
        contractPrice={g("cp")} setContractPrice={s("cp")}
        paymentTerms={g("pt")} setPaymentTerms={s("pt")}
        bankAccount={g("ba")} setBankAccount={s("ba")}
        warrantyMonths={g("wm")} setWarrantyMonths={s("wm")}
        penaltyPercent={g("pp")} setPenaltyPercent={s("pp")}
        clauseOverrides={ov}
        setClauseOverride={(id, v) => setOv((p) => { const n = { ...p }; if (v === null) delete n[id]; else n[id] = v; return n; })}
        executorOptions={["Караманов Груп ЕООД", "Александър Строй ЕООД"]}
        repOptions={["Иван Иванов"]}
      />
    </div>
  );
}
