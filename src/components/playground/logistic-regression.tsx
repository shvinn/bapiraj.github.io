"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

/* ----------------------------------------------------------------------------
   In-browser logistic regression. The training loop runs entirely client-side
   (no TF.js/backend needed for this 2D case). The PlaygroundRuntime interface
   below is the seam: a TensorFlow.js / ONNX Runtime Web / remote-inference
   backend can implement the same contract without changing this component.
   -------------------------------------------------------------------------- */

type Point = { x: number; y: number; label: 0 | 1 };

function makeData(n = 120, seed = 7): Point[] {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const gauss = () => (rand() + rand() + rand() + rand() - 2) / 2;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1;
    const cx = label === 0 ? 0.35 : 0.65;
    const cy = label === 0 ? 0.4 : 0.6;
    pts.push({ x: cx + gauss() * 0.14, y: cy + gauss() * 0.14, label });
  }
  return pts;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function LogisticRegressionPlayground({
  defaultLearningRate = 0.5,
  defaultEpochs = 200,
}: {
  defaultLearningRate?: number;
  defaultEpochs?: number;
}) {
  const data = useMemo(() => makeData(), []);
  const [lr, setLr] = useState(defaultLearningRate);
  const [epochs, setEpochs] = useState(defaultEpochs);
  const [weights, setWeights] = useState({ w1: 0, w2: 0, b: 0 });
  const [metrics, setMetrics] = useState({ loss: 0, acc: 0, trained: false });
  const [training, setTraining] = useState(false);
  const raf = useRef<number | null>(null);

  const train = useCallback(() => {
    if (training) return;
    setTraining(true);
    let { w1, w2, b } = { w1: 0, w2: 0, b: 0 };
    let epoch = 0;

    const step = () => {
      const batch = Math.min(8, epochs - epoch); // a few epochs per frame
      for (let k = 0; k < batch; k++) {
        let gw1 = 0, gw2 = 0, gb = 0;
        for (const p of data) {
          const pred = sigmoid(w1 * p.x + w2 * p.y + b);
          const err = pred - p.label;
          gw1 += err * p.x;
          gw2 += err * p.y;
          gb += err;
        }
        const m = data.length;
        w1 -= (lr * gw1) / m;
        w2 -= (lr * gw2) / m;
        b -= (lr * gb) / m;
        epoch++;
      }

      let loss = 0, correct = 0;
      for (const p of data) {
        const pred = sigmoid(w1 * p.x + w2 * p.y + b);
        loss += -(p.label * Math.log(pred + 1e-9) + (1 - p.label) * Math.log(1 - pred + 1e-9));
        if ((pred >= 0.5 ? 1 : 0) === p.label) correct++;
      }
      setWeights({ w1, w2, b });
      setMetrics({ loss: loss / data.length, acc: correct / data.length, trained: true });

      if (epoch < epochs) {
        raf.current = requestAnimationFrame(step);
      } else {
        setTraining(false);
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [data, lr, epochs, training]);

  const reset = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setTraining(false);
    setWeights({ w1: 0, w2: 0, b: 0 });
    setMetrics({ loss: 0, acc: 0, trained: false });
  };

  // Decision boundary line: w1*x + w2*y + b = 0  →  y = -(w1*x + b)/w2
  const { w1, w2, b } = weights;
  const boundary =
    metrics.trained && Math.abs(w2) > 1e-6
      ? [0, 1].map((x) => ({ x, y: -(w1 * x + b) / w2 }))
      : null;

  const S = 320; // svg size
  const toPx = (v: number) => v * S;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Icon name="play" size={15} className="text-[var(--color-accent-2)]" /> Logistic Regression
        </span>
        <span className="text-xs text-[var(--color-text-subtle)]">runs in your browser</span>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[320px_1fr]">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full rounded-[var(--radius-md)] bg-[#0a0c16]" aria-label="Decision boundary plot">
          <defs>
            <linearGradient id="lr-bound" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
          {boundary && (
            <line
              x1={toPx(boundary[0].x)}
              y1={toPx(boundary[0].y)}
              x2={toPx(boundary[1].x)}
              y2={toPx(boundary[1].y)}
              stroke="url(#lr-bound)"
              strokeWidth={3}
            />
          )}
          {data.map((p, i) => (
            <circle
              key={i}
              cx={toPx(p.x)}
              cy={toPx(p.y)}
              r={4}
              fill={p.label === 1 ? "#ff5ca8" : "#2dd4a7"}
              opacity={0.85}
            />
          ))}
        </svg>

        <div className="flex flex-col gap-4">
          <Control label="Learning rate" value={lr} min={0.01} max={3} step={0.01} onChange={setLr} disabled={training} />
          <Control label="Epochs" value={epochs} min={10} max={800} step={10} onChange={(v) => setEpochs(Math.round(v))} disabled={training} format={(v) => String(Math.round(v))} />

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Loss" value={metrics.trained ? metrics.loss.toFixed(3) : "—"} />
            <Metric label="Accuracy" value={metrics.trained ? `${(metrics.acc * 100).toFixed(0)}%` : "—"} />
          </div>

          <div className="mt-auto flex gap-2">
            <button
              onClick={train}
              disabled={training}
              className="flex-1 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {training ? "Training…" : "Train"}
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
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
        className="mt-2 w-full accent-[var(--color-accent)]"
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
