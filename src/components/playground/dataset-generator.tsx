"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Synthetic dataset generator. Every pattern is produced by a seeded PRNG, so
   a given seed always reproduces the same points — the on-screen plot and the
   downloaded CSV are guaranteed to match. Swapping in a served/precomputed
   dataset later just means replacing `generate*` with a fetch; the controls
   and plot don't change.
   -------------------------------------------------------------------------- */

type TaskType = "regression" | "classification";
type RegressionPattern = "linear" | "polynomial" | "sinusoidal" | "exponential";
type ClassificationPattern = "blobs" | "moons" | "circles" | "spiral" | "checkerboard";

type RegressionPoint = { x: number; y: number };
type ClassPoint = { x: number; y: number; label: number };

const PALETTE = ["#7c5cff", "#00d4ff", "#2dd4a7", "#ffb43d", "#ff5ca8", "#f97316"];

const REGRESSION_PATTERNS: { id: RegressionPattern; label: string; blurb: string }[] = [
  { id: "linear", label: "Linear", blurb: "y = a·x + b — the textbook regression line." },
  { id: "polynomial", label: "Polynomial", blurb: "A quadratic bowl. A straight-line fit will underfit it." },
  { id: "sinusoidal", label: "Sinusoidal", blurb: "A periodic signal — needs basis expansion or a nonlinear model." },
  { id: "exponential", label: "Exponential", blurb: "A growth curve — try fitting it after a log transform." },
];

const CLASSIFICATION_PATTERNS: {
  id: ClassificationPattern;
  label: string;
  blurb: string;
  fixedClasses?: number;
}[] = [
  { id: "blobs", label: "Blobs", blurb: "Well-separated Gaussian clusters — a linear boundary works fine." },
  { id: "moons", label: "Moons", blurb: "Two interleaving crescents — no straight line separates these.", fixedClasses: 2 },
  { id: "circles", label: "Circles", blurb: "Concentric rings — needs a radial, nonlinear boundary." },
  { id: "spiral", label: "Spiral", blurb: "Interleaved spiral arms — the classic classifier stress test." },
  { id: "checkerboard", label: "Checkerboard", blurb: "Alternating grid cells — purely local structure, no global trend." },
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function regressionValue(pattern: RegressionPattern, x: number): number {
  switch (pattern) {
    case "linear":
      return 0.15 + 0.7 * x;
    case "polynomial":
      return 0.92 - 3.2 * (x - 0.5) ** 2;
    case "sinusoidal":
      return 0.5 + 0.38 * Math.sin(x * Math.PI * 3);
    case "exponential":
      return 0.05 + (0.85 * (Math.exp(2.5 * x) - 1)) / (Math.exp(2.5) - 1);
  }
}

function generateRegression(pattern: RegressionPattern, n: number, noise: number, rand: () => number): RegressionPoint[] {
  const pts: RegressionPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand();
    const y = regressionValue(pattern, x) + gaussian(rand) * noise * 0.15;
    pts.push({ x, y: Math.min(1.05, Math.max(-0.05, y)) });
  }
  return pts;
}

function generateClassification(
  pattern: ClassificationPattern,
  n: number,
  noise: number,
  classes: number,
  rand: () => number,
): ClassPoint[] {
  const pts: ClassPoint[] = [];
  const jitter = 0.02 + noise * 0.16;

  if (pattern === "blobs") {
    for (let i = 0; i < n; i++) {
      const label = i % classes;
      const angle = (label / classes) * Math.PI * 2;
      const cx = 0.5 + Math.cos(angle) * 0.28;
      const cy = 0.5 + Math.sin(angle) * 0.28;
      pts.push({ x: cx + gaussian(rand) * jitter, y: cy + gaussian(rand) * jitter, label });
    }
  } else if (pattern === "moons") {
    // The two half-circles span different raw x/y ranges (the classic
    // make_moons formula), so normalize both together before placing them
    // in the [0,1] box — a fixed offset/radius would misalign them.
    const raw: { x: number; y: number; label: number }[] = [];
    for (let i = 0; i < n; i++) {
      const label = i % 2;
      const t = rand() * Math.PI;
      const [x, y] = label === 0 ? [Math.cos(t), Math.sin(t)] : [1 - Math.cos(t), 1 - Math.sin(t) - 0.5];
      raw.push({ x, y, label });
    }
    const xs = raw.map((p) => p.x);
    const ys = raw.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    for (const p of raw) {
      pts.push({
        x: 0.08 + ((p.x - minX) / (maxX - minX)) * 0.84 + gaussian(rand) * jitter * 0.3,
        y: 0.08 + ((p.y - minY) / (maxY - minY)) * 0.84 + gaussian(rand) * jitter * 0.3,
        label: p.label,
      });
    }
  } else if (pattern === "circles") {
    for (let i = 0; i < n; i++) {
      const label = i % classes;
      const r = ((label + 1) / classes) * 0.42;
      const angle = rand() * Math.PI * 2;
      pts.push({
        x: 0.5 + Math.cos(angle) * r + gaussian(rand) * jitter * 0.5,
        y: 0.5 + Math.sin(angle) * r + gaussian(rand) * jitter * 0.5,
        label,
      });
    }
  } else if (pattern === "spiral") {
    const turns = 2.2;
    for (let i = 0; i < n; i++) {
      const label = i % classes;
      const t = rand();
      const r = t * 0.45;
      const angle = t * Math.PI * 2 * turns + (label * Math.PI * 2) / classes;
      pts.push({
        x: 0.5 + r * Math.cos(angle) + gaussian(rand) * jitter * 0.5,
        y: 0.5 + r * Math.sin(angle) + gaussian(rand) * jitter * 0.5,
        label,
      });
    }
  } else {
    const grid = 4;
    for (let i = 0; i < n; i++) {
      const x = rand();
      const y = rand();
      const cell = Math.floor(x * grid) + Math.floor(y * grid);
      pts.push({ x, y, label: cell % classes });
    }
  }

  return pts;
}

function toCsv(task: TaskType, rows: RegressionPoint[] | ClassPoint[]): string {
  if (task === "regression") {
    const body = (rows as RegressionPoint[]).map((p) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`);
    return ["x,y", ...body].join("\n");
  }
  const body = (rows as ClassPoint[]).map((p) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.label}`);
  return ["x1,x2,label", ...body].join("\n");
}

export function DatasetGeneratorPlayground({
  defaultSamples = 180,
  defaultNoise = 0.25,
}: {
  defaultSamples?: number;
  defaultNoise?: number;
}) {
  const [task, setTask] = useState<TaskType>("classification");
  const [regPattern, setRegPattern] = useState<RegressionPattern>("linear");
  const [clsPattern, setClsPattern] = useState<ClassificationPattern>("spiral");
  const [samples, setSamples] = useState(defaultSamples);
  const [noise, setNoise] = useState(defaultNoise);
  const [classes, setClasses] = useState(3);
  const [seed, setSeed] = useState(7);

  const activeClsMeta = CLASSIFICATION_PATTERNS.find((p) => p.id === clsPattern)!;
  const effectiveClasses = activeClsMeta.fixedClasses ?? classes;

  const data = useMemo(() => {
    const rand = mulberry32(seed);
    return task === "regression"
      ? generateRegression(regPattern, samples, noise, rand)
      : generateClassification(clsPattern, samples, noise, effectiveClasses, rand);
  }, [task, regPattern, clsPattern, samples, noise, effectiveClasses, seed]);

  const truth = useMemo(() => {
    if (task !== "regression") return null;
    return Array.from({ length: 60 }, (_, i) => {
      const x = i / 59;
      return { x, y: regressionValue(regPattern, x) };
    });
  }, [task, regPattern]);

  const blurb = task === "regression"
    ? REGRESSION_PATTERNS.find((p) => p.id === regPattern)!.blurb
    : activeClsMeta.blurb;

  const classCounts = useMemo(() => {
    if (task !== "classification") return null;
    const counts = new Array(effectiveClasses).fill(0);
    for (const p of data as ClassPoint[]) counts[p.label]++;
    return counts;
  }, [task, data, effectiveClasses]);

  const download = () => {
    const csv = toCsv(task, data);
    const name = task === "regression" ? regPattern : clsPattern;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-dataset.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const S = 320;
  const toPx = (v: number) => v * S;
  const toPxY = (v: number) => S - v * S;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Icon name="database" size={15} className="text-[var(--color-accent-2)]" /> Dataset Generator
        </span>
        <span className="text-xs text-[var(--color-text-subtle)]">runs in your browser</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <TabButton active={task === "regression"} onClick={() => setTask("regression")}>
          Regression
        </TabButton>
        <TabButton active={task === "classification"} onClick={() => setTask("classification")}>
          Classification
        </TabButton>
        <span className="mx-1 hidden h-5 w-px bg-[var(--color-border)] sm:block" />
        {task === "regression"
          ? REGRESSION_PATTERNS.map((p) => (
              <PatternPill key={p.id} active={regPattern === p.id} onClick={() => setRegPattern(p.id)}>
                {p.label}
              </PatternPill>
            ))
          : CLASSIFICATION_PATTERNS.map((p) => (
              <PatternPill key={p.id} active={clsPattern === p.id} onClick={() => setClsPattern(p.id)}>
                {p.label}
              </PatternPill>
            ))}
      </div>

      <p className="border-b border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-muted)]">
        {blurb}
      </p>

      <div className="grid gap-5 p-5 md:grid-cols-[320px_1fr]">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full rounded-[var(--radius-md)] bg-[#0a0c16]" aria-label="Generated dataset plot">
          <defs>
            <linearGradient id="dg-fit" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>

          {task === "regression" && truth && (
            <polyline
              points={truth.map((p) => `${toPx(p.x)},${toPxY(p.y)}`).join(" ")}
              fill="none"
              stroke="url(#dg-fit)"
              strokeWidth={2.5}
              opacity={0.9}
            />
          )}

          {task === "regression"
            ? (data as RegressionPoint[]).map((p, i) => (
                <circle key={i} cx={toPx(p.x)} cy={toPxY(p.y)} r={3.5} fill="#00d4ff" opacity={0.75} />
              ))
            : (data as ClassPoint[]).map((p, i) => (
                <circle
                  key={i}
                  cx={toPx(p.x)}
                  cy={toPxY(p.y)}
                  r={3.5}
                  fill={PALETTE[p.label % PALETTE.length]}
                  opacity={0.85}
                />
              ))}
        </svg>

        <div className="flex flex-col gap-4">
          <Control label="Samples" value={samples} min={40} max={400} step={10} onChange={(v) => setSamples(Math.round(v))} />
          <Control label="Noise" value={noise} min={0} max={1} step={0.05} onChange={setNoise} format={(v) => v.toFixed(2)} />
          {task === "classification" && (
            <Control
              label="Classes"
              value={effectiveClasses}
              min={2}
              max={6}
              step={1}
              onChange={(v) => setClasses(Math.round(v))}
              disabled={Boolean(activeClsMeta.fixedClasses)}
              format={(v) => (activeClsMeta.fixedClasses ? `${v} (fixed)` : String(Math.round(v)))}
            />
          )}

          {classCounts && (
            <div className="flex flex-wrap gap-1.5">
              {classCounts.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                >
                  <span className="size-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Samples" value={String(data.length)} />
            <Metric label="Dimensions" value={task === "regression" ? "1 → 1" : "2 → label"} />
          </div>

          <div className="mt-auto flex gap-2">
            <button
              onClick={() => setSeed((s) => s + 1 + Math.floor(Math.random() * 1000))}
              className="flex-1 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-medium text-white"
            >
              Regenerate
            </button>
            <button
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <Icon name="download" size={14} /> CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white"
          : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
      )}
    >
      {children}
    </button>
  );
}

function PatternPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-[var(--color-accent)] bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-[var(--color-accent-soft)]"
          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]",
      )}
    >
      {children}
    </button>
  );
}

function Control({
  label, value, min, max, step, onChange, disabled, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; disabled?: boolean; format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        {label}
        <span className="font-[family-name:var(--font-mono)] text-[var(--color-text)]">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-accent)] disabled:opacity-40"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2">
      <p className="text-xs text-[var(--color-text-subtle)]">{label}</p>
      <p className="font-[family-name:var(--font-mono)] text-lg text-[var(--color-text)]">{value}</p>
    </div>
  );
}
