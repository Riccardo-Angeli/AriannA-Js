/**
 * @module    components/modifiers/2D/Resizer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Resizer component module.
 */

import { Component, Templates } from '../../../core/index.ts';
import { Modifier2D } from './Base.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   Resizer
 *  @public
 *  @description Namespace containing Resizer contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Resizer
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        ResizeDir
         *  @public
         *  @type        {'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'}
         *  @description Type alias for ResizeDir.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ResizerOptions
         *  @public
         *  @description ResizerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ResizerOptions
        {
            /** @name        handles
             *  @public
             *  @type        {Resizer.Types.ResizeDir[]}
             *  @description Component member for handles.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handles?: Types.ResizeDir[];

            /** @name        minWidth
             *  @public
             *  @type        {number}
             *  @description Component member for min Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minWidth?: number;

            /** @name        minHeight
             *  @public
             *  @type        {number}
             *  @description Component member for min Height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            minHeight?: number;

            /** @name        maxWidth
             *  @public
             *  @type        {number}
             *  @description Component member for max Width.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            maxWidth?: number;

            /** @name        maxHeight
             *  @public
             *  @type        {number}
             *  @description Component member for max Height.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            maxHeight?: number;

            /** @name        handleSize
             *  @public
             *  @type        {number}
             *  @description Component member for handle Size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleSize?: number;

            /** @name        handleColor
             *  @public
             *  @type        {string}
             *  @description Component member for handle Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handleColor?: string;

            /** @name        allowCross
             *  @public
             *  @type        {boolean}
             *  @description Component member for allow Cross.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            allowCross?: boolean;
        }
    }
    export function handleStyle(dir: Types.ResizeDir, hs: number): string {
        /** @name        h
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned h value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const h = hs / 2;

        /** @name        map
         *  @public
         *  @type        {Record<Resizer.Types.ResizeDir, string>}
         *  @description Namespace-owned map value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const map: Record<Types.ResizeDir, string> = {
            n: `top:-${h}px;left:50%;transform:translateX(-50%);cursor:n-resize;`,
            s: `bottom:-${h}px;left:50%;transform:translateX(-50%);cursor:s-resize;`,
            e: `right:-${h}px;top:50%;transform:translateY(-50%);cursor:e-resize;`,
            w: `left:-${h}px;top:50%;transform:translateY(-50%);cursor:w-resize;`,
            ne: `top:-${h}px;right:-${h}px;cursor:ne-resize;`,
            nw: `top:-${h}px;left:-${h}px;cursor:nw-resize;`,
            se: `bottom:-${h}px;right:-${h}px;cursor:se-resize;`,
            sw: `bottom:-${h}px;left:-${h}px;cursor:sw-resize;`,
        };
        return map[dir] ?? '';
    }

    /** @name        HandleStyle
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned HandleStyle value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function HandleStyle(...args: Parameters<typeof handleStyle>): ReturnType<typeof handleStyle>
    {
        return handleStyle(...args);
    }

    /** @class       Resizer
     *  @public
     *  @description AriannA Resizer component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-resizer', {}, {
        Attributes: [
            'handles', 'min-width', 'min-height', 'max-width', 'max-height',
            'handle-size', 'handle-color', 'allow-cross', 'disabled',
        ],
    })
    export class Resizer extends Modifier2D.Modifier2D
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        applyTo
         *  @protected
         *  @type        {void}
         *  @description Component member for apply To.
         *  @param       {HTMLElement} target Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected applyTo(target: HTMLElement): void
        {
            if (getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            /** @name        handlesAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned handlesAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const handlesAttr = this.getAttribute('handles');

            /** @name        handles
             *  @public
             *  @type        {Resizer.Types.ResizeDir[]}
             *  @description Namespace-owned handles value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const handles: Types.ResizeDir[] = handlesAttr
                ? handlesAttr.split(',').map(s => s.trim() as Types.ResizeDir).filter(s => /^(n|s|e|w|ne|nw|se|sw)$/.test(s))
                : ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

            /** @name        hs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hs = parseInt(this.getAttribute('handle-size') ?? '8', 10) || 8;

            /** @name        hc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hc = this.getAttribute('handle-color') ?? 'var(--arianna-primary, #1f6feb)';

            /** @name        allowCross
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned allowCross value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const allowCross = this.getAttribute('allow-cross') !== 'false';

            /** @name        minW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned minW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const minW = parseInt(this.getAttribute('min-width') ?? (allowCross ? '0' : '40'), 10) || (allowCross ? 0 : 40);

            /** @name        minH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned minH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const minH = parseInt(this.getAttribute('min-height') ?? (allowCross ? '0' : '40'), 10) || (allowCross ? 0 : 40);

            /** @name        maxW
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned maxW value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const maxW = parseInt(this.getAttribute('max-width') ?? '9999', 10) || 9999;

            /** @name        maxH
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned maxH value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const maxH = parseInt(this.getAttribute('max-height') ?? '9999', 10) || 9999;
            for (const dir of handles)
            {
                /** @name        handle
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned handle value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const handle = document.createElement('div');
                handle.dataset['resizeDir'] = dir;
                handle.className = 'ar-resizer-handle';
                handle.style.cssText =
                    `position:absolute;width:${hs}px;height:${hs}px;background:${hc};` +
                        `border-radius:50%;z-index:9999;touch-action:none;` +
                        handleStyle(dir, hs);
                target.appendChild(handle);

                /** @name        pointerId
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned pointerId value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let pointerId = -1;

                /** @name        startPx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned startPx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let startPx = 0, startPy = 0;

                /** @name        anchorX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned anchorX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let anchorX = 0, pointerStartX = 0;

                /** @name        anchorY
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned anchorY value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let anchorY = 0, pointerStartY = 0;

                /** @name        movesX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned movesX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let movesX = false, movesY = false;

                /** @name        onDown
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onDown value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onDown = (e: PointerEvent) => {
                    if (!this.isEnabled)
                        return;
                    if (e.button !== 0)
                        return;
                    e.preventDefault();
                    e.stopPropagation();
                    pointerId = e.pointerId;
                    startPx = e.clientX;
                    startPy = e.clientY;

                    /** @name        w
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned w value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const w = target.offsetWidth;

                    /** @name        h
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned h value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const h = target.offsetHeight;

                    /** @name        l
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned l value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const l = target.offsetLeft;

                    /** @name        t
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned t value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const t = target.offsetTop;
                    if (dir.includes('e'))
                    {
                        anchorX = l;
                        pointerStartX = l + w;
                        movesX = true;
                    }
                    else if (dir.includes('w'))
                    {
                        anchorX = l + w;
                        pointerStartX = l;
                        movesX = true;
                    }
                    else
                    {
                        movesX = false;
                    }
                    if (dir.includes('s'))
                    {
                        anchorY = t;
                        pointerStartY = t + h;
                        movesY = true;
                    }
                    else if (dir.includes('n'))
                    {
                        anchorY = t + h;
                        pointerStartY = t;
                        movesY = true;
                    }
                    else
                    {
                        movesY = false;
                    }
                    try
                    {
                        handle.setPointerCapture(pointerId);
                    }
                    catch { /* ignore */ }
                    handle.addEventListener('pointermove', onMove);
                    handle.addEventListener('pointerup', onUp);
                    handle.addEventListener('pointercancel', onUp);
                };

                /** @name        onMove
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onMove value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onMove = (ev: PointerEvent) => {
                    if (ev.pointerId !== pointerId)
                        return;

                    /** @name        dx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned dx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const dx = ev.clientX - startPx;

                    /** @name        dy
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned dy value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const dy = ev.clientY - startPy;

                    /** @name        w
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned w value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let w = target.offsetWidth;

                    /** @name        h
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned h value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let h = target.offsetHeight;

                    /** @name        nl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned nl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let nl = target.offsetLeft;

                    /** @name        nt
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned nt value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    let nt = target.offsetTop;
                    if (movesX)
                    {
                        /** @name        pointerX
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned pointerX value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        let pointerX = pointerStartX + dx;
                        if (allowCross)
                        {
                            /** @name        signed
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned signed value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const signed = pointerX - anchorX;
                            if (Math.abs(signed) > maxW)
                            {
                                pointerX = anchorX + (signed < 0 ? -maxW : maxW);
                            }
                        }
                        else
                        {
                            /** @name        origSign
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned origSign value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const origSign = (pointerStartX - anchorX) > 0 ? 1 : -1;

                            /** @name        signed
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned signed value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const signed = pointerX - anchorX;
                            if (origSign * signed < minW)
                                pointerX = anchorX + origSign * minW;
                            else if (Math.abs(signed) > maxW)
                                pointerX = anchorX + origSign * maxW;
                        }
                        w = Math.round(Math.abs(pointerX - anchorX));
                        nl = Math.round(Math.min(anchorX, pointerX));
                    }
                    if (movesY)
                    {
                        /** @name        pointerY
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned pointerY value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        let pointerY = pointerStartY + dy;
                        if (allowCross)
                        {
                            /** @name        signed
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned signed value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const signed = pointerY - anchorY;
                            if (Math.abs(signed) > maxH)
                            {
                                pointerY = anchorY + (signed < 0 ? -maxH : maxH);
                            }
                        }
                        else
                        {
                            /** @name        origSign
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned origSign value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const origSign = (pointerStartY - anchorY) > 0 ? 1 : -1;

                            /** @name        signed
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned signed value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const signed = pointerY - anchorY;
                            if (origSign * signed < minH)
                                pointerY = anchorY + origSign * minH;
                            else if (Math.abs(signed) > maxH)
                                pointerY = anchorY + origSign * maxH;
                        }
                        h = Math.round(Math.abs(pointerY - anchorY));
                        nt = Math.round(Math.min(anchorY, pointerY));
                    }
                    target.style.width = `${w}px`;
                    target.style.height = `${h}px`;
                    target.style.left = `${nl}px`;
                    target.style.top = `${nt}px`;
                    target.dispatchEvent(new CustomEvent('arianna:resize', {
                        bubbles: true,
                        detail: { width: w, height: h, target },
                    }));
                };

                /** @name        onUp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned onUp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const onUp = (ev: PointerEvent) => {
                    if (ev.pointerId !== pointerId)
                        return;
                    try
                    {
                        handle.releasePointerCapture(pointerId);
                    }
                    catch { /* ignore */ }
                    handle.removeEventListener('pointermove', onMove);
                    handle.removeEventListener('pointerup', onUp);
                    handle.removeEventListener('pointercancel', onUp);
                    pointerId = -1;
                };
                handle.addEventListener('pointerdown', onDown);
                this.cleanups.push(() => {
                    handle.removeEventListener('pointerdown', onDown);
                    handle.remove();
                });
            }
        }
    }
}
export default Resizer;
