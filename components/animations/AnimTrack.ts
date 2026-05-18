/**
 * @module    components/animations/AnimTrack
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * AnimTrack — one channel of a KeyframeEditor (e.g. "X Location",
 * "W Quaternion Rotation"). Contains Keyframe children placed along
 * the timeline.
 *
 *   <arianna-anim-track name="X Location" channel="loc-x" group="position">
 *     <arianna-keyframe frame="0"  value="0"></arianna-keyframe>
 *     <arianna-keyframe frame="24" value="5"></arianna-keyframe>
 *   </arianna-anim-track>
 *
 *   const tr = new AnimTrack({ name: 'X Location', channel: 'loc-x', group: 'position' });
 *   tr.addKeyframe(new Keyframe({ frame: 0,  value: 0 }));
 *   tr.addKeyframe(new Keyframe({ frame: 24, value: 5 }));
 *
 * `group` is used by CurveEditor to colour curves consistently
 * (e.g. all position channels in cyan, all rotation channels in orange).
 *
 * Events:
 *   arianna:track-mute   { track, value }
 *   arianna:track-lock   { track, value }
 *   arianna:track-hidden { track, value }
 */

import { Component } from '../../core/Component.ts';
import { effect, type Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule } from '../../core/Rule.ts';
import type { Keyframe } from './Keyframe.ts';

export type ChannelGroup = 'position' | 'rotation' | 'scale' | 'custom';

export interface AnimTrackOptions {
    name?    : string;
    channel? : string;
    group?   : ChannelGroup;
    muted?   : boolean;
    locked?  : boolean;
    hidden?  : boolean;
}

export class AnimTrack extends Component('arianna-anim-track', HTMLElement, {}, {
    attrs : ['name', 'channel', 'group', 'muted', 'locked', 'hidden'],
    shadow: false,
    bus   : 'arianna-keyframe-editor',
})
{
    constructor(opts: AnimTrackOptions = {}) {
        super(opts as never);
        const self = this as unknown as { render(): HTMLElement };
        const el = self.render();
        if (opts.name)    el.setAttribute('name',    opts.name);
        if (opts.channel) el.setAttribute('channel', opts.channel);
        if (opts.group)   el.setAttribute('group',   opts.group);
        if (opts.muted)   el.setAttribute('muted',   '');
        if (opts.locked)  el.setAttribute('locked',  '');
        if (opts.hidden)  el.setAttribute('hidden',  '');
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            attrSignal(name: string): Signal<string | null> | undefined;
            Sheet: Sheet | null;
        };
        const el = self.render();
        if (el.querySelector('.at-head')) return;

        // Track header (left column inside the editor grid)
        const head = document.createElement('div');
        head.className = 'at-head';

        const name = document.createElement('span');
        name.className = 'at-name';
        const sName = self.attrSignal('name');
        effect(() => { name.textContent = sName?.get() ?? 'Channel'; });

        const btnMute = document.createElement('button');
        btnMute.type = 'button'; btnMute.className = 'at-icon at-mute';
        btnMute.title = 'mute';
        btnMute.textContent = '◉';

        const btnHide = document.createElement('button');
        btnHide.type = 'button'; btnHide.className = 'at-icon at-hide';
        btnHide.title = 'hide';
        btnHide.textContent = '◎';

        const btnLock = document.createElement('button');
        btnLock.type = 'button'; btnLock.className = 'at-icon at-lock';
        btnLock.title = 'lock';
        btnLock.textContent = '⚿';

        head.append(name, btnMute, btnHide, btnLock);

        // Track lane (right column — where keyframes are positioned)
        const lane = document.createElement('div');
        lane.className = 'at-lane';

        // Group dot (color marker — set by CSS variable picked by 'group' attr)
        const groupDot = document.createElement('span');
        groupDot.className = 'at-group-dot';
        head.insertBefore(groupDot, name);

        // Migrate any pre-existing arianna-keyframe children into the lane
        Array.from(el.querySelectorAll('arianna-keyframe'))
             .forEach(kf => lane.appendChild(kf));

        el.appendChild(head);
        el.appendChild(lane);

        // Reactive group-class
        const sGroup = self.attrSignal('group');
        effect(() => {
            const g = sGroup?.get() ?? 'custom';
            el.dataset.group = g;
        });

        btnMute.addEventListener('click', () => {
            const v = !el.hasAttribute('muted');
            if (v) el.setAttribute('muted', ''); else el.removeAttribute('muted');
            self.fire('arianna:track-mute', { detail: { track: this, value: v, source: this }, bubbles: true });
        });
        btnHide.addEventListener('click', () => {
            const v = !el.hasAttribute('hidden');
            if (v) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
            self.fire('arianna:track-hidden', { detail: { track: this, value: v, source: this }, bubbles: true });
        });
        btnLock.addEventListener('click', () => {
            const v = !el.hasAttribute('locked');
            if (v) el.setAttribute('locked', ''); else el.removeAttribute('locked');
            self.fire('arianna:track-lock', { detail: { track: this, value: v, source: this }, bubbles: true });
        });

        effect(() => { btnMute.classList.toggle('active', el.hasAttribute('muted')); });
        effect(() => { btnHide.classList.toggle('active', el.hasAttribute('hidden')); });
        effect(() => { btnLock.classList.toggle('active', el.hasAttribute('locked')); });

        self.Sheet = AnimTrack.DefaultSheet();
    }

    /** Append a Keyframe to this track. */
    addKeyframe(kf: Keyframe): this {
        const self = this as unknown as { render(): HTMLElement };
        const lane = self.render().querySelector('.at-lane');
        if (!lane) return this;
        const kfEl = (kf as unknown as { render(): HTMLElement }).render();
        lane.appendChild(kfEl);
        return this;
    }

    /** All keyframes on this track. */
    getKeyframes(): Keyframe[] {
        const self = this as unknown as { _children?: unknown[] };
        return (self._children ?? []) as Keyframe[];
    }

    static DefaultSheet(): Sheet {
        return new Sheet([
            new Rule(':root', {
                borderBottom: '1px solid var(--ar-border, #2a2a2a)',
                display     : 'grid',
                gridTemplateColumns: 'var(--track-head-width, 160px) 1fr',
                height      : 'var(--track-height, 22px)',
                position    : 'relative',
            }),
            new Rule(':root[hidden]', { opacity: '0.35' }),
            new Rule(':root .at-head', {
                alignItems   : 'center',
                background   : 'var(--ar-bg2, #161616)',
                borderRight  : '1px solid var(--ar-border, #2a2a2a)',
                display      : 'flex',
                gap          : '4px',
                paddingLeft  : '6px',
                paddingRight : '4px',
            }),
            new Rule(':root .at-group-dot', {
                background  : 'var(--ar-muted, #888)',
                borderRadius: '50%',
                display     : 'inline-block',
                flexShrink  : '0',
                height      : '8px',
                width       : '8px',
            }),
            new Rule(":root[data-group='position'] .at-group-dot", { background: 'var(--arianna-curve-position, #4dd0e1)' }),
            new Rule(":root[data-group='rotation'] .at-group-dot", { background: 'var(--arianna-curve-rotation, #ff9800)' }),
            new Rule(":root[data-group='scale']    .at-group-dot", { background: 'var(--arianna-curve-scale,    #7eb8f7)' }),
            new Rule(':root .at-name', {
                color     : 'var(--ar-text, #e0e0e0)',
                flex      : '1',
                fontSize  : '0.74rem',
                overflow  : 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }),
            new Rule(':root .at-icon', {
                background  : 'transparent',
                border      : '0',
                color       : 'var(--ar-muted, #888)',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.85rem',
                lineHeight  : '1',
                padding     : '0 2px',
            }),
            new Rule(':root .at-icon.active', { color: 'var(--ar-warning, #ff9800)' }),
            new Rule(':root .at-icon:hover',  { color: 'var(--ar-text, #e0e0e0)' }),
            new Rule(':root .at-lane', {
                background      : 'transparent',
                backgroundImage : 'linear-gradient(to right, var(--ar-border, #2a2a2a) 1px, transparent 1px)',
                backgroundSize  : 'var(--frame-step-px, 70px) 100%',
                position        : 'relative',
            }),
            new Rule(':root[muted] .at-lane', { opacity: '0.4' }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AnimTrack', {
        value: AnimTrack, writable: false, enumerable: false, configurable: false,
    });
}

export default AnimTrack;
