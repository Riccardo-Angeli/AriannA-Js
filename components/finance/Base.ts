/**
 * Internal light-DOM template mount helper.
 * AriannA's current Component service resolves the descriptor before onConnected();
 * components in this folder construct their reactive template in onConnected(), so
 * the folder owns the one deterministic mount after state/bindings have been installed.
 */
export interface MountableTemplate
{
    Mount?: (root: Element, scope?: Record<string, unknown>, options?: { Owner?: unknown }) => unknown;
}

export function MountFinanceTemplate(host: HTMLElement & { template?: unknown }): void
{
    const state = host as HTMLElement &
    {
        template?: MountableTemplate;
        __ariannaFolderTemplateMounted?: boolean;
        __ariannaFolderOnMountCalled?: boolean;
        onMount?: () => void;
    };

    if(!state.__ariannaFolderTemplateMounted)
    {
        const template = state.template;
        if(!template || typeof template.Mount !== 'function')
            throw new Error(`[arianna-components] Template missing for <${host.localName}>.`);

        state.__ariannaFolderTemplateMounted = true;
        template.Mount(host, host as unknown as Record<string, unknown>, { Owner: host });
    }

    if(!state.__ariannaFolderOnMountCalled && typeof state.onMount === 'function')
    {
        state.__ariannaFolderOnMountCalled = true;
        state.onMount();
    }
}
