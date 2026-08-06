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

import { Core }      from './Core.ts';
import { Templates } from './Template.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

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
    export type Mode             = SchemaTypes.Shadow.Mode;
    /** @name        Backend
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Backend.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Backend          = SchemaTypes.Shadow.Backend;
    /** @name        Projection
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Projection.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Projection       = SchemaTypes.Shadow.Projection;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options          = SchemaInterfaces.Shadow.Options;
    /** @name        RootContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RootContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RootContract     = SchemaInterfaces.Shadow.Root;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract  = SchemaInterfaces.Shadow.Service;
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

        constructor
        (
            host     : Element,
            options? : Options
        )
        {
            this.#host = host;

            this.#options =
            {
                Mode            : options?.Mode ?? 'closed',
                Backend         : options?.Backend ?? 'native',
                DelegatesFocus  : options?.DelegatesFocus ?? false,
                Projection      : options?.Projection ?? 'adopt',
                Sandbox         : options?.Sandbox ?? 'allow-same-origin allow-scripts'
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
            mode     : ShadowMode = 'closed',
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
                document.createElement('style');

            style.textContent =
                typeof css === 'string'
                    ? css
                    : Array.from(css.cssRules).map(rule => rule.cssText).join('\n');

            if(this.#root instanceof Document)
            {
                this.#root.head.appendChild(style);
            }
            else
            {
                this.#root.prepend(style);
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
                                event.data?.Id !== id
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
                            Payload : message
                        },
                        '*'
                    );
                }
            );
        }


        Dispose(): void
        {
            this.#mount?.Dispose();
            this.#mount = null;
            this.#iframe?.remove();
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
                        document.createElement('iframe');

                    iframe.sandbox.value = this.#options.Sandbox ?? '';
                    this.#host.appendChild(iframe);

                    const documentRoot =
                        iframe.contentDocument;

                    if(!documentRoot)
                    {
                        throw new Error
                        (
                            '[arianna] Unable to create iframe Shadow document.'
                        );
                    }

                    return {
                        Root   : documentRoot,
                        Iframe : iframe
                    };
                }

                default:
                {
                    const existing =
                        this.#host.shadowRoot;

                    const root =
                        existing ??
                        this.#host.attachShadow
                        (
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

    const Service = new Core.Services.Service<ServiceContract>
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
