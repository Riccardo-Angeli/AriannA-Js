/**
 * @module    components/audio/PianoRoll
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Reference-quality piano-roll editor. The visual language and
 * interaction model intentionally mirror the AriannA reference style: dark
 * transport/tool bar, DAW-style ruler, piano keyboard, editable MIDI notes,
 * velocity lane, playhead and MIDI event monitor.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;
const { Rule, Stylesheet } = Css;

export namespace PianoRoll
{
    export namespace Interfaces
    {
        export interface PianoNote
        {
            pitch    : number;
            start    : number;
            length   : number;
            velocity : number; // 0..1
            channel? : number;
            id?      : string;
        }

        export interface PianoRollOptions
        {
            beats?      : number;
            pitchMin?   : number;
            pitchMax?   : number;
            cellWidth?  : number;
            cellHeight? : number;
            snap?       : number;
            bpm?        : number;
            bars?       : number;
            theme?      : 'dark' | 'light';
            src?        : string;
        }

        export interface MidiImportOptions
        {
            /** Keep a single melodic note at every onset. Defaults to true. */
            monophonic?    : boolean;
            /** Zero-based MIDI track index. By default the most likely melodic track is selected. */
            track?         : number;
            /** Move the first imported note to beat zero. Defaults to true. */
            normalizeStart?: boolean;
        }

        export interface MidiImportResult
        {
            notes     : PianoNote[];
            bpm       : number;
            bars      : number;
            track     : number;
            trackName?: string;
        }
    }

    export namespace Types
    {
        export type Signal<T> = Reactivity.SignalContract<T>;
        export type Stylesheet = Css.Stylesheet;
    }

    type Tool = 'draw' | 'select' | 'erase';

    const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const BLACK = new Set([1, 3, 6, 8, 10]);
    const BPB = 4;

    const pitchLabel = (pitch: number): string =>
        NOTE_NAMES[((pitch % 12) + 12) % 12] + (Math.floor(pitch / 12) - 1);

    type ParsedMidiNote = Interfaces.PianoNote & { startTick:number; endTick:number; track:number };
    type ParsedMidiTrack = { index:number; name?:string; notes:ParsedMidiNote[] };

    const ParseMidi = (source:ArrayBuffer|Uint8Array,options:Interfaces.MidiImportOptions={}):Interfaces.MidiImportResult =>
    {
        const bytes=source instanceof Uint8Array?source:new Uint8Array(source);
        const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
        let offset=0;
        const ascii=(length:number):string=>{let value='';for(let i=0;i<length;i++)value+=String.fromCharCode(bytes[offset++]);return value;};
        const u16=():number=>{const value=view.getUint16(offset);offset+=2;return value;};
        const u32=():number=>{const value=view.getUint32(offset);offset+=4;return value;};
        const vlq=(end:number):number=>
        {
            let value=0,byte=0,count=0;
            do
            {
                if(offset>=end||count++>4)throw new Error('Invalid MIDI variable-length quantity');
                byte=bytes[offset++];value=(value<<7)|(byte&0x7f);
            }
            while(byte&0x80);
            return value;
        };
        if(ascii(4)!=='MThd')throw new Error('Invalid MIDI header');
        const headerLength=u32();
        if(headerLength<6||offset+headerLength>bytes.length)throw new Error('Invalid MIDI header length');
        const format=u16(),trackCount=u16(),division=u16();
        if(format>2)throw new Error('Unsupported MIDI format');
        if(division&0x8000)throw new Error('SMPTE MIDI timing is not supported');
        const ticksPerBeat=Math.max(1,division);
        offset=8+headerLength;
        const tracks:ParsedMidiTrack[]=[];
        const tempos:{tick:number;microseconds:number}[]=[];

        for(let trackIndex=0;trackIndex<trackCount&&offset+8<=bytes.length;trackIndex++)
        {
            if(ascii(4)!=='MTrk')throw new Error(`Invalid MIDI track ${trackIndex}`);
            const length=u32(),end=Math.min(bytes.length,offset+length);
            let tick=0,runningStatus=0,name='';
            const notes:ParsedMidiNote[]=[];
            const active=new Map<string,ParsedMidiNote[]>();
            while(offset<end)
            {
                tick+=vlq(end);
                let status=bytes[offset++];
                if(status<0x80)
                {
                    if(!runningStatus)throw new Error('Invalid MIDI running status');
                    offset--;status=runningStatus;
                }
                else if(status<0xf0)runningStatus=status;

                if(status===0xff)
                {
                    const type=bytes[offset++],size=vlq(end),dataStart=offset;
                    if(type===0x03)name=new TextDecoder().decode(bytes.subarray(dataStart,dataStart+size));
                    else if(type===0x51&&size===3)
                        tempos.push({tick,microseconds:(bytes[dataStart]<<16)|(bytes[dataStart+1]<<8)|bytes[dataStart+2]});
                    offset=Math.min(end,dataStart+size);continue;
                }
                if(status===0xf0||status===0xf7){const size=vlq(end);offset=Math.min(end,offset+size);continue;}
                const operation=status&0xf0,channel=status&0x0f;
                const pitch=bytes[offset++];
                const value=operation===0xc0||operation===0xd0?0:bytes[offset++];
                const key=`${channel}:${pitch}`;
                if(operation===0x90&&value>0)
                {
                    const note:ParsedMidiNote={pitch,start:0,length:0,velocity:value/127,channel,id:undefined,startTick:tick,endTick:tick,track:trackIndex};
                    const queue=active.get(key)??[];queue.push(note);active.set(key,queue);
                }
                else if(operation===0x80||(operation===0x90&&value===0))
                {
                    const queue=active.get(key),note=queue?.shift();
                    if(note){note.endTick=Math.max(note.startTick+1,tick);notes.push(note);}
                    if(queue&&!queue.length)active.delete(key);
                }
            }
            offset=end;tracks.push({index:trackIndex,name:name||undefined,notes});
        }

        const candidates=tracks.filter(track=>track.notes.some(note=>note.channel!==9));
        if(!candidates.length)throw new Error('The MIDI file contains no melodic notes');
        let selected=Number.isInteger(options.track)?candidates.find(track=>track.index===options.track):undefined;
        selected??=candidates.sort((a,b)=>
        {
            const score=(track:ParsedMidiTrack):number=>
            {
                const melodic=track.notes.filter(note=>note.channel!==9);
                const onsets=new Set(melodic.map(note=>note.startTick)).size;
                const first=Math.min(...melodic.map(note=>note.startTick));
                const mean=melodic.reduce((sum,note)=>sum+note.pitch,0)/Math.max(1,melodic.length);
                return onsets*4+melodic.length+mean-first/ticksPerBeat;
            };
            return score(b)-score(a);
        })[0];
        const selectedTrack=selected??candidates[0];
        let chosen=selectedTrack.notes.filter(note=>note.channel!==9).sort((a,b)=>a.startTick-b.startTick||b.pitch-a.pitch);
        if(options.monophonic!==false)
        {
            const byOnset=new Map<number,ParsedMidiNote[]>();
            for(const note of chosen){const group=byOnset.get(note.startTick)??[];group.push(note);byOnset.set(note.startTick,group);}
            chosen=[...byOnset.values()].map(group=>group.sort((a,b)=>b.pitch-a.pitch||b.endTick-a.endTick)[0]).sort((a,b)=>a.startTick-b.startTick);
            chosen=chosen.map((note,index)=>({...note,endTick:Math.min(note.endTick,chosen[index+1]?.startTick??note.endTick)})).filter(note=>note.endTick>note.startTick);
        }
        const origin=options.normalizeStart===false?0:(chosen[0]?.startTick??0);
        const round=(value:number):number=>Math.round(value*1e6)/1e6;
        const notes=chosen.map(note=>({
            pitch:note.pitch,start:round((note.startTick-origin)/ticksPerBeat),
            length:round(Math.max(1,note.endTick-note.startTick)/ticksPerBeat),velocity:round(note.velocity),channel:note.channel
        }));
        const tempo=tempos.sort((a,b)=>a.tick-b.tick)[0]?.microseconds??500000;
        const bpm=Math.max(20,Math.min(300,Math.round(60000000/tempo*1000)/1000));
        const endBeat=notes.reduce((maximum,note)=>Math.max(maximum,note.start+note.length),0);
        return{notes,bpm,bars:Math.max(1,Math.ceil(endBeat/BPB)),track:selectedTrack.index,trackName:selectedTrack.name};
    };


    const Styles = new Stylesheet([
                new Rule('.PianoRoll', {
                    Background: '#fff', Border: '1px solid #333', BorderRadius: '6px', Color: '#222',
                    Display: 'block', MinHeight: '520px', Overflow: 'hidden', Position: 'relative', Width: '100%'
                }),
                new Rule('.PianoRoll', {
                    Background: '#fff', Color: '#222', Display: 'flex', FlexDirection: 'column',
                    Font: '13px -apple-system, system-ui, sans-serif', Height: '100%', MinHeight: '520px', Position: 'relative'
                }),
                new Rule('.PianoRoll-Toolbar', {
                    AlignItems: 'center', Background: '#1e1e1e', borderBottom: '1px solid #333', Color: '#d4d4d4',
                    Display: 'flex', flexShrink: '0', flexWrap: 'wrap', Gap: '10px', MinHeight: '44px', Padding: '6px 16px'
                }),
                new Rule('.PianoRoll-Title', { Color: '#e40c88', FontSize: '13px', FontWeight: '500', margin: '0' }),
                new Rule('.PianoRoll-Status', { Color: '#888', Font: '11px ui-monospace, monospace' }),
                new Rule('.PianoRoll-Label', { Color: '#888', Font: '11px sans-serif' }),
                new Rule('.PianoRoll-Fill', { Flex: '1 1 20px' }),
                new Rule('.PianoRoll-Spacer', { Width: '8px' }),
                new Rule('.PianoRoll-Button, .PianoRoll-ToolButton', {
                    Background: 'transparent', Border: '1px solid #444', BorderRadius: '3px', Color: '#d4d4d4', Cursor: 'pointer',
                    Font: '12px sans-serif', Padding: '4px 12px'
                }),
                new Rule('.PianoRoll-ToolButton', { MinWidth: '32px', Padding: '4px 8px' }),
                new Rule('.PianoRoll-Button:hover, .PianoRoll-ToolButton:hover', { Background: '#2a2a2a' }),
                new Rule('.PianoRoll-ToolButton.active', { Background: '#e40c88', borderColor: '#e40c88', Color: '#fff' }),
                new Rule('.PianoRoll-Button.play', { Background: '#16a34a', borderColor: '#16a34a', Color: '#fff' }),
                new Rule('.PianoRoll-Button.pause', { Background: '#eab308', borderColor: '#eab308', Color: '#1f1f1f' }),
                new Rule('.PianoRoll-Button.stop', { Background: '#dc2626', borderColor: '#dc2626', Color: '#fff' }),
                new Rule('.PianoRoll-MidiInput', { Display: 'none' }),
                new Rule('.PianoRoll-Input', {
                    Background: 'transparent', Border: '1px solid #444', BorderRadius: '3px', Color: '#d4d4d4',
                    Font: '12px ui-monospace, monospace', Padding: '3px 8px', Width: '60px'
                }),
                new Rule('.PianoRoll-Snap', { Width: 'auto' }),
                new Rule('.PianoRoll-Grid', {
                    Background: '#fff', Display: 'grid', Flex: '1', GridTemplateColumns: '64px minmax(0,1fr)',
                    GridTemplateRows: '22px minmax(0,1fr)', MinHeight: '0'
                }),
                new Rule('.PianoRoll-Corner', { Background: '#f0f0f0', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }),
                new Rule('.PianoRoll-Ruler', {
                    Background: '#f0f0f0', borderBottom: '1px solid #ddd', Color: '#666', Font: '10px ui-monospace, monospace',
                    Overflow: 'hidden', Position: 'relative'
                }),
                new Rule('.PianoRoll-Tick', { Background: '#ccc', Bottom: '0', Position: 'absolute', Top: '0', Width: '1px' }),
                new Rule('.PianoRoll-Tick.bar', { Background: '#888' }),
                new Rule('.PianoRoll-TickLabel', { Color: '#555', FontSize: '10px', paddingLeft: '3px', Position: 'absolute', Top: '4px', UserSelect: 'none' }),
                new Rule('.PianoRoll-Keys', { Background: '#fff', borderRight: '1px solid #ddd', Overflow: 'hidden', Position: 'relative', UserSelect: 'none' }),
                new Rule('.PianoRoll-Key', {
                    AlignItems: 'center', borderBottom: '1px solid #eee', Color: '#888', Cursor: 'pointer', Display: 'flex',
                    Font: '9px ui-monospace, monospace', Left: '0', LineHeight: '1', paddingLeft: '4px', Position: 'absolute', Right: '0'
                }),
                new Rule('.PianoRoll-Key.white', { Background: '#fff' }),
                new Rule('.PianoRoll-Key.black', { Background: '#2a2a2a', Color: '#ccc', Right: '28%', ZIndex: '2' }),
                new Rule('.PianoRoll-Key.white:hover', { Background: '#fde7f3' }),
                new Rule('.PianoRoll-Key.black:hover', { Background: '#4a3040' }),
                new Rule('.PianoRoll-Canvas', { Background: '#fff', Cursor: 'crosshair', Overflow: 'auto', Position: 'relative' }),
                new Rule('.PianoRoll-Grid-bg', {
                    backgroundImage: 'linear-gradient(to right,#e8e8e8 1px,transparent 1px),linear-gradient(to bottom,#eee 1px,transparent 1px)',
                    backgroundSize: 'var(--pr-beat-w) 100%,100% var(--pr-row-h)', pointerEvents: 'none', Position: 'absolute'
                }),
                new Rule('.PianoRoll__row-tint', { Background: '#f6f6f6', Left: '0', pointerEvents: 'none', Position: 'absolute' }),
                new Rule('.PianoRoll-Note', {
                    Background: '#e40c88', Border: '1px solid #b80b6f', BorderRadius: '2px', BoxShadow: '0 1px 2px rgba(0,0,0,.15)',
                    Color: '#fff', Cursor: 'move', Font: '9px ui-monospace, monospace', LineHeight: '1.2', Overflow: 'hidden',
                    Padding: '1px 4px', Position: 'absolute', UserSelect: 'none', WhiteSpace: 'nowrap', ZIndex: '3'
                }),
                new Rule('.PianoRoll-Note.selected', { Background: '#f06ab1', borderColor: '#fff', BoxShadow: '0 0 0 2px #e40c88,0 1px 4px rgba(0,0,0,.25)' }),
                new Rule('.PianoRoll-NoteResize', { Background: 'rgba(255,255,255,.2)', Bottom: '0', Cursor: 'ew-resize', Position: 'absolute', Right: '0', Top: '0', Width: '6px' }),
                new Rule('.PianoRoll-Playhead', { Background: '#16a34a', Bottom: '0', BoxShadow: '0 0 4px rgba(22,163,74,.5)', pointerEvents: 'none', Position: 'absolute', Top: '0', Width: '2px', ZIndex: '6' }),
                new Rule('.PianoRoll-Playhead[hidden]', { Display: 'none' }),
                new Rule('.PianoRoll__vel', { Background: 'rgba(245,245,245,.95)', borderTop: '1px solid #ddd', Bottom: '0', Cursor: 'ns-resize', Height: '60px', Left: '0', PointerEvents: 'auto', Position: 'absolute', Right: '0', ZIndex: '4' }),
                new Rule('.PianoRoll__vel[hidden]', { Display: 'none' }),
                new Rule('.PianoRoll-VelocityBar', { Background: '#e40c88', BorderRadius: '2px 2px 0 0', Bottom: '0', Cursor: 'ns-resize', Opacity: '.82', PointerEvents: 'auto', Position: 'absolute', Width: '6px' }),
                new Rule('.PianoRoll-VelocityToggle', { Background: '#1e1e1e', Border: '0', BorderRadius: '3px 3px 0 0', Bottom: '60px', Color: '#d4d4d4', Cursor: 'pointer', Font: '10px sans-serif', Padding: '2px 8px', Position: 'absolute', Right: '6px', ZIndex: '7' }),
                new Rule('.PianoRoll-Events', { Background: '#1e1e1e', BorderRadius: '6px', BoxShadow: '0 4px 12px rgba(0,0,0,.15)', Color: '#d4d4d4', MaxHeight: '200px', overflowY: 'auto', Padding: '8px 10px', Position: 'absolute', Right: '12px', Top: '80px', Width: '240px', ZIndex: '10' }),
                new Rule('.PianoRoll-Events-ttl', { Color: '#c3e88d', FontSize: '9px', FontWeight: '600', LetterSpacing: '.5px', marginBottom: '4px', textTransform: 'uppercase' }),
                new Rule('.PianoRoll-Events-list', { Color: '#888', Font: '10px ui-monospace, monospace' }),
                new Rule('.PianoRoll-EventsRow', { borderBottom: '1px solid #333', Display: 'flex', JustifyContent: 'space-between', Padding: '1px 0' }),
                new Rule('.PianoRoll-EventsRow .t', { Color: '#6cb6ff' }),
                new Rule('.PianoRoll-EventsRow .ev', { Color: '#ffab40' }),
                new Rule('.PianoRoll[theme="dark"]', { Background: '#171a1d', BorderColor: '#0d0f11', Color: '#eef1f4' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Grid', { Background: '#202428' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Corner, .PianoRoll[theme="dark"] .PianoRoll-Ruler', { Background: '#292e33', borderBottomColor: '#15181a', borderRightColor: '#15181a', Color: '#9aa2aa' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Keys', { Background: '#202428', borderRightColor: '#15181a' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Key.white', { Background: '#d8dde1', borderBottomColor: '#b7bec4', Color: '#42484d' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Key.black', { Background: '#24282c', borderBottomColor: '#15181a', Color: '#c8cdd2' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Canvas', { Background: '#202428' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll-Grid-bg', { backgroundImage: 'linear-gradient(to right,rgba(151,160,169,.16) 1px,transparent 1px),linear-gradient(to bottom,rgba(151,160,169,.12) 1px,transparent 1px)' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll__row-tint', { Background: 'rgba(255,255,255,.025)' }),
                new Rule('.PianoRoll[theme="dark"] .PianoRoll__vel', { Background: 'rgba(23,26,29,.94)', borderTopColor: '#3a4046' }),
                new Rule('.PianoRoll[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
            ]);
    @Component('arianna-piano-roll', Styles, { Shadow: false,
        Attributes: ['beats', 'bars', 'bpm', 'pitch-min', 'pitch-max', 'cell-width', 'cell-height', 'snap', 'theme'],
    })
    export class PianoRoll extends HTMLElement
    {
        public static readonly Styles = Styles;
        public static readonly tag = 'arianna-piano-roll';
        public template = html``;

        readonly notes$: Types.Signal<Interfaces.PianoNote[]> = Reactivity.CreateSignal<Interfaces.PianoNote[]>([]);
        readonly playing$: Types.Signal<boolean> = Reactivity.CreateSignal(false);
        readonly playhead$: Types.Signal<number> = Reactivity.CreateSignal(0);

        _root?: HTMLElement;
        _keys?: HTMLDivElement;
        _ruler?: HTMLDivElement;
        _canvas?: HTMLDivElement;
        _grid?: HTMLDivElement;
        _velocity?: HTMLDivElement;
        _playhead?: HTMLDivElement;
        _status?: HTMLSpanElement;
        _events?: HTMLDivElement;
        _velToggle?: HTMLButtonElement;
        _playButton?: HTMLButtonElement;
        _pauseButton?: HTMLButtonElement;
        _midiInput?: HTMLInputElement;

        _beats = 32;
        _pitchMin = 36;
        _pitchMax = 96;
        _cellW = 80;
        _cellH = 16;
        _snap = .25;
        _bpm = 120;
        _tool: Tool = 'draw';
        _selected = new Set<string>();
        _showVelocity = true;
        _nextId = 1;
        _raf = 0;
        _lastPlaybackBeat = 0;
        _playStartedAt = 0;
        _eventLog: Array<{ time: number; type: string; pitch: number; velocity: number }> = [];
        _noteClipboard: Interfaces.PianoNote[] = [];
        _synthContext?: AudioContext;
        _synthMaster?: GainNode;
        _synthVoices?: Map<number, { oscillator: OscillatorNode; gain: GainNode }>;
        _bound?: boolean;

        constructor(opts: Interfaces.PianoRollOptions = {})
        {
            super();
            this.EnsureState();
            const root = (this as unknown as { render(): HTMLElement }).render();
            if (opts.beats != null) root.setAttribute('beats', String(opts.beats));
            if (opts.bars != null) root.setAttribute('bars', String(opts.bars));
            if (opts.bpm != null) root.setAttribute('bpm', String(opts.bpm));
            if (opts.pitchMin != null) root.setAttribute('pitch-min', String(opts.pitchMin));
            if (opts.pitchMax != null) root.setAttribute('pitch-max', String(opts.pitchMax));
            if (opts.cellWidth != null) root.setAttribute('cell-width', String(opts.cellWidth));
            if (opts.cellHeight != null) root.setAttribute('cell-height', String(opts.cellHeight));
            if (opts.snap != null) root.setAttribute('snap', String(opts.snap));
            if (opts.theme) root.setAttribute('theme', opts.theme);
        }

        onConnected(): void
        {
            this.EnsureState();
            this.classList.add('PianoRoll');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            const root = (this as unknown as { render(): HTMLElement }).render();
            if (root.querySelector('.PianoRoll')) return;
            this._root = root;

            const bars = parseInt(root.getAttribute('bars') ?? '', 10);
            const beats = parseInt(root.getAttribute('beats') ?? '', 10);
            this._beats = beats > 0 ? beats : (bars > 0 ? bars * BPB : 32);
            this._pitchMin = parseInt(root.getAttribute('pitch-min') ?? '36', 10) || 36;
            this._pitchMax = parseInt(root.getAttribute('pitch-max') ?? '96', 10) || 96;
            this._cellW = parseFloat(root.getAttribute('cell-width') ?? '80') || 80;
            this._cellH = parseFloat(root.getAttribute('cell-height') ?? '16') || 16;
            this._snap = parseFloat(root.getAttribute('snap') ?? '.25') || .25;
            this._bpm = parseFloat(root.getAttribute('bpm') ?? '120') || 120;

            const shell = document.createElement('div');
            shell.className = 'PianoRoll';

            const toolbar = document.createElement('div');
            toolbar.className = 'PianoRoll-Toolbar';
            toolbar.innerHTML = `
                <h3 class="PianoRoll-Title">PianoRoll</h3>
                <span class="PianoRoll-Status">— idle</span>
                <span class="PianoRoll-Spacer"></span>
                <button type="button" class="PianoRoll-ToolButton active" data-tool="draw">✏ Draw</button>
                <button type="button" class="PianoRoll-ToolButton" data-tool="select">⌖ Select</button>
                <button type="button" class="PianoRoll-ToolButton" data-tool="erase">⌫ Erase</button>
                <span class="PianoRoll-Spacer"></span>
                <label class="PianoRoll-Label">Snap</label>
                <select class="PianoRoll-Input PianoRoll-Snap" aria-label="Piano roll snap">
                    <option value="0.0625">1/16</option><option value="0.125">1/8</option>
                    <option value="0.25">1/4</option><option value="0.5">1/2</option><option value="1">1/1</option>
                </select>
                <label class="PianoRoll-Label">BPM</label>
                <input class="PianoRoll-Input PianoRoll__bpm" type="number" min="20" max="300" aria-label="BPM">
                <label class="PianoRoll-Label">Bars</label>
                <input class="PianoRoll-Input PianoRoll__bars" type="number" min="1" max="64" aria-label="Bars">
                <span class="PianoRoll-Fill"></span>
                <button type="button" class="PianoRoll-Button play">▶ Play</button>
                <button type="button" class="PianoRoll-Button pause">‖ Pause</button>
                <button type="button" class="PianoRoll-Button stop">■ Stop</button>
                <span class="PianoRoll-Spacer"></span>
                <button type="button" class="PianoRoll-Button import" title="Import .mid or .midi">IMPORT</button>
                <input class="PianoRoll-MidiInput" type="file" accept=".mid,.midi,audio/midi,audio/x-midi">
                <button type="button" class="PianoRoll-Button clear">Clear</button>
                <button type="button" class="PianoRoll-Button export">Export JSON</button>`;

            this._status = toolbar.querySelector('.PianoRoll-Status') as HTMLSpanElement;
            this._playButton = toolbar.querySelector('.play') as HTMLButtonElement;
            this._pauseButton = toolbar.querySelector('.pause') as HTMLButtonElement;
            this._midiInput = toolbar.querySelector('.PianoRoll-MidiInput') as HTMLInputElement;
            const snap = toolbar.querySelector('.PianoRoll-Snap') as HTMLSelectElement;
            const bpm = toolbar.querySelector('.PianoRoll__bpm') as HTMLInputElement;
            const barsInput = toolbar.querySelector('.PianoRoll__bars') as HTMLInputElement;
            snap.value = String(this._snap);
            bpm.value = String(this._bpm);
            barsInput.value = String(Math.max(1, Math.ceil(this._beats / BPB)));

            const gridShell = document.createElement('div');
            gridShell.className = 'PianoRoll-Grid';
            const corner = document.createElement('div');
            corner.className = 'PianoRoll-Corner';
            this._ruler = document.createElement('div');
            this._ruler.className = 'PianoRoll-Ruler';
            this._keys = document.createElement('div');
            this._keys.className = 'PianoRoll-Keys';
            this._canvas = document.createElement('div');
            this._canvas.className = 'PianoRoll-Canvas';
            this._grid = document.createElement('div');
            this._grid.className = 'PianoRoll-Grid-bg';
            this._velocity = document.createElement('div');
            this._velocity.className = 'PianoRoll__vel';
            this._velToggle = document.createElement('button');
            this._velToggle.type = 'button';
            this._velToggle.className = 'PianoRoll-VelocityToggle';
            this._velToggle.textContent = '▼ Velocity';
            this._playhead = document.createElement('div');
            this._playhead.className = 'PianoRoll-Playhead';
            this._playhead.hidden = true;
            this._canvas.append(this._grid, this._velocity, this._velToggle, this._playhead);
            gridShell.append(corner, this._ruler, this._keys, this._canvas);

            const eventPanel = document.createElement('div');
            eventPanel.className = 'PianoRoll-Events';
            eventPanel.innerHTML = '<div class="PianoRoll-Events-ttl">MIDI Events</div>';
            this._events = document.createElement('div');
            this._events.className = 'PianoRoll-Events-list';
            this._events.textContent = '(no events yet — press Play)';
            eventPanel.appendChild(this._events);

            shell.append(toolbar, gridShell, eventPanel);
            root.appendChild(shell);

            this._buildKeys();
            this._buildRulerAndGrid();
            this._bindToolbar(toolbar, snap, bpm, barsInput);
            this._bindCanvas();
            this.BindKeyboard();
            this.BindRuler();
            this.BindVelocity();

            this._canvas.addEventListener('scroll', () =>
            {
                if (this._keys) this._keys.scrollTop = this._canvas!.scrollTop;
                if (this._ruler) this._ruler.scrollLeft = this._canvas!.scrollLeft;
            });

            Reactivity.CreateEffect(() =>
            {
                this.notes$.Get();
                this._renderNotes();
            });
            Reactivity.CreateEffect(() =>
            {
                const beat = this.playhead$.Get();
                if (this._playhead) this._playhead.style.left = this._beatX(beat) + 'px';
            });

        }

        public onCreated(): void
        {
            this.EnsureState();
        }

        private EnsureState(): void
        {
            const self = this as unknown as {
                notes$?: Types.Signal<Interfaces.PianoNote[]>; playing$?: Types.Signal<boolean>; playhead$?: Types.Signal<number>;
                _beats?: number; _pitchMin?: number; _pitchMax?: number; _cellW?: number; _cellH?: number; _snap?: number; _bpm?: number;
                _tool?: Tool; _selected?: Set<string>; _showVelocity?: boolean; _nextId?: number; _raf?: number;
                _lastPlaybackBeat?: number; _playStartedAt?: number;
                _eventLog?: Array<{ time: number; type: string; pitch: number; velocity: number }>;
                _noteClipboard?: Interfaces.PianoNote[]; _synthVoices?: Map<number, { oscillator: OscillatorNode; gain: GainNode }>; _bound?: boolean;
            };
            if(!self.notes$ || typeof self.notes$.Get !== 'function') self.notes$ = Reactivity.CreateSignal<Interfaces.PianoNote[]>([]);
            if(!self.playing$ || typeof self.playing$.Get !== 'function') self.playing$ = Reactivity.CreateSignal(false);
            if(!self.playhead$ || typeof self.playhead$.Get !== 'function') self.playhead$ = Reactivity.CreateSignal(0);
            if(!Number.isFinite(self._beats)) self._beats = 32;
            if(!Number.isFinite(self._pitchMin)) self._pitchMin = 36;
            if(!Number.isFinite(self._pitchMax)) self._pitchMax = 96;
            if(!Number.isFinite(self._cellW)) self._cellW = 80;
            if(!Number.isFinite(self._cellH)) self._cellH = 16;
            if(!Number.isFinite(self._snap)) self._snap = .25;
            if(!Number.isFinite(self._bpm)) self._bpm = 120;
            if(self._tool !== 'draw' && self._tool !== 'select' && self._tool !== 'erase') self._tool = 'draw';
            if(!(self._selected instanceof Set)) self._selected = new Set<string>();
            if(typeof self._showVelocity !== 'boolean') self._showVelocity = true;
            if(!Number.isFinite(self._nextId) || (self._nextId ?? 0) < 1) self._nextId = 1;
            if(!Number.isFinite(self._raf)) self._raf = 0;
            if(!Number.isFinite(self._lastPlaybackBeat)) self._lastPlaybackBeat = 0;
            if(!Number.isFinite(self._playStartedAt)) self._playStartedAt = 0;
            if(!Array.isArray(self._eventLog)) self._eventLog = [];
            if(!Array.isArray(self._noteClipboard)) self._noteClipboard = [];
            if(!(self._synthVoices instanceof Map)) self._synthVoices = new Map();
        }

        public get notes(): Interfaces.PianoNote[] { this.EnsureState(); return this.getNotes(); }
        public set notes(value: Interfaces.PianoNote[]) { this.EnsureState(); this.setNotes(Array.isArray(value) ? value : []); }

        _bindToolbar(toolbar: HTMLElement, snap: HTMLSelectElement, bpm: HTMLInputElement, bars: HTMLInputElement): void
        {
            toolbar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(button =>
            {
                button.addEventListener('click', () =>
                {
                    this._tool = (button.dataset.tool ?? 'draw') as Tool;
                    toolbar.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b === button));
                });
            });

            snap.addEventListener('change', () =>
            {
                this._snap = parseFloat(snap.value) || .25;
                this.setAttribute('snap', String(this._snap));
                this._buildRulerAndGrid();
            });
            bpm.addEventListener('change', () =>
            {
                this._bpm = Math.max(20, Math.min(300, parseFloat(bpm.value) || 120));
                bpm.value = String(this._bpm);
                this.setAttribute('bpm', String(this._bpm));
            });
            bars.addEventListener('change', () =>
            {
                const count = Math.max(1, Math.min(64, parseInt(bars.value, 10) || 8));
                bars.value = String(count);
                this._beats = count * BPB;
                this.setAttribute('bars', String(count));
                this.setAttribute('beats', String(this._beats));
                this._buildRulerAndGrid();
                this._renderNotes();
            });

            this._playButton?.addEventListener('click', () => this.play());
            this._pauseButton?.addEventListener('click', () => this.pause());
            toolbar.querySelector('.stop')?.addEventListener('click', () => this.stop());
            toolbar.querySelector('.import')?.addEventListener('click',()=>this._midiInput?.click());
            this._midiInput?.addEventListener('change',async()=>
            {
                const file=this._midiInput?.files?.[0];
                if(!file)return;
                try{await this.importMidi(file);}
                catch(error)
                {
                    if(this._status)this._status.textContent='⚠ '+(error instanceof Error?error.message:'MIDI import failed');
                    this.dispatchEvent(new CustomEvent('arianna:pianoroll-midi-import-error',{bubbles:true,detail:{error,source:this}}));
                }
                finally{if(this._midiInput)this._midiInput.value='';}
            });
            toolbar.querySelector('.clear')?.addEventListener('click', () =>
            {
                this._selected.clear();
                this.notes$.Set([]);
            });
            toolbar.querySelector('.export')?.addEventListener('click', () => this._exportJson());
            this._velToggle?.addEventListener('click', () =>
            {
                this._showVelocity = !this._showVelocity;
                if (this._velocity) this._velocity.hidden = !this._showVelocity;
                if (this._velToggle) this._velToggle.textContent = this._showVelocity ? '▼ Velocity' : '▲ Velocity';
            });
        }

        _buildKeys(): void
        {
            if (!this._keys) return;
            this._keys.replaceChildren();
            const height = (this._pitchMax - this._pitchMin + 1) * this._cellH;
            this._keys.style.height = height + 'px';

            for (let pitch = this._pitchMax; pitch >= this._pitchMin; pitch--)
            {
                const key = document.createElement('div');
                key.className = 'PianoRoll-Key ' + (BLACK.has(pitch % 12) ? 'black' : 'white');
                key.style.top = this._pitchY(pitch) + 'px';
                key.style.height = this._cellH + 'px';
                if (pitch % 12 === 0 || pitch % 12 === 7) key.textContent = pitchLabel(pitch);
                key.addEventListener('pointerdown', e =>
                {
                    e.preventDefault();
                    this._midi('note-on', pitch, 1);
                    const pointer = e.pointerId;
                    const off = (ev: PointerEvent): void =>
                    {
                        if (ev.pointerId !== pointer) return;
                        this._midi('note-off', pitch, 0);
                        window.removeEventListener('pointerup', off);
                        window.removeEventListener('pointercancel', off);
                    };
                    window.addEventListener('pointerup', off);
                    window.addEventListener('pointercancel', off);
                });
                this._keys.appendChild(key);
            }
        }

        _buildRulerAndGrid(): void
        {
            if (!this._ruler || !this._grid || !this._canvas) return;
            this._ruler.replaceChildren();
            this._grid.replaceChildren();
            const width = this._beatX(this._beats);
            const height = (this._pitchMax - this._pitchMin + 1) * this._cellH;
            this._ruler.style.width = width + 'px';
            this._grid.style.width = width + 'px';
            this._grid.style.height = height + 'px';
            this._canvas.style.setProperty('--pr-grid-width', width + 'px');
            this._canvas.style.setProperty('--pr-grid-height', height + 'px');
            this._canvas.style.setProperty('--pr-row-h', this._cellH + 'px');
            this._canvas.style.setProperty('--pr-beat-w', this._cellW + 'px');
            this._canvas.style.minHeight = Math.min(520, height) + 'px';

            for (let beat = 0; beat <= this._beats; beat++)
            {
                const tick = document.createElement('span');
                tick.className = 'PianoRoll-Tick' + (beat % BPB === 0 ? ' bar' : '');
                tick.style.left = this._beatX(beat) + 'px';
                this._ruler.appendChild(tick);
                if (beat % BPB === 0)
                {
                    const label = document.createElement('span');
                    label.className = 'PianoRoll-TickLabel';
                    label.style.left = (this._beatX(beat) + 2) + 'px';
                    label.textContent = String(beat / BPB + 1);
                    this._ruler.appendChild(label);
                }
            }

            for (let pitch = this._pitchMax; pitch >= this._pitchMin; pitch--)
            {
                if (!BLACK.has(pitch % 12)) continue;
                const tint = document.createElement('div');
                tint.className = 'PianoRoll__row-tint';
                tint.style.top = this._pitchY(pitch) + 'px';
                tint.style.height = this._cellH + 'px';
                tint.style.width = width + 'px';
                this._grid.appendChild(tint);
            }
        }

        _bindCanvas(): void
        {
            if (!this._canvas) return;
            this._canvas.addEventListener('pointerdown', e =>
            {
                const target = e.target as Element;
                if (target.closest('.PianoRoll-Note') || target.closest('.PianoRoll-VelocityToggle')) return;
                if (this._tool === 'select')
                {
                    if (!e.shiftKey) this._selected.clear();
                    this._renderNotes();
                    return;
                }
                if (this._tool !== 'draw') return;

                const { beat, pitch } = this._pointToNote(e);
                if (pitch < this._pitchMin || pitch > this._pitchMax) return;
                const note: Interfaces.PianoNote =
                {
                    id: 'n' + this._nextId++, pitch,
                    start: this._snapBeat(beat), length: Math.max(this._snap, .0625), velocity: .8, channel: 1
                };
                this.notes$.Set([...this.notes$.Peek(), note]);
                this._selected.clear();
                this._selected.add(note.id!);

                const pointer = e.pointerId;
                const originBeat = note.start;
                const move = (ev: PointerEvent): void =>
                {
                    if(ev.pointerId !== pointer) return;
                    const point = this._pointToNote(ev);
                    note.length = Math.max(this._snap, this._snapBeat(point.beat - originBeat));
                    this._renderNotes();
                };
                const up = (ev: PointerEvent): void =>
                {
                    if(ev.pointerId !== pointer) return;
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    this.notes$.Set([...this.notes$.Peek()]);
                    this.dispatchEvent(new CustomEvent('arianna:pianoroll-note-add', { bubbles: true, detail: { note: { ...note }, source: this } }));
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            });
        }

        _renderNotes(): void
        {
            if (!this._canvas || !this._velocity) return;
            this._canvas.querySelectorAll('.PianoRoll-Note').forEach(node => node.remove());
            this._velocity.replaceChildren();

            for (const note of this.notes$.Peek())
            {
                if (!note.id) note.id = 'n' + this._nextId++;
                const el = document.createElement('div');
                el.className = 'PianoRoll-Note' + (this._selected.has(note.id) ? ' selected' : '');
                el.dataset.noteId = note.id;
                el.style.left = this._beatX(note.start) + 'px';
                el.style.top = this._pitchY(note.pitch) + 'px';
                el.style.width = this._beatX(note.length) + 'px';
                el.style.height = this._cellH + 'px';
                el.style.opacity = String(.55 + Math.max(0, Math.min(1, note.velocity)) * .45);
                el.innerHTML = `<span class="note-lbl">${pitchLabel(note.pitch)}</span><span class="PianoRoll-NoteResize"></span>`;
                el.addEventListener('pointerdown', e => this._notePointerDown(e, note, el));
                this._canvas.appendChild(el);

                const velocity = document.createElement('span');
                velocity.className = 'PianoRoll-VelocityBar';
                velocity.dataset.noteId = note.id;
                velocity.style.left = this._beatX(note.start) + 'px';
                velocity.style.height = Math.max(2, note.velocity * 58) + 'px';
                this._velocity.appendChild(velocity);
            }
            this._velocity.style.width = this._beatX(this._beats) + 'px';
        }

        _notePointerDown(e: PointerEvent, note: Interfaces.PianoNote, el: HTMLElement): void
        {
            e.preventDefault();
            e.stopPropagation();
            if (this._tool === 'erase')
            {
                this.removeNote(note.id!);
                return;
            }

            if (!this._selected.has(note.id!))
            {
                if (!e.shiftKey) this._selected.clear();
                this._selected.add(note.id!);
                this._renderNotes();
                el = this._canvas?.querySelector(`[data-note-id="${CSS.escape(note.id!)}"]`) as HTMLElement ?? el;
            }

            const resize = (e.target as Element).classList.contains('PianoRoll-NoteResize');
            const startX = e.clientX;
            const startY = e.clientY;
            const original = { start: note.start, pitch: note.pitch, length: note.length };
            const pointer = e.pointerId;

            const move = (ev: PointerEvent): void =>
            {
                if (ev.pointerId !== pointer) return;
                if (resize)
                {
                    note.length = Math.max(this._snap, this._snapBeat(original.length + (ev.clientX - startX) / this._cellW));
                }
                else
                {
                    note.start = Math.max(0, this._snapBeat(original.start + (ev.clientX - startX) / this._cellW));
                    note.pitch = Math.max(this._pitchMin, Math.min(this._pitchMax, original.pitch - Math.round((ev.clientY - startY) / this._cellH)));
                }
                this._renderNotes();
            };
            const up = (ev: PointerEvent): void =>
            {
                if (ev.pointerId !== pointer) return;
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                window.removeEventListener('pointercancel', up);
                this.notes$.Set([...this.notes$.Peek()]);
                this.dispatchEvent(new CustomEvent('arianna:pianoroll-note-edit', { bubbles: true, detail: { note: { ...note }, source: this } }));
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
            window.addEventListener('pointercancel', up);
        }

        private BindKeyboard(): void
        {
            if(this._bound) return;
            this._bound = true;
            this.addEventListener('keydown', event =>
            {
                const modifier = event.metaKey || event.ctrlKey;
                const key = event.key.toLowerCase();
                if(modifier && key === 'a')
                {
                    event.preventDefault();
                    this._selected = new Set(this.notes$.Peek().map(note => note.id!).filter(Boolean));
                    this._renderNotes();
                    return;
                }
                if(modifier && key === 'c')
                {
                    event.preventDefault();
                    this._noteClipboard = this.notes$.Peek().filter(note => this._selected.has(note.id!)).map(note => ({ ...note }));
                    return;
                }
                if(modifier && key === 'x')
                {
                    event.preventDefault();
                    this._noteClipboard = this.notes$.Peek().filter(note => this._selected.has(note.id!)).map(note => ({ ...note }));
                    this.notes$.Set(this.notes$.Peek().filter(note => !this._selected.has(note.id!)));
                    this._selected.clear();
                    return;
                }
                if(modifier && key === 'v')
                {
                    event.preventDefault();
                    const base = this.playhead$.Peek();
                    const min = this._noteClipboard.length ? Math.min(...this._noteClipboard.map(note => note.start)) : 0;
                    const pasted = this._noteClipboard.map(note => ({ ...note, id: 'n' + this._nextId++, start: Math.max(0, base + note.start - min) }));
                    this.notes$.Set([...this.notes$.Peek(), ...pasted]);
                    this._selected = new Set(pasted.map(note => note.id!));
                    return;
                }
                if(event.key === 'Delete' || event.key === 'Backspace')
                {
                    event.preventDefault();
                    this.notes$.Set(this.notes$.Peek().filter(note => !this._selected.has(note.id!)));
                    this._selected.clear();
                    return;
                }
                if(event.code === 'Space')
                {
                    event.preventDefault();
                    this.playing$.Peek() ? this.pause() : this.play();
                }
            });
        }

        private BindRuler(): void
        {
            if(!this._ruler) return;
            const set = (event: PointerEvent): void =>
            {
                const rect = this._ruler!.getBoundingClientRect();
                const x = event.clientX - rect.left + this._ruler!.scrollLeft;
                this.setPlayhead(this._snapBeat(x / this._cellW));
                if(this._playhead) this._playhead.hidden = false;
            };
            let dragging = false;
            this._ruler.addEventListener('pointerdown', event => { dragging = true; set(event); });
            this._ruler.addEventListener('pointermove', event => { if(dragging) set(event); });
            this._ruler.addEventListener('pointerup', () => { dragging = false; });
            this._ruler.addEventListener('pointercancel', () => { dragging = false; });
        }

        private BindVelocity(): void
        {
            if(!this._velocity) return;
            this._velocity.addEventListener('pointerdown', event =>
            {
                event.preventDefault();
                event.stopPropagation();
                const target = event.target as HTMLElement;
                const id = target.closest<HTMLElement>('.PianoRoll-VelocityBar')?.dataset.noteId;
                const rect = this._velocity!.getBoundingClientRect();
                const x = event.clientX - rect.left + (this._canvas?.scrollLeft ?? 0);
                const beat = x / this._cellW;
                let note = id ? this.notes$.Peek().find(item => item.id === id) : undefined;
                if(!note)
                {
                    note = this.notes$.Peek().reduce<Interfaces.PianoNote | undefined>((best, item) =>
                        !best || Math.abs(item.start - beat) < Math.abs(best.start - beat) ? item : best, undefined);
                }
                if(!note) return;
                const pointer = event.pointerId;
                const update = (ev: PointerEvent): void =>
                {
                    if(ev.pointerId !== pointer) return;
                    const y = ev.clientY - rect.top;
                    note!.velocity = Math.max(0, Math.min(1, 1 - y / Math.max(1, rect.height)));
                    this._renderNotes();
                    this.dispatchEvent(new CustomEvent('arianna:pianoroll-velocity', { bubbles: true, detail: { note: { ...note! }, source: this } }));
                };
                update(event);
                const up = (ev: PointerEvent): void =>
                {
                    if(ev.pointerId !== pointer) return;
                    window.removeEventListener('pointermove', update);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    this.notes$.Set([...this.notes$.Peek()]);
                };
                window.addEventListener('pointermove', update);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            });
        }

        _pointToNote(e: PointerEvent): { beat: number; pitch: number }
        {
            const rect = this._canvas!.getBoundingClientRect();
            const x = e.clientX - rect.left + this._canvas!.scrollLeft;
            const y = e.clientY - rect.top + this._canvas!.scrollTop;
            return { beat: x / this._cellW, pitch: this._pitchMax - Math.floor(y / this._cellH) };
        }

        _beatX(beat: number): number { return beat * this._cellW; }
        _pitchY(pitch: number): number { return (this._pitchMax - pitch) * this._cellH; }
        _snapBeat(beat: number): number { return this._snap > 0 ? Math.round(beat / this._snap) * this._snap : beat; }

        _midi(type: string, pitch: number, velocity: number): void
        {
            this.EnsureState();
            if(type === 'note-on' && velocity > 0) this.SynthNoteOn(pitch, velocity);
            else if(type === 'note-off' || velocity <= 0) this.SynthNoteOff(pitch);

            const event = { time: performance.now(), type, pitch, velocity };
            this._eventLog.unshift(event);
            if (this._eventLog.length > 30) this._eventLog.length = 30;
            if (this._events)
            {
                this._events.replaceChildren();
                for (const row of this._eventLog.slice(0, 12))
                {
                    const line = document.createElement('div');
                    line.className = 'PianoRoll-EventsRow';
                    line.innerHTML = `<span class="t">${(row.time / 1000).toFixed(2)}</span><span class="ev">${row.type}</span><span>${pitchLabel(row.pitch)} · ${Math.round(row.velocity * 127)}</span>`;
                    this._events.appendChild(line);
                }
            }
            this.dispatchEvent(new CustomEvent('arianna:pianoroll-midi', { bubbles: true, detail: { ...event, source: this } }));
        }

        private EnsureSynth(): AudioContext | undefined
        {
            if(this._synthContext) return this._synthContext;

            try
            {
                const Constructor = window.AudioContext ||
                    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if(!Constructor) return undefined;

                const context = new Constructor();
                const master = context.createGain();
                master.gain.value = .16;
                master.connect(context.destination);
                this._synthContext = context;
                this._synthMaster = master;
                this._synthVoices ??= new Map();
                return context;
            }
            catch
            {
                return undefined;
            }
        }

        private SynthNoteOn(pitch: number, velocity: number): void
        {
            const context = this.EnsureSynth();
            const master = this._synthMaster;
            if(!context || !master) return;

            if(context.state === 'suspended') void context.resume().catch(() => undefined);
            this.SynthNoteOff(pitch, true);

            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12);

            const now = context.currentTime;
            const level = Math.max(.01, Math.min(1, velocity)) * .32;
            gain.gain.setValueAtTime(.0001, now);
            gain.gain.exponentialRampToValueAtTime(Math.max(.0002, level), now + .008);

            oscillator.connect(gain);
            gain.connect(master);
            oscillator.start(now);
            this._synthVoices?.set(pitch, { oscillator, gain });
        }

        private SynthNoteOff(pitch: number, immediate = false): void
        {
            const voice = this._synthVoices?.get(pitch);
            if(!voice) return;
            this._synthVoices?.delete(pitch);

            const context = this._synthContext;
            if(!context)
            {
                try { voice.oscillator.stop(); } catch {}
                return;
            }

            const now = context.currentTime;
            try
            {
                voice.gain.gain.cancelScheduledValues(now);
                voice.gain.gain.setValueAtTime(Math.max(.0001, voice.gain.gain.value), now);
                voice.gain.gain.exponentialRampToValueAtTime(.0001, now + (immediate ? .01 : .06));
                voice.oscillator.stop(now + (immediate ? .015 : .07));
            }
            catch
            {
                try { voice.oscillator.stop(); } catch {}
            }
        }

        private StopSynth(): void
        {
            for(const pitch of Array.from(this._synthVoices?.keys() ?? [])) this.SynthNoteOff(pitch, true);
        }

        _exportJson(): void
        {
            const blob = new Blob([JSON.stringify(this.getNotes(), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'arianna-pianoroll.json';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        }

        /** Import a Standard MIDI File. Monophonic melody extraction is the default. */
        async importMidi(source:Blob|ArrayBuffer|Uint8Array,options:Interfaces.MidiImportOptions={}):Promise<Interfaces.MidiImportResult>
        {
            const bytes=source instanceof Blob?await source.arrayBuffer():source;
            const result=ParseMidi(bytes,{monophonic:true,normalizeStart:true,...options});
            this.stop();
            this._bpm=result.bpm;
            this._beats=result.bars*BPB;
            const pitches=result.notes.map(note=>note.pitch);
            if(pitches.length)
            {
                this._pitchMin=Math.max(0,Math.floor((Math.min(...pitches)-2)/12)*12);
                this._pitchMax=Math.min(127,Math.ceil((Math.max(...pitches)+3)/12)*12-1);
            }
            this.setAttribute('bpm',String(this._bpm));
            this.setAttribute('bars',String(result.bars));
            this.setAttribute('beats',String(this._beats));
            this.setAttribute('pitch-min',String(this._pitchMin));
            this.setAttribute('pitch-max',String(this._pitchMax));
            const bpmInput=this.querySelector<HTMLInputElement>('.PianoRoll__bpm');
            const barsInput=this.querySelector<HTMLInputElement>('.PianoRoll__bars');
            if(bpmInput)bpmInput.value=String(this._bpm);
            if(barsInput)barsInput.value=String(result.bars);
            this._buildKeys();
            this._buildRulerAndGrid();
            this.setNotes(result.notes);
            this.setPlayhead(0);
            if(this._status)this._status.textContent=`✓ ${result.notes.length} notes · ${this._bpm} BPM${result.trackName?' · '+result.trackName:''}`;
            this.dispatchEvent(new CustomEvent('arianna:pianoroll-midi-import',{
                bubbles:true,detail:{...result,monophonic:options.monophonic!==false,source:this}
            }));
            return result;
        }

        addNote(note: Interfaces.PianoNote): this
        {
            this.notes$.Set([...this.notes$.Peek(), { ...note, id: note.id ?? 'n' + this._nextId++ }]);
            return this;
        }

        removeNote(id: string): this
        {
            this.notes$.Set(this.notes$.Peek().filter(note => note.id !== id));
            this._selected.delete(id);
            return this;
        }

        setNotes(notes: Interfaces.PianoNote[]): this
        {
            this._selected.clear();
            this.notes$.Set(notes.map(note => ({ ...note, id: note.id ?? 'n' + this._nextId++ })));
            return this;
        }

        getNotes(): Interfaces.PianoNote[] { return this.notes$.Get().map(note => ({ ...note })); }

        play(): void
        {
            if (this.playing$.Get()) return;
            this.playing$.Set(true);
            this._playStartedAt = performance.now() - (this.playhead$.Peek() / (this._bpm / 60)) * 1000;
            this._lastPlaybackBeat = this.playhead$.Peek() - 1e-6;
            if (this._status) this._status.textContent = '● playing · internal synth';
            if (this._playhead) this._playhead.hidden = false;
            const synth = this.EnsureSynth();
            if(synth?.state === 'suspended') void synth.resume().catch(() => undefined);
            this.dispatchEvent(new CustomEvent('arianna:pianoroll-play', { bubbles: true, detail: { source: this } }));

            const tick = (): void =>
            {
                if (!this.playing$.Peek()) return;
                const beat = ((performance.now() - this._playStartedAt) / 1000) * (this._bpm / 60);
                if (beat >= this._beats)
                {
                    this.stop();
                    return;
                }
                for (const note of this.notes$.Peek())
                {
                    if (note.start > this._lastPlaybackBeat && note.start <= beat + 1e-6) this._midi('note-on', note.pitch, note.velocity);
                    const end = note.start + note.length;
                    if (end > this._lastPlaybackBeat && end <= beat) this._midi('note-off', note.pitch, 0);
                }
                this._lastPlaybackBeat = beat;
                this.playhead$.Set(beat);
                this._raf = requestAnimationFrame(tick);
            };
            this._raf = requestAnimationFrame(tick);
        }

        pause(): void
        {
            if (!this.playing$.Peek()) return;
            this.playing$.Set(false);
            if (this._raf) cancelAnimationFrame(this._raf);
            this._raf = 0;
            this.StopSynth();
            if (this._status) this._status.textContent = '‖ paused';
            this.dispatchEvent(new CustomEvent('arianna:pianoroll-pause', { bubbles: true, detail: { source: this } }));
        }

        stop(): void
        {
            this.playing$.Set(false);
            if (this._raf) cancelAnimationFrame(this._raf);
            this._raf = 0;
            this.playhead$.Set(0);
            if (this._playhead) this._playhead.hidden = true;
            this.StopSynth();
            if (this._status) this._status.textContent = '— idle';
            this.dispatchEvent(new CustomEvent('arianna:pianoroll-stop', { bubbles: true, detail: { source: this } }));
        }

        setPlayhead(beat: number): this
        {
            this.playhead$.Set(Math.max(0, Math.min(this._beats, beat)));
            return this;
        }

        onUnmount(): void
        {
            this.EnsureState();
            this.StopSynth();
            if (this._raf) cancelAnimationFrame(this._raf);
            this._raf = 0;
        }

        static DefaultSheet(): Types.Stylesheet { return Styles; }
    }
}

export type PianoRollOptions = PianoRoll.Interfaces.PianoRollOptions;
export type PianoNote = PianoRoll.Interfaces.PianoNote;
export type MidiImportOptions = PianoRoll.Interfaces.MidiImportOptions;
export type MidiImportResult = PianoRoll.Interfaces.MidiImportResult;
export default PianoRoll;
