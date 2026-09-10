/**
 * @module components/payments/Base
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Internal light-DOM mount helper and shared payment theme bridge.
 */
export interface MountableTemplate
{
    Mount?: (root: Element, scope?: Record<string, unknown>, options?: { Owner?: unknown }) => unknown;
}

type ThemedHost = HTMLElement &
{
    template?: MountableTemplate;
    __ariannaFolderTemplateMounted?: boolean;
    __ariannaFolderOnMountCalled?: boolean;
    __ariannaPaymentThemeObserver?: MutationObserver;
    onMount?: () => void;
};

function ApplyPaymentTheme(host: HTMLElement): void
{
    if(!host.hasAttribute('theme')) host.setAttribute('theme', 'dark');
    const light = host.getAttribute('theme') === 'light';
    const vars: Record<string, string> = light ? {
        '--arianna-bg':'#eef0f2','--arianna-bg-2':'#ffffff','--arianna-bg-3':'#e3e6e8',
        '--arianna-border':'#b9bec3','--arianna-text':'#25292d','--arianna-muted':'#687077',
        '--arianna-primary':'#e40c88','--arianna-primary-hover':'#bf0a72','--arianna-success':'#3b9d57',
        '--arianna-warning':'#d19a2c','--arianna-danger':'#c84545','--bg':'#eef0f2','--bg2':'#ffffff',
        '--bg3':'#e3e6e8','--border':'#b9bec3','--text':'#25292d','--muted':'#687077','--accent':'#e40c88'
    } : {
        '--arianna-bg':'#171a1d','--arianna-bg-2':'#202428','--arianna-bg-3':'#292e33',
        '--arianna-border':'#3a4046','--arianna-text':'#eef1f4','--arianna-muted':'#9aa2aa',
        '--arianna-primary':'#e40c88','--arianna-primary-hover':'#ff249e','--arianna-success':'#55bd6b',
        '--arianna-warning':'#e2aa2f','--arianna-danger':'#d9564d','--bg':'#171a1d','--bg2':'#202428',
        '--bg3':'#292e33','--border':'#3a4046','--text':'#eef1f4','--muted':'#9aa2aa','--accent':'#e40c88'
    };
    for(const [name,value] of Object.entries(vars)) host.style.setProperty(name,value);
}

function EnsurePaymentChromeStyles(): void
{
    if(typeof document === 'undefined' || document.getElementById('arianna-payment-chrome')) return;
    const style = document.createElement('style');
    style.id = 'arianna-payment-chrome';
    style.textContent = `
.ar-payment-provider{overflow:hidden;border:1px solid var(--arianna-border);border-radius:12px;background:var(--arianna-bg)}
.ar-payment-header{box-sizing:border-box;display:flex;align-items:center;gap:12px;min-height:58px;padding:10px 14px;background:var(--arianna-bg-2);border-bottom:1px solid var(--arianna-border);border-left:4px solid var(--ar-payment-provider,var(--arianna-primary))}
.ar-payment-logo{display:inline-flex;align-items:center;justify-content:flex-start;width:128px;height:36px;flex:0 0 128px;overflow:hidden}
.ar-payment-logo img,.ar-payment-logo svg{display:block;max-width:128px;max-height:36px;width:auto;height:auto;object-fit:contain}
.ar-payment-name{flex:1;min-width:0;font:700 14px/1.2 -apple-system,system-ui,sans-serif;color:var(--arianna-text)}
.ar-payment-body{padding:14px}
.ar-payment-primary,.ar-payment-secondary{appearance:none;min-height:34px;border-radius:8px;cursor:pointer;padding:8px 14px;font:700 12px/1 -apple-system,system-ui,sans-serif;transition:background .14s ease,border-color .14s ease,color .14s ease,box-shadow .14s ease,transform .14s ease}
.ar-payment-primary{border:1px solid var(--ar-payment-provider,var(--arianna-primary));background:var(--ar-payment-provider,var(--arianna-primary));color:var(--ar-payment-contrast,#fff)}
.ar-payment-secondary{border:1px solid var(--arianna-border);background:var(--arianna-bg-3);color:var(--arianna-text)}
.ar-payment-primary:hover,.ar-payment-secondary:hover{box-shadow:0 0 0 2px color-mix(in srgb,var(--ar-payment-provider,var(--arianna-primary)) 18%,transparent)}
.ar-payment-primary:focus-visible,.ar-payment-secondary:focus-visible{outline:2px solid var(--ar-payment-provider,var(--arianna-primary));outline-offset:2px}
.ar-payment-primary:active,.ar-payment-secondary:active{transform:translateY(1px)}
.ar-payment-primary:disabled{cursor:wait;opacity:.58}
`;
    document.head.appendChild(style);
}

export function MountPaymentTemplate(host: ThemedHost): void
{
    ApplyPaymentTheme(host);
    EnsurePaymentChromeStyles();
    if(!host.__ariannaPaymentThemeObserver && typeof MutationObserver !== 'undefined')
    {
        host.__ariannaPaymentThemeObserver = new MutationObserver(records => {
            if(records.some(record => record.attributeName === 'theme')) ApplyPaymentTheme(host);
        });
        host.__ariannaPaymentThemeObserver.observe(host,{attributes:true,attributeFilter:['theme']});
    }
    if(!host.__ariannaFolderTemplateMounted)
    {
        const template = host.template;
        if(!template || typeof template.Mount !== 'function') throw new Error(`[arianna-components] Template missing for <${host.localName}>.`);
        template.Mount(host,host as unknown as Record<string,unknown>,{Owner:host});
        host.__ariannaFolderTemplateMounted = true;
    }
    if(!host.__ariannaFolderOnMountCalled && typeof host.onMount === 'function')
    {
        host.onMount();
        host.__ariannaFolderOnMountCalled = true;
    }
}
