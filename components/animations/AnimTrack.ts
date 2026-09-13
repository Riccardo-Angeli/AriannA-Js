/**
 * @module components/animations/AnimTrack
 * @version 2.0.0
 */
import { Component, Css, Templates, Namespaces } from '../../core/index.ts';
import { Keyframe } from './Keyframe.ts';

const html = Templates.Template.Html;

export namespace AnimTrack
{
    export namespace Types
    {
        export type ChannelGroup = 'position' | 'rotation' | 'scale' | 'custom';
    }

    export namespace Interfaces
    {
        export interface AnimTrackOptions
        {
            name?: string;
            channel?: string;
            group?: Types.ChannelGroup;
            folder?: string;
            muted?: boolean;
            locked?: boolean;
            hidden?: boolean;
            frameStart?: number;
            frameEnd?: number;
            frameStep?: number;
            keyframes?: Keyframe.Interfaces.Options[];
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.AnimTrack', {
            '--Animation-KeyframeColor': '#4b9ee9',
            BoxSizing: 'border-box', Display: 'grid', GridTemplateColumns: '164px minmax(0,1fr)',
            MinHeight: '28px', MinWidth: '0', Position: 'relative', Width: '100%'
        }),
        new Css.Rule('.AnimTrack[data-group="position"]', { '--Animation-KeyframeColor': '#4b9ee9' }),
        new Css.Rule('.AnimTrack[data-group="rotation"]', { '--Animation-KeyframeColor': '#e69a45' }),
        new Css.Rule('.AnimTrack[data-group="scale"]', { '--Animation-KeyframeColor': '#42bd50' }),
        new Css.Rule('.AnimTrack[hidden]', { Opacity: '.34' }),
        new Css.Rule('.AnimTrack[muted] .AnimTrack-Lane', { Opacity: '.42' }),

        new Css.Rule('.AnimTrack-Header', {
            AlignItems: 'center', Background: '#292d31', BorderBottom: '1px solid #15181a',
            BorderRight: '1px solid #15181a', BoxSizing: 'border-box', Color: '#dde1e5',
            Display: 'flex', Gap: '7px', MinWidth: '0', Padding: '4px 7px'
        }),
        new Css.Rule('.AnimTrack-Toggle', {
            Appearance: 'none', Background: 'transparent', Border: '0', Color: '#e8ebee',
            Cursor: 'pointer', Font: 'inherit', FontSize: '14px', Height: '20px',
            LineHeight: '18px', Padding: '0', Width: '20px'
        }),
        new Css.Rule('.AnimTrack-Enabled', {
            AccentColor: '#4c9be8', Cursor: 'pointer', Height: '14px', Margin: '0', Width: '14px'
        }),
        new Css.Rule('.AnimTrack-Name', {
            Flex: '1 1 auto', FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            FontSize: '12px', FontWeight: '550', MinWidth: '0', Overflow: 'hidden',
            TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.AnimTrack-Icon', {
            Appearance: 'none', Background: 'transparent', Border: '0', Color: '#c7ccd1',
            Cursor: 'pointer', Font: '12px/1 var(--arianna-font, system-ui, sans-serif)',
            Height: '20px', Padding: '0', Width: '20px'
        }),
        new Css.Rule('.AnimTrack-Icon:hover, .AnimTrack-Icon[data-active="true"]', { Color: '#ffffff' }),
        new Css.Rule('.AnimTrack-Icon[data-active="true"]', { TextShadow: '0 0 8px rgba(239,141,47,.75)' }),

        new Css.Rule('.AnimTrack-Lane', {
            BackgroundColor: '#202428',
            BackgroundImage: 'linear-gradient(to right, rgba(115,124,133,.18) 1px, transparent 1px), linear-gradient(to bottom, transparent calc(50% - .5px), #15181a calc(50% - .5px), #15181a calc(50% + .5px), transparent calc(50% + .5px))',
            BackgroundSize: '20% 100%, 100% 100%', BorderBottom: '1px solid #15181a',
            BoxSizing: 'border-box', MinHeight: '28px', Overflow: 'visible', Position: 'relative'
        }),

        /* Standalone track follows the image reference: header over a full-width lane. */
        new Css.Rule('.AnimTrack.AnimTrack-Standalone', {
            Background: '#202428', Border: '1px solid #15181a', BorderRadius: '8px',
            GridTemplateColumns: '1fr', GridTemplateRows: '42px 86px', Overflow: 'hidden'
        }),
        new Css.Rule('.AnimTrack.AnimTrack-Standalone .AnimTrack-Header', {
            Background: 'linear-gradient(180deg,#363b40 0%,#25292d 100%)', BorderRight: '0',
            Padding: '8px 10px'
        }),
        new Css.Rule('.AnimTrack.AnimTrack-Standalone .AnimTrack-Lane', {
            BorderBottom: '0', MinHeight: '86px'
        }),
        new Css.Rule('.AnimTrack-Ruler', {
            Color: '#9ca4ab', Font: '10px/1 var(--arianna-font, system-ui, sans-serif)',
            Height: '18px', Left: '0', PointerEvents: 'none', Position: 'absolute', Right: '0', Top: '4px'
        }),
        new Css.Rule('.AnimTrack-RulerTick', { Position: 'absolute', Transform: 'translateX(-50%)' }),
        new Css.Rule('.AnimTrack.AnimTrack-Standalone .Keyframe', { Top: '58%' }),

        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Header, .KeyframeEditor[theme="light"] .AnimTrack-Header', {
            Background: 'linear-gradient(180deg,#f7f8f9,#d9dde0)', BorderBottomColor: '#bdc2c6', BorderRightColor: '#bcc1c5', Color: '#2d3237'
        }),
        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Toggle, .KeyframeEditor[theme="light"] .AnimTrack-Toggle', { Color: '#555c62' }),
        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Icon, .KeyframeEditor[theme="light"] .AnimTrack-Icon', { Color: '#697077' }),
        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Icon:hover, .AnimTrack[theme="light"] .AnimTrack-Icon[data-active="true"], .KeyframeEditor[theme="light"] .AnimTrack-Icon:hover, .KeyframeEditor[theme="light"] .AnimTrack-Icon[data-active="true"]', { Color: '#24282c' }),
        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Lane, .KeyframeEditor[theme="light"] .AnimTrack-Lane', {
            BackgroundColor: '#fafafa', BackgroundImage: 'linear-gradient(to right,#e2e4e6 1px,transparent 1px),linear-gradient(to bottom,transparent calc(50% - .5px),#c8ccd0 calc(50% - .5px),#c8ccd0 calc(50% + .5px),transparent calc(50% + .5px))', BorderBottomColor: '#bdc2c6'
        }),
        new Css.Rule('.AnimTrack.AnimTrack-Standalone[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3' }),
        new Css.Rule('.AnimTrack.AnimTrack-Standalone[theme="light"] .AnimTrack-Header', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)' }),
        new Css.Rule('.AnimTrack[theme="light"] .AnimTrack-Ruler, .KeyframeEditor[theme="light"] .AnimTrack-Ruler', { Color: '#697077' }),
    ]);

    @Component('arianna-anim-track', Styles, {
        Shadow: false,
        Attributes: ['name', 'channel', 'group', 'folder', 'muted', 'locked', 'hidden', 'frame-start', 'frame-end', 'frame-step'],
        Properties: ['keyframes']
    })
    export class AnimTrack extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        /*
         * IMPORTANT: AriannA can promote markup-first hosts before the native class
         * constructor/field initializers have run. These members therefore MUST be
         * treated as optional runtime state and initialized lazily by EnsureState().
         */
        private _keyframes?: Keyframe.Interfaces.Options[];
        private _bound?: boolean;

        constructor(options: Interfaces.AnimTrackOptions = {})
        {
            super();
            this.EnsureState();
            if(options.name) this.setAttribute('name', options.name);
            if(options.channel) this.setAttribute('channel', options.channel);
            if(options.group) this.setAttribute('group', options.group);
            if(options.folder) this.setAttribute('folder', options.folder);
            if(options.muted != null) this.toggleAttribute('muted', options.muted);
            if(options.locked != null) this.toggleAttribute('locked', options.locked);
            if(options.hidden != null) this.toggleAttribute('hidden', options.hidden);
            if(options.frameStart != null) this.setAttribute('frame-start', String(options.frameStart));
            if(options.frameEnd != null) this.setAttribute('frame-end', String(options.frameEnd));
            if(options.frameStep != null) this.setAttribute('frame-step', String(options.frameStep));
            if(options.keyframes) this._keyframes = options.keyframes.slice();
        }

        public get keyframes(): Keyframe.Interfaces.Options[]
        {
            this.EnsureState();
            return this.getKeyframes().map(keyframe => ({
                frame: keyframe.frame,
                value: keyframe.value,
                interpolation: keyframe.interpolation,
                selected: keyframe.hasAttribute('selected'),
                hot: keyframe.hasAttribute('hot')
            }));
        }

        public set keyframes(value: Keyframe.Interfaces.Options[])
        {
            this.EnsureState();
            this._keyframes = Array.isArray(value) ? value.slice() : [];
            if(this.isConnected) this.Render();
        }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('AnimTrack');
            this.classList.toggle('AnimTrack-Standalone', !this.closest('arianna-keyframe-editor, .KeyframeEditor'));
            if(!this.hasAttribute('name')) this.setAttribute('name', 'Track');
            if(!this.hasAttribute('group')) this.setAttribute('group', 'custom');
            if(!this.hasAttribute('frame-start')) this.setAttribute('frame-start', '0');
            if(!this.hasAttribute('frame-end')) this.setAttribute('frame-end', '50');
            if(!this.hasAttribute('frame-step')) this.setAttribute('frame-step', '10');
            this.dataset.group = this.getAttribute('group') ?? 'custom';
            this.Render();
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public render(): HTMLElement
        {
            return this;
        }

        public addKeyframe(keyframe: Keyframe.Keyframe): this
        {
            this.EnsureState();
            this.Render();
            const lane = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane');
            const live = this.NormalizeKeyframe(keyframe);
            lane?.append(live as unknown as Node);
            live.onConnected?.();
            this.PositionKeyframes();
            this.dispatchEvent(new CustomEvent('arianna:track-update', {
                bubbles: true, composed: true, detail: { track: this, source: this }
            }));
            return this;
        }

        public getKeyframes(): Keyframe.Keyframe[]
        {
            const lane = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane');
            if(!lane) return [];
            return (Array.from(lane.children)
                .filter(node => node instanceof HTMLElement && (node.matches('arianna-keyframe') || node.classList.contains('Keyframe'))) as unknown as Keyframe.Keyframe[]);
        }

        public PositionKeyframes(): void
        {
            const start = Number(this.getAttribute('frame-start') ?? 0) || 0;
            const end = Number(this.getAttribute('frame-end') ?? 100) || 100;
            for(const keyframe of this.getKeyframes())
            {
                const frame = Number((keyframe as unknown as HTMLElement).getAttribute('frame') ?? 0) || 0;
                const ratio = Math.max(0, Math.min(1, (frame - start) / Math.max(1, end - start)));
                const element = keyframe as unknown as HTMLElement;
                element.style.left = `${ratio * 100}%`;
                element.classList.remove('Keyframe-Standalone');
            }
        }

        private EnsureState(): void
        {
            if(!Array.isArray(this._keyframes)) this._keyframes = [];
            if(typeof this._bound !== 'boolean') this._bound = false;
        }

        private Render(): void
        {
            this.EnsureState();

            /* Preserve markup-first keyframes whether AriannA has already promoted
               them to their concrete DIV class or they are still custom tags. */
            const existing = (Array.from(this.children)
                .filter(node => node instanceof HTMLElement && (node.matches('arianna-keyframe') || node.classList.contains('Keyframe'))) as HTMLElement[])
                .map(node => this.NormalizeKeyframe(node as unknown as Keyframe.Keyframe) as unknown as HTMLElement);

            if(!this.querySelector(':scope > .AnimTrack-Header'))
            {
                const header = document.createElement('div');
                header.className = 'AnimTrack-Header';

                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'AnimTrack-Toggle';
                toggle.textContent = '⌄';
                toggle.title = 'Channel';

                const enabled = document.createElement('input');
                enabled.type = 'checkbox';
                enabled.className = 'AnimTrack-Enabled';
                enabled.checked = !this.hasAttribute('muted');
                enabled.title = 'Enable channel';

                const name = document.createElement('span');
                name.className = 'AnimTrack-Name';
                name.textContent = this.getAttribute('name') ?? 'Channel';

                const lock = document.createElement('button');
                lock.type = 'button';
                lock.className = 'AnimTrack-Icon';
                lock.title = 'Lock';
                lock.textContent = '♙';
                lock.dataset.active = String(this.hasAttribute('locked'));

                const eye = document.createElement('button');
                eye.type = 'button';
                eye.className = 'AnimTrack-Icon';
                eye.title = 'Visibility';
                eye.textContent = '◉';
                eye.dataset.active = String(!this.hasAttribute('hidden'));

                header.append(toggle, enabled, name, lock, eye);

                const lane = document.createElement('div');
                lane.className = 'AnimTrack-Lane';

                const ruler = document.createElement('div');
                ruler.className = 'AnimTrack-Ruler';
                lane.append(ruler);

                this.replaceChildren(header, lane);
                existing.forEach(keyframe =>
                {
                    lane.append(keyframe);
                    (keyframe as unknown as Keyframe.Keyframe).onConnected?.();
                });

                enabled.addEventListener('change', () =>
                {
                    this.toggleAttribute('muted', !enabled.checked);
                    this.Emit('arianna:track-mute', !enabled.checked);
                });

                lock.addEventListener('click', () =>
                {
                    const value = !this.hasAttribute('locked');
                    this.toggleAttribute('locked', value);
                    lock.dataset.active = String(value);
                    this.Emit('arianna:track-lock', value);
                });

                eye.addEventListener('click', () =>
                {
                    const value = !this.hasAttribute('hidden');
                    this.toggleAttribute('hidden', value);
                    eye.dataset.active = String(!value);
                    this.Emit('arianna:track-hidden', value);
                });

                toggle.addEventListener('click', () =>
                {
                    const collapsed = this.toggleAttribute('collapsed');
                    lane.style.display = collapsed ? 'none' : '';
                    toggle.textContent = collapsed ? '›' : '⌄';
                    this.Emit('arianna:track-collapse', collapsed);
                });
            }

            const name = this.querySelector<HTMLElement>(':scope > .AnimTrack-Header > .AnimTrack-Name');
            if(name) name.textContent = this.getAttribute('name') ?? 'Channel';

            const enabled = this.querySelector<HTMLInputElement>(':scope > .AnimTrack-Header > .AnimTrack-Enabled');
            if(enabled) enabled.checked = !this.hasAttribute('muted');

            const icons = this.querySelectorAll<HTMLElement>(':scope > .AnimTrack-Header > .AnimTrack-Icon');
            if(icons[0]) icons[0].dataset.active = String(this.hasAttribute('locked'));
            if(icons[1]) icons[1].dataset.active = String(!this.hasAttribute('hidden'));

            this.dataset.group = this.getAttribute('group') ?? 'custom';
            this.RenderRuler();

            const lane = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane');
            if(lane && existing.length) existing.forEach(keyframe =>
            {
                lane.append(keyframe);
                (keyframe as unknown as Keyframe.Keyframe).onConnected?.();
            });

            const pending = Array.isArray(this._keyframes) ? this._keyframes : [];
            if(pending.length) this.RenderKeyframes();
            else this.PositionKeyframes();

            if(!this._bound)
            {
                this._bound = true;
                this.BindInteraction();
                this.addEventListener('arianna:keyframe-select', () =>
                {
                    this.dispatchEvent(new CustomEvent('arianna:track-update', {
                        bubbles: true, composed: true, detail: { track: this, source: this }
                    }));
                });
            }
        }

        private BindInteraction(): void
        {
            const lane = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane');
            if(!lane) return;

            let dragging: Keyframe.Keyframe | null = null;
            let pointerId: number | null = null;
            let moved = false;

            const frameAt = (clientX: number): number =>
            {
                const rect = lane.getBoundingClientRect();
                const ratio = rect.width > 0 ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0;
                const start = Number(this.getAttribute('frame-start') ?? 0) || 0;
                const end = Number(this.getAttribute('frame-end') ?? 100) || 100;
                return Math.round(start + ratio * Math.max(1, end - start));
            };

            const keyframeFromTarget = (target: EventTarget | null): Keyframe.Keyframe | null =>
            {
                if(!(target instanceof Element)) return null;
                const element = target.closest('arianna-keyframe, .Keyframe');
                if(!element || !lane.contains(element)) return null;
                return element as unknown as Keyframe.Keyframe;
            };

            lane.addEventListener('pointerdown', event =>
            {
                const keyframe = keyframeFromTarget(event.target);
                if(!keyframe || this.hasAttribute('locked')) return;

                event.preventDefault();
                dragging = keyframe;
                pointerId = event.pointerId;
                moved = false;

                for(const sibling of this.getKeyframes())
                    (sibling as unknown as HTMLElement).toggleAttribute('selected', sibling === keyframe);

                lane.setPointerCapture?.(event.pointerId);
            });

            lane.addEventListener('pointermove', event =>
            {
                if(!dragging || pointerId !== event.pointerId) return;
                const frame = frameAt(event.clientX);
                const current = Number((dragging as unknown as HTMLElement).getAttribute('frame') ?? 0) || 0;
                if(frame === current) return;

                moved = true;
                if(typeof dragging.setFrame === 'function') dragging.setFrame(frame);
                else (dragging as unknown as HTMLElement).setAttribute('frame', String(frame));
                this.PositionKeyframes();

                this.dispatchEvent(new CustomEvent('arianna:keyframe-move', {
                    bubbles: true, composed: true,
                    detail: { track: this, keyframe: dragging, frame, source: this }
                }));
                this.dispatchEvent(new CustomEvent('arianna:track-update', {
                    bubbles: true, composed: true, detail: { track: this, source: this }
                }));
            });

            const finishDrag = (event: PointerEvent): void =>
            {
                if(pointerId !== event.pointerId) return;
                try { lane.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
                if(dragging && moved)
                {
                    this.dispatchEvent(new CustomEvent('arianna:keyframe-change', {
                        bubbles: true, composed: true,
                        detail: {
                            track: this,
                            keyframe: dragging,
                            frame: Number((dragging as unknown as HTMLElement).getAttribute('frame') ?? 0) || 0,
                            source: this
                        }
                    }));
                }
                dragging = null;
                pointerId = null;
                moved = false;
            };

            lane.addEventListener('pointerup', finishDrag);
            lane.addEventListener('pointercancel', finishDrag);

            /* Double-clicking an empty lane creates a keyframe at that frame.
               This keeps standalone usage editable without requiring external control UI. */
            lane.addEventListener('dblclick', event =>
            {
                if(this.hasAttribute('locked') || keyframeFromTarget(event.target)) return;
                const frame = frameAt(event.clientX);
                for(const sibling of this.getKeyframes())
                    (sibling as unknown as HTMLElement).removeAttribute('selected');

                const keyframe = this.CreateKeyframe({ frame, value: 0, interpolation: 'bezier', selected: true, tooltip: true });
                this.addKeyframe(keyframe);
                this.dispatchEvent(new CustomEvent('arianna:keyframe-add', {
                    bubbles: true, composed: true,
                    detail: { track: this, keyframe, frame, source: this }
                }));
            });
        }

        /**
         * Always materialize nested keyframes as their LOGICAL AriannA tag.
         * `new Keyframe.Keyframe()` inherits HTMLDivElement, so its native wire node is
         * a <div>; the Playground correctly reports that as an un-upgraded component.
         * Creating the logical tag and synchronously upgrading it keeps the DOM identity
         * canonical and does not depend on a later MutationObserver turn.
         */
        private CreateKeyframe(options: Keyframe.Interfaces.Options = {}): Keyframe.Keyframe
        {
            const node = document.createElementNS('http://www.w3.org/1999/xhtml', 'arianna-keyframe') as HTMLElement;
            const upgraded = Namespaces.Namespace.Upgrade(node) as HTMLElement;
            const keyframe = upgraded as unknown as Keyframe.Keyframe;

            if(options.frame != null) keyframe.setFrame?.(options.frame);
            else if(!keyframe.hasAttribute('frame')) keyframe.setAttribute('frame', '0');

            if(options.value != null) keyframe.setValue?.(options.value);
            else if(!keyframe.hasAttribute('value')) keyframe.setAttribute('value', '0');

            if(options.interpolation) keyframe.setInterpolation?.(options.interpolation);
            else if(!keyframe.hasAttribute('interpolation')) keyframe.setAttribute('interpolation', 'bezier');

            if(options.handleIn && options.handleOut) keyframe.setHandles?.(options.handleIn, options.handleOut);
            if(options.selected != null) keyframe.toggleAttribute('selected', options.selected);
            if(options.hot != null) keyframe.toggleAttribute('hot', options.hot);
            if(options.tooltip != null) keyframe.toggleAttribute('tooltip', options.tooltip);

            return keyframe;
        }

        private NormalizeKeyframe(keyframe: Keyframe.Keyframe): Keyframe.Keyframe
        {
            const element = keyframe as unknown as HTMLElement;

            if(element.localName === 'arianna-keyframe')
            {
                Namespaces.Namespace.Upgrade(element);
                return element as unknown as Keyframe.Keyframe;
            }

            const replacement = this.CreateKeyframe({
                frame: Number(element.getAttribute('frame') ?? 0) || 0,
                value: Number(element.getAttribute('value') ?? 0) || 0,
                interpolation: (element.getAttribute('interpolation') as Keyframe.Types.Interpolation | null) ?? 'bezier',
                selected: element.hasAttribute('selected'),
                hot: element.hasAttribute('hot'),
                tooltip: element.hasAttribute('tooltip'),
                handleIn: keyframe.handleIn,
                handleOut: keyframe.handleOut
            });

            return replacement;
        }

        private RenderKeyframes(): void
        {
            this.EnsureState();
            const lane = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane');
            if(!lane) return;

            Array.from(lane.children)
                .filter(node => node instanceof HTMLElement && (node.matches('arianna-keyframe') || node.classList.contains('Keyframe')))
                .forEach(node => node.remove());

            for(const options of this._keyframes ?? [])
            {
                const keyframe = this.CreateKeyframe(options);
                lane.append(keyframe as unknown as Node);
                keyframe.onConnected?.();
            }

            /* Options are an input buffer, not permanent render state. Clearing it
               prevents a later Render() from destroying user-moved DOM keyframes. */
            this._keyframes = [];
            this.PositionKeyframes();
        }

        private RenderRuler(): void
        {
            const ruler = this.querySelector<HTMLElement>(':scope > .AnimTrack-Lane > .AnimTrack-Ruler');
            if(!ruler) return;
            ruler.replaceChildren();
            if(!this.classList.contains('AnimTrack-Standalone')) return;

            const start = Number(this.getAttribute('frame-start') ?? 0) || 0;
            const end = Number(this.getAttribute('frame-end') ?? 50) || 50;
            const step = Math.max(1, Number(this.getAttribute('frame-step') ?? 10) || 10);
            for(let frame = start; frame <= end; frame += step)
            {
                const tick = document.createElement('span');
                tick.className = 'AnimTrack-RulerTick';
                tick.textContent = String(frame);
                tick.style.left = `${((frame - start) / Math.max(1, end - start)) * 100}%`;
                ruler.append(tick);
            }
        }

        private Emit(type: string, value: boolean): void
        {
            this.dispatchEvent(new CustomEvent(type, {
                bubbles: true, composed: true, detail: { track: this, value, source: this }
            }));
        }
    }
}

export type ChannelGroup = AnimTrack.Types.ChannelGroup;
export type AnimTrackOptions = AnimTrack.Interfaces.AnimTrackOptions;
export default AnimTrack.AnimTrack;
