// src/components/ui/ColorSwatchesGrid.tsx
import { useMemo, useState } from "react";

type ColorToken = { name: string; varName: string };

function getVarRaw(varName: string): string {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(varName).trim();
}

function getVarComputed(varName: string): string {
  const expr =
    getVarRaw(varName) ||
    (varName.startsWith("--") ? `var(${varName})` : varName);
  const probe = document.createElement("span");
  probe.style.color = expr;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color; // rgb(...) or rgb(r g b / a)
  document.body.removeChild(probe);
  return computed;
}

function getOklchLiteral(varName: string): string | null {
  // If your custom property literally contains 'oklch(...)', show that as-is for documentation.
  const raw = getVarRaw(varName);
  const m = raw.match(/oklch\([^)]*\)/i);
  return m ? m[0] : null;
}

function copy(text: string) {
  if (navigator?.clipboard?.writeText)
    navigator.clipboard.writeText(text).catch(() => {});
}

const normOKLCH = (s?: string | null) =>
  s ? s.toLowerCase().replace(/\s+/g, "") : null;

function Swatch({
  token,
  isBgMatch,
  onCopied,
  small = false,
}: {
  token: ColorToken;
  isBgMatch: boolean;
  onCopied: () => void;
  small?: boolean;
}) {
  const oklch = getOklchLiteral(token.varName); // expected to exist in your tokens
  const disabled = !oklch;

  return (
    <button
      type="button"
      onClick={() => {
        if (oklch) copy(oklch);
        onCopied();
      }}
      disabled={disabled}
      className={[
        `group focus-outline soft-transition hover-pop relative rounded-md ring-1 ring-transparent ${small ? "h-5 w-5 sm:h-6 sm:w-6" : "h-8 w-8 sm:h-10 sm:w-10"}`,
        isBgMatch ? "border-content-0 border-1 border-dotted" : "",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
      style={{ background: `var(${token.varName})` }}
      aria-label={`copy ${token.varName} OKLCH to clipboard`}
      title={disabled ? "no OKLCH available" : "click to copy OKLCH"}
    >
      {/* tiny toast */}
      <span className="bg-surface-2 font-base text-content-2 pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-sm opacity-0 transition group-[.copied]:opacity-100">
        copied
      </span>
    </button>
  );
}

/**
 * Renders two rows of 5 and a centered row of 3; only the swatch matching bgVar gets a default outline.
 * Copies OKLCH on click
 */
export function ColorSwatchesGrid({
  colors,
  bgVar = "--color-surface-1",
  small = false,
}: {
  colors: ColorToken[];
  bgVar?: string;
  small?: boolean;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Background matching (prefer OKLCH literal; fallback to computed RGB string equality if needed)
  const bgOKLCH = useMemo(() => normOKLCH(getOklchLiteral(bgVar)), [bgVar]);
  const bgRGB = useMemo(() => getVarComputed(bgVar), [bgVar]);

  const isBgMatch = (token: ColorToken) => {
    const tokOKLCH = normOKLCH(getOklchLiteral(token.varName));
    if (bgOKLCH && tokOKLCH) return tokOKLCH === bgOKLCH;
    // no hex here; only fallback to rgb string compare if ok
    return getVarComputed(token.varName) === bgRGB;
  };

  const rowSize = colors.length <= 6 ? colors.length : 5;
  const rows: ColorToken[][] = [];
  for (let i = 0; i < colors.length; i += rowSize) {
    rows.push(colors.slice(i, i + rowSize));
  }

  const onCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 900);
  };

  const Row = ({ row }: { row: ColorToken[] }) => (
    <div
      style={{ display: "grid", gridTemplateColumns: `repeat(${rowSize}, minmax(0, 1fr))`, gap: "0.5rem" }}
    >
      {row.map((c) => (
        <div
          key={c.varName}
          className={copiedKey === c.varName ? "group copied" : "group"}
        >
          <Swatch
            token={c}
            isBgMatch={isBgMatch(c)}
            onCopied={() => onCopied(c.varName)}
            small={small}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <Row key={i} row={row} />
      ))}
    </div>
  );
}
