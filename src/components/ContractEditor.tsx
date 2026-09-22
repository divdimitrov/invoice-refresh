import { Pencil } from "lucide-react";
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

export function EditableClause({
  text,
  original,
  onChange,
  autoEdit = false,
  resetLabel = "Върни оригинала",
  unlocked = false,
}: {
  text: string;
  original: string;
  onChange: (v: string | null) => void;
  autoEdit?: boolean;
  resetLabel?: string;
  unlocked?: boolean;
}) {
  const [editing, setEditing] = useState(autoEdit);
  const changed = text !== original;

  if (!unlocked) {
    return (
      <p className="leading-[2.3] text-justify px-2 py-1">
        <span className={changed ? "bg-primary/[0.07] rounded px-0.5" : undefined}>{text}</span>
      </p>
    );
  }

  if (editing) {
    return (
      <div className="my-1 rounded-lg border border-primary/40 bg-primary/[0.04] p-2.5">
        <textarea
          value={text}
          autoFocus
          rows={Math.max(3, Math.ceil(text.length / 90))}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y rounded-md bg-background/70 p-2 text-[13px] leading-[1.7] text-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40"
        />
        <div className="mt-2 flex items-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground"
          >
            Готово
          </button>
          {changed && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted-foreground underline underline-offset-2 hover:text-primary"
            >
              {resetLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative my-1 rounded-lg px-2 py-1 transition-colors hover:bg-primary/[0.04]">
      <p className="leading-[2.3] text-justify">
        <span className={changed ? "bg-primary/[0.07] rounded px-0.5" : undefined}>{text}</span>
      </p>
      <div className="mt-0.5 flex items-center gap-2">
        <button
          type="button"
          title="Промени клаузата"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/[0.07] px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
        >
          <Pencil className="h-3 w-3" />
          Промени текста
        </button>
        {changed && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-primary"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </div>
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
  id,
  plain,
  override,
  onChange,
  children,
  unlocked = false,
}: {
  id: string;
  plain: string;
  override?: string;
  onChange: (v: string | null) => void;
  children: ReactNode;
  unlocked?: boolean;
}) {
  const [opened, setOpened] = useState(false);

  if (override !== undefined) {
    return (
      <EditableClause
        key={id}
        text={override}
        original={plain}
        autoEdit={opened && unlocked}
        unlocked={unlocked}
        resetLabel="Върни полетата"
        onChange={(v) => {
          if (v === null) setOpened(false);
          onChange(v);
        }}
      />
    );
  }

  if (!unlocked) return <Article>{children}</Article>;

  return (
    <div className="group relative my-1 rounded-lg px-2 py-1 transition-colors hover:bg-primary/[0.04]">
      <Article>{children}</Article>
      <div className="mt-0.5">

        <button
          type="button"
          title="Промени текста на клаузата"
          onClick={() => {
            setOpened(true);
            onChange(plain);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/[0.07] px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
        >
          <Pencil className="h-3 w-3" />
          Промени текста
        </button>
      </div>
    </div>
  );
}
