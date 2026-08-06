/**
 * @module    components/shipments/Tracker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Tracker component module.
 */

import { Component, Css, Reactivity, Templates, Components } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   Tracker
 *  @public
 *  @description Namespace containing Tracker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Tracker
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        TrackingEventKindType
         *  @public
         *  @type        {TrackingEventKind}
         *  @description Type alias for TrackingEventKindType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type TrackingEventKindType = TrackingEventKind;

        /** Reactive Signal contract used by Tracker state. */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** AriannA stylesheet runtime type. */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   TrackingEventContract
         *  @public
         *  @description TrackingEventContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TrackingEventContract extends TrackingEvent
        {
        }

        /** @interface   CarrierConfigContract
         *  @public
         *  @description CarrierConfigContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CarrierConfigContract extends CarrierConfig
        {
        }

        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends TrackerOptions
        {
        }
    }

    /** @name        FormatDate
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned FormatDate value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const FormatDate = formatDate;

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const html = Templates.Template.Html;

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
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
     * Attributes: tracking-number, carrier, locale
     */
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const { Rule, Stylesheet } = Css;

    /** @name        TrackingEventKind
     *  @public
     *  @type        {'created' | 'picked-up' | 'in-transit' | 'arrived' | 'customs' | 'out-delivery' | 'delivered' | 'failed' | 'returned' | 'exception' | 'unknown'}
     *  @description Type alias for TrackingEventKind.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TrackingEventKind = 'created' | 'picked-up' | 'in-transit' | 'arrived' | 'customs' | 'out-delivery' | 'delivered' | 'failed' | 'returned' | 'exception' | 'unknown';

    /** @interface   TrackingEvent
     *  @public
     *  @description TrackingEvent contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface TrackingEvent
    {
        /** @name        kind
         *  @public
         *  @type        {TrackingEventKind}
         *  @description Component member for kind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        kind: TrackingEventKind;

        /** @name        raw
         *  @public
         *  @type        {string}
         *  @description Component member for raw.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        raw?: string;

        /** @name        location
         *  @public
         *  @type        {string}
         *  @description Component member for location.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        location?: string;

        /** Unix ms. */
        at: number;
    }

    /** @interface   CarrierConfig
     *  @public
     *  @description CarrierConfig contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface CarrierConfig
    {
        /** @name        id
         *  @public
         *  @type        {string}
         *  @description Component member for id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        id: string;

        /** @name        name
         *  @public
         *  @type        {string}
         *  @description Component member for name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        name: string;

        /** @name        publicUrl
         *  @public
         *  @type        {string}
         *  @description Component member for public Url.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        publicUrl: string;

        /** @name        color
         *  @public
         *  @type        {string}
         *  @description Component member for color.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        color: string;

        /** @name        logo
         *  @public
         *  @type        {string}
         *  @description Component member for logo.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        logo: string;

        /** @name        pattern
         *  @public
         *  @type        {RegExp}
         *  @description Component member for pattern.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        pattern?: RegExp;
    }

    /** @interface   TrackerOptions
     *  @public
     *  @description TrackerOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface TrackerOptions
    {
        /** @name        trackingNumber
         *  @public
         *  @type        {string}
         *  @description Component member for tracking Number.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        trackingNumber?: string;

        /** @name        carrier
         *  @public
         *  @type        {CarrierConfig}
         *  @description Component member for carrier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        carrier?: CarrierConfig;

        /** @name        events
         *  @public
         *  @type        {TrackingEvent[]}
         *  @description Component member for events.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        events?: TrackingEvent[];

        /** @name        locale
         *  @public
         *  @type        {string}
         *  @description Component member for locale.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        locale?: string;
    }

    /** @name        KIND_LABELS
     *  @public
     *  @type        {Record<TrackingEventKind, string>}
     *  @description Namespace-owned KIND_LABELS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const KIND_LABELS: Record<TrackingEventKind, string> = {
        'created': 'Created',
        'picked-up': 'Picked up',
        'in-transit': 'In transit',
        'arrived': 'Arrived at hub',
        'customs': 'In customs',
        'out-delivery': 'Out for delivery',
        'delivered': 'Delivered',
        'failed': 'Delivery failed',
        'returned': 'Returned',
        'exception': 'Exception',
        'unknown': 'Unknown',
    };

    /** @name        KIND_ICONS
     *  @public
     *  @type        {Record<TrackingEventKind, string>}
     *  @description Namespace-owned KIND_ICONS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const KIND_ICONS: Record<TrackingEventKind, string> = {
        'created': '○',
        'picked-up': '○',
        'in-transit': '○',
        'arrived': '○',
        'customs': '⊘',
        'out-delivery': '◐',
        'delivered': '●',
        'failed': '✕',
        'returned': '↩',
        'exception': '⚠',
        'unknown': '?',
    };

    /** @name        TERMINAL
     *  @public
     *  @type        {TrackingEventKind[]}
     *  @description Namespace-owned TERMINAL value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const TERMINAL: TrackingEventKind[] = ['delivered', 'returned'];
    export function formatDate(ts: number, locale: string): string {
        try
        {
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit', month: 'short',
                hour: '2-digit', minute: '2-digit',
            }).format(new Date(ts));
        }
        catch {
            return new Date(ts).toLocaleString();
        }
    }

    /** @class       Tracker
     *  @public
     *  @description AriannA Tracker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tracker', {}, {
        Attributes: ['tracking-number', 'carrier', 'locale'],
    })
    export class Tracker extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible template slot installed by @Component. */
        declare template: unknown;

        /** @name        events$
         *  @public
         *  @type        {Signal<TrackingEvent[]>}
         *  @description Component member for events$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        events$: Types.Signal<TrackingEvent[]> = signal<TrackingEvent[]>([]);

        /** @name        carrier$
         *  @public
         *  @type        {Signal<CarrierConfig | null>}
         *  @description Component member for carrier$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        carrier$: Types.Signal<CarrierConfig | null> = signal<CarrierConfig | null>(null);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {TrackerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: TrackerOptions = {})
        {
            /** @name        numberAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned numberAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const numberAttr = this.signal().attribute('tracking-number');

            /** @name        localeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned localeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const localeAttr = this.signal().attribute('locale');
            this.headerTitle = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.carrier$.Get();

                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = numberAttr.Get();
                if (!c && !n)
                    return 'Shipment tracker';

                /** @name        parts
                 *  @public
                 *  @type        {string[]}
                 *  @description Namespace-owned parts value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const parts: string[] = [];
                if (c?.name)
                    parts.push(c.name);
                if (n)
                    parts.push(n);
                return parts.join(' · ');
            };
            this.headerStyle = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.carrier$.Get();
                return c?.color ? `border-left: 3px solid ${c.color}` : '';
            };
            this.logoHtml = () => this.carrier$.Get()?.logo ?? '';
            this.hasEvents = () => this.events$.Get().length > 0;
            this.hasCarrierLink = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.carrier$.Get();

                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = numberAttr.Get();
                return !!(c?.publicUrl && n);
            };
            this.portalLabel = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.carrier$.Get();
                return c ? `Track on ${c.name} →` : 'Open portal →';
            };
            this.eventList = (): Array<{
                /** @name        icon
                 *  @public
                 *  @type        {string}
                 *  @description Component member for icon.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                icon: string;

                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;

                /** @name        raw
                 *  @public
                 *  @type        {string}
                 *  @description Component member for raw.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                raw: string;

                /** @name        location
                 *  @public
                 *  @type        {string}
                 *  @description Component member for location.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                location: string;

                /** @name        date
                 *  @public
                 *  @type        {string}
                 *  @description Component member for date.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                date: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;
            }> => {
                /** @name        locale
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned locale value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const locale = localeAttr.Get() ?? 'en';
                // Sort descending by `at` (most recent first)
                return [...this.events$.Get()].sort((a, b) => b.at - a.at).map(e => ({
                    icon: KIND_ICONS[e.kind as TrackingEventKind] ?? KIND_ICONS.unknown,
                    label: KIND_LABELS[e.kind as TrackingEventKind] ?? e.kind,
                    raw: e.raw ?? '',
                    location: e.location ?? '',
                    date: formatDate(e.at, locale),
                    cls: 'ar-trk__event ar-trk__event--' + e.kind
                        + (TERMINAL.includes(e.kind) ? ' ar-trk__event--terminal' : ''),
                }));
            };
            this.onPortalClick = () => {
                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = this.carrier$.Get();

                /** @name        n
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned n value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const n = numberAttr.Get();
                if (!c?.publicUrl || !n)
                    return;

                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = c.publicUrl.replace('{n}', encodeURIComponent(n));
                this.dispatchEvent(new CustomEvent('arianna:tracking-portal', {
                    bubbles: true, detail: { carrier: c.id, url },
                }));
                window.open(url, '_blank', 'noopener');
            };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Tracker.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setCarrier
         *  @public
         *  @type        {this}
         *  @description Component member for set Carrier.
         *  @param       {CarrierConfig} c Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setCarrier(c: CarrierConfig): this
        {
            this.carrier$.Set({ ...c });
            this.setAttribute('carrier', c.id);
            return this;
        }

        /** @name        getCarrier
         *  @public
         *  @type        {CarrierConfig | null}
         *  @description Component member for get Carrier.
         *  @returns     {CarrierConfig | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCarrier(): CarrierConfig | null { return this.carrier$.Get(); }

        /** @name        setTrackingNumber
         *  @public
         *  @type        {this}
         *  @description Component member for set Tracking Number.
         *  @param       {string} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setTrackingNumber(n: string): this
        {
            this.setAttribute('tracking-number', n);
            return this;
        }

        /** @name        getTrackingNumber
         *  @public
         *  @type        {string}
         *  @description Component member for get Tracking Number.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }

        /** @name        setEvents
         *  @public
         *  @type        {this}
         *  @description Component member for set Events.
         *  @param       {TrackingEvent[]} events Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setEvents(events: TrackingEvent[]): this
        {
            /** @name        sanitized
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sanitized value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sanitized = events.map(e => ({ ...e }));
            this.events$.Set(sanitized);
            // Fire one event per setEvents call (last event = most recent)
            /** @name        last
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned last value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const last = sanitized[sanitized.length - 1];
            if (last)
            {
                this.dispatchEvent(new CustomEvent('arianna:tracking-event', {
                    bubbles: true, detail: { event: { ...last } },
                }));
            }
            return this;
        }

        /** @name        getEvents
         *  @public
         *  @type        {TrackingEvent[]}
         *  @description Component member for get Events.
         *  @returns     {TrackingEvent[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getEvents(): TrackingEvent[] { return this.events$.Get().map((e: any) => ({ ...e })); }

        /** @name        validateNumber
         *  @public
         *  @type        {boolean}
         *  @description Component member for validate Number.
         *  @param       {string} n Parameter.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        validateNumber(n: string): boolean
        {
            /** @name        c
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned c value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const c = this.carrier$.Get();
            if (!c?.pattern)
                return n.length > 0;
            return c.pattern.test(n);
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        headerTitle
         *  @private
         *  @type        {() => string}
         *  @description Component member for header Title.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private headerTitle: () => string = () => 'Shipment tracker';

        /** @name        headerStyle
         *  @private
         *  @type        {() => string}
         *  @description Component member for header Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private headerStyle: () => string = () => '';

        /** @name        logoHtml
         *  @private
         *  @type        {() => string}
         *  @description Component member for logo Html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private logoHtml: () => string = () => '';

        /** @name        hasEvents
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Events.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasEvents: () => boolean = () => false;

        /** @name        hasCarrierLink
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Carrier Link.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasCarrierLink: () => boolean = () => false;

        /** @name        portalLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for portal Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private portalLabel: () => string = () => 'Open portal →';

        /** @name        eventList
         *  @private
         *  @type        {() => Array<{
            icon: string;
            label: string;
            raw: string;
            location: string;
            date: string;
            cls: string;
        }>}
         *  @description Component member for event List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private eventList: () => Array<{
            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        raw
             *  @public
             *  @type        {string}
             *  @description Component member for raw.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            raw: string;

            /** @name        location
             *  @public
             *  @type        {string}
             *  @description Component member for location.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            location: string;

            /** @name        date
             *  @public
             *  @type        {string}
             *  @description Component member for date.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            date: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;
        }> = () => [];

        /** @name        onPortalClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Portal Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPortalClick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
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
            ]);
        }
    }
}
export default Tracker;

export type TrackingEventKind = Tracker.TrackingEventKind;
export type TrackingEvent = Tracker.TrackingEvent;
export type CarrierConfig = Tracker.CarrierConfig;
export type TrackerOptions = Tracker.TrackerOptions;
