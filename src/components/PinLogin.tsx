import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PIN_LENGTH = 4;

export function PinLogin() {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    setError(false);
    setPin(prev => prev + digit);
  };

  const handleDelete = () => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length < PIN_LENGTH) return;
    setLoading(true);
    setError(false);

    try {
      const { data, error: rpcError } = await supabase.rpc("verify_pin", { p_pin: pin });
      if (rpcError) throw rpcError;

      if (data?.valid) {
        login(data.id, data.must_change);
        toast.success("Успешен вход!");
      } else {
        setError(true);
        setPin("");
        toast.error("Грешен PIN код");
      }
    } catch (e) {
      toast.error("Грешка при свързване");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg mx-auto">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Въведете PIN код</h1>
          <p className="text-sm text-muted-foreground">Въведете вашия код за достъп</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: Math.max(PIN_LENGTH, pin.length) }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === pin.length - 1 ? [1, 1.3, 1] : 1,
                backgroundColor: error
                  ? "hsl(var(--destructive))"
                  : i < pin.length
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted))",
              }}
              transition={{ duration: 0.15 }}
              className="h-4 w-4 rounded-full"
            />
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center text-sm text-destructive font-medium"
            >
              Грешен код, опитайте отново
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              disabled={loading}
              className="h-16 rounded-2xl bg-card border border-border text-xl font-semibold text-foreground
                         active:scale-95 active:bg-accent transition-all duration-100
                         hover:bg-accent/50 disabled:opacity-50"
            >
              {d}
            </button>
          ))}

          {/* Bottom row: delete, 0, submit */}
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-16 rounded-2xl bg-card border border-border flex items-center justify-center
                       active:scale-95 active:bg-accent transition-all duration-100
                       hover:bg-accent/50 disabled:opacity-30"
          >
            <Delete className="h-6 w-6 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleDigit("0")}
            disabled={loading}
            className="h-16 rounded-2xl bg-card border border-border text-xl font-semibold text-foreground
                       active:scale-95 active:bg-accent transition-all duration-100
                       hover:bg-accent/50 disabled:opacity-50"
          >
            0
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < PIN_LENGTH}
            className="h-16 rounded-2xl gradient-bg flex items-center justify-center
                       active:scale-95 transition-all duration-100
                       disabled:opacity-30"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <ArrowRight className="h-6 w-6 text-primary-foreground" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
