/** @module components/charts */
export { BarChart } from './BarChart.ts'; export type { BarDatum, BarChartOptions } from './BarChart.ts';
export { LineChart } from './LineChart.ts'; export type { LinePoint, LineSeries, LineChartOptions } from './LineChart.ts';
export { PieChart } from './PieChart.ts'; export type { PieDatum, PieChartOptions } from './PieChart.ts';
import { BarChart } from './BarChart.ts';import { LineChart } from './LineChart.ts';import { PieChart } from './PieChart.ts';
export const ChartComponents={BarChart,LineChart,PieChart};export default ChartComponents;
