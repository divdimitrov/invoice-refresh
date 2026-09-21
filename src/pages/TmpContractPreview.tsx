import { useState } from "react";
import ContractSheet from "@/components/ContractSheet";

export default function TmpContractPreview() {
  const [s, setS] = useState<Record<string, string>>({});
  const g = (k: string) => s[k] || "";
  const set = (k: string) => (v: string) => setS((p) => ({ ...p, [k]: v }));
  return (
    <div className="max-w-3xl mx-auto p-6">
      <ContractSheet
        docNumber={g("n")} setDocNumber={set("n")}
        city={g("city")} setCity={set("city")}
        startDate={g("sd")} setStartDate={set("sd")}
        endDate={g("ed")} setEndDate={set("ed")}
        assignor={g("a")} setAssignor={set("a")}
        assignorEik={g("ae")} setAssignorEik={set("ae")}
        assignorAddress={g("aa")} setAssignorAddress={set("aa")}
        executor={g("e") || "Караманов Груп ЕООД"} setExecutor={set("e")}
        executorEik={g("ee")} setExecutorEik={set("ee")}
        executorAddress={g("ea")} setExecutorAddress={set("ea")}
        signFor={g("sf")} setSignFor={set("sf")}
        signBy={g("sb")} setSignBy={set("sb")}
        object={g("o")} setObject={set("o")}
        contractPrice={g("cp")} setContractPrice={set("cp")}
        paymentTerms={g("pt")} setPaymentTerms={set("pt")}
        bankAccount={g("ba")} setBankAccount={set("ba")}
        warrantyMonths={g("wm")} setWarrantyMonths={set("wm")}
        penaltyPercent={g("pp")} setPenaltyPercent={set("pp")}
        executorOptions={["Караманов Груп ЕООД", "Александър Строй ЕООД"]}
        repOptions={[]}
      />
    </div>
  );
}
