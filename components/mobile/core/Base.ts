import { Css } from '../../../core/index.ts';

export type MobileTheme = 'dark' | 'light';
export type AttributeOptions = Record<string, unknown>;

export const MobileStyles = new Css.Stylesheet([
    new Css.Rule('.AriannaMobile', { BoxSizing:'border-box', Color:'var(--mobile-text,#f2f3f5)', FontFamily:'Inter,system-ui,sans-serif', WebkitTapHighlightColor:'transparent' }),
    new Css.Rule('.AriannaMobile:not([theme="light"])', { '--mobile-bg':'#17181c','--mobile-bg2':'#1d1e23','--mobile-bg3':'#24262b','--mobile-text':'#f2f3f5','--mobile-muted':'#a6abb4','--mobile-border':'#303238','--mobile-primary':'#e40c88' }),
    new Css.Rule('.AriannaMobile[theme="light"]', { '--mobile-bg':'#fff','--mobile-bg2':'#f8f8fa','--mobile-bg3':'#eeeeF2','--mobile-text':'#1b1d22','--mobile-muted':'#68707b','--mobile-border':'#dfe1e6','--mobile-primary':'#d5097d' }),
    new Css.Rule('.MobileBar', { AlignItems:'center', Background:'var(--mobile-bg2)', Border:'1px solid var(--mobile-border)', Display:'flex', Gap:'8px', MinHeight:'48px', Padding:'max(8px,env(safe-area-inset-top)) 12px 8px' }),
    new Css.Rule('.MobileButton', { Appearance:'none', Background:'linear-gradient(135deg,var(--mobile-primary),#ff58b2)', Border:'0', BorderRadius:'9px', Color:'#fff', Cursor:'pointer', Font:'inherit', FontWeight:'650', MinHeight:'36px', Padding:'8px 14px' }),
    new Css.Rule('.MobileButton:active', { Filter:'brightness(.86)', Transform:'translateY(1px)' }),
    new Css.Rule('.MobileButton:focus-visible', { Outline:'3px solid color-mix(in srgb,var(--mobile-primary),white 35%)', OutlineOffset:'2px' }),
    new Css.Rule('.MobileButton[data-variant="outlined"]', { Background:'transparent', Border:'1px solid var(--mobile-primary)', Color:'var(--mobile-primary)' }),
    new Css.Rule('.MobileButton[data-variant="text"]', { Background:'transparent', Color:'var(--mobile-primary)' }),
    new Css.Rule('.AriannaMobile[platform="ios"] .MobileButton', { BorderRadius:'10px' }),
    new Css.Rule('.AriannaMobile[platform="android"] .MobileButton', { BorderRadius:'20px', LetterSpacing:'.01em' }),
    new Css.Rule('.MobilePanel', { Background:'var(--mobile-bg)', Border:'1px solid var(--mobile-border)', BorderRadius:'14px', BoxShadow:'0 18px 48px rgba(0,0,0,.28)', Color:'var(--mobile-text)', Padding:'14px' }),
    new Css.Rule('.MobileField', { AccentColor:'var(--mobile-primary)', Background:'var(--mobile-bg3)', Border:'1px solid var(--mobile-border)', BorderRadius:'8px', Color:'var(--mobile-text)', MinHeight:'36px', Padding:'6px 9px' }),
]);

export abstract class MobileElement extends HTMLElement
{
    protected AttributeChanged(name: string, old: string | null, value: string | null, attributes: readonly string[]): boolean
    {
        return this.isConnected && old !== value && attributes.includes(name) && name !== 'theme';
    }
    protected Apply(options: AttributeOptions = {}): void
    {
        for(const [name, value] of Object.entries(options))
        {
            const attribute = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
            if(typeof value === 'boolean') this.toggleAttribute(attribute, value);
            else if(typeof value === 'string' || typeof value === 'number') this.setAttribute(attribute, String(value));
        }
    }
    protected Emit<T>(name: string, detail?: T): boolean { return this.dispatchEvent(new CustomEvent(name, { bubbles:true, composed:true, detail })); }
    protected Initialize(): void
    {
        this.classList.add('AriannaMobile');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        if(!this.hasAttribute('platform'))
        {
            const agent = globalThis.navigator?.userAgent ?? '';
            this.setAttribute('platform', /android/i.test(agent) ? 'android' : /iphone|ipad|ipod/i.test(agent) ? 'ios' : 'web');
        }
    }
    get Theme(): MobileTheme { return (this.getAttribute('theme') ?? 'dark') as MobileTheme; }
    set Theme(value: MobileTheme) { this.setAttribute('theme', value); }
}

export function Emit<T>(target: EventTarget, name: string, detail?: T): boolean
{
    return target.dispatchEvent(new CustomEvent(name, { bubbles:true, composed:true, detail }));
}

export function Button(label: string, action: () => void, className = 'MobileButton'): HTMLButtonElement
{
    const button = document.createElement('button');
    button.type = 'button'; button.className = className; button.textContent = label; button.onclick = action;
    return button;
}

