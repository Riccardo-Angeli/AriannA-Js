/**
 * @module    components/charts
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * General-purpose charts (not the Finance-specific ones, which live in
 * components/finance — those use heavier domain types). `LineChart` here
 * is a simple line/area chart for dashboards and reports; the `LineChart`
 * inside finance/ is OHLC-aware and not interchangeable.
 *
 *   import { BarChart, LineChart, PieChart } from 'arianna/components/charts';
 */

export { BarChart  } from './BarChart.ts';
export { LineChart } from './LineChart.ts';
export { PieChart  } from './PieChart.ts';
