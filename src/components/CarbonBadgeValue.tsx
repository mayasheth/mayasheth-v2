import { useEffect, useState } from "react";

export function CarbonBadgeValue({ green = 0 }) {
  const [gramsText, setGramsText] = useState("...");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pagePath = window.location.pathname;
    const saved = Number(localStorage.getItem(`transfer-bytes:${pagePath}`));
    if (!Number.isFinite(saved) || saved <= 0) {
      setGramsText("--");
      return;
    }
    fetch(`/api/carbonFootprint?bytes=${saved}&green=${green}`)
      .then((r) => r.json())
      .then((json) => {
        const d = json?.data ?? json;
        const grams =
          (typeof d?.gco2e === "number" ? d.gco2e : null) ??
          (d?.statistics?.co2?.grid?.grams ?? d?.statistics?.co2?.renewable?.grams ?? null);
        setGramsText(grams != null ? grams.toFixed(2) : "--");
      })
      .catch(() => {
        setGramsText("--");
      });
  }, [green]);

  return <p className="font-mono text-content-2">{gramsText}</p>;
}

// Usage:
// <CarbonBadgeValue>{gramsText =>
//   <span className="font-mono">{gramsText} g CO₂/view</span>
// }</CarbonBadgeValue>