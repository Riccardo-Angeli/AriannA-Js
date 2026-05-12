/**
 * @module    components/animations/KeyframeEditor
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   AGPL-3.0 / Commercial
 *
 * KeyframeEditor — 3ds Max / Blender / After Effects style timeline editor
 * for hand-keyed animation. Drives any object that exposes a `set(prop, values)`
 * method (Three.js nodes, DOM properties, audio params, Two.ts shapes, …).
 *
 * ── Layout ───────────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────────────────────┐
 *   │ Assets Preview │ Console │ Animation                                  ☰ │
 *   │ Clips: anim ▾  ⏮ ⏪ ▶ ⏩ ⏭ ⏹  Time ▾  0-09  Spacing: 1   ☴⚡⚙        │
 *   │ ─────────────────────────────────────────────────────────────────────── │
 *   │ Node list ◉ Enter           0-00          0-05         0-10            │
 *   │ ▸ Cube                  ◆────◆────◆──┃─◆──────◆                       │
 *   │ ▸ Node                                                                  │
 *   │ ─────────────────────────────────────────────────────────────────────── │
 *   │ Property list +  scale.z  [1]                                          │
 *   │ ▸ position              ◆────◆────◆──┃─◆──────                         │
 *   │ ▸ scale                          ◆──┃─◆                                │
 *   │ ─────────────────────────────────────────────────────────────────────── │
 *   │ WrapMode Normal ▾   Sample 60   Speed 0.2   Duration: 0.15 (0.75)s    │
 *   └─────────────────────────────────────────────────────────────────────────┘
 *
 * ── Features (beyond the 3ds Max screenshot) ─────────────────────────────────
 *
 *   • Multi-clip support — switch between named animation clips.
 *   • Per-property channels — every track is a curve, not just a row of dots.
 *   • Easing & interpolation — linear, step, cubic-bezier, all 12 named
 *     curves from additionals/Animation (linear, easeIn/Out/InOut Quad/Cubic/
 *     Quart/Expo, easeOutBack, easeOutBounce, easeOutElastic).
 *   • Drag, copy, paste, delete, snap keyframes; multi-select with shift.
 *   • Time / frame display toggle.
 *   • Wrap modes — normal, loop, ping-pong, clamp-forever.
 *   • Sample (fps) and Speed (playback multiplier) controls.
 *   • Live playhead with cursor scrubbing.
 *   • Per-keyframe right-click context menu (set easing, copy, delete).
 *   • Drives a generic IKeyframeTarget contract — works for any object.
 *
 * ── Marriage with additionals/Physics ────────────────────────────────────────
 *
 *   The Physics additional reads `editor.sample(nodeId, propId, t)` to follow
 *   keyframed motion with a kinematic body, and writes baked simulation
 *   results back into clips via the public `_clips` state. See Physics.ts.
 *
 * @example
 *   import { KeyframeEditor } from 'arianna/components/animations';
 *
 *   const editor = new KeyframeEditor('#mount', {
 *     clips: [{
 *       id: 'anim-1', name: 'animation1', sampleRate: 60, duration: 0.75,
 *       nodes: [{
 *         id: 'cube', label: 'Cube',
 *         properties: [
 *           { id: 'position', label: 'position', channels: ['x','y','z'],
 *             keyframes: [
 *               { time: 0.00, values: [0, 0, 0] },
 *               { time: 0.15, values: [1, 0, 0], easing: 'easeOutCubic' },
 *               { time: 0.30, values: [1, 1, 0] },
 *             ] },
 *         ],
 *       }],
 *     }],
 *     wrapMode: 'loop', speed: 0.5,
 *   });
 *
 *   editor.bind('cube', {
 *     set: (prop, vals) => {
 *       if (prop === 'position') threeCube.position.set(...vals);
 *     },
 *   });
 *   editor.play();
 */

import { Control } from "../core/Control.ts";
import { Easing }  from "../../additionals/Animation.ts";

// ── Public types ──────────────────────────────────────────────────────────────

export type EasingName =
  | "linear" | "step"
  | "easeInQuad"  | "easeOutQuad"  | "easeInOutQuad"
  | "easeInCubic" | "easeOutCubic" | "easeInOutCubic"
  | "easeInQuart" | "easeOutQuart"
  | "easeInExpo"  | "easeOutExpo"  | "easeInOutExpo"
  | "easeOutBack" | "easeOutBounce" | "easeOutElastic";

export type EasingDef =
  | EasingName
  | { type: "cubic-bezier"; p1x: number; p1y: number; p2x: number; p2y: number };

export type WrapMode = "normal" | "loop" | "ping-pong" | "clamp-forever";

export interface Keyframe {
  time   : number;       // seconds
  values : number[];     // one entry per channel
  easing?: EasingDef;
  locked?: boolean;
  label? : string;
}

export interface Property {
  id        : string;
  label     : string;
  channels  : string[];  // ['x','y','z'] or ['value'] or ['r','g','b']
  keyframes : Keyframe[];
  visible?  : boolean;
  expanded? : boolean;
}

export interface NodeTrack {
  id         : string;
  label      : string;
  properties : Property[];
  expanded?  : boolean;
  visible?   : boolean;
}

export interface Clip {
  id          : string;
  name        : string;
  sampleRate  : number;  // fps
  duration    : number;  // seconds
  defaultEase?: EasingDef;
  nodes       : NodeTrack[];
}

export interface IKeyframeTarget {
  set: (property: string, values: number[]) => void;
}

export interface KeyframeEditorState {
  activeClipId: string;
  currentTime : number;
  isPlaying   : boolean;
  selectedKeys: { nodeId: string; propertyId: string; index: number }[];
}

export interface KeyframeEditorOptions {
  class?      : string;
  theme?      : "light" | "dark" | "auto";
  clips?      : Clip[];
  activeClip? : string;
  wrapMode?   : WrapMode;
  speed?      : number;
  view?       : "time" | "frames";
  spacing?    : number;
  onChange?   : (state: KeyframeEditorState) => void;
  onKeyframe? : (e: { nodeId: string; propertyId: string; keyframe: Keyframe }) => void;
  onPlay?     : () => void;
  onStop?     : () => void;
}

// ── Cubic-bezier easing ───────────────────────────────────────────────────────
// Newton-Raphson on x → t, then evaluate y(t). Used for custom curves only;
// the named curves come from additionals/Animation Easing table.

const cbz = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const bz    = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const cx = bz(t, p1x, p2x) - x;
      if (Math.abs(cx) < 1e-5) break;
      const sl = slope(t, p1x, p2x);
      if (Math.abs(sl) < 1e-6) break;
      t -= cx / sl;
    }
    return bz(t, p1y, p2y);
  };
};

const evalEasing = (e: EasingDef | undefined, x: number): number => {
  if (!e) return x;
  if (typeof e === "string") {
    if (e === "step") return x < 1 ? 0 : 1;
    const fn = Easing[e];
    return fn ? fn(Math.max(0, Math.min(1, x))) : x;
  }
  if (e.type === "cubic-bezier") return cbz(e.p1x, e.p1y, e.p2x, e.p2y)(x);
  return x;
};

const interp = (a: Keyframe, b: Keyframe, t: number): number[] => {
  const dur = b.time - a.time;
  if (dur <= 0) return a.values.slice();
  const raw = (t - a.time) / dur;
  const e   = evalEasing(a.easing, Math.max(0, Math.min(1, raw)));
  const out: number[] = new Array(a.values.length);
  for (let i = 0; i < a.values.length; i++) {
    out[i] = a.values[i] + (b.values[i] - a.values[i]) * e;
  }
  return out;
};

const wrapTime = (t: number, dur: number, mode: WrapMode): number => {
  if (dur <= 0) return 0;
  if (mode === "clamp-forever") return Math.max(0, Math.min(dur, t));
  if (mode === "loop") return ((t % dur) + dur) % dur;
  if (mode === "ping-pong") {
    const cycle = dur * 2;
    const m = ((t % cycle) + cycle) % cycle;
    return m > dur ? cycle - m : m;
  }
  return t;
};

// ── Component ─────────────────────────────────────────────────────────────────

export class KeyframeEditor extends Control<KeyframeEditorOptions> {
  // Public state — read by Physics for sample()/bake() round-trips.
  _clips        : Clip[];
  _activeId     : string;
  _time         = 0;
  _playing      = false;
  _wrap         : WrapMode;
  _speed        : number;
  _view         : "time" | "frames";
  _spacing      : number;
  _selected     = new Set<string>();
  _selectedNode = "";
  _selectedProp = "";
  _bindings     = new Map<string, IKeyframeTarget>();

  // Callbacks
  private _onChange?  : KeyframeEditorOptions["onChange"];
  private _onKeyframe?: KeyframeEditorOptions["onKeyframe"];
  private _onPlay?    : KeyframeEditorOptions["onPlay"];
  private _onStop?    : KeyframeEditorOptions["onStop"];

  // Runtime
  private _loopRaf  = 0;
  private _lastT    = 0;
  private _drag: null | {
    kind: "playhead" | "keyframe";
    nodeId?: string; propId?: string; keyIndex?: number;
  } = null;

  // DOM refs
  private _elTrackCanvas!: HTMLCanvasElement;
  private _elPropCanvas! : HTMLCanvasElement;
  private _elTrackCtx!   : CanvasRenderingContext2D;
  private _elPropCtx!    : CanvasRenderingContext2D;
  private _elTimeReadout!: HTMLSpanElement;
  private _elDurReadout! : HTMLSpanElement;
  private _elClipSelect! : HTMLSelectElement;
  private _elWrapSelect! : HTMLSelectElement;
  private _elViewSelect! : HTMLSelectElement;
  private _elSpeedInput! : HTMLInputElement;
  private _elSampleInput!: HTMLInputElement;
  private _elSpacingInput!: HTMLInputElement;
  private _elPlayBtn!    : HTMLButtonElement;

  constructor(container: string | HTMLElement | null, opts: KeyframeEditorOptions = {}) {
    super(container, "div", {
      theme   : "dark",
      wrapMode: "normal",
      speed   : 1.0,
      view    : "time",
      spacing : 1,
      ...opts,
    });

    this.el.className = `ar-kfe${opts.class ? " " + opts.class : ""}`;
    this.el.dataset.theme = this._get("theme", "dark");

    this._clips    = (opts.clips && opts.clips.length)
      ? opts.clips
      : [{ id: "anim-1", name: "animation1", sampleRate: 60, duration: 0.75, nodes: [] }];
    this._activeId = opts.activeClip ?? this._clips[0].id;
    this._wrap     = this._get("wrapMode", "normal");
    this._speed    = this._get("speed", 1);
    this._view     = this._get("view", "time");
    this._spacing  = this._get("spacing", 1);

    this._onChange   = opts.onChange;
    this._onKeyframe = opts.onKeyframe;
    this._onPlay     = opts.onPlay;
    this._onStop     = opts.onStop;

    this._injectStyles();
    // Control's constructor schedules first _build() via microtask flush.
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  play(): this {
    if (this._playing) return this;
    this._playing = true;
    this._lastT   = performance.now();
    this._tick();
    this._onPlay?.();
    this._emit("play", { time: this._time });
    this._refreshTransport();
    return this;
  }

  pause(): this {
    if (!this._playing) return this;
    this._playing = false;
    cancelAnimationFrame(this._loopRaf);
    this._emit("pause", { time: this._time });
    this._refreshTransport();
    return this;
  }

  stop(): this {
    this.pause();
    this._time = 0;
    this._applyBindings();
    this._renderCanvases();
    this._refreshReadouts();
    this._onStop?.();
    this._emit("stop", {});
    return this;
  }

  seek(t: number): this {
    this._time = Math.max(0, t);
    this._applyBindings();
    this._renderCanvases();
    this._refreshReadouts();
    this._emit("seek", { time: this._time });
    return this;
  }

  step(framesDelta: number): this {
    const clip = this._activeClip();
    if (!clip) return this;
    return this.seek(this._time + framesDelta / clip.sampleRate);
  }

  bind(nodeId: string, target: IKeyframeTarget): this {
    this._bindings.set(nodeId, target);
    this._applyBindings();
    return this;
  }
  unbind(nodeId: string): this { this._bindings.delete(nodeId); return this; }

  addClip(c: Clip): this {
    this._clips = [...this._clips, c];
    this.refresh();
    return this;
  }

  setActiveClip(id: string): this {
    this._activeId = id;
    this._time     = 0;
    this.refresh();
    return this;
  }

  addKeyframe(nodeId: string, propertyId: string, k: Keyframe): this {
    const node = this._activeClip()?.nodes.find(n => n.id === nodeId);
    const prop = node?.properties.find(p => p.id === propertyId);
    if (!prop) return this;
    prop.keyframes.push({ ...k });
    prop.keyframes.sort((a, b) => a.time - b.time);
    this._onKeyframe?.({ nodeId, propertyId, keyframe: k });
    this._renderCanvases();
    this._notifyChange();
    return this;
  }

  removeKeyframe(nodeId: string, propertyId: string, index: number): this {
    const prop = this._activeClip()?.nodes.find(n => n.id === nodeId)
                 ?.properties.find(p => p.id === propertyId);
    if (!prop) return this;
    prop.keyframes.splice(index, 1);
    this._renderCanvases();
    this._notifyChange();
    return this;
  }

  /** Interpolated values for a property at time t (defaults to current time). */
  sample(nodeId: string, propertyId: string, t = this._time): number[] | null {
    const clip = this._activeClip();
    if (!clip) return null;
    const prop = clip.nodes.find(n => n.id === nodeId)
                 ?.properties.find(p => p.id === propertyId);
    if (!prop || prop.keyframes.length === 0) return null;
    const ks = prop.keyframes;
    const tt = wrapTime(t, clip.duration, this._wrap);
    if (tt <= ks[0].time) return ks[0].values.slice();
    if (tt >= ks[ks.length - 1].time) return ks[ks.length - 1].values.slice();
    for (let i = 0; i < ks.length - 1; i++) {
      if (tt >= ks[i].time && tt < ks[i + 1].time) return interp(ks[i], ks[i + 1], tt);
    }
    return ks[ks.length - 1].values.slice();
  }

  getState(): KeyframeEditorState {
    return {
      activeClipId: this._activeId,
      currentTime : this._time,
      isPlaying   : this._playing,
      selectedKeys: [...this._selected].map(k => {
        const [nodeId, propertyId, idx] = k.split("|");
        return { nodeId, propertyId, index: +idx };
      }),
    };
  }

  destroy(): void {
    cancelAnimationFrame(this._loopRaf);
    this._bindings.clear();
    super.destroy();
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _activeClip(): Clip | undefined {
    return this._clips.find(c => c.id === this._activeId);
  }

  protected _build(): void {
    this.el.innerHTML = `
<div class="ar-kfe__tabs">
  <button class="ar-kfe__tab" data-r="tab-assets">Assets Preview</button>
  <button class="ar-kfe__tab" data-r="tab-console">Console</button>
  <button class="ar-kfe__tab ar-kfe__tab--on" data-r="tab-anim">Animation</button>
  <span class="ar-kfe__flex"></span>
  <button class="ar-kfe__icon" data-r="menu" title="Menu">&#9776;</button>
</div>

<div class="ar-kfe__toolbar">
  <label class="ar-kfe__lbl">Clips:</label>
  <select class="ar-kfe__select" data-r="clip-select"></select>

  <span class="ar-kfe__sep"></span>

  <button class="ar-kfe__icon" data-r="t-start" title="Go to start">&#9198;</button>
  <button class="ar-kfe__icon" data-r="t-prev"  title="Previous frame">&#9194;</button>
  <button class="ar-kfe__icon ar-kfe__icon--play" data-r="play" title="Play / pause">&#9654;</button>
  <button class="ar-kfe__icon" data-r="t-next"  title="Next frame">&#9193;</button>
  <button class="ar-kfe__icon" data-r="t-end"   title="Go to end">&#9197;</button>
  <button class="ar-kfe__icon" data-r="t-stop"  title="Stop">&#9209;</button>

  <span class="ar-kfe__sep"></span>

  <select class="ar-kfe__select" data-r="view-select">
    <option value="time">Time</option>
    <option value="frames">Frames</option>
  </select>
  <span class="ar-kfe__readout" data-r="time-readout">0-00</span>

  <span class="ar-kfe__flex"></span>

  <label class="ar-kfe__lbl">Spacing:</label>
  <input class="ar-kfe__num" data-r="spacing-input" type="number" min="1" max="10" step="1" value="1">

  <button class="ar-kfe__icon" data-r="grid"     title="Show grid">&#9783;</button>
  <button class="ar-kfe__icon" data-r="snap"     title="Snap">&#9889;</button>
  <button class="ar-kfe__icon" data-r="settings" title="Settings">&#9881;</button>
  <button class="ar-kfe__icon" data-r="export"   title="Export">&#9167;</button>
</div>

<div class="ar-kfe__row-hd">
  <span class="ar-kfe__col-title">Node List</span>
  <span class="ar-kfe__icon ar-kfe__icon--small" title="Visibility">&#9673;</span>
  <input class="ar-kfe__filter" placeholder="Enter">
</div>

<canvas class="ar-kfe__canvas ar-kfe__canvas--tracks" data-r="track-canvas"></canvas>

<div class="ar-kfe__row-hd">
  <span class="ar-kfe__col-title">Property List</span>
  <button class="ar-kfe__icon ar-kfe__icon--small" data-r="add-prop" title="Add property">+</button>
  <span class="ar-kfe__flex"></span>
  <span class="ar-kfe__prop-name" data-r="prop-channel"></span>
  <input class="ar-kfe__num ar-kfe__num--wide" data-r="prop-value" type="number" step="0.01">
</div>

<canvas class="ar-kfe__canvas ar-kfe__canvas--props" data-r="prop-canvas"></canvas>

<div class="ar-kfe__footer">
  <label class="ar-kfe__lbl">WrapMode</label>
  <select class="ar-kfe__select" data-r="wrap-select">
    <option value="normal">Normal</option>
    <option value="loop">Loop</option>
    <option value="ping-pong">Ping-pong</option>
    <option value="clamp-forever">Clamp forever</option>
  </select>

  <span class="ar-kfe__flex"></span>

  <label class="ar-kfe__lbl">Sample</label>
  <input class="ar-kfe__num" data-r="sample-input" type="number" min="1" max="240" step="1" value="60">

  <label class="ar-kfe__lbl">Speed</label>
  <input class="ar-kfe__num" data-r="speed-input" type="number" min="0.1" max="8" step="0.1" value="1">

  <label class="ar-kfe__lbl">Duration:</label>
  <span class="ar-kfe__readout" data-r="dur-readout">0.00 (0.00)s</span>
</div>`;

    const r = <T extends HTMLElement = HTMLElement>(n: string) =>
      this.el.querySelector(`[data-r="${n}"]`) as T;

    this._elTrackCanvas  = r<HTMLCanvasElement>("track-canvas");
    this._elPropCanvas   = r<HTMLCanvasElement>("prop-canvas");
    this._elTrackCtx     = this._elTrackCanvas.getContext("2d")!;
    this._elPropCtx      = this._elPropCanvas.getContext("2d")!;
    this._elTimeReadout  = r<HTMLSpanElement>("time-readout");
    this._elDurReadout   = r<HTMLSpanElement>("dur-readout");
    this._elClipSelect   = r<HTMLSelectElement>("clip-select");
    this._elWrapSelect   = r<HTMLSelectElement>("wrap-select");
    this._elViewSelect   = r<HTMLSelectElement>("view-select");
    this._elSpeedInput   = r<HTMLInputElement>("speed-input");
    this._elSampleInput  = r<HTMLInputElement>("sample-input");
    this._elSpacingInput = r<HTMLInputElement>("spacing-input");
    this._elPlayBtn      = r<HTMLButtonElement>("play");

    // populate clip dropdown
    this._elClipSelect.innerHTML = "";
    for (const c of this._clips) {
      const o = document.createElement("option");
      o.value = c.id; o.textContent = c.name;
      this._elClipSelect.appendChild(o);
    }
    this._elClipSelect.value  = this._activeId;
    this._elWrapSelect.value  = this._wrap;
    this._elViewSelect.value  = this._view;
    this._elSpeedInput.value  = String(this._speed);
    this._elSpacingInput.value = String(this._spacing);
    const clip = this._activeClip();
    if (clip) this._elSampleInput.value = String(clip.sampleRate);

    this._wireEvents();
    this._resizeCanvases();
    this._renderCanvases();
    this._refreshReadouts();
    this._refreshTransport();
  }

  private _wireEvents(): void {
    const r = <T extends HTMLElement = HTMLElement>(n: string) =>
      this.el.querySelector(`[data-r="${n}"]`) as T;

    this._on(this._elPlayBtn,     "click", () => this._playing ? this.pause() : this.play());
    this._on(r("t-stop"),         "click", () => this.stop());
    this._on(r("t-prev"),         "click", () => this.step(-1));
    this._on(r("t-next"),         "click", () => this.step(+1));
    this._on(r("t-start"),        "click", () => this.seek(0));
    this._on(r("t-end"),          "click", () => { const c = this._activeClip(); if (c) this.seek(c.duration); });

    this._on(this._elClipSelect,   "change", () => this.setActiveClip(this._elClipSelect.value));
    this._on(this._elWrapSelect,   "change", () => { this._wrap = this._elWrapSelect.value as WrapMode; this._notifyChange(); });
    this._on(this._elViewSelect,   "change", () => { this._view = this._elViewSelect.value as "time" | "frames"; this._renderCanvases(); this._refreshReadouts(); });
    this._on(this._elSpeedInput,   "input",  () => { this._speed = +this._elSpeedInput.value || 1; this._refreshReadouts(); this._notifyChange(); });
    this._on(this._elSpacingInput, "input",  () => { this._spacing = +this._elSpacingInput.value || 1; this._renderCanvases(); });
    this._on(this._elSampleInput,  "input",  () => {
      const v = +this._elSampleInput.value || 60;
      const c = this._activeClip(); if (c) { c.sampleRate = v; this._refreshReadouts(); this._notifyChange(); }
    });

    // canvas interactions
    for (const cv of [this._elTrackCanvas, this._elPropCanvas]) {
      this._on(cv, "mousedown",   (e: MouseEvent) => this._onMouseDown(e, cv));
      this._on(cv, "dblclick",    (e: MouseEvent) => this._onDblClick(e, cv));
      this._on(cv, "contextmenu", (e: MouseEvent) => this._onContext(e));
    }
    this._on(window, "mousemove", (e: MouseEvent) => this._onMouseMove(e));
    this._on(window, "mouseup",   () => { this._drag = null; });
    this._on(window, "resize",    () => { this._resizeCanvases(); this._renderCanvases(); });
  }

  private _resizeCanvases(): void {
    const dpr = window.devicePixelRatio || 1;
    for (const c of [this._elTrackCanvas, this._elPropCanvas]) {
      const rect = c.getBoundingClientRect();
      c.width  = Math.max(1, Math.round(rect.width  * dpr));
      c.height = Math.max(1, Math.round(rect.height * dpr));
      c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private _tick = () => {
    if (!this._playing) return;
    const now  = performance.now();
    const dt   = (now - this._lastT) / 1000;
    this._lastT = now;
    const clip = this._activeClip(); if (!clip) return;
    const next = this._time + dt * this._speed;
    if (this._wrap === "normal" && next >= clip.duration) {
      this._time = clip.duration;
      this._applyBindings();
      this._renderCanvases();
      this._refreshReadouts();
      this.pause();
      return;
    }
    this._time = wrapTime(next, clip.duration, this._wrap);
    this._applyBindings();
    this._renderCanvases();
    this._refreshReadouts();
    this._loopRaf = requestAnimationFrame(this._tick);
  };

  private _applyBindings(): void {
    const clip = this._activeClip(); if (!clip) return;
    for (const node of clip.nodes) {
      const target = this._bindings.get(node.id);
      if (!target) continue;
      for (const prop of node.properties) {
        const v = this.sample(node.id, prop.id);
        if (v) target.set(prop.id, v);
      }
    }
  }

  private _notifyChange(): void {
    this._onChange?.(this.getState());
    this._emit("change", this.getState());
  }

  private _refreshTransport(): void {
    if (this._elPlayBtn) this._elPlayBtn.innerHTML = this._playing ? "&#9208;" : "&#9654;";
  }

  private _refreshReadouts(): void {
    const clip = this._activeClip(); if (!clip) return;
    const frame = Math.round(this._time * clip.sampleRate);
    if (this._elTimeReadout) {
      this._elTimeReadout.textContent = this._view === "time"
        ? `${this._time.toFixed(2)}s`
        : `0-${String(frame).padStart(2, "0")}`;
    }
    if (this._elDurReadout) {
      const real = clip.duration / Math.max(0.0001, this._speed);
      this._elDurReadout.textContent = `${real.toFixed(2)} (${clip.duration.toFixed(2)})s`;
    }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  private _renderCanvases(): void { this._drawTrackLane(); this._drawPropLane(); }

  private _drawTrackLane(): void {
    const ctx = this._elTrackCtx;
    const cv  = this._elTrackCanvas;
    const W = cv.clientWidth, H = cv.clientHeight;
    const clip = this._activeClip(); if (!clip) return;
    ctx.clearRect(0, 0, W, H);

    const PAD_L = 140;
    const T_TO_X = (t: number) => PAD_L + (t / clip.duration) * (W - PAD_L - 20);
    this._drawRuler(ctx, PAD_L, 0, W - 20, 24, clip.duration, clip.sampleRate);

    let y = 32;
    const ROW = 28;
    for (const node of clip.nodes) {
      ctx.fillStyle = node.id === this._selectedNode ? "rgba(30,74,122,0.7)" : "transparent";
      ctx.fillRect(0, y, PAD_L, ROW);
      ctx.fillStyle = "#dcdcdc";
      ctx.font = "12px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("▸ " + node.label, 16, y + ROW / 2);

      const allTimes = new Set<number>();
      for (const p of node.properties) for (const k of p.keyframes) allTimes.add(k.time);
      for (const t of allTimes) this._drawDiamond(ctx, T_TO_X(t), y + ROW / 2, "#2c8df7", 6);

      y += ROW;
    }
    this._drawPlayhead(ctx, T_TO_X(this._time), 0, H);
  }

  private _drawPropLane(): void {
    const ctx = this._elPropCtx;
    const cv  = this._elPropCanvas;
    const W = cv.clientWidth, H = cv.clientHeight;
    const clip = this._activeClip(); if (!clip) return;
    ctx.clearRect(0, 0, W, H);

    const PAD_L = 140;
    const T_TO_X = (t: number) => PAD_L + (t / clip.duration) * (W - PAD_L - 20);
    this._drawRuler(ctx, PAD_L, 0, W - 20, 20, clip.duration, clip.sampleRate);

    const node = clip.nodes.find(n => n.id === this._selectedNode) ?? clip.nodes[0];
    if (!node) return;

    let y = 28;
    const ROW = 28;
    for (const prop of node.properties) {
      ctx.fillStyle = prop.id === this._selectedProp ? "rgba(30,74,122,0.7)" : "transparent";
      ctx.fillRect(0, y, PAD_L, ROW);
      ctx.fillStyle = "#dcdcdc";
      ctx.font = "12px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("▸ " + prop.label, 16, y + ROW / 2);

      // interpolation preview curve (channel 0 amplitude)
      if (prop.keyframes.length >= 2) {
        ctx.strokeStyle = "rgba(44,141,247,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const steps = 80;
        for (let s = 0; s <= steps; s++) {
          const tt = (s / steps) * clip.duration;
          const v  = this.sample(node.id, prop.id, tt);
          if (!v) continue;
          const x  = T_TO_X(tt);
          const yL = y + ROW - 6 - Math.min(18, Math.abs(v[0]) * 4);
          if (s === 0) ctx.moveTo(x, yL); else ctx.lineTo(x, yL);
        }
        ctx.stroke();
      }

      for (let i = 0; i < prop.keyframes.length; i++) {
        const k = prop.keyframes[i];
        const key = `${node.id}|${prop.id}|${i}`;
        const sel = this._selected.has(key);
        this._drawDiamond(ctx, T_TO_X(k.time), y + ROW / 2,
                          sel ? "#ff3aa1" : "#2c8df7", sel ? 8 : 6);
      }

      y += ROW;
    }
    this._drawPlayhead(ctx, T_TO_X(this._time), 0, H);
  }

  private _drawRuler(ctx: CanvasRenderingContext2D, x0: number, y: number, x1: number, y1: number, dur: number, fps: number): void {
    const W = x1 - x0;
    ctx.fillStyle = "#262932";
    ctx.fillRect(x0, y, W, y1 - y);
    ctx.fillStyle = "#8a8f98";
    ctx.font = "10px sans-serif";
    ctx.textBaseline = "middle";
    const step = dur / 10;
    for (let i = 0; i <= 10; i++) {
      const t = i * step;
      const xx = x0 + (t / dur) * W;
      ctx.fillRect(xx, y1 - 6, 1, 6);
      const frame = Math.round(t * fps);
      const label = this._view === "frames"
        ? `0-${String(frame).padStart(2, "0")}`
        : `${t.toFixed(2)}`;
      ctx.fillText(label, xx + 4, y + (y1 - y) / 2);
    }
  }

  private _drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, size: number): void {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#0e0e10";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private _drawPlayhead(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number): void {
    ctx.strokeStyle = "#ff3a3a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.fillStyle = "#ff3a3a";
    ctx.beginPath();
    ctx.moveTo(x - 5, y0);
    ctx.lineTo(x + 5, y0);
    ctx.lineTo(x, y0 + 6);
    ctx.closePath();
    ctx.fill();
  }

  // ── Mouse interaction ──────────────────────────────────────────────────────

  private _hitTest(e: MouseEvent, cv: HTMLCanvasElement) {
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const clip = this._activeClip()!;
    const PAD_L = 140;
    const W = cv.clientWidth;
    const x_to_t = (xx: number) =>
      Math.max(0, Math.min(clip.duration, ((xx - PAD_L) / (W - PAD_L - 20)) * clip.duration));
    return { x, y, t: x_to_t(x), inLabel: x < PAD_L };
  }

  private _onMouseDown(e: MouseEvent, cv: HTMLCanvasElement): void {
    const clip = this._activeClip(); if (!clip) return;
    const h = this._hitTest(e, cv);

    if (h.inLabel) {
      if (cv === this._elTrackCanvas) {
        const idx = Math.floor((h.y - 32) / 28);
        const node = clip.nodes[idx];
        if (node) { this._selectedNode = node.id; this._renderCanvases(); }
      } else {
        const node = clip.nodes.find(n => n.id === this._selectedNode) ?? clip.nodes[0];
        if (node) {
          const idx = Math.floor((h.y - 28) / 28);
          const prop = node.properties[idx];
          if (prop) { this._selectedProp = prop.id; this._renderCanvases(); }
        }
      }
      return;
    }

    const PAD_L = 140;
    const T_TO_X = (t: number) => PAD_L + (t / clip.duration) * (cv.clientWidth - PAD_L - 20);
    const HIT = 7;

    if (cv === this._elPropCanvas) {
      const node = clip.nodes.find(n => n.id === this._selectedNode) ?? clip.nodes[0];
      if (node) {
        for (let pi = 0; pi < node.properties.length; pi++) {
          const yRow = 28 + pi * 28 + 14;
          if (Math.abs(h.y - yRow) > HIT) continue;
          const prop = node.properties[pi];
          for (let ki = 0; ki < prop.keyframes.length; ki++) {
            const xk = T_TO_X(prop.keyframes[ki].time);
            if (Math.abs(h.x - xk) < HIT) {
              const key = `${node.id}|${prop.id}|${ki}`;
              if (e.shiftKey) {
                if (this._selected.has(key)) this._selected.delete(key);
                else this._selected.add(key);
              } else {
                this._selected.clear();
                this._selected.add(key);
              }
              this._drag = { kind: "keyframe", nodeId: node.id, propId: prop.id, keyIndex: ki };
              this._renderCanvases();
              return;
            }
          }
        }
      }
    }

    this._drag = { kind: "playhead" };
    this.seek(h.t);
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this._drag) return;
    const cv = this._drag.kind === "keyframe" ? this._elPropCanvas : this._elTrackCanvas;
    const h  = this._hitTest(e, cv);
    if (this._drag.kind === "playhead") { this.seek(h.t); return; }
    if (this._drag.kind === "keyframe") {
      const clip = this._activeClip(); if (!clip) return;
      const prop = clip.nodes.find(n => n.id === this._drag!.nodeId)
                   ?.properties.find(p => p.id === this._drag!.propId);
      if (!prop) return;
      const k = prop.keyframes[this._drag.keyIndex!];
      if (!k) return;
      k.time = Math.max(0, Math.min(clip.duration, h.t));
      prop.keyframes.sort((a, b) => a.time - b.time);
      this._renderCanvases();
      this._notifyChange();
    }
  }

  private _onDblClick(e: MouseEvent, cv: HTMLCanvasElement): void {
    const h = this._hitTest(e, cv);
    if (h.inLabel || cv !== this._elPropCanvas) return;
    const clip = this._activeClip(); if (!clip) return;
    const node = clip.nodes.find(n => n.id === this._selectedNode) ?? clip.nodes[0];
    if (!node) return;
    const pi = Math.floor((h.y - 28) / 28);
    const prop = node.properties[pi];
    if (!prop) return;
    const v = this.sample(node.id, prop.id, h.t) ?? prop.channels.map(() => 0);
    this.addKeyframe(node.id, prop.id, { time: h.t, values: v });
  }

  private _onContext(e: MouseEvent): void {
    e.preventDefault();
    const menu = document.createElement("div");
    menu.className = "ar-kfe__menu";
    menu.style.left = e.clientX + "px";
    menu.style.top  = e.clientY + "px";
    menu.innerHTML = `
      <div data-act="del">Delete keyframe(s)</div>
      <div data-act="copy">Copy</div>
      <div data-act="paste">Paste</div>
      <div class="ar-kfe__menu-sep"></div>
      <div data-act="ease-linear">Easing: Linear</div>
      <div data-act="ease-easeInQuad">Easing: Ease in (quad)</div>
      <div data-act="ease-easeOutQuad">Easing: Ease out (quad)</div>
      <div data-act="ease-easeInOutQuad">Easing: Ease in-out (quad)</div>
      <div data-act="ease-easeOutCubic">Easing: Ease out (cubic)</div>
      <div data-act="ease-easeOutBack">Easing: Ease out (back)</div>
      <div data-act="ease-easeOutBounce">Easing: Ease out (bounce)</div>
      <div data-act="ease-easeOutElastic">Easing: Ease out (elastic)</div>
      <div data-act="ease-step">Easing: Step</div>`;
    document.body.appendChild(menu);
    const close = () => { menu.remove(); window.removeEventListener("click", close); };
    setTimeout(() => window.addEventListener("click", close), 0);
    menu.onclick = (ev) => {
      const act = (ev.target as HTMLElement).dataset.act; if (!act) return;
      const sel = [...this._selected];
      const clip = this._activeClip(); if (!clip) { close(); return; }
      if (act === "del") {
        // delete in reverse order to keep indices valid
        const byProp = new Map<string, number[]>();
        for (const k of sel) {
          const [n, p, i] = k.split("|");
          const key = `${n}|${p}`;
          if (!byProp.has(key)) byProp.set(key, []);
          byProp.get(key)!.push(+i);
        }
        for (const [key, idxs] of byProp) {
          const [n, p] = key.split("|");
          const prop = clip.nodes.find(x => x.id === n)?.properties.find(x => x.id === p);
          if (!prop) continue;
          idxs.sort((a, b) => b - a).forEach(i => prop.keyframes.splice(i, 1));
        }
        this._selected.clear();
      } else if (act.startsWith("ease-")) {
        const name = act.slice(5) as EasingName;
        for (const k of sel) {
          const [n, p, i] = k.split("|");
          const prop = clip.nodes.find(x => x.id === n)?.properties.find(x => x.id === p);
          if (prop) prop.keyframes[+i].easing = name;
        }
      }
      this._renderCanvases();
      this._notifyChange();
      close();
    };
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  private _injectStyles(): void {
    if (document.getElementById("ar-kfe-styles")) return;
    const s = document.createElement("style");
    s.id = "ar-kfe-styles";
    s.textContent = `
.ar-kfe {
  display:flex; flex-direction:column;
  background:#1e1e1e; color:#dcdcdc;
  font:12px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  border:1px solid #2a2a2a; border-radius:4px; overflow:hidden;
  min-height:420px; width:100%;
}
.ar-kfe[data-theme="light"] { background:#fafafa; color:#1c1e21; border-color:#d4d6db; }
.ar-kfe button { font:inherit; }
.ar-kfe input, .ar-kfe select {
  background:#2a2a2a; color:#dcdcdc; border:1px solid #3a3a3a;
  border-radius:3px; padding:3px 6px; font:inherit;
}
.ar-kfe[data-theme="light"] input, .ar-kfe[data-theme="light"] select {
  background:#fff; color:#1c1e21; border-color:#d4d6db;
}

.ar-kfe__tabs {
  display:flex; align-items:center; gap:4px;
  padding:4px 8px; background:#181818; border-bottom:1px solid #2a2a2a;
}
.ar-kfe[data-theme="light"] .ar-kfe__tabs { background:#ececec; border-bottom-color:#d4d6db; }
.ar-kfe__tab {
  background:transparent; color:#8a8f98; border:0;
  padding:6px 12px; cursor:pointer; border-radius:3px 3px 0 0;
}
.ar-kfe__tab--on { background:#2c8df7; color:#fff; }

.ar-kfe__toolbar, .ar-kfe__footer, .ar-kfe__row-hd {
  display:flex; align-items:center; gap:6px;
  padding:6px 8px; background:#232323; border-bottom:1px solid #2a2a2a;
}
.ar-kfe[data-theme="light"] .ar-kfe__toolbar,
.ar-kfe[data-theme="light"] .ar-kfe__footer,
.ar-kfe[data-theme="light"] .ar-kfe__row-hd { background:#f0f1f4; border-bottom-color:#d4d6db; }

.ar-kfe__flex { flex:1; }
.ar-kfe__sep  { width:1px; height:18px; background:#3a3a3a; margin:0 4px; }
.ar-kfe__lbl  { color:#8a8f98; font-size:11px; }
.ar-kfe__icon {
  background:transparent; color:#c0c4ca; border:1px solid transparent;
  padding:3px 7px; cursor:pointer; border-radius:3px; min-width:22px;
}
.ar-kfe__icon:hover { background:#2c8df7; color:#fff; }
.ar-kfe__icon--play { background:#2c8df7; color:#fff; }
.ar-kfe__icon--small { padding:1px 5px; font-size:10px; }
.ar-kfe__select { min-width:80px; }
.ar-kfe__num    { width:50px; text-align:right; }
.ar-kfe__num--wide { width:70px; }
.ar-kfe__readout   { font:11px 'SF Mono',Menlo,monospace; color:#8a8f98; }
.ar-kfe__col-title { color:#c0c4ca; font-weight:500; }
.ar-kfe__filter    { width:120px; }
.ar-kfe__prop-name { color:#2c8df7; font-weight:500; padding:2px 6px;
                     background:rgba(44,141,247,0.10); border-radius:3px; }

.ar-kfe__canvas--tracks { width:100%; height:140px; display:block; cursor:pointer; }
.ar-kfe__canvas--props  { width:100%; height:180px; display:block; cursor:pointer; }

.ar-kfe__menu {
  position:fixed; z-index:10000;
  background:#232323; color:#dcdcdc; border:1px solid #3a3a3a;
  border-radius:4px; padding:4px 0; min-width:200px;
  box-shadow:0 8px 24px rgba(0,0,0,.4);
  font:12px -apple-system,sans-serif;
}
.ar-kfe__menu > div { padding:6px 14px; cursor:pointer; }
.ar-kfe__menu > div:hover { background:#2c8df7; color:#fff; }
.ar-kfe__menu-sep { border-top:1px solid #3a3a3a; margin:4px 0;
                    padding:0 !important; cursor:default !important;
                    pointer-events:none; }
`;
    document.head.appendChild(s);
  }
}

export default KeyframeEditor;
