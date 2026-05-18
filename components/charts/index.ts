/**
 * @module    components/charts
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * SVG-based chart widgets — no external deps.
 *
 *   • BarChart  — categorical bars (configurable y-range, grid, values)
 *   • LineChart — multi-series lines, optional area fill, Catmull-Rom smoothing
 *   • PieChart  — pie / donut with legend
 *
 *   import { BarChart, LineChart, PieChart } from 'arianna/components/charts';
 *
 *   const bar = new BarChart({ width: 480, height: 280 });
 *   bar.data = [
 *     { label: 'Q1', value: 120 },
 *     { label: 'Q2', value: 180 },
 *     { label: 'Q3', value: 95  },
 *     { label: 'Q4', value: 210 },
 *   ];
 *   bar.append(document.body);
 */

export { BarChart }  from './BarChart.ts';
export type { BarChartOptions, BarDatum } from './BarChart.ts';

export { LineChart } from './LineChart.ts';
export type { LineChartOptions, LineSeries, LinePoint } from './LineChart.ts';

export { PieChart }  from './PieChart.ts';
export type { PieChartOptions, PieDatum } from './PieChart.ts';
