/**
 * @module    components/finance
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — finance widgets. Importing this module side-effect-registers
 * 11 custom-element tags so the tags become available in HTML markup,
 * plus re-exports the classes and shared types.
 *
 * # Tags registered
 *
 *   arianna-candlestick-chart   OHLC chart with bull/bear bodies
 *   arianna-line-chart          Multi-series line chart with grid+legend
 *   arianna-depth-chart         Cumulative bid/ask area
 *   arianna-heatmap-chart       N×N correlation matrix (diverging ramp)
 *   arianna-portfolio-donut     Asset allocation donut
 *   arianna-pnl-chart           P/L bar chart (zero-centered)
 *   arianna-risk-gauge          Semi-circular gauge
 *   arianna-order-book          Bid/ask ladder + mid/spread
 *   arianna-screener            Filterable instrument table
 *   arianna-sparkline           Mini inline price line
 *   arianna-alert-badge         Pill badge (4 severity levels)
 *
 * # Styling tokens
 *
 *   Widgets pull from the AriannA design tokens with sane fallbacks:
 *     --arianna-bg          surface
 *     --arianna-text        primary text
 *     --arianna-muted       secondary text
 *     --arianna-border      hairlines
 *     --arianna-primary     accent (link/info)
 *     --arianna-bull        positive direction  (default #26a69a)
 *     --arianna-bear        negative direction  (default #ef5350)
 *     --arianna-warning     warning             (default #f5a623)
 *     --arianna-danger      danger              (default #cf222e)
 *
 *   Override per-widget by setting attrs (e.g. `bull="#0a0"`) or by
 *   replacing the component's `.Sheet`.
 *
 * # Light/dark theme
 *
 *   v1 hard-coded `#131722` background. v2 uses tokens so the widgets
 *   inherit your app theme (light by default, swap tokens for dark mode).
 *
 * # Helpers (not registered as elements)
 *
 *   The `helpers.ts` module exports `_svg`, `_fmt`, `_fmtK`, `_esc` for
 *   internal use by the widgets. Stable API; exported for downstream
 *   apps that want consistent number formatting.
 */

// ── Re-exports ──────────────────────────────────────────────────────────────

export { CandlestickChart } from './CandlestickChart.ts';
export { LineChart }        from './LineChart.ts';
export { DepthChart }       from './DepthChart.ts';
export { HeatmapChart }     from './HeatmapChart.ts';
export { PortfolioDonut }   from './PortfolioDonut.ts';
export { PnLChart }         from './PnLChart.ts';
export { RiskGauge }        from './RiskGauge.ts';
export { OrderBook }        from './OrderBook.ts';
export { Screener }         from './Screener.ts';
export { Sparkline }        from './Sparkline.ts';
export { AlertBadge }       from './AlertBadge.ts';

export type { CandleBar, CandlestickChartOptions } from './CandlestickChart.ts';
export type { LineChartSeries, LineChartOptions } from './LineChart.ts';
export type { Level as DepthLevel, DepthChartOptions } from './DepthChart.ts';
export type { HeatmapChartOptions } from './HeatmapChart.ts';
export type { DonutSegment, PortfolioDonutOptions } from './PortfolioDonut.ts';
export type { PnLBar, PnLChartOptions } from './PnLChart.ts';
export type { RiskGaugeOptions } from './RiskGauge.ts';
export type { Level as OrderBookLevel, OrderBookOptions } from './OrderBook.ts';
export type { ScreenerRow, ScreenerOptions } from './Screener.ts';
export type { SparklineOptions } from './Sparkline.ts';
export type { AlertLevel, AlertBadgeOptions } from './AlertBadge.ts';

// ── Helpers (re-exported for downstream consistency) ────────────────────────

export { _svg, _fmt, _fmtK, _esc } from './helpers.ts';

// ── Convenience bundle ─────────────────────────────────────────────────────

import { CandlestickChart } from './CandlestickChart.ts';
import { LineChart }        from './LineChart.ts';
import { DepthChart }       from './DepthChart.ts';
import { HeatmapChart }     from './HeatmapChart.ts';
import { PortfolioDonut }   from './PortfolioDonut.ts';
import { PnLChart }         from './PnLChart.ts';
import { RiskGauge }        from './RiskGauge.ts';
import { OrderBook }        from './OrderBook.ts';
import { Screener }         from './Screener.ts';
import { Sparkline }        from './Sparkline.ts';
import { AlertBadge }       from './AlertBadge.ts';

export const FinanceComponents = {
    CandlestickChart, LineChart, DepthChart, HeatmapChart,
    PortfolioDonut, PnLChart, RiskGauge,
    OrderBook, Screener, Sparkline, AlertBadge,
};

export default FinanceComponents;
