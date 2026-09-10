/**
 * @module components/graphics/2D/Align
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * Illustrator-class Align panel + selection behaviour.
 */
import { Component, Css, Templates } from '../../../core/index.ts';

const html = Templates.Template.Html;

export type AlignAction =
    | 'align-left' | 'align-h-center' | 'align-right'
    | 'align-top' | 'align-v-center' | 'align-bottom'
    | 'distribute-top' | 'distribute-v-center' | 'distribute-bottom'
    | 'distribute-left' | 'distribute-h-center' | 'distribute-right'
    | 'distribute-v-spacing' | 'distribute-h-spacing';

export type AlignTo = 'selection' | 'key-object' | 'artboard';

export interface AlignOptions
{
    alignTo?: AlignTo;
    spacing?: number;
}

interface Box
{
    element: HTMLElement;
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
    cx: number;
    cy: number;
}

interface State
{
    host: HTMLElement | null;
    selected: Set<HTMLElement>;
    keyObject: HTMLElement | null;
    alignTo: AlignTo;
    spacing: number;
    marquee: HTMLDivElement | null;
    startX: number;
    startY: number;
    dragging: boolean;
}

const States = new WeakMap<HTMLElement, State>();

const stateOf = (host: HTMLElement): State =>
{
    let state = States.get(host);
    if(!state)
    {
        state = {
            host: null,
            selected: new Set(),
            keyObject: null,
            alignTo: 'selection',
            spacing: 0,
            marquee: null,
            startX: 0,
            startY: 0,
            dragging: false
        };
        States.set(host,state);
    }
    return state;
};

const icon = (kind: string): string =>
{
    const common = 'width="28" height="24" viewBox="0 0 28 24" aria-hidden="true"';
    const bar = 'fill="currentColor"';
    const obj = 'fill="currentColor" opacity=".88"';
    const guide = 'stroke="currentColor" stroke-width="1.4" opacity=".75"';
    const map: Record<string,string> = {
        'align-left': `<svg ${common}><line x1="4" y1="2" x2="4" y2="22" ${guide}/><rect x="6" y="5" width="15" height="5" ${obj}/><rect x="6" y="14" width="10" height="5" ${obj}/></svg>`,
        'align-h-center': `<svg ${common}><line x1="14" y1="2" x2="14" y2="22" ${guide}/><rect x="7" y="5" width="14" height="5" ${obj}/><rect x="9" y="14" width="10" height="5" ${obj}/></svg>`,
        'align-right': `<svg ${common}><line x1="24" y1="2" x2="24" y2="22" ${guide}/><rect x="7" y="5" width="15" height="5" ${obj}/><rect x="12" y="14" width="10" height="5" ${obj}/></svg>`,
        'align-top': `<svg ${common}><line x1="2" y1="4" x2="26" y2="4" ${guide}/><rect x="6" y="6" width="5" height="14" ${obj}/><rect x="16" y="6" width="7" height="9" ${obj}/></svg>`,
        'align-v-center': `<svg ${common}><line x1="2" y1="12" x2="26" y2="12" ${guide}/><rect x="5" y="5" width="6" height="14" ${obj}/><rect x="16" y="7" width="7" height="10" ${obj}/></svg>`,
        'align-bottom': `<svg ${common}><line x1="2" y1="20" x2="26" y2="20" ${guide}/><rect x="5" y="6" width="6" height="12" ${obj}/><rect x="16" y="10" width="7" height="8" ${obj}/></svg>`,
        'distribute-top': `<svg ${common}><line x1="2" y1="4" x2="26" y2="4" ${guide}/><rect x="4" y="6" width="20" height="3" ${obj}/><rect x="7" y="11" width="14" height="3" ${obj}/><rect x="5" y="17" width="18" height="3" ${obj}/></svg>`,
        'distribute-v-center': `<svg ${common}><rect x="4" y="3" width="20" height="3" ${obj}/><line x1="2" y1="12" x2="26" y2="12" ${guide}/><rect x="7" y="10" width="14" height="4" ${obj}/><rect x="5" y="18" width="18" height="3" ${obj}/></svg>`,
        'distribute-bottom': `<svg ${common}><rect x="4" y="4" width="20" height="3" ${obj}/><rect x="7" y="10" width="14" height="3" ${obj}/><rect x="5" y="15" width="18" height="3" ${obj}/><line x1="2" y1="20" x2="26" y2="20" ${guide}/></svg>`,
        'distribute-left': `<svg ${common}><line x1="4" y1="2" x2="4" y2="22" ${guide}/><rect x="6" y="4" width="3" height="16" ${obj}/><rect x="12" y="7" width="3" height="10" ${obj}/><rect x="19" y="5" width="3" height="14" ${obj}/></svg>`,
        'distribute-h-center': `<svg ${common}><rect x="4" y="4" width="3" height="16" ${obj}/><line x1="14" y1="2" x2="14" y2="22" ${guide}/><rect x="12" y="7" width="4" height="10" ${obj}/><rect x="21" y="5" width="3" height="14" ${obj}/></svg>`,
        'distribute-right': `<svg ${common}><rect x="4" y="4" width="3" height="16" ${obj}/><rect x="11" y="7" width="3" height="10" ${obj}/><rect x="19" y="5" width="3" height="14" ${obj}/><line x1="24" y1="2" x2="24" y2="22" ${guide}/></svg>`,
        'distribute-v-spacing': `<svg ${common}><rect x="4" y="4" width="20" height="4" ${obj}/><path d="M3 11h22M3 14h22" ${guide}/><rect x="7" y="17" width="14" height="4" ${obj}/></svg>`,
        'distribute-h-spacing': `<svg ${common}><rect x="4" y="4" width="4" height="16" ${obj}/><path d="M11 3v18M14 3v18" ${guide}/><rect x="18" y="6" width="4" height="12" ${obj}/></svg>`
    };
    return map[kind] ?? `<svg ${common}><rect x="5" y="5" width="18" height="14" ${bar}/></svg>`;
};

export const AlignStyles = new Css.Stylesheet([
    new Css.Rule('arianna-align,.Align',{
        Background:'var(--arianna-surface-2,#25292d)',Border:'1px solid var(--arianna-border,#15181a)',BorderRadius:'4px',
        BoxSizing:'border-box',Color:'var(--arianna-text,#e5e8ea)',Display:'block',
        FontFamily:'var(--arianna-font,system-ui,sans-serif)',MinWidth:'300px',Width:'100%'
    }),
    new Css.Rule('.Align-Header',{
        AlignItems:'center',Background:'linear-gradient(180deg,var(--arianna-surface-3,#363b40),var(--arianna-surface-2,#25292d))',BorderBottom:'1px solid var(--arianna-border,#15181a)',
        Display:'flex',FontSize:'13px',FontWeight:'700',Height:'34px',Padding:'0 10px'
    }),
    new Css.Rule('.Align-Group',{BorderBottom:'1px solid var(--arianna-border-soft,#343a40)',Padding:'9px 10px 10px'}),
    new Css.Rule('.Align-Label',{FontSize:'11px',FontWeight:'600',MarginBottom:'6px'}),
    new Css.Rule('.Align-Buttons',{Display:'grid',Gap:'7px',GridTemplateColumns:'repeat(6,1fr)'}),
    new Css.Rule('.Align-Buttons[data-count="3"]',{GridTemplateColumns:'repeat(3,1fr)'}),
    new Css.Rule('.Align-Button',{
        AlignItems:'center',Appearance:'none',Background:'transparent',Border:'1px solid transparent',
        BorderRadius:'3px',Color:'var(--arianna-text,#dce0e3)',Cursor:'pointer',Display:'flex',Height:'33px',
        JustifyContent:'center',Padding:'2px'
    }),
    new Css.Rule('.Align-Button:hover',{Background:'var(--arianna-hover,#3b4146)',BorderColor:'var(--arianna-accent,#e40c88)'}),
    new Css.Rule('.Align-Button:disabled',{Cursor:'default',Opacity:'.28'}),
    new Css.Rule('.Align-Footer',{
        AlignItems:'end',Display:'grid',Gap:'10px',GridTemplateColumns:'1fr 1fr',Padding:'9px 10px 11px'
    }),
    new Css.Rule('.Align-FieldLabel',{Display:'grid',FontSize:'10px',Gap:'4px'}),
    new Css.Rule('.Align-Field',{
        Background:'var(--arianna-input-bg,#171b1e)',Border:'1px solid var(--arianna-input-border,#3b4146)',BorderRadius:'3px',Color:'var(--arianna-text,#e5e8ea)',
        Height:'28px',MinWidth:'0',Padding:'0 6px'
    }),
    new Css.Rule('.Align-BindTarget',{Position:'relative',UserSelect:'none'}),
    new Css.Rule('.Align-Selectable',{Cursor:'default',Outline:'1px solid transparent'}),
    new Css.Rule('.Align-Selectable[data-align-selected="true"]',{
        Outline:'2px solid var(--arianna-selection,#4d9de0)',OutlineOffset:'2px'
    }),
    new Css.Rule('.Align-Selectable[data-align-key="true"]',{
        Outline:'3px solid var(--arianna-accent,#e40c88)',OutlineOffset:'3px'
    }),
    new Css.Rule('.Align-Marquee',{
        Background:'color-mix(in srgb,var(--arianna-selection,#4d9de0) 14%,transparent)',Border:'1px solid var(--arianna-selection,#4d9de0)',
        BoxSizing:'border-box',PointerEvents:'none',Position:'absolute',ZIndex:'9999'
    }),
    new Css.Rule('arianna-align[theme="light"],.Align[theme="light"]',{
        Background:'#f1f1f1',BorderColor:'#c8c8c8',Color:'#333'
    })
]);

@Component('arianna-align', AlignStyles, {
    Shadow:false,
    Attributes:['theme','align-to','spacing']
})
export class Align extends HTMLElement
{
    public static readonly Styles = AlignStyles;
    public template = html``;

    public onCreated(): void
    {
        if(this.isConnected) this.onConnected();
    }

    public onConnected(): void
    {
        this.classList.add('Align');
        const state = stateOf(this);

        const alignTo = this.getAttribute('align-to') as AlignTo | null;
        if(alignTo === 'selection' || alignTo === 'key-object' || alignTo === 'artboard')
            state.alignTo = alignTo;

        const spacing = Number(this.getAttribute('spacing'));
        if(Number.isFinite(spacing)) state.spacing = spacing;

        this.Render();
    }

    public bind(container: HTMLElement, selector='[data-align-item]'): this
    {
        const state = stateOf(this);
        this.unbind();

        state.host = container;
        container.classList.add('Align-BindTarget');

        const items = (): HTMLElement[] =>
            [...container.querySelectorAll<HTMLElement>(selector)];

        const clearVisuals = () =>
        {
            for(const item of items())
            {
                item.classList.add('Align-Selectable');
                item.dataset.alignSelected = String(state.selected.has(item));
                item.dataset.alignKey = String(state.keyObject === item);
            }
        };

        const click = (event: MouseEvent) =>
        {
            const item = (event.target as Element).closest(selector) as HTMLElement | null;
            if(!item || !container.contains(item)) return;

            event.preventDefault();
            event.stopPropagation();

            if(event.shiftKey)
            {
                if(state.selected.has(item)) state.selected.delete(item);
                else state.selected.add(item);
            }
            else
            {
                state.selected.clear();
                state.selected.add(item);
            }

            if(event.altKey || event.metaKey)
                state.keyObject = item;

            clearVisuals();
            this.UpdateButtons();
            this.EmitSelection();
        };

        const pointerDown = (event: PointerEvent) =>
        {
            if(event.button !== 0) return;
            const item = (event.target as Element).closest(selector);
            if(item) return;

            const rect = container.getBoundingClientRect();
            state.startX = event.clientX - rect.left + container.scrollLeft;
            state.startY = event.clientY - rect.top + container.scrollTop;
            state.dragging = true;

            if(!event.shiftKey) state.selected.clear();

            const marquee = document.createElement('div');
            marquee.className = 'Align-Marquee';
            marquee.style.left = `${state.startX}px`;
            marquee.style.top = `${state.startY}px`;
            marquee.style.width = '0px';
            marquee.style.height = '0px';
            state.marquee = marquee;
            container.appendChild(marquee);
            clearVisuals();
            container.setPointerCapture?.(event.pointerId);
        };

        const pointerMove = (event: PointerEvent) =>
        {
            if(!state.dragging || !state.marquee) return;
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left + container.scrollLeft;
            const y = event.clientY - rect.top + container.scrollTop;

            const left = Math.min(state.startX,x);
            const top = Math.min(state.startY,y);
            const right = Math.max(state.startX,x);
            const bottom = Math.max(state.startY,y);

            Object.assign(state.marquee.style,{
                left:`${left}px`,top:`${top}px`,
                width:`${right-left}px`,height:`${bottom-top}px`
            });

            for(const item of items())
            {
                const r = item.getBoundingClientRect();
                const il = r.left - rect.left + container.scrollLeft;
                const it = r.top - rect.top + container.scrollTop;
                const ir = il + r.width;
                const ib = it + r.height;

                if(ir >= left && il <= right && ib >= top && it <= bottom)
                    state.selected.add(item);
            }

            clearVisuals();
            this.UpdateButtons();
        };

        const pointerUp = (event: PointerEvent) =>
        {
            if(!state.dragging) return;
            state.dragging = false;
            state.marquee?.remove();
            state.marquee = null;
            try { container.releasePointerCapture?.(event.pointerId); } catch(_) {}
            clearVisuals();
            this.UpdateButtons();
            this.EmitSelection();
        };

        container.addEventListener('click',click);
        container.addEventListener('pointerdown',pointerDown);
        container.addEventListener('pointermove',pointerMove);
        container.addEventListener('pointerup',pointerUp);
        container.addEventListener('pointercancel',pointerUp);

        (container as any).__ariannaAlignCleanup = () =>
        {
            container.removeEventListener('click',click);
            container.removeEventListener('pointerdown',pointerDown);
            container.removeEventListener('pointermove',pointerMove);
            container.removeEventListener('pointerup',pointerUp);
            container.removeEventListener('pointercancel',pointerUp);
        };

        clearVisuals();
        this.UpdateButtons();
        return this;
    }

    public unbind(): this
    {
        const state = stateOf(this);
        const old = state.host as any;
        old?.__ariannaAlignCleanup?.();
        state.marquee?.remove();
        state.host = null;
        state.marquee = null;
        state.dragging = false;
        return this;
    }

    public select(elements: HTMLElement[], keyObject?: HTMLElement | null): this
    {
        const state = stateOf(this);
        state.selected = new Set(elements);
        if(keyObject !== undefined) state.keyObject = keyObject;
        this.RefreshSelectionVisuals();
        this.UpdateButtons();
        this.EmitSelection();
        return this;
    }

    public getSelection(): HTMLElement[]
    {
        return [...stateOf(this).selected];
    }

    public setKeyObject(element: HTMLElement | null): this
    {
        stateOf(this).keyObject = element;
        this.RefreshSelectionVisuals();
        return this;
    }

    public setAlignTo(value: AlignTo): this
    {
        stateOf(this).alignTo = value;
        this.setAttribute('align-to',value);
        const select = this.querySelector<HTMLSelectElement>('[data-role="align-to"]');
        if(select) select.value = value;
        return this;
    }

    public setSpacing(value:number): this
    {
        stateOf(this).spacing = Number.isFinite(value) ? value : 0;
        this.setAttribute('spacing',String(stateOf(this).spacing));
        const input = this.querySelector<HTMLInputElement>('[data-role="spacing"]');
        if(input) input.value = String(stateOf(this).spacing);
        return this;
    }

    public apply(action: AlignAction): this
    {
        const state = stateOf(this);
        const elements = [...state.selected].filter(el => el.isConnected);
        if(!state.host || elements.length === 0) return this;

        const hostRect = state.host.getBoundingClientRect();
        const boxes = elements.map(element => this.Box(element,hostRect));

        const selectionBounds = () =>
        {
            const left = Math.min(...boxes.map(b=>b.left));
            const top = Math.min(...boxes.map(b=>b.top));
            const right = Math.max(...boxes.map(b=>b.right));
            const bottom = Math.max(...boxes.map(b=>b.bottom));
            return {left,top,right,bottom,cx:(left+right)/2,cy:(top+bottom)/2};
        };

        const reference = () =>
        {
            if(state.alignTo === 'artboard')
                return {left:0,top:0,right:state.host!.clientWidth,bottom:state.host!.clientHeight,
                    cx:state.host!.clientWidth/2,cy:state.host!.clientHeight/2};

            if(state.alignTo === 'key-object' && state.keyObject && state.selected.has(state.keyObject))
            {
                const key = boxes.find(b=>b.element===state.keyObject);
                if(key) return key;
            }
            return selectionBounds();
        };

        const ref = reference();
        const moveTo = (box:Box,left:number,top:number) =>
        {
            box.element.style.position = 'absolute';
            box.element.style.left = `${left}px`;
            box.element.style.top = `${top}px`;
        };

        if(action === 'align-left') boxes.forEach(b=>moveTo(b,ref.left,b.top));
        else if(action === 'align-h-center') boxes.forEach(b=>moveTo(b,ref.cx-b.width/2,b.top));
        else if(action === 'align-right') boxes.forEach(b=>moveTo(b,ref.right-b.width,b.top));
        else if(action === 'align-top') boxes.forEach(b=>moveTo(b,b.left,ref.top));
        else if(action === 'align-v-center') boxes.forEach(b=>moveTo(b,b.left,ref.cy-b.height/2));
        else if(action === 'align-bottom') boxes.forEach(b=>moveTo(b,b.left,ref.bottom-b.height));
        else if(action.startsWith('distribute-'))
            this.Distribute(action,boxes,moveTo);

        this.RefreshSelectionVisuals();
        this.dispatchEvent(new CustomEvent('arianna:align',{
            bubbles:true,composed:true,
            detail:{action,alignTo:state.alignTo,spacing:state.spacing,elements}
        }));
        return this;
    }

    private Distribute(
        action:AlignAction,
        boxes:Box[],
        moveTo:(box:Box,left:number,top:number)=>void
    ): void
    {
        if(boxes.length < 2) return;
        const state = stateOf(this);

        if(action === 'distribute-h-spacing')
        {
            const sorted = [...boxes].sort((a,b)=>a.left-b.left);
            const start = sorted[0].left;
            const gap = state.spacing;
            let cursor = start;
            for(const box of sorted)
            {
                moveTo(box,cursor,box.top);
                cursor += box.width + gap;
            }
            return;
        }

        if(action === 'distribute-v-spacing')
        {
            const sorted = [...boxes].sort((a,b)=>a.top-b.top);
            const start = sorted[0].top;
            const gap = state.spacing;
            let cursor = start;
            for(const box of sorted)
            {
                moveTo(box,box.left,cursor);
                cursor += box.height + gap;
            }
            return;
        }

        const horizontal = action === 'distribute-left' || action === 'distribute-h-center' || action === 'distribute-right';
        const sorted = [...boxes].sort((a,b)=>
            horizontal ? (a.cx-b.cx) : (a.cy-b.cy));

        if(sorted.length < 3) return;

        if(horizontal)
        {
            const first = action === 'distribute-left' ? sorted[0].left :
                action === 'distribute-right' ? sorted[0].right : sorted[0].cx;
            const lastBox = sorted[sorted.length-1];
            const last = action === 'distribute-left' ? lastBox.left :
                action === 'distribute-right' ? lastBox.right : lastBox.cx;
            const step = (last-first)/(sorted.length-1);

            sorted.forEach((box,index)=>{
                const target = first + step*index;
                const left = action === 'distribute-left' ? target :
                    action === 'distribute-right' ? target-box.width : target-box.width/2;
                moveTo(box,left,box.top);
            });
        }
        else
        {
            const first = action === 'distribute-top' ? sorted[0].top :
                action === 'distribute-bottom' ? sorted[0].bottom : sorted[0].cy;
            const lastBox = sorted[sorted.length-1];
            const last = action === 'distribute-top' ? lastBox.top :
                action === 'distribute-bottom' ? lastBox.bottom : lastBox.cy;
            const step = (last-first)/(sorted.length-1);

            sorted.forEach((box,index)=>{
                const target = first + step*index;
                const top = action === 'distribute-top' ? target :
                    action === 'distribute-bottom' ? target-box.height : target-box.height/2;
                moveTo(box,box.left,top);
            });
        }
    }

    private Box(element:HTMLElement,hostRect:DOMRect):Box
    {
        const rect = element.getBoundingClientRect();
        const left = rect.left-hostRect.left+(stateOf(this).host?.scrollLeft ?? 0);
        const top = rect.top-hostRect.top+(stateOf(this).host?.scrollTop ?? 0);
        return {
            element,left,top,width:rect.width,height:rect.height,
            right:left+rect.width,bottom:top+rect.height,
            cx:left+rect.width/2,cy:top+rect.height/2
        };
    }

    private RefreshSelectionVisuals(): void
    {
        const state = stateOf(this);
        if(!state.host) return;
        for(const item of state.host.querySelectorAll<HTMLElement>('[data-align-item]'))
        {
            item.classList.add('Align-Selectable');
            item.dataset.alignSelected = String(state.selected.has(item));
            item.dataset.alignKey = String(state.keyObject===item);
        }
    }

    private EmitSelection(): void
    {
        const state = stateOf(this);
        this.dispatchEvent(new CustomEvent('arianna:align-selection',{
            bubbles:true,composed:true,
            detail:{elements:[...state.selected],keyObject:state.keyObject}
        }));
    }

    private UpdateButtons(): void
    {
        const count = stateOf(this).selected.size;
        this.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{
            const action = button.dataset.action!;
            button.disabled = action.startsWith('distribute-') ? count < 2 : count < 1;
        });
    }

    private Render(): void
    {
        const state = stateOf(this);
        this.replaceChildren();

        const header = document.createElement('div');
        header.className = 'Align-Header';
        header.textContent = 'Align';
        this.appendChild(header);

        const groups: Array<{label:string; actions:AlignAction[]; count?:number}> = [
            { label:'Align Objects', actions:[
                'align-left','align-h-center','align-right',
                'align-top','align-v-center','align-bottom'
            ]},
            { label:'Distribute Objects', actions:[
                'distribute-top','distribute-v-center','distribute-bottom',
                'distribute-left','distribute-h-center','distribute-right'
            ]},
            { label:'Distribute Spacing', count:3, actions:[
                'distribute-v-spacing','distribute-h-spacing'
            ]}
        ];

        for(const group of groups)
        {
            const section = document.createElement('section');
            section.className = 'Align-Group';

            const label = document.createElement('div');
            label.className = 'Align-Label';
            label.textContent = group.label;
            section.appendChild(label);

            const row = document.createElement('div');
            row.className = 'Align-Buttons';
            if(group.count) row.dataset.count = String(group.count);

            for(const action of group.actions)
            {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'Align-Button';
                button.dataset.action = action;
                button.title = action;
                button.innerHTML = icon(action);
                button.onclick = () => this.apply(action);
                row.appendChild(button);
            }
            section.appendChild(row);
            this.appendChild(section);
        }

        const footer = document.createElement('div');
        footer.className = 'Align-Footer';

        const spacingLabel = document.createElement('label');
        spacingLabel.className = 'Align-FieldLabel';
        spacingLabel.textContent = 'Spacing';
        const spacing = document.createElement('input');
        spacing.type = 'number';
        spacing.className = 'Align-Field';
        spacing.dataset.role = 'spacing';
        spacing.value = String(state.spacing);
        spacing.onchange = () => this.setSpacing(Number(spacing.value));
        spacingLabel.appendChild(spacing);

        const alignToLabel = document.createElement('label');
        alignToLabel.className = 'Align-FieldLabel';
        alignToLabel.textContent = 'Align To';
        const alignTo = document.createElement('select');
        alignTo.className = 'Align-Field';
        alignTo.dataset.role = 'align-to';
        alignTo.innerHTML =
            '<option value="selection">Selection</option>'+
            '<option value="key-object">Key Object</option>'+
            '<option value="artboard">Artboard</option>';
        alignTo.value = state.alignTo;
        alignTo.onchange = () => this.setAlignTo(alignTo.value as AlignTo);
        alignToLabel.appendChild(alignTo);

        footer.append(spacingLabel,alignToLabel);
        this.appendChild(footer);
        this.UpdateButtons();
    }
}

export default Align;
