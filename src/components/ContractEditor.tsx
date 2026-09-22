import { ReactNode } from "react";
import { ReactNode, useState } from "react";

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

const base =
  "inline-block align-baseline bg-primary/[0.06] border-b border-dashed border-primary/40 px-1.5 py-0.5 rounded-md text-foreground font-medium outline-none transition-all duration-200 hover:bg-primary/10 focus:bg-primary/10 focus:border-solid focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:italic";

export function InlineField({ value, onChange, placeholder = ".........", min = 8, type = "text" }: InlineProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: type === "date" ? "13ch" : ch(value, placeholder, min) }}
      className={base}
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
      className={`${base} max-w-full cursor-pointer appearance-none pr-5 bg-[length:10px] bg-no-repeat bg-[right_0.35rem_center] bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23888' stroke-width='1.6'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E")]`}
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

const OTHER = "__other__";

export function InlineCombo({
  value,
  onChange,
  options,
  placeholder = ".........",
  min = 14,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  min?: number;
}) {
  const known = options.includes(value);
  const [custom, setCustom] = useState(!known && value !== "");

  if (custom) {
    return (
      <span className="inline-flex items-center gap-1 align-baseline">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          style={{ width: ch(value, placeholder, min) }}
          className={base}
        />
        {options.length > 0 && (
          <button
            type="button"
            title="Избери от списъка"
            onClick={() => {
              setCustom(false);
              onChange("");
            }}
            className="text-[10px] text-muted-foreground hover:text-primary underline underline-offset-2"
          >
            списък
          </button>
        )}
      </span>
    );
  }

  return (
    <select
      value={known ? value : ""}
      onChange={(e) => {
        if (e.target.value === OTHER) {
          setCustom(true);
          onChange("");
        } else onChange(e.target.value);
      }}
      className={`${base} max-w-full cursor-pointer appearance-none pr-5 bg-[length:10px] bg-no-repeat bg-[right_0.35rem_center] bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23888' stroke-width='1.6'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E")]`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={OTHER}>Друг…</option>
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
      className={`${base} block w-full mt-1.5 resize-y px-2.5 py-1.5`}
    />
  );
}

export function Article({ children }: { children: ReactNode }) {
  return <p className="leading-[2.3] text-justify">{children}</p>;
}

function ClauseArea({
  text,
  original,
  onChange,
}: {
  text: string;
  original: string;
  onChange: (v: string | null) => void;
}) {
  return (
    <textarea
      value={text}
      rows={Math.max(2, Math.ceil(text.length / 95))}
      onChange={(e) => onChange(e.target.value === original ? null : e.target.value)}
      className="my-1 block w-full resize-y rounded-lg border border-primary/25 bg-primary/[0.03] p-2.5 text-[13px] leading-[1.9] text-foreground outline-none transition-colors focus:border-primary focus:bg-primary/[0.06] focus:ring-2 focus:ring-primary/20"
    />
  );
}

export function EditableClause({
  text,
  original,
  onChange,
  unlocked = false,
}: {
  text: string;
  original: string;
  onChange: (v: string | null) => void;
  unlocked?: boolean;
}) {
  if (unlocked) return <ClauseArea text={text} original={original} onChange={onChange} />;

  return (
    <p className="leading-[2.3] text-justify px-2 py-1">
      <span className={text !== original ? "bg-primary/[0.07] rounded px-0.5" : undefined}>{text}</span>
    </p>
  );
}

export function ContractHeading({ children }: { children: ReactNode }) {
  return (
    <div className="pt-6 pb-1 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
      <h3 className="text-center font-bold text-[12px] tracking-[0.12em] text-primary uppercase">{children}</h3>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
    </div>
  );
}

export function EditableWrap({
  plain,
  override,
  onChange,
  children,
  unlocked = false,
}: {
  id?: string;
  plain: string;
  override?: string;
  onChange: (v: string | null) => void;
  children: ReactNode;
  unlocked?: boolean;
}) {
  if (unlocked) return <ClauseArea text={override ?? plain} original={plain} onChange={onChange} />;

  if (override !== undefined && override !== plain) {
    return (
      <p className="leading-[2.3] text-justify px-2 py-1">
        <span className="bg-primary/[0.07] rounded px-0.5">{override}</span>
      </p>
    );
  }

  return <Article>{children}</Article>;
}
