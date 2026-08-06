import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/inputs/FileUpload
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * FileUpload — drag-and-drop file upload area with native file input fallback
 * and a small list of selected files.
 *
 * @example HTML
 *   <arianna-file-upload accept="image/*" multiple
 *                        label="Drop images or click"
 *                        hint="PNG, JPG up to 10MB"></arianna-file-upload>
 *
 * Events: arianna:change  detail: { files }
 * Attributes:  accept, multiple, label, hint, disabled
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface FileUploadOptions {
    accept?: string;
    multiple?: boolean;
    label?: string;
    hint?: string;
    disabled?: boolean;
}
interface FileView {
    name: string;
    sizeKB: string;
}
@Component('arianna-file-upload', {}, {
    Attributes: ['accept', 'multiple', 'label', 'hint', 'disabled'],
})
export class FileUpload extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    files$: Signal<File[]> = signal<File[]>([]);
    dragging$: Signal<boolean> = signal<boolean>(false);
    onConnected(_opts: FileUploadOptions = {}) {
        const accept = this.signal().attribute('accept');
        const label = this.signal().attribute('label');
        const hint = this.signal().attribute('hint');
        this.acceptVal = () => accept.Get() ?? '';
        this.isMultiple = () => this.hasAttribute('multiple');
        this.isDisabled = () => this.hasAttribute('disabled');
        this.labelText = () => label.Get() ?? 'Drop files here or click to browse';
        this.hintText = () => hint.Get() ?? '';
        this.hasHint = () => !!hint.Get();
        this.zoneClass = () => 'ar-fileupload__zone'
            + (this.dragging$.Get() ? ' ar-fileupload__zone--over' : '');
        this.fileViews = (): FileView[] => this.files$.Get().map(f => ({
            name: f.name,
            sizeKB: (f.size / 1024).toFixed(1),
        }));
        this.hasFiles = () => this.files$.Get().length > 0;
        this.onInputChange = (e: Event) => {
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
            Sheet: Stylesheet | null;
        }).Sheet = FileUpload.DefaultSheet();
    }
    /** Programmatically clear the file selection. */
    clear(): this { this.files$.Set([]); return this; }
    /** Current files list (snapshot). */
    get files(): File[] { return this.files$.Get(); }
    #setFiles(files: File[]): void {
        this.files$.Set(files);
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true, detail: { files },
        }));
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private acceptVal: () => string = () => '';
    private isMultiple: () => boolean = () => false;
    private isDisabled: () => boolean = () => false;
    private labelText: () => string = () => '';
    private hintText: () => string = () => '';
    private hasHint: () => boolean = () => false;
    private zoneClass: () => string = () => '';
    private fileViews: () => FileView[] = () => [];
    private hasFiles: () => boolean = () => false;
    private onInputChange: (e: Event) => void = () => { };
    private onDragOver: (e: Event) => void = () => { };
    private onDragLeave: () => void = () => { };
    private onDrop: (e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
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
/* ──────────────────────────────────────────────────────────────────────────
 * FileUpload namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace FileUpload {
    export namespace Interfaces {
        export interface Options extends FileUploadOptions {
        }
        export interface FileViewContract extends FileView {
        }
    }
}
export default FileUpload;
