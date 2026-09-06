/**
 * @module components/inputs/Base
 * @description Internal Input light-DOM mount helper. Input components build their
 *              reactive Template during onConnected(); the current Component service
 *              performs its automatic Template pass before onConnected(), so Inputs
 *              explicitly mount once after their state/bindings exist.
 *
 * IMPORTANT: AriannA markup upgrade is prototype-based. Parser-created hosts do
 * not execute JavaScript class field initializers. Components that keep runtime
 * state in fields must therefore initialize that state lazily in onConnected().
 * ECMAScript #private fields/methods must not be used by upgradeable hosts because
 * such hosts never receive the class private brand.
 */

export interface MountableTemplate
{
    Mount?:
    (
        root    : Element,
        scope?  : Record<string, unknown>,
        options?: { Owner?: unknown }
    ) => unknown;
}

export function MountInputTemplate
(
    host: HTMLElement & { template?: unknown }
): void
{
    const state = host as HTMLElement &
    {
        template?: MountableTemplate;
        __ariannaInputTemplateMounted?: boolean;
    };

    if(state.__ariannaInputTemplateMounted) return;

    const template = state.template;
    if(!template || typeof template.Mount !== 'function')
    {
        throw new Error(`[arianna-inputs] Template missing for <${host.localName}>.`);
    }

    state.__ariannaInputTemplateMounted = true;
    template.Mount
    (
        host,
        host as unknown as Record<string, unknown>,
        { Owner: host }
    );
}
