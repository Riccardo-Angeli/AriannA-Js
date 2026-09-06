/**
 * @module    playground/playground
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * AriannA Playground — Overview page that wires the entire framework
 * surface (core + additionals + components) into a single tabbed page.
 *
 * v3 changes:
 *   • Imports use the published bare specifiers ('arianna', 'arianna/components',
 *     'arianna/additionals') — the bundles resolve as ESM at runtime via
 *     `<script type="module">` import maps or direct relative paths in the
 *     pre-built bundles next to this file.
 *   • Removed the deep `'../../../../../../arianna-v2-complete/core'` path
 *     hierarchy that broke whenever the playground moved on disk.
 *   • Uses the new v2 surface: `Real.Sheet`, `Rule.css()`, `.sub()`,
 *     dotted-path setters, components like `FinanceLineChart` /
 *     `GraphicsColorPicker` / `InputChip` (canonical aliased exports).
 */

// ── CORE ────────────────────────────────────────────────────────────────────

import {
    // Default classes
    Core, Observable, State, Real, Virtual, VirtualNode, Component, Directive,
    Stylesheet, Context, Namespace,
    // Reactive primitives
    signal, signalMono, effect, computed, batch, untrack, uuid,
    AriannATemplate,
    // CSS rule engine
    Rule, CssState,
    // Template DSL
    html, css, Template, TemplateInstance,
    // Dotted-path helpers
    readDottedPath, writeDottedPath, makeSubAccessor,
    // Namespace aliases
    htmlNamespace, svgNamespace, mathMLNamespace,
    // Decorators
    ComponentDecorator, Prop,
    // SSR + Workers
    escapeHtml, renderToString, hydrate, Island, SSR,
    WorkerPool, Workers,
    // Types
    type Signal, type SignalMono, type ReadonlySignal,
    type CSSProperties, type RuleDefinition,
} from 'arianna';

// ── ADDITIONALS ─────────────────────────────────────────────────────────────

import {
    AI, Animation, Audio, Colors, Data, Finance, Geometry, IO,
    Latex, Less, Math as ArMath, Midi, Network, Physics,
    Sass, Scss, Stylus, Three, Two, Video,
    // Physics classes
    World, Body, Shape, Circle, Sphere, Box, Capsule, Polygon,
    Spring, DistanceConstraint, Pin, Rope,
    Drag, PointGravity, Wind, PhysicsVec,
    // CSS preprocessor parsers
    parseLess, parseSass, parseScss, parseStylus,
} from 'arianna/additionals';

// ── COMPONENTS ──────────────────────────────────────────────────────────────

import {
    // animations
    Keyframe, AnimTrack, KeyframeEditor, CurveEditor, OnionStage,
    // audio
    AudioComponent, TransportBar, AudioPlayer, ChannelStrip,
    AudioEditor, PianoRoll, AudioTrackEditor, AudioTrack, AudioPart,
    // charts (canonical LineChart)
    BarChart, LineChart, PieChart,
    // composite (NEW v2: CodeEditor)
    NodeEditor, Chat, CodeEditor,
    // data (canonical Table from layout, TreeView)
    TreeView,
    // display (canonical Chip)
    Avatar, Badge, Banner, Chip, Divider, Icon, List,
    ProgressBar, ProgressCircular, Skeleton, Snackbar, Tag, Tooltip,
    // finance (LineChart → FinanceLineChart, alias)
    CandlestickChart, FinanceLineChart, DepthChart, HeatmapChart,
    PortfolioDonut, PnLChart, RiskGauge, OrderBook, Screener, Sparkline,
    // graphics (ColorPicker → GraphicsColorPicker, alias)
    Canvas2D, BezierEditor, LayersPanel, LinesPalette2D, ToolsPalette,
    CameraViewer3D, MaterialsPalette, Modifiers3DPalette,
    GraphicsColorPicker, ColorPickerSquare, ColorPickerTile, ColorPickerWheel,
    // inputs (canonical ColorPicker, Chip → InputChip)
    Button, Switch, Checkbox, Radio, TextField, SearchBar,
    Dropdown, Rating, FileUpload, TimePicker, ColorPicker,
    RangeSlider, Calendar, DatePicker, RichTextEditor, InputChip,
    // layout
    Card, Drawer, Modal, Panel, Splitter, Tabs, Tab, Accordion,
    Dock, Window as ArWindow, Table,
    // maps
    MapEmbed, GoogleMap, OpenStreetMap, AppleMap, AzureMap, MapLibreMap,
    // modifiers
    Modifiers2D, Modifiers3D,
    // navigation
    Breadcrumb, Header, Menu, NavRail, Pagination, Stepper, Sidebar,
    // payments
    ApplePay, GooglePay, CreditCard, PayPal, Stripe, Satispay, Nexi,
    AliPay, PaymentGateway,
    // shipments
    Tracker, DHLTracker, UPSTracker, FedExTracker, BRTTracker, TrackingMulti,
    // video
    VideoPlayer, detectVideoProvider, VideoTrackEditor,
} from 'arianna/components';

// ────────────────────────────────────────────────────────────────────────────
//  Surface manifest — proves every public export survived the build.
// ────────────────────────────────────────────────────────────────────────────

const SURFACE = {
    core: {
        classes: [Core, Observable, State, Real, Virtual, VirtualNode, Component,
                  Directive, Stylesheet, Context, Namespace],
        reactive: { signal, signalMono, effect, computed, batch, untrack, uuid,
                    AriannATemplate },
        cssRules: { Rule, CssState },
        template: { html, css, Template, TemplateInstance },
        dotted  : { readDottedPath, writeDottedPath, makeSubAccessor },
        namespaces: { htmlNamespace, svgNamespace, mathMLNamespace },
        decorators: { ComponentDecorator, Prop },
        ssr: { escapeHtml, renderToString, hydrate, Island, SSR },
        workers: { WorkerPool, Workers },
    },
    additionals: {
        AI, Animation, Audio, Colors, Data, Finance, Geometry, IO,
        Latex, Less, ArMath, Midi, Network, Physics,
        Sass, Scss, Stylus, Three, Two, Video,
        physicsClasses: { World, Body, Shape, Circle, Sphere, Box, Capsule,
                          Polygon, Spring, DistanceConstraint, Pin, Rope,
                          Drag, PointGravity, Wind, PhysicsVec },
        parsers: { parseLess, parseSass, parseScss, parseStylus },
    },
    components: {
        animations  : [Keyframe, AnimTrack, KeyframeEditor, CurveEditor, OnionStage],
        audio       : [AudioComponent, TransportBar, AudioPlayer, ChannelStrip,
                       AudioEditor, PianoRoll, AudioTrackEditor, AudioTrack, AudioPart],
        charts      : [BarChart, LineChart, PieChart],
        composite   : [NodeEditor, Chat, CodeEditor],
        data        : [Table, TreeView],
        display     : [Avatar, Badge, Banner, Chip, Divider, Icon, List,
                       ProgressBar, ProgressCircular, Skeleton, Snackbar, Tag, Tooltip],
        finance     : [CandlestickChart, FinanceLineChart, DepthChart, HeatmapChart,
                       PortfolioDonut, PnLChart, RiskGauge, OrderBook, Screener,
                       Sparkline],
        graphics    : [Canvas2D, BezierEditor, LayersPanel, LinesPalette2D, ToolsPalette,
                       CameraViewer3D, MaterialsPalette, Modifiers3DPalette,
                       GraphicsColorPicker, ColorPickerSquare, ColorPickerTile,
                       ColorPickerWheel],
        inputs      : [Button, Switch, Checkbox, Radio, TextField, SearchBar,
                       Dropdown, Rating, FileUpload, TimePicker, ColorPicker,
                       RangeSlider, Calendar, DatePicker, RichTextEditor, InputChip],
        layout      : [Card, Drawer, Modal, Panel, Splitter, Tabs, Tab,
                       Accordion, Dock, ArWindow, Table],
        maps        : [MapEmbed, GoogleMap, OpenStreetMap, AppleMap, BingMap,
                       AzureMap, MapLibreMap],
        modifiers   : [Modifiers2D, Modifiers3D],
        navigation  : [Breadcrumb, Header, Menu, NavRail, Pagination, Stepper, Sidebar],
        payments    : [ApplePay, GooglePay, CreditCard, PayPal, Stripe,
                       Satispay, Nexi, AliPay, PaymentGateway],
        shipments   : [Tracker, DHLTracker, UPSTracker, FedExTracker, BRTTracker,
                       TrackingMulti],
        video       : [VideoPlayer, VideoTrackEditor],
    },
};

// ────────────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────────────

type ElementCtor<T = Element> = new (...args: unknown[]) => T;

function mk<T extends Element = HTMLElement>(
    Cls: { new (...args: never[]): Element } | ElementCtor<T>,
    opts?: object,
): T {
    const Ctor = Cls as unknown as new (opts?: object) => T;
    return new Ctor(opts);
}

// ────────────────────────────────────────────────────────────────────────────
//  Tab system
// ────────────────────────────────────────────────────────────────────────────

const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab');
const panels  = document.querySelectorAll<HTMLElement>('.panel');
const status  = document.getElementById('ready-status');

function setActive(tabName: string): void {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
    panels .forEach(p => { p.hidden = p.dataset.panel !== tabName; });
}

tabBtns.forEach(b => {
    b.addEventListener('click', () => {
        const tab = b.dataset.tab;
        if (!tab) return;
        setActive(tab);
        renderPanel(tab);
    });
});

const rendered = new Set<string>();

function renderPanel(name: string): void {
    if (rendered.has(name)) return;
    const panel = document.querySelector<HTMLElement>(`[data-panel="${name}"]`);
    if (!panel) return;
    try {
        switch (name) {
            case 'display':     renderDisplay(panel);     break;
            case 'inputs':      renderInputs(panel);      break;
            case 'charts':      renderCharts(panel);      break;
            case 'audio':       renderAudio(panel);       break;
            case 'animations':  renderAnimations(panel);  break;
            case 'composite':   renderComposite(panel);   break;
            case 'graphics':    renderGraphics(panel);    break;
            case 'maps':        renderMaps(panel);        break;
            case 'layout':      renderLayout(panel);      break;
            case 'payments':    renderPayments(panel);    break;
            case 'finance':     renderFinance(panel);     break;
            case 'additionals': renderAdditionals(panel); break;
        }
        rendered.add(name);
    } catch (err) {
        const pre = document.createElement('pre');
        pre.textContent = `Render error in "${name}": ${String(err)}`;
        pre.style.color = 'var(--ar-danger)';
        panel.appendChild(pre);
        rendered.add(name);
    }
}

function makeCard(title: string, fill: (host: HTMLDivElement) => void, modifier?: string): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'demo-card' + (modifier ? ' ' + modifier : '');
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const host = document.createElement('div');
    host.className = 'demo-host';
    card.append(h3, host);
    try { fill(host); }
    catch (err) {
        const pre = document.createElement('pre');
        pre.textContent = String(err);
        pre.style.color = 'var(--ar-danger)';
        host.appendChild(pre);
    }
    return card;
}

function gridify(panel: HTMLElement, cards: HTMLDivElement[]): void {
    const grid = document.createElement('div');
    grid.className = 'demo-grid';
    cards.forEach(c => grid.appendChild(c));
    const h2 = document.createElement('h2');
    h2.textContent = panel.dataset.panel ?? '';
    h2.style.textTransform = 'capitalize';
    panel.append(h2, grid);
}

// ── Display ────────────────────────────────────────────────────────────────
function renderDisplay(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('Avatar', host => {
        host.append(mk(Avatar, { name: 'Riccardo' }));
        host.append(mk(Avatar, { name: 'Arianna' }));
        host.append(mk(Avatar, { name: 'AB' }));
    }));
    cards.push(makeCard('Badge', host => {
        host.append(mk(Badge, { value: '3' }));
        host.append(mk(Badge, { value: '12', variant: 'success' }));
        host.append(mk(Badge, { value: '99+', variant: 'danger' }));
    }));
    cards.push(makeCard('Banner', host => {
        host.append(mk(Banner, { title: 'Heads up', body: 'AriannA v2 is live', variant: 'info' }));
    }, 'wide'));
    cards.push(makeCard('Chip', host => {
        host.append(mk(Chip, { label: 'TypeScript' }));
        host.append(mk(Chip, { label: 'AriannA', variant: 'primary' }));
        host.append(mk(Chip, { label: 'closable', closable: true }));
    }));
    cards.push(makeCard('Icon + Divider', host => {
        host.append(mk(Icon, { name: 'star' }));
        host.append(mk(Divider));
        host.append(mk(Icon, { name: 'heart' }));
    }));
    cards.push(makeCard('List', host => {
        host.append(mk(List, { items: ['Alpha', 'Beta', 'Gamma'] }));
    }));
    cards.push(makeCard('ProgressBar', host => {
        host.append(mk(ProgressBar, { value: 65, max: 100 }));
    }));
    cards.push(makeCard('ProgressCircular', host => {
        host.append(mk(ProgressCircular, { value: 33 }));
    }));
    cards.push(makeCard('Skeleton', host => {
        host.append(mk(Skeleton, { width: 220, height: 14 }));
        host.append(mk(Skeleton, { width: 180, height: 14 }));
    }));
    cards.push(makeCard('Snackbar', host => {
        host.append(mk(Snackbar, { text: 'Saved.' }));
    }));
    cards.push(makeCard('Tag + Tooltip', host => {
        host.append(mk(Tag, { label: 'beta' }));
        host.append(mk(Tooltip, { content: 'hi', target: 'hover me' }));
    }));
    gridify(panel, cards);
}

// ── Inputs ─────────────────────────────────────────────────────────────────
function renderInputs(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('Button', host => {
        host.append(mk(Button, { label: 'Primary',   variant: 'primary'   }));
        host.append(mk(Button, { label: 'Secondary', variant: 'secondary' }));
        host.append(mk(Button, { label: 'Danger',    variant: 'danger'    }));
    }));
    cards.push(makeCard('Switch / Checkbox / Radio', host => {
        host.append(mk(Switch,   { checked: true }));
        host.append(mk(Checkbox, { label: 'check me', checked: true }));
        host.append(mk(Radio,    { label: 'one', name: 'g1' }));
    }));
    cards.push(makeCard('TextField + SearchBar', host => {
        host.append(mk(TextField, { placeholder: 'Type something…' }));
        host.append(mk(SearchBar, { placeholder: 'Search…' }));
    }));
    cards.push(makeCard('Dropdown + Rating', host => {
        host.append(mk(Dropdown, { items: ['Alpha', 'Beta', 'Gamma'] }));
        host.append(mk(Rating,   { value: 3, max: 5 }));
    }));
    cards.push(makeCard('FileUpload', host => {
        host.append(mk(FileUpload, { accept: '.png,.jpg' }));
    }));
    cards.push(makeCard('TimePicker + Calendar + DatePicker', host => {
        host.append(mk(TimePicker, {}));
        host.append(mk(Calendar,   {}));
        host.append(mk(DatePicker, {}));
    }));
    cards.push(makeCard('ColorPicker (canonical, from inputs)', host => {
        host.append(mk(ColorPicker, { value: '#e40c88' }));
    }));
    cards.push(makeCard('RangeSlider', host => {
        host.append(mk(RangeSlider, { min: 0, max: 100, value: 40 }));
    }));
    cards.push(makeCard('RichTextEditor', host => {
        host.append(mk(RichTextEditor, { value: '<b>Hello</b>' }));
    }, 'wide'));
    cards.push(makeCard('InputChip (Chip from inputs)', host => {
        host.append(mk(InputChip, { label: 'editable', editable: true }));
    }));
    gridify(panel, cards);
}

// ── Charts ─────────────────────────────────────────────────────────────────
function renderCharts(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('BarChart',  host => host.append(mk(BarChart,  { data: [4, 7, 2, 9, 5] }))));
    cards.push(makeCard('LineChart (canonical, from charts)', host =>
        host.append(mk(LineChart, { data: [1, 3, 2, 5, 4, 6] }))));
    cards.push(makeCard('PieChart',  host => host.append(mk(PieChart,  { data: [10, 20, 30, 40] }))));
    gridify(panel, cards);
}

// ── Finance ────────────────────────────────────────────────────────────────
function renderFinance(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('FinanceLineChart (alias of finance/LineChart)', host =>
        host.append(mk(FinanceLineChart, { data: [{ t: 0, v: 100 }, { t: 1, v: 105 }, { t: 2, v: 98 }] })), 'wide'));
    cards.push(makeCard('CandlestickChart',  host => host.append(mk(CandlestickChart,  { data: [] }))));
    cards.push(makeCard('DepthChart',        host => host.append(mk(DepthChart,        { bids: [], asks: [] }))));
    cards.push(makeCard('HeatmapChart',      host => host.append(mk(HeatmapChart,      { data: [[1, 2], [3, 4]] }))));
    cards.push(makeCard('PortfolioDonut',    host => host.append(mk(PortfolioDonut,    { data: [{ label: 'AAPL', value: 50 }] }))));
    cards.push(makeCard('PnLChart',          host => host.append(mk(PnLChart,          { data: [] }))));
    cards.push(makeCard('RiskGauge',         host => host.append(mk(RiskGauge,         { value: 0.4 }))));
    cards.push(makeCard('OrderBook',         host => host.append(mk(OrderBook,         { bids: [], asks: [] }))));
    cards.push(makeCard('Screener',          host => host.append(mk(Screener,          { rows: [] }))));
    cards.push(makeCard('Sparkline',         host => host.append(mk(Sparkline,         { data: [1, 2, 1.5, 3, 2.5] }))));
    gridify(panel, cards);
}

// ── Audio ──────────────────────────────────────────────────────────────────
function renderAudio(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('AudioPlayer',      host => host.append(mk(AudioPlayer,      {}))));
    cards.push(makeCard('TransportBar',     host => host.append(mk(TransportBar,     {}))));
    cards.push(makeCard('ChannelStrip',     host => host.append(mk(ChannelStrip,     {}))));
    cards.push(makeCard('AudioEditor',      host => host.append(mk(AudioEditor,      {})), 'wide'));
    cards.push(makeCard('PianoRoll',        host => host.append(mk(PianoRoll,        {})), 'wide'));
    cards.push(makeCard('AudioTrackEditor', host => host.append(mk(AudioTrackEditor, {})), 'wide'));
    gridify(panel, cards);
}

// ── Animations ─────────────────────────────────────────────────────────────
function renderAnimations(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('KeyframeEditor', host => host.append(mk(KeyframeEditor, {}))));
    cards.push(makeCard('CurveEditor',    host => host.append(mk(CurveEditor,    {}))));
    cards.push(makeCard('OnionStage',     host => host.append(mk(OnionStage,     {})), 'wide'));
    gridify(panel, cards);
}

// ── Composite ──────────────────────────────────────────────────────────────
function renderComposite(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('CodeEditor (new in v2)', host => {
        const ed = mk(CodeEditor, { value: 'const greeting = "Hello AriannA!";', language: 'ts', height: '200px' });
        host.append(ed);
    }, 'wide'));
    cards.push(makeCard('NodeEditor', host => host.append(mk(NodeEditor, {})), 'wide'));
    cards.push(makeCard('Chat',       host => host.append(mk(Chat,       {})), 'wide'));
    gridify(panel, cards);
}

// ── Graphics ───────────────────────────────────────────────────────────────
function renderGraphics(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('Canvas2D',                host => host.append(mk(Canvas2D, { width: 220, height: 140 }))));
    cards.push(makeCard('BezierEditor',            host => host.append(mk(BezierEditor, {}))));
    cards.push(makeCard('LayersPanel',             host => host.append(mk(LayersPanel, {}))));
    cards.push(makeCard('LinesPalette2D',          host => host.append(mk(LinesPalette2D, {}))));
    cards.push(makeCard('ToolsPalette',            host => host.append(mk(ToolsPalette, {}))));
    cards.push(makeCard('CameraViewer3D',          host => host.append(mk(CameraViewer3D, {})), 'wide'));
    cards.push(makeCard('MaterialsPalette',        host => host.append(mk(MaterialsPalette, {}))));
    cards.push(makeCard('Modifiers3DPalette',      host => host.append(mk(Modifiers3DPalette, {}))));
    cards.push(makeCard('GraphicsColorPicker (alias)', host => host.append(mk(GraphicsColorPicker, {}))));
    cards.push(makeCard('ColorPickerSquare',       host => host.append(mk(ColorPickerSquare, {}))));
    cards.push(makeCard('ColorPickerTile',         host => host.append(mk(ColorPickerTile, {}))));
    cards.push(makeCard('ColorPickerWheel',        host => host.append(mk(ColorPickerWheel, {}))));
    gridify(panel, cards);
}

// ── Maps ───────────────────────────────────────────────────────────────────
function renderMaps(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('MapEmbed',        host => host.append(mk(MapEmbed,        { lat: 46.8, lng: 8.2, zoom: 7 })), 'wide'));
    cards.push(makeCard('OpenStreetMap',   host => host.append(mk(OpenStreetMap,   { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    cards.push(makeCard('GoogleMap',       host => host.append(mk(GoogleMap,       { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    cards.push(makeCard('AppleMap',        host => host.append(mk(AppleMap,        { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    cards.push(makeCard('BingMap',         host => host.append(mk(BingMap,         { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    cards.push(makeCard('AzureMap',        host => host.append(mk(AzureMap,        { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    cards.push(makeCard('MapLibreMap',     host => host.append(mk(MapLibreMap,     { lat: 41.9, lng: 12.5, zoom: 11 })), 'wide'));
    gridify(panel, cards);
}

// ── Layout ─────────────────────────────────────────────────────────────────
function renderLayout(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('Card',       host => host.append(mk(Card,       { title: 'Card', body: 'Body text' }))));
    cards.push(makeCard('Drawer',     host => host.append(mk(Drawer,     {}))));
    cards.push(makeCard('Modal',      host => host.append(mk(Modal,      {}))));
    cards.push(makeCard('Panel',      host => host.append(mk(Panel,      {}))));
    cards.push(makeCard('Splitter',   host => host.append(mk(Splitter,   {}))));
    cards.push(makeCard('Tabs',       host => host.append(mk(Tabs,       { tabs: ['One', 'Two'] }))));
    cards.push(makeCard('Accordion',  host => host.append(mk(Accordion,  { items: [] }))));
    cards.push(makeCard('Dock',       host => host.append(mk(Dock,       {}))));
    cards.push(makeCard('Window',     host => host.append(mk(ArWindow,   { title: 'Win' }))));
    cards.push(makeCard('Table',      host => host.append(mk(Table,      { columns: [], rows: [] })), 'wide'));
    gridify(panel, cards);
}

// ── Payments ───────────────────────────────────────────────────────────────
function renderPayments(panel: HTMLElement): void {
    const cards: HTMLDivElement[] = [];
    cards.push(makeCard('ApplePay',       host => host.append(mk(ApplePay,       { amount: 25 }))));
    cards.push(makeCard('GooglePay',      host => host.append(mk(GooglePay,      { amount: 25 }))));
    cards.push(makeCard('CreditCard',     host => host.append(mk(CreditCard,     { amount: 25 }))));
    cards.push(makeCard('PayPal',         host => host.append(mk(PayPal,         { amount: 25 }))));
    cards.push(makeCard('Stripe',         host => host.append(mk(Stripe,         { amount: 25 }))));
    cards.push(makeCard('Satispay',       host => host.append(mk(Satispay,       { amount: 25 }))));
    cards.push(makeCard('Nexi',           host => host.append(mk(Nexi,           { amount: 25 }))));
    cards.push(makeCard('AliPay',         host => host.append(mk(AliPay,         { amount: 25 }))));
    cards.push(makeCard('PaymentGateway', host => host.append(mk(PaymentGateway, { amount: 25 })), 'wide'));
    gridify(panel, cards);
}

// ── Additionals — text-only summary of every namespace ─────────────────────
function renderAdditionals(panel: HTMLElement): void {
    const h2 = document.createElement('h2'); h2.textContent = 'Additionals'; panel.appendChild(h2);
    const lead = document.createElement('p'); lead.className = 'panel-lead';
    lead.textContent = 'Self-contained namespaces (no DOM rendering). Each is a default-exported module.';
    panel.appendChild(lead);

    const lines: string[] = [];
    const probe = (label: string, ns: unknown) => {
        const keys = Object.keys(ns as object).sort();
        lines.push(`${label.padEnd(11)} = ${keys.length.toString().padStart(3)} keys` +
                   (keys.length ? '  →  ' + keys.slice(0, 6).join(', ') + (keys.length > 6 ? ', …' : '') : ''));
    };
    probe('AI',        AI);
    probe('Animation', Animation);
    probe('Audio',     Audio);
    probe('Colors',    Colors);
    probe('Data',      Data);
    probe('Finance',   Finance);
    probe('Geometry',  Geometry);
    probe('IO',        IO);
    probe('Latex',     Latex);
    probe('Less',      Less);
    probe('Math',      ArMath);
    probe('Midi',      Midi);
    probe('Network',   Network);
    probe('Physics',   Physics);
    probe('Sass',      Sass);
    probe('Scss',      Scss);
    probe('Stylus',    Stylus);
    probe('Three',     Three);
    probe('Two',       Two);
    probe('Video',     Video);
    const pre = document.createElement('pre');
    pre.textContent = lines.join('\n');
    panel.appendChild(pre);

    const parsersHead = document.createElement('h2');
    parsersHead.textContent = 'CSS preprocessors';
    parsersHead.style.marginTop = '24px';
    panel.appendChild(parsersHead);
    const parsersPre = document.createElement('pre');
    parsersPre.textContent = [
        'parseLess   typeof = ' + typeof parseLess,
        'parseSass   typeof = ' + typeof parseSass,
        'parseScss   typeof = ' + typeof parseScss,
        'parseStylus typeof = ' + typeof parseStylus,
    ].join('\n');
    panel.appendChild(parsersPre);
}

// ────────────────────────────────────────────────────────────────────────────
//  Overview tag-cloud
// ────────────────────────────────────────────────────────────────────────────

function renderOverviewTags(): void {
    const host = document.getElementById('overview-tags');
    if (!host) return;
    const flat: string[] = [];
    for (const cat of Object.values(SURFACE.components)) {
        for (const cls of cat as unknown[]) {
            const name = (cls as { name?: string }).name ?? '?';
            flat.push(name);
        }
    }
    flat.sort();
    for (const n of flat) {
        const tag = document.createElement('span');
        tag.className   = 'tag-chip';
        tag.textContent = n;
        host.appendChild(tag);
    }
    if (status) {
        status.textContent = `ready — ${flat.length} components live, 20 additionals, ${Object.keys(SURFACE.core).length} core modules`;
        status.classList.remove('booting');
    }
}

// ────────────────────────────────────────────────────────────────────────────
//  Boot
// ────────────────────────────────────────────────────────────────────────────

if (status) status.classList.add('booting');

try {
    renderOverviewTags();
    // Smoke-test: prove Observable / signal loaded
    const probe = signal<number>(0);
    probe.set(probe.peek() + 1);
} catch (err) {
    if (status) {
        status.textContent = 'error: ' + String(err);
        status.classList.add('error');
    }
    console.error('[playground] bootstrap failed:', err);
}

// Expose for console exploration
(globalThis as unknown as { AriannA: unknown }).AriannA = {
    core       : { signal, effect, computed, Component, Stylesheet, Rule, html, css, Theme: SURFACE.core },
    additionals: SURFACE.additionals,
    components : SURFACE.components,
};

// Re-export the type aliases so TS strict doesn't warn about unused imports.
export type { Signal, SignalMono, ReadonlySignal, CSSProperties, RuleDefinition };
