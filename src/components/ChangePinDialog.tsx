import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChangePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forced?: boolean;
}

export function ChangePinDialog({ open, onOpenChange, forced = false }: ChangePinDialogProps) {
  const { pinId, clearMustChange, logout } = useAuth();
  const [step, setStep] = useState<"old" | "new" | "confirm">(forced ? "new" : "old");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep(forced ? "new" : "old");
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handleClose = (val: boolean) => {
    if (forced) return; // Can't close forced dialog
    if (!val) reset();
    onOpenChange(val);
  };

  const handleSubmit = async () => {
    if (step === "old") {
      if (oldPin.length < 6) return;
      setStep("new");
      return;
    }
    if (step === "new") {
      if (newPin.length < 6) return;
      setStep("confirm");
      return;
    }

    // Confirm step
    if (newPin !== confirmPin) {
      toast.error("PIN кодовете не съвпадат");
      setConfirmPin("");
      setStep("new");
      setNewPin("");
      return;
    }

    setLoading(true);
    try {
      const actualOldPin = forced ? "" : oldPin;
      // For forced change, we use a special approach - the PIN ID is already verified
      const { data, error } = await supabase.rpc("change_pin", {
        p_id: pinId,
        p_old_pin: actualOldPin,
        p_new_pin: newPin,
      });

      if (error) throw error;

      if (data) {
        toast.success("PIN кодът е сменен успешно!");
        clearMustChange();
        reset();
        onOpenChange(false);
      } else {
        toast.error("Грешен стар PIN код");
        reset();
      }
    } catch (e) {
      toast.error("Грешка при смяна на PIN");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    old: "Въведете стария PIN",
    new: "Въведете нов PIN код",
    confirm: "Потвърдете новия PIN",
  };

  const currentValue = step === "old" ? oldPin : step === "new" ? newPin : confirmPin;
  const setter = step === "old" ? setOldPin : step === "new" ? setNewPin : setConfirmPin;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs" onPointerDownOutside={forced ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-center">{titles[step]}</DialogTitle>
          <DialogDescription className="text-center">
            {forced
              ? "Трябва да смените PIN кода си при първия вход"
              : step === "old"
              ? "За сигурност въведете текущия си PIN"
              : step === "new"
              ? "Изберете нов 4-6 цифрен код"
              : "Въведете новия PIN отново"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP
            maxLength={6}
            value={currentValue}
            onChange={setter}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div className="flex gap-2 w-full">
            {forced && (
              <Button variant="outline" className="flex-1" onClick={logout}>
                Изход
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={loading || currentValue.length < 6}
              className="flex-1"
            >
              {loading ? "Запазване..." : step === "confirm" ? "Запази" : "Напред"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
