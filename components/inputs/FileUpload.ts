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
 * Attrs:  accept, multiple, label, hint, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface FileUploadOptions {
    accept?   : string;
    multiple? : boolean;
    label?    : string;
    hint?     : string;
    disabled? : boolean;
}

interface FileView {
    name   : string;
    sizeKB : string;
}

export class FileUpload extends Component('arianna-file-upload', HTMLElement, {}, {
    attrs : ['accept', 'multiple', 'label', 'hint', 'disabled'],
    shadow: false,
})
{
    files$    : Signal<File[]>  = signal<File[]>([]);
    dragging$ : Signal<boolean> = signal<boolean>(false);

    build(_opts: FileUploadOptions = {})
    {
        const accept = this.attrSignal('accept');
        const label  = this.attrSignal('label');
        const hint   = this.attrSignal('hint');

        this.acceptVal  = () => accept.get() ?? '';
        this.isMultiple = () => this.hasAttribute('multiple');
        this.isDisabled = () => this.hasAttribute('disabled');
        this.labelText  = () => label.get() ?? 'Drop files here or click to browse';
        this.hintText   = () => hint.get() ?? '';
        this.hasHint    = () => !!hint.get();
        this.zoneClass  = () => 'ar-fileupload__zone'
            + (this.dragging$.get() ? ' ar-fileupload__zone--over' : '');

        this.fileViews = (): FileView[] => this.files$.get().map(f => ({
            name  : f.name,
            sizeKB: (f.size / 1024).toFixed(1),
        }));
        this.hasFiles = () => this.files$.get().length > 0;

        this.onInputChange = (e: Event) => {
            const inp = e.target as HTMLInputElement;
            if (inp.files) this.#setFiles(Array.from(inp.files));
        };
        this.onDragOver = (e: Event) => {
            e.preventDefault();
            this.dragging$.set(true);
        };
        this.onDragLeave = () => this.dragging$.set(false);
        this.onDrop = (e: Event) => {
            e.preventDefault();
            this.dragging$.set(false);
            const de = e as DragEvent;
            if (de.dataTransfer?.files) this.#setFiles(Array.from(de.dataTransfer.files));
        };

        this.template = html`
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

        this.Sheet = FileUpload.DefaultSheet();
    }

    /** Programmatically clear the file selection. */
    clear(): this { this.files$.set([]); return this; }

    /** Current files list (snapshot). */
    get files(): File[] { return this.files$.get(); }

    #setFiles(files: File[]): void
    {
        this.files$.set(files);
        this.dispatchEvent(new CustomEvent('arianna:change', {
            bubbles: true, detail: { files },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private acceptVal   : () => string = () => '';
    private isMultiple  : () => boolean = () => false;
    private isDisabled  : () => boolean = () => false;
    private labelText   : () => string = () => '';
    private hintText    : () => string = () => '';
    private hasHint     : () => boolean = () => false;
    private zoneClass   : () => string = () => '';
    private fileViews   : () => FileView[] = () => [];
    private hasFiles    : () => boolean = () => false;
    private onInputChange: (e: Event) => void = () => {};
    private onDragOver  : (e: Event) => void = () => {};
    private onDragLeave : () => void = () => {};
    private onDrop      : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'flex', flexDirection: 'column', gap: '8px' }),
                new Rule('.ar-fileupload__zone', {
                    alignItems  : 'center',
                    border      : '2px dashed var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-lg, 8px)',
                    cursor      : 'pointer',
                    display     : 'flex',
                    flexDirection: 'column',
                    gap         : '6px',
                    padding     : '28px 16px',
                    position    : 'relative',
                    textAlign   : 'center',
                    transition  : 'border-color 0.18s ease, background 0.18s ease',
                }),
                new Rule('.ar-fileupload__zone:hover, .ar-fileupload__zone--over', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    background : 'rgba(31,111,235,0.04)',
                }),
                new Rule('.ar-fileupload__icon',  { fontSize: '2rem' }),
                new Rule('.ar-fileupload__label', { fontSize: '0.83rem' }),
                new Rule('.ar-fileupload__hint',  { color: 'var(--arianna-muted, #6e6b62)', fontSize: '0.74rem' }),
                new Rule('.ar-fileupload__input', {
                    cursor  : 'pointer',
                    height  : '100%',
                    left    : '0',
                    opacity : '0',
                    position: 'absolute',
                    top     : '0',
                    width   : '100%',
                }),
                new Rule('.ar-fileupload__list', {
                    listStyle: 'none',
                    margin   : '0',
                    padding  : '0',
                    display  : 'flex',
                    flexDirection: 'column',
                    gap      : '4px',
                }),
                new Rule('.ar-fileupload__file', {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    fontSize    : '0.78rem',
                    padding     : '4px 10px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'FileUpload', { value: FileUpload, writable: false, enumerable: false, configurable: false });
}

export default FileUpload;
