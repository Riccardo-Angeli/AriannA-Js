/**
 * @module components/shipments/Base
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
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
    __ariannaShipmentThemeObserver?: MutationObserver;
    onMount?: () => void;
};

function ApplyShipmentTheme(host: HTMLElement): void
{
    if(!host.hasAttribute('theme')) host.setAttribute('theme', 'dark');
    const light = host.getAttribute('theme') === 'light';
    const vars: Record<string, string> = light ? {
        '--arianna-bg': '#eef0f2', '--arianna-bg-2': '#ffffff', '--arianna-bg-3': '#e3e6e8',
        '--arianna-border': '#b9bec3', '--arianna-text': '#25292d', '--arianna-muted': '#687077',
        '--arianna-primary': '#e40c88', '--arianna-primary-hover': '#bf0a72',
        '--arianna-bull': '#3b9d57', '--arianna-danger': '#c84545', '--arianna-warning': '#d19a2c',
        '--bg': '#eef0f2', '--bg3': '#e3e6e8', '--border': '#b9bec3', '--text': '#25292d', '--muted': '#687077', '--accent': '#e40c88'
    } : {
        '--arianna-bg': '#171a1d', '--arianna-bg-2': '#202428', '--arianna-bg-3': '#292e33',
        '--arianna-border': '#3a4046', '--arianna-text': '#eef1f4', '--arianna-muted': '#9aa2aa',
        '--arianna-primary': '#e40c88', '--arianna-primary-hover': '#ff249e',
        '--arianna-bull': '#55bd6b', '--arianna-danger': '#d9564d', '--arianna-warning': '#e2aa2f',
        '--bg': '#171a1d', '--bg3': '#292e33', '--border': '#3a4046', '--text': '#eef1f4', '--muted': '#9aa2aa', '--accent': '#e40c88'
    };
    for(const [name, value] of Object.entries(vars)) host.style.setProperty(name, value);
}

export function MountShipmentTemplate(host: ThemedHost): void
{
    ApplyShipmentTheme(host);
    if(!host.__ariannaShipmentThemeObserver && typeof MutationObserver !== 'undefined')
    {
        host.__ariannaShipmentThemeObserver = new MutationObserver(records =>
        {
            if(records.some(record => record.attributeName === 'theme')) ApplyShipmentTheme(host);
        });
        host.__ariannaShipmentThemeObserver.observe(host, { attributes: true, attributeFilter: ['theme'] });
    }

    if(!host.__ariannaFolderTemplateMounted)
    {
        const template = host.template;
        if(!template || typeof template.Mount !== 'function')
            throw new Error(`[arianna-components] Template missing for <${host.localName}>.`);
        template.Mount(host, host as unknown as Record<string, unknown>, { Owner: host });
        host.__ariannaFolderTemplateMounted = true;
    }

    if(!host.__ariannaFolderOnMountCalled && typeof host.onMount === 'function')
    {
        host.onMount();
        host.__ariannaFolderOnMountCalled = true;
    }
}
