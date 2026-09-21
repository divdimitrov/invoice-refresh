import { ReactNode } from "react";

interface InlineProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  type?: string;
}

function ch(value: string, placeholder: string, min: number) {
  const len = Math.max(value.length, placeholder.length, min);
  return `${Math.min(len + 1, 70)}ch`;
}

export function InlineField({ value, onChange, placeholder = ".........", min = 8, type = "text" }: InlineProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: type === "date" ? "13ch" : ch(value, placeholder, min) }}
      className="inline-block align-baseline bg-primary/5 border-b border-dashed border-primary/50 px-1 py-0.5 rounded-t-sm text-foreground font-medium outline-none focus:bg-primary/10 focus:border-primary transition-colors placeholder:text-muted-foreground/60 placeholder:font-normal"
    />
  );
}

export function InlineSelect({
  value,
  onChange,
  options,
  placeholder = ".........",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const known = options.includes(value);
  return (
    <select
      value={known ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      className="inline-block align-baseline bg-primary/5 border-b border-dashed border-primary/50 px-1 py-0.5 rounded-t-sm text-foreground font-medium outline-none focus:bg-primary/10 focus:border-primary transition-colors max-w-full"
    >
      <option value="" disabled>
        {value && !known ? value : placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function InlineArea({ value, onChange, placeholder = "........." }: InlineProps) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={2}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full mt-1 resize-y bg-primary/5 border-b border-dashed border-primary/50 px-2 py-1 rounded-t-sm text-foreground font-medium outline-none focus:bg-primary/10 focus:border-primary transition-colors placeholder:text-muted-foreground/60 placeholder:font-normal"
    />
  );
}

export function Article({ children }: { children: ReactNode }) {
  return <p className="leading-[2.1] text-justify">{children}</p>;
}

export function ContractHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-center font-bold text-[13px] tracking-wide text-primary pt-3">{children}</h3>;
}
