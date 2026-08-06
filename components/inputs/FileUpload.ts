/**
 * @module    components/inputs/FileUpload
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA FileUpload component module.
 */

import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';

/** @namespace   FileUpload
 *  @public
 *  @description Namespace containing FileUpload contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace FileUpload
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   FileUploadOptions
         *  @public
         *  @description FileUploadOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FileUploadOptions
        {
            /** @name        accept
             *  @public
             *  @type        {string}
             *  @description Component member for accept.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            accept?: string;

            /** @name        multiple
             *  @public
             *  @type        {boolean}
             *  @description Component member for multiple.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            multiple?: boolean;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        hint
             *  @public
             *  @type        {string}
             *  @description Component member for hint.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            hint?: string;

            /** @name        disabled
             *  @public
             *  @type        {boolean}
             *  @description Component member for disabled.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            disabled?: boolean;
        }

        /** @interface   FileView
         *  @public
         *  @description FileView contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FileView
        {
            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        sizeKB
             *  @public
             *  @type        {string}
             *  @description Component member for size KB.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sizeKB: string;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       FileUpload
     *  @public
     *  @description AriannA FileUpload component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-file-upload', {}, {
        Attributes: ['accept', 'multiple', 'label', 'hint', 'disabled'],
    })
    export class FileUpload extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        files$
         *  @public
         *  @type        {FileUpload.Types.Signal<File[]>}
         *  @description Component member for files$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        files$: Types.Signal<File[]> = signal<File[]>([]);

        /** @name        dragging$
         *  @public
         *  @type        {FileUpload.Types.Signal<boolean>}
         *  @description Component member for dragging$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        dragging$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {FileUpload.Interfaces.FileUploadOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.FileUploadOptions = {})
        {
            /** @name        accept
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned accept value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const accept = this.signal().attribute('accept');

            /** @name        label
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned label value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const label = this.signal().attribute('label');

            /** @name        hint
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned hint value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const hint = this.signal().attribute('hint');
            this.acceptVal = () => accept.Get() ?? '';
            this.isMultiple = () => this.hasAttribute('multiple');
            this.isDisabled = () => this.hasAttribute('disabled');
            this.labelText = () => label.Get() ?? 'Drop files here or click to browse';
            this.hintText = () => hint.Get() ?? '';
            this.hasHint = () => !!hint.Get();
            this.zoneClass = () => 'ar-fileupload__zone'
                + (this.dragging$.Get() ? ' ar-fileupload__zone--over' : '');
            this.fileViews = (): Interfaces.FileView[] => this.files$.Get().map((f: any) => ({
                name: f.name,
                sizeKB: (f.size / 1024).toFixed(1),
            }));
            this.hasFiles = () => this.files$.Get().length > 0;
            this.onInputChange = (e: Event) => {
                /** @name        inp
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inp value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inp = e.target as HTMLInputElement;
                if (inp.files)
                    this.#setFiles(Array.from(inp.files));
            };
            this.onDragOver = (e: Event) => {
                e.preventDefault();
                this.dragging$.Set(true);
            };
            this.onDragLeave = () => this.dragging$.Set(false);
            this.onDrop = (e: Event) => {
                e.preventDefault();
                this.dragging$.Set(false);

                /** @name        de
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned de value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const de = e as DragEvent;
                if (de.dataTransfer?.files)
                    this.#setFiles(Array.from(de.dataTransfer.files));
            };
            this.template = html `
            <div :class="this.zoneClass()"
                 @dragover="this.onDragOver"
                 @dragleave="this.onDragLeave"
                 @drop="this.onDrop">
                <div class="ar-fileupload__icon">📁</div>
                <div class="ar-fileupload__label">{{ this.labelText() }}</div>
                <div class="ar-fileupload__hint" a-if="this.hasHint()">{{ this.hintText() }}</div>
                <input class="ar-fileupload__input"
                       type="file"
                       :accept="this.acceptVal()"
                       :multiple="this.isMultiple()"
                       :disabled="this.isDisabled()"
                       @change="this.onInputChange"/>
            </div>
            <ul class="ar-fileupload__list" a-if="this.hasFiles()">
                <li class="ar-fileupload__file" a-for="f in this.fileViews()">{{ f.name }} ({{ f.sizeKB }} KB)</li>
            </ul>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {FileUpload.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = FileUpload.DefaultSheet();
        }

        /** Programmatically clear the file selection. */
        clear(): this { this.files$.Set([]); return this; }

        /** Current files list (snapshot). */
        get files(): File[] { return this.files$.Get(); }

        /** @name        #setFiles
         *  @public
         *  @type        {void}
         *  @description Component member for set Files.
         *  @param       {File[]} files Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #setFiles(files: File[]): void
        {
            this.files$.Set(files);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { files },
            }));
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        acceptVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for accept Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private acceptVal: () => string = () => '';

        /** @name        isMultiple
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Multiple.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isMultiple: () => boolean = () => false;

        /** @name        isDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDisabled: () => boolean = () => false;

        /** @name        labelText
         *  @private
         *  @type        {() => string}
         *  @description Component member for label Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private labelText: () => string = () => '';

        /** @name        hintText
         *  @private
         *  @type        {() => string}
         *  @description Component member for hint Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hintText: () => string = () => '';

        /** @name        hasHint
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Hint.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasHint: () => boolean = () => false;

        /** @name        zoneClass
         *  @private
         *  @type        {() => string}
         *  @description Component member for zone Class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private zoneClass: () => string = () => '';

        /** @name        fileViews
         *  @private
         *  @type        {() => FileUpload.Interfaces.FileView[]}
         *  @description Component member for file Views.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private fileViews: () => Interfaces.FileView[] = () => [];

        /** @name        hasFiles
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Files.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasFiles: () => boolean = () => false;

        /** @name        onInputChange
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInputChange: (e: Event) => void = () => { };

        /** @name        onDragOver
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Drag Over.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDragOver: (e: Event) => void = () => { };

        /** @name        onDragLeave
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Drag Leave.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDragLeave: () => void = () => { };

        /** @name        onDrop
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Drop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDrop: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {FileUpload.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {FileUpload.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'flex', flexDirection: 'column', gap: '8px' }),
                new Rule('.ar-fileupload__zone', {
                    alignItems: 'center',
                    border: '2px dashed var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-lg, 8px)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '28px 16px',
                    position: 'relative',
                    textAlign: 'center',
                    transition: 'border-color 0.18s ease, background 0.18s ease',
                }),
                new Rule('.ar-fileupload__zone:hover, .ar-fileupload__zone--over', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    background: 'rgba(31,111,235,0.04)',
                }),
                new Rule('.ar-fileupload__icon', { fontSize: '2rem' }),
                new Rule('.ar-fileupload__label', { fontSize: '0.83rem' }),
                new Rule('.ar-fileupload__hint', { color: 'var(--arianna-muted, #6e6b62)', fontSize: '0.74rem' }),
                new Rule('.ar-fileupload__input', {
                    cursor: 'pointer',
                    height: '100%',
                    left: '0',
                    opacity: '0',
                    position: 'absolute',
                    top: '0',
                    width: '100%',
                }),
                new Rule('.ar-fileupload__list', {
                    listStyle: 'none',
                    margin: '0',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }),
                new Rule('.ar-fileupload__file', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                }),
            ]);
        }
    }
}
export default FileUpload;

export type FileUploadOptions = FileUpload.Interfaces.FileUploadOptions;
