import React, { useEffect, useRef } from "react";

/* ---------------- TREND CHART ---------------- */

interface TrendChartProps {
  data: { year: number; value: number }[];
  color?: string;
  height?: number;
  showAxes?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  color = "#22c55e",
  height = 200,
  showAxes = true
}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    if (!data || data.length < 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const heightCanvas = rect.height;

    const padding = showAxes ? 40 : 10;

    const chartWidth = width - padding * 2;
    const chartHeight = heightCanvas - padding * 2;

    const values = data.map(d => d.value);

    const min = Math.min(...values) * 0.9;
    const max = Math.max(...values) * 1.1;

    const range = max - min || 1;

    ctx.clearRect(0, 0, width, heightCanvas);

    /* ---------- GRID ---------- */

    if (showAxes) {

      ctx.strokeStyle = "#21272f";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {

        const y = padding + (chartHeight / 4) * i;

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

      }

    }

    /* ---------- LINE ---------- */

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    data.forEach((d, i) => {

      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y =
        heightCanvas -
        padding -
        ((d.value - min) / range) * chartHeight;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

    });

    ctx.stroke();

    /* ---------- GRADIENT FILL ---------- */

    const gradient = ctx.createLinearGradient(
      0,
      padding,
      0,
      heightCanvas - padding
    );

    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(1, `${color}00`);

    ctx.lineTo(padding + chartWidth, heightCanvas - padding);
    ctx.lineTo(padding, heightCanvas - padding);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();

    /* ---------- POINTS ---------- */

    data.forEach((d, i) => {

      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y =
        heightCanvas -
        padding -
        ((d.value - min) / range) * chartHeight;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#111418";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (showAxes) {

        ctx.fillStyle = "#9ca3af";
        ctx.font = "10px DM Mono";
        ctx.textAlign = "center";

        ctx.fillText(
          d.year.toString(),
          x,
          heightCanvas - padding + 15
        );

      }

    });

    /* ---------- Y LABELS ---------- */

    if (showAxes) {

      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px DM Mono";
      ctx.textAlign = "right";

      ctx.fillText(
        Math.round(max).toString(),
        padding - 5,
        padding + 5
      );

      ctx.fillText(
        Math.round(min).toString(),
        padding - 5,
        heightCanvas - padding + 5
      );

    }

  }, [data, color, showAxes]);

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full"/>
    </div>
  );
};

interface ComparisonBarDatum {
  label: string;
  a: number;
  b: number;
}

interface ComparisonBarChartProps {
  data: ComparisonBarDatum[];
  colorA?: string;
  colorB?: string;
  height?: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  colorA = "#22c55e",
  colorB = "#ef4444",
  height = 320
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const canvasHeight = rect.height;
    const paddingTop = 24;
    const paddingRight = 24;
    const paddingBottom = 54;
    const paddingLeft = 58;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = canvasHeight - paddingTop - paddingBottom;
    const maxValue = Math.max(...data.flatMap((entry) => [entry.a, entry.b]), 1);
    const gridLines = 4;
    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(36, groupWidth * 0.28);
    const gap = Math.min(16, groupWidth * 0.12);

    ctx.clearRect(0, 0, width, canvasHeight);

    ctx.strokeStyle = "#21272f";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px DM Mono";
      ctx.textAlign = "right";
      ctx.fillText(value.toLocaleString(), paddingLeft - 8, y + 3);
    }

    data.forEach((entry, index) => {
      const groupCenter = paddingLeft + groupWidth * index + groupWidth / 2;
      const leftX = groupCenter - gap / 2 - barWidth;
      const rightX = groupCenter + gap / 2;
      const leftHeight = (entry.a / maxValue) * chartHeight;
      const rightHeight = (entry.b / maxValue) * chartHeight;
      const leftY = paddingTop + chartHeight - leftHeight;
      const rightY = paddingTop + chartHeight - rightHeight;

      ctx.fillStyle = colorA;
      ctx.fillRect(leftX, leftY, barWidth, leftHeight);

      ctx.fillStyle = colorB;
      ctx.fillRect(rightX, rightY, barWidth, rightHeight);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px DM Mono";
      ctx.textAlign = "center";
      ctx.fillText(entry.label, groupCenter, canvasHeight - 18);
    });
  }, [colorA, colorB, data]);

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

/* ---------------- SAFETY RING ---------------- */

interface SafetyRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const SafetyRing: React.FC<SafetyRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10
}) => {

  const radius = (size - strokeWidth) / 2;

  const circumference = radius * 2 * Math.PI;

  const offset =
    circumference - (score / 100) * circumference;

  const getColor = (s: number) => {

    if (s >= 80) return "#22c55e";
    if (s >= 65) return "#eab308";
    if (s >= 45) return "#f97316";
    return "#ef4444";

  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >

      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#21272f"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="safety-ring"
        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-2xl font-bold font-mono text-white">
          {score.toFixed(2)}
        </span>

        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          Score
        </span>

      </div>

    </div>
  );

};
