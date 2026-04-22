'use client';

import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, ChartOptions, ScriptableContext, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, Filler, annotationPlugin);

export type HistoricalPoint = {
  dt: string;
  price: number;
  average: number;
  low: number;
  high: number;
};

export type Stock = {
  symbol?: string;
  name?: string;
  historical?: HistoricalPoint[];
};

type Props = {
  stock?: Stock | null;
  height?: number;
};

export default function StockHistoryChart({
  stock = null,
  height = 45,
}: Props) {
  const historical = Array.isArray(stock?.historical) ? stock.historical : [];

  const sorted = [...historical]
    .filter(
      (p) =>
        p &&
        p.dt &&
        typeof p.price === 'number' &&
        !Number.isNaN(p.price)
    )
    .sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime());

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const isUp = !!(first && latest && latest.price >= first.price);

  const lineColor = isUp ? '#13deb9' : '#ff4d4f';
  const glowColor = isUp
    ? 'rgba(19, 222, 185, 0.35)'
    : 'rgba(255, 77, 79, 0.35)';

  const data = {
    datasets: [
      {
        label: 'Price',
        data: sorted.map((p) => ({
          x: p.dt,
          y: p.price,
        })),
        borderColor: lineColor,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return glowColor;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: '#00bfff',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          title: (items) => {
            const raw = items?.[0]?.parsed?.x;
            if (!raw) return stock?.symbol || 'Stock';
            return new Date(raw).toLocaleTimeString();
          },
          label: (context) => `$${Number(context.parsed.y).toFixed(2)}`,
        },
      },
      annotation: latest
        ? {
            annotations: {
              latestPriceLine: {
                type: 'line',
                yMin: latest.price,
                yMax: latest.price,
                borderColor: 'rgba(0, 191, 255, 0.7)',
                borderWidth: 1,
                borderDash: [3, 3],
              },
            },
          }
        : undefined,
    },
    scales: {
      x: {
        display: false,
        type: 'time',
        time: {
          tooltipFormat: 'PPpp',
        },
      },
      y: {
        display: false,
        beginAtZero: false,
      },
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
    },
  };

  if (!sorted.length) {
    return <></>;
  }

  return (
    <div className={`stockChart`}>
      <Line data={data} options={options} />
    </div>
  );
}