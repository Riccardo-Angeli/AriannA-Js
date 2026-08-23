/**
 * @module    core/Shadow
 * @author    Riccardo Angeli
 * @version   4.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Unified native/light/iframe shadow runtime with Template mounting, stylesheet adoption, slot
 *              projection, lifecycle disposal.
 */
import { Services }  from '../kernel/Services.ts';
import { Templates } from './Template.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';
import { Reals } from './Real.ts';

/** @name        Shadows
 *  @public
 *  @type        {namespace}
 *  @description Groups the Shadows contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Shadows
{
    /** @name        Mode
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Mode.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Mode             = Types.Shadow.Mode;
    /** @name        Backend
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Backend.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Backend          = Types.Shadow.Backend;
    /** @name        Projection
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Projection.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Projection       = Types.Shadow.Projection;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options          = Interfaces.Shadow.Options;
    /** @name        RootContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RootContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RootContract     = Interfaces.Shadow.Root;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract  = Interfaces.Shadow.Service;
    /** @name        ShadowMode
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ShadowMode.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ShadowMode = Mode;
    /** @name        AriannaShadowOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for AriannaShadowOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type AriannaShadowOptions = Options;
    /** @name        AriannaShadow
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for AriannaShadow.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type AriannaShadow = Shadow;

    /** @name        Shadow
     *  @public
     *  @type        {typeof Shadow}
     *  @description Runtime class responsible for the Shadow capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Shadow
    {
        readonly #host: Element;
        readonly #options: Options;
        readonly #root: ShadowRoot | Element | Document;
        readonly #iframe: HTMLIFrameElement | null;
        #mount: Templates.Mount | null = null;
        readonly #channel = crypto.randomUUID?.() ?? `arianna-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        constructor
        (
            host     : Element,
            options? : Options
        )
        {
            this.#host = host;

            this.#options =
            {
                Mode            : options?.Mode ?? 'open',
                Backend         : options?.Backend ?? 'native',
                DelegatesFocus  : options?.DelegatesFocus ?? false,
                Projection      : options?.Projection ?? 'adopt',
                Sandbox         : options?.Sandbox ?? '',
                Src             : options?.Src,
                CSP             : options?.CSP,
                TargetOrigin    : options?.TargetOrigin
            };

            const created =
                this.#Create();

            this.#root   = created.Root;
            this.#iframe = created.Iframe;
        }

        get Host(): Element
        {
            return this.#host;
        }

        get Root(): ShadowRoot | Element | Document
        {
            return this.#root;
        }

        get Backend(): Backend
        {
            return this.#options.Backend ?? 'native';
        }

        static Create
        (
            host     : Element,
            options? : Options
        ): Shadow
        {
            return new Shadow(host, options);
        }

        static Attach
        (
            host     : Element,
            mode     : ShadowMode = 'open',
            options? : AriannaShadowOptions
        ): AriannaShadow
        {
            return Shadow.Create
            (
                host,
                {
                    ...options,
                    Mode: mode
                }
            );
        }

        Template
        (
            template : Templates.Template,
            scope    : Templates.Scope = {}
        ): this
        {
            this.#mount?.Dispose();
            this.#mount = template.Mount(this.#root, scope, { Owner: this.#host });

            return this;
        }

        Css(css: string | CSSStyleSheet): this
        {
            if(css instanceof CSSStyleSheet && 'adoptedStyleSheets' in this.#root)
            {
                const root =
                    this.#root as ShadowRoot;

                root.adoptedStyleSheets =
                    [...root.adoptedStyleSheets, css];

                return this;
            }

            const style =
                Reals.Real.Create('style') as HTMLStyleElement;

            Reals.Real.Content
            (
                style,
                typeof css === 'string'
                    ? css
                    : Array.from(css.cssRules).map(rule => rule.cssText).join('\n')
            );

            if(this.#root instanceof Document)
            {
                Reals.Real.Append(this.#root.head, style);
            }
            else
            {
                Reals.Real.Before(this.#root, style, this.#root.firstChild);
            }

            return this;
        }

        Slot(name: string = ''): readonly Node[]
        {
            if(this.#root instanceof Document)
            {
                return [];
            }

            const selector =
                name
                    ? `slot[name="${CSS.escape(name)}"]`
                    : 'slot:not([name])';

            const slot =
                this.#root.querySelector<HTMLSlotElement>(selector);

            return slot?.assignedNodes({ flatten: true }) ?? [];
        }

        Send
        (
            message   : unknown,
            timeoutMs : number = 5_000
        ): Promise<unknown>
        {
            if(!this.#iframe?.contentWindow)
            {
                throw new Error
                (
                    '[arianna] Shadow.Send() requires the iframe backend.'
                );
            }

            return new Promise
            (
                (resolve, reject) =>
                {
                    const id =
                        `shadow-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                    const timer =
                        setTimeout
                        (
                            () =>
                            {
                                window.removeEventListener('message', receive);
                                reject(new Error('[arianna] Shadow message timed out.'));
                            },
                            timeoutMs
                        );

                    const receive =
                        (event: MessageEvent) =>
                        {
                            if
                            (
                                event.source !== this.#iframe?.contentWindow ||
                                event.data?.Id !== id ||
                                event.data?.Channel !== this.#channel
                            )
                            {
                                return;
                            }

                            clearTimeout(timer);
                            window.removeEventListener('message', receive);
                            resolve(event.data.Value);
                        };

                    window.addEventListener('message', receive);

                    this.#iframe?.contentWindow?.postMessage
                    (
                        {
                            Id      : id,
                            Channel : this.#channel,
                            Payload : message
                        },
                        this.#TargetOrigin()
                    );
                }
            );
        }


        Dispose(): void
        {
            this.#mount?.Dispose();
            this.#mount = null;
            if(this.#iframe) Reals.Real.Remove(this.#iframe);
        }

        #TargetOrigin(): string
        {
            if(this.#options.TargetOrigin) return this.#options.TargetOrigin;
            // A sandbox without allow-same-origin has an opaque origin and cannot be named as postMessage target.
            if(!(this.#options.Sandbox ?? '').split(/\s+/).includes('allow-same-origin')) return '*';
            if(this.#options.Src)
            {
                try { return new URL(String(this.#options.Src), document.baseURI).origin; }
                catch { /* fall through */ }
            }
            return location.origin;
        }

        #Create(): RootContract
        {
            switch(this.#options.Backend)
            {
                case 'light':
                    return {
                        Root   : this.#host,
                        Iframe : null
                    };

                case 'iframe':
                {
                    const iframe =
                        Reals.Real.Create('iframe') as HTMLIFrameElement;

                    Reals.Real.Attribute(iframe, 'sandbox', this.#options.Sandbox ?? '');
                    if(this.#options.CSP) Reals.Real.Attribute(iframe, 'csp', this.#options.CSP);
                    if(this.#options.Src) iframe.src = String(this.#options.Src);
                    Reals.Real.Append(this.#host, iframe);

                    // A cross-origin or opaque-origin frame intentionally exposes no DOM root.
                    // In that case the local host remains the mount surface and Send() is the bridge.
                    const documentRoot = iframe.contentDocument;
                    return { Root: documentRoot ?? this.#host, Iframe: iframe };
                }

                default:
                {
                    const existing =
                        this.#host.shadowRoot;

                    const root =
                        existing ??
                        Reals.Real.AttachShadow
                        (
                            this.#host,
                            {
                                mode           : this.#options.Mode ?? 'closed',
                                delegatesFocus : this.#options.DelegatesFocus ?? false
                            }
                        );

                    return {
                        Root   : root,
                        Iframe : null
                    };
                }
            }
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'shadow',
        {
            Create
            (
                host     : Element,
                options? : Options
            ): Shadow
            {
                return Shadow.Create(host, options);
            }
        }
    );
}

export default Shadows.Shadow;
