/**
 * @module    components/shipments/Tracker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Carrier-agnostic shipment-tracker base widget. Renders a unified timeline
 * of `TrackingEvent`s with status icon, location, timestamp, and a final
 * "Track on <carrier> →" button that opens the carrier's public tracking
 * page in a new tab.
 *
 * The 4 carrier-specific subclasses (DHL, UPS, FedEx, BRT) configure brand
 * colours, logos, the public tracking URL pattern, and a regex for tracking-
 * number validation; everything else is shared.
 *
 *   ┌─────────────────────────────────────────────┐
 *   │ DHL · 1234567890                            │
 *   ├─────────────────────────────────────────────┤
 *   │ ● Delivered — Roma, IT — 06 May, 14:22       │
 *   │ ●  Out for delivery — Roma, IT — 06 May, 09:11│
 *   │ ○ Arrived at hub — Milano, IT — 05 May, 23:14│
 *   │ ○ In transit — DE → IT — 05 May, 06:00       │
 *   │ ○ Picked up — Berlin, DE — 04 May, 18:30     │
 *   ├─────────────────────────────────────────────┤
 *   │       [ Track on DHL → ]                     │
 *   └─────────────────────────────────────────────┘
 *
 * IMPORTANT — API access: live carrier APIs require server-side credentials
 * (DHL Tracking API key, UPS OAuth, FedEx API client, BRT auth) that must
 * NEVER ship to the browser. The widget therefore expects the merchant
 * server to fetch, normalise, and feed it the events via `setEvents()`. As
 * an escape hatch, the widget can also operate in pure "link" mode where no
 * events are displayed and only the public tracking URL is exposed.
 *
 * The base class is concrete — it can be used directly with a custom
 * `CarrierConfig`; the four subclasses pre-bind the well-known carriers.
 *
 * @example
 *   import { Tracker } from 'arianna/components/shipments';
 *
 *   // Use the base directly with a custom carrier
 *   const t = new Tracker();
 *   t.setCarrier({
 *     id: 'gls', name: 'GLS', color: '#0033a0',
 *     publicUrl: 'https://gls-group.com/track/{n}', logo: '...',
 *   });
 *   t.setTrackingNumber('123456789');
 *   t.setEvents(eventsFromServer);
 *
 *   // Subscribe to portal-open clicks
 *   t.addEventListener('arianna:tracking-portal', e =>
 *     analytics.track('portal_open', { carrier: e.detail.carrier }));
 *
 * Events:
 *   arianna:tracking-portal  detail: { carrier: string, url: string }
 *   arianna:tracking-event   detail: { event: TrackingEvent }  (fired per setEvents change)
 *
 * Attrs: tracking-number, carrier, locale
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type TrackingEventKind =
    | 'created'
    | 'picked-up'
    | 'in-transit'
    | 'arrived'
    | 'customs'
    | 'out-delivery'
    | 'delivered'
    | 'failed'
    | 'returned'
    | 'exception'
    | 'unknown';

export interface TrackingEvent {
    kind     : TrackingEventKind;
    raw?     : string;
    location?: string;
    /** Unix ms. */
    at       : number;
}

export interface CarrierConfig {
    id        : string;
    name      : string;
    publicUrl : string;
    color     : string;
    logo      : string;
    pattern?  : RegExp;
}

export interface TrackerOptions {
    trackingNumber? : string;
    carrier?        : CarrierConfig;
    events?         : TrackingEvent[];
    locale?         : string;
}

const KIND_LABELS: Record<TrackingEventKind, string> = {
    'created'      : 'Created',
    'picked-up'    : 'Picked up',
    'in-transit'   : 'In transit',
    'arrived'      : 'Arrived at hub',
    'customs'      : 'In customs',
    'out-delivery' : 'Out for delivery',
    'delivered'    : 'Delivered',
    'failed'       : 'Delivery failed',
    'returned'     : 'Returned',
    'exception'    : 'Exception',
    'unknown'      : 'Unknown',
};

const KIND_ICONS: Record<TrackingEventKind, string> = {
    'created'      : '○',
    'picked-up'    : '○',
    'in-transit'   : '○',
    'arrived'      : '○',
    'customs'      : '⊘',
    'out-delivery' : '◐',
    'delivered'    : '●',
    'failed'       : '✕',
    'returned'     : '↩',
    'exception'    : '⚠',
    'unknown'      : '?',
};

const TERMINAL: TrackingEventKind[] = ['delivered', 'returned'];

function formatDate(ts: number, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(ts));
    } catch {
        return new Date(ts).toLocaleString();
    }
}

export class Tracker extends Component('arianna-tracker', HTMLElement, {}, {
    attrs : ['tracking-number', 'carrier', 'locale'],
    shadow: false,
})
{
    events$  : Signal<TrackingEvent[]> = signal<TrackingEvent[]>([]);
    carrier$ : Signal<CarrierConfig | null> = signal<CarrierConfig | null>(null);

    build(_opts: TrackerOptions = {})
    {
        const numberAttr = this.attrSignal('tracking-number');
        const localeAttr = this.attrSignal('locale');

        this.headerTitle = () => {
            const c = this.carrier$.get();
            const n = numberAttr.get();
            if (!c && !n) return 'Shipment tracker';
            const parts: string[] = [];
            if (c?.name) parts.push(c.name);
            if (n)       parts.push(n);
            return parts.join(' · ');
        };

        this.headerStyle = () => {
            const c = this.carrier$.get();
            return c?.color ? `border-left: 3px solid ${c.color}` : '';
        };

        this.logoHtml = () => this.carrier$.get()?.logo ?? '';

        this.hasEvents = () => this.events$.get().length > 0;
        this.hasCarrierLink = () => {
            const c = this.carrier$.get();
            const n = numberAttr.get();
            return !!(c?.publicUrl && n);
        };

        this.portalLabel = () => {
            const c = this.carrier$.get();
            return c ? `Track on ${c.name} →` : 'Open portal →';
        };

        this.eventList = (): Array<{ icon: string; label: string; raw: string; location: string; date: string; cls: string }> => {
            const locale = localeAttr.get() ?? 'en';
            // Sort descending by `at` (most recent first)
            return [...this.events$.get()].sort((a, b) => b.at - a.at).map(e => ({
                icon    : KIND_ICONS[e.kind] ?? KIND_ICONS.unknown,
                label   : KIND_LABELS[e.kind] ?? e.kind,
                raw     : e.raw     ?? '',
                location: e.location ?? '',
                date    : formatDate(e.at, locale),
                cls     : 'ar-trk__event ar-trk__event--' + e.kind
                          + (TERMINAL.includes(e.kind) ? ' ar-trk__event--terminal' : ''),
            }));
        };

        this.onPortalClick = () => {
            const c = this.carrier$.get();
            const n = numberAttr.get();
            if (!c?.publicUrl || !n) return;
            const url = c.publicUrl.replace('{n}', encodeURIComponent(n));
            this.dispatchEvent(new CustomEvent('arianna:tracking-portal', {
                bubbles: true, detail: { carrier: c.id, url },
            }));
            window.open(url, '_blank', 'noopener');
        };

        this.template = html`
            <div class="ar-trk">
                <header class="ar-trk__header" :style="this.headerStyle()">
                    <span class="ar-trk__logo" a-if="this.logoHtml()"
                          .innerHTML="this.logoHtml()"></span>
                    <span class="ar-trk__title">{{ this.headerTitle() }}</span>
                </header>
                <ol class="ar-trk__events" a-if="this.hasEvents()">
                    <li a-for="e in this.eventList()" :class="e.cls">
                        <span class="ar-trk__icon">{{ e.icon }}</span>
                        <div class="ar-trk__body">
                            <div class="ar-trk__label">{{ e.label }}</div>
                            <div class="ar-trk__meta">
                                <span a-if="e.location">{{ e.location }}</span>
                                <span class="ar-trk__date">{{ e.date }}</span>
                            </div>
                            <div class="ar-trk__raw" a-if="e.raw">{{ e.raw }}</div>
                        </div>
                    </li>
                </ol>
                <div class="ar-trk__empty" a-if="!this.hasEvents()">
                    No tracking events yet.
                </div>
                <button type="button" class="ar-trk__portal"
                        a-if="this.hasCarrierLink()"
                        @click="this.onPortalClick">{{ this.portalLabel() }}</button>
            </div>
        `;

        this.Sheet = Tracker.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setCarrier(c: CarrierConfig): this {
        this.carrier$.set({ ...c });
        this.setAttribute('carrier', c.id);
        return this;
    }
    getCarrier(): CarrierConfig | null { return this.carrier$.get(); }

    setTrackingNumber(n: string): this {
        this.setAttribute('tracking-number', n);
        return this;
    }
    getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }

    setEvents(events: TrackingEvent[]): this {
        const sanitized = events.map(e => ({ ...e }));
        this.events$.set(sanitized);
        // Fire one event per setEvents call (last event = most recent)
        const last = sanitized[sanitized.length - 1];
        if (last) {
            this.dispatchEvent(new CustomEvent('arianna:tracking-event', {
                bubbles: true, detail: { event: { ...last } },
            }));
        }
        return this;
    }
    getEvents(): TrackingEvent[] { return this.events$.get().map(e => ({ ...e })); }

    validateNumber(n: string): boolean {
        const c = this.carrier$.get();
        if (!c?.pattern) return n.length > 0;
        return c.pattern.test(n);
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private headerTitle    : () => string = () => 'Shipment tracker';
    private headerStyle    : () => string = () => '';
    private logoHtml       : () => string = () => '';
    private hasEvents      : () => boolean = () => false;
    private hasCarrierLink : () => boolean = () => false;
    private portalLabel    : () => string = () => 'Open portal →';
    private eventList      : () => Array<{ icon: string; label: string; raw: string; location: string; date: string; cls: string }> = () => [];
    private onPortalClick  : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display: 'block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, #1f2328)',
                    maxWidth: '480px',
                }),
                new Rule('.ar-trk', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    overflow: 'hidden',
                }),
                new Rule('.ar-trk__header', {
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px',
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-trk__logo', { display: 'inline-flex', alignItems: 'center' }),
                new Rule('.ar-trk__logo svg', { height: '20px' }),
                new Rule('.ar-trk__title', { fontWeight: '600', fontSize: '13px' }),
                new Rule('.ar-trk__events', {
                    listStyle: 'none', margin: '0', padding: '12px 16px',
                    display: 'flex', flexDirection: 'column', gap: '14px',
                }),
                new Rule('.ar-trk__event', {
                    display: 'flex', gap: '12px',
                    position: 'relative',
                }),
                new Rule('.ar-trk__event:not(:last-child)::after', {
                    content: '""',
                    position: 'absolute',
                    left: '8px', top: '20px', bottom: '-14px',
                    width: '1px',
                    background: 'var(--arianna-border, #d8d8d8)',
                }),
                new Rule('.ar-trk__icon', {
                    width: '18px', height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    flexShrink: '0',
                    background: 'var(--arianna-bg, #fff)',
                    position: 'relative',
                    zIndex: '1',
                }),
                new Rule('.ar-trk__event--terminal .ar-trk__icon', {
                    color: 'var(--arianna-bull, #1f883d)',
                }),
                new Rule('.ar-trk__event--failed .ar-trk__icon, .ar-trk__event--exception .ar-trk__icon', {
                    color: 'var(--arianna-danger, #cf222e)',
                }),
                new Rule('.ar-trk__body', { flex: '1', minWidth: '0' }),
                new Rule('.ar-trk__label', { fontWeight: '600', fontSize: '13px' }),
                new Rule('.ar-trk__meta', {
                    display: 'flex',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    marginTop: '2px',
                }),
                new Rule('.ar-trk__date', { fontFamily: 'ui-monospace, monospace' }),
                new Rule('.ar-trk__raw', {
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    marginTop: '4px',
                    fontStyle: 'italic',
                }),
                new Rule('.ar-trk__empty', {
                    padding: '24px 16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-trk__portal', {
                    width: '100%',
                    padding: '11px',
                    background: 'transparent',
                    color: 'var(--arianna-text, #1f2328)',
                    border: 'none',
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                }),
                new Rule('.ar-trk__portal:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Tracker', {
        value: Tracker, writable: false, enumerable: false, configurable: false,
    });
}

export default Tracker;
