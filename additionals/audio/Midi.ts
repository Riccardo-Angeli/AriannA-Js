/**
 * @module    additionals/Midi
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * A.r.i.a.n.n.A. MIDI — addon
 *
 * Three things in one file:
 *   1. Live Web MIDI engine (formerly Audio.MIDIEngine, moved here).
 *      Supports legacy 1.0 messages on the wire because that is what
 *      hardware still sends, but normalises everything into the high-res
 *      MidiEvent shape used by the rest of the addon.
 *   2. AriannA proprietary binary format (.amid).
 *      Designed from day one for MPE and MIDI 2.0:
 *        - per-note pitch bend (cents, signed 14-bit)
 *        - high-res velocity (16-bit)
 *        - per-note expression / pressure / brightness / timbre
 *        - explicit note ID linking on/off pairs (no 'last on' guesswork)
 *      No backwards compatibility with SMF — that's a separate import path
 *      we'll add later (Midi.fromSMF).
 *   3. Helpers: noteToFreq, noteToName, hex utils, validation.
 *
 * Wire format (.amid) — overview
 * -------------------------------
 *   Header  : "AMID" magic (4B) + version u16 + flags u16
 *   Songmeta: tempo (u32 µ-quarter), ppq (u16), timeSig (u8 num, u8 den)
 *   Tracks  : count u16, then per track: nameLen u8, name UTF-8, eventCount u32, events
 *   Events  : delta u32 (varint, ticks), kind u8, payload (variable, kind-defined)
 *
 * The full byte layout is in `_writeBinary` / `_readBinary`. Schema is
 * versioned; bump the version field when changing.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Note ID — pairs noteOn with the matching noteOff. UUID-ish string. */
export type NoteId = string;

/** Channel 0..15 (legacy) or 0..255 in MIDI 2.0 mode. */
export type Channel = number;

/**
 * High-resolution unified MIDI event. All instrument data flows through
 * this shape, regardless of whether it came from MIDI 1.0 hardware,
 * MIDI 2.0 hardware, or a parsed .amid file.
 */
export type MidiEvent =
    | NoteOnEvent
    | NoteOffEvent
    | ControlChangeEvent
    | PitchBendEvent
    | PressureEvent
    | ProgramChangeEvent
    | PerNoteExpressionEvent
    | TempoEvent
    | TimeSignatureEvent
    | MetaEvent;

export interface NoteOnEvent {
    type      : 'noteOn';
    time      : number;            // ticks (PPQ-based) or ms — depends on context
    channel   : Channel;
    noteId    : NoteId;            // pairs with noteOff
    pitch     : number;            // 0..127 (MIDI key number)
    velocity  : number;            // 0..65535 (16-bit, MIDI 2.0 native)
    pitchBend?: number;            // cents, -8192..8191 (per-note, MPE/2.0)
    timbre?   : number;            // 0..16383 (per-note CC, MPE/2.0)
}

export interface NoteOffEvent {
    type     : 'noteOff';
    time     : number;
    channel  : Channel;
    noteId   : NoteId;
    pitch    : number;
    velocity : number;             // release velocity, 0..65535
}

export interface ControlChangeEvent {
    type    : 'cc';
    time    : number;
    channel : Channel;
    control : number;              // 0..127 (legacy) or 0..32767 (2.0)
    value   : number;              // 0..65535 high-res
}

export interface PitchBendEvent {
    type    : 'pitchBend';
    time    : number;
    channel : Channel;
    value   : number;              // -8192..8191 (legacy) or -2^31..2^31-1 (2.0)
}

export interface PressureEvent {
    type    : 'pressure';
    time    : number;
    channel : Channel;
    noteId? : NoteId;              // when set: per-note (poly) pressure
    pitch?  : number;
    value   : number;              // 0..65535
}

export interface ProgramChangeEvent {
    type    : 'programChange';
    time    : number;
    channel : Channel;
    program : number;              // 0..127
    bank?   : number;              // 0..16383
}

export interface PerNoteExpressionEvent {
    type    : 'perNoteExpression';
    time    : number;
    channel : Channel;
    noteId  : NoteId;
    pitch   : number;
    /** Identifier of the expression (e.g. 'pitch','timbre','pressure','brightness'). */
    name    : string;
    /** Normalised value 0..1 or -1..1, depending on `name`. */
    value   : number;
}

export interface TempoEvent {
    type    : 'tempo';
    time    : number;
    /** Microseconds per quarter note. 60_000_000 / value = BPM. */
    uPerQ   : number;
}

export interface TimeSignatureEvent {
    type        : 'timeSignature';
    time        : number;
    numerator   : number;
    denominator : number;
}

export interface MetaEvent {
    type      : 'meta';
    time      : number;
    /** Named meta event, application-defined. */
    name      : string;
    value     : string;
}

/** A single track in a song. */
export interface MidiTrack {
    id     : string;
    name   : string;
    channel: Channel;              // primary channel for the track
    color? : string;               // UI hint, e.g. '#e40c88'
    events : MidiEvent[];
}

/** Complete song. */
export interface MidiSong {
    /** Schema URL. Bump when format changes. */
    $schema     : 'arianna.io/midi/v1';
    title?      : string;
    author?     : string;
    /** Microseconds per quarter (default 500_000 = 120 BPM). */
    uPerQ       : number;
    /** Pulses per quarter note. Default 480. */
    ppq         : number;
    /** Default time signature. Per-event tempo/sig changes go in track events. */
    timeSignature: [number, number];
    /** All tracks. */
    tracks      : MidiTrack[];
}

// ── Live engine (Web MIDI API) ────────────────────────────────────────────────

export type MidiHandler = (event: MidiEvent) => void;

/**
 * Live MIDI input/output via the browser Web MIDI API.
 * Drop-in replacement for the old Audio.MIDIEngine: same `init()` /
 * `on(cb)` shape, but events are normalised to MidiEvent (not raw bytes).
 */
export class MidiEngine {
    #access  : MIDIAccess | null = null;
    #handlers: MidiHandler[] = [];
    #seq     : number = 0;            // monotonic noteId counter
    #activeNotes: Map<string, NoteId> = new Map();   // `${ch}:${pitch}` → noteId

    async init(): Promise<boolean> {
        if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
            return false;
        }
        try {
            this.#access = await (navigator as unknown as {
                requestMIDIAccess(o?: object): Promise<MIDIAccess>;
            }).requestMIDIAccess({ sysex: false });
            this.#access.inputs.forEach(input => {
                input.onmidimessage = (e) => this.#parse(e as MIDIMessageEvent);
            });
            return true;
        } catch {
            return false;
        }
    }

    #parse(e: MIDIMessageEvent): void {
        const data_ = e.data ? Array.from(e.data) : [0, 0, 0];
        const [status, d1, d2] = data_;
        const cmd = status >> 4;
        const ch  = status & 0xF;
        const time = e.timeStamp || 0;

        let event: MidiEvent | null = null;
        const key = `${ch}:${d1}`;

        if (cmd === 0x9 && d2 > 0) {
            const noteId = this.#newNoteId();
            this.#activeNotes.set(key, noteId);
            event = {
                type     : 'noteOn',
                time,
                channel  : ch,
                noteId,
                pitch    : d1,
                velocity : d2 << 9,        // 7-bit → 16-bit (preserve top bits)
            };
        } else if (cmd === 0x9 || cmd === 0x8) {
            const noteId = this.#activeNotes.get(key) ?? this.#newNoteId();
            this.#activeNotes.delete(key);
            event = {
                type     : 'noteOff',
                time,
                channel  : ch,
                noteId,
                pitch    : d1,
                velocity : d2 << 9,
            };
        } else if (cmd === 0xB) {
            event = {
                type    : 'cc',
                time,
                channel : ch,
                control : d1,
                value   : d2 << 9,
            };
        } else if (cmd === 0xE) {
            const raw = (d2 << 7) | d1;    // 14-bit
            event = {
                type    : 'pitchBend',
                time,
                channel : ch,
                value   : raw - 8192,
            };
        } else if (cmd === 0xD) {
            event = {
                type    : 'pressure',
                time,
                channel : ch,
                value   : d1 << 9,
            };
        } else if (cmd === 0xC) {
            event = {
                type    : 'programChange',
                time,
                channel : ch,
                program : d1,
            };
        } else {
            return;
        }

        this.#handlers.forEach(h => h(event!));
    }

    #newNoteId(): NoteId {
        return `n-${(++this.#seq).toString(36)}-${Date.now().toString(36)}`;
    }

    on(handler: MidiHandler): this {
        this.#handlers.push(handler);
        return this;
    }

    /** Send a MidiEvent out to all available outputs (best-effort). */
    send(event: MidiEvent): void {
        if (!this.#access) return;
        const bytes = _eventToBytes(event);
        if (!bytes) return;
        this.#access.outputs.forEach(out => out.send(bytes));
    }

    get inputs() : MIDIInputMap  | null { return this.#access?.inputs  ?? null; }
    get outputs(): MIDIOutputMap | null { return this.#access?.outputs ?? null; }
}

function _eventToBytes(e: MidiEvent): number[] | null {
    switch (e.type) {
        case 'noteOn':  return [0x90 | (e.channel & 0xF), e.pitch & 0x7F, (e.velocity >> 9) & 0x7F];
        case 'noteOff': return [0x80 | (e.channel & 0xF), e.pitch & 0x7F, (e.velocity >> 9) & 0x7F];
        case 'cc':      return [0xB0 | (e.channel & 0xF), e.control & 0x7F, (e.value >> 9) & 0x7F];
        case 'pitchBend': {
            const v = e.value + 8192;
            return [0xE0 | (e.channel & 0xF), v & 0x7F, (v >> 7) & 0x7F];
        }
        case 'pressure':
            return e.noteId !== undefined && e.pitch !== undefined
                ? [0xA0 | (e.channel & 0xF), e.pitch & 0x7F, (e.value >> 9) & 0x7F]   // poly
                : [0xD0 | (e.channel & 0xF), (e.value >> 9) & 0x7F];                   // chan
        case 'programChange': return [0xC0 | (e.channel & 0xF), e.program & 0x7F];
        default: return null;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function noteToFreq(note: number, pitchBendCents = 0): number {
    return 440 * Math.pow(2, ((note - 69) + pitchBendCents / 100) / 12);
}

export function noteToName(note: number): string {
    const n = NOTE_NAMES[((note % 12) + 12) % 12];
    const o = Math.floor(note / 12) - 1;
    return `${n}${o}`;
}

export function nameToNote(name: string): number {
    const m = name.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
    if (!m) return -1;
    const base = NOTE_NAMES.indexOf(m[1].toUpperCase());
    if (base < 0) return -1;
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    const oct = parseInt(m[3], 10);
    return base + acc + (oct + 1) * 12;
}

// ── Binary format: AMID ───────────────────────────────────────────────────────

const AMID_MAGIC   = 0x41_4D_49_44; // "AMID"
const AMID_VERSION = 1;

const KIND = {
    noteOn            : 1,
    noteOff           : 2,
    cc                : 3,
    pitchBend         : 4,
    pressure          : 5,
    programChange     : 6,
    perNoteExpression : 7,
    tempo             : 8,
    timeSignature     : 9,
    meta              : 10,
} as const;

const KIND_TO_TYPE: Record<number, MidiEvent['type']> = {
    1: 'noteOn',
    2: 'noteOff',
    3: 'cc',
    4: 'pitchBend',
    5: 'pressure',
    6: 'programChange',
    7: 'perNoteExpression',
    8: 'tempo',
    9: 'timeSignature',
    10: 'meta',
};

class _W {
    buf: number[] = [];
    u8 (v: number) { this.buf.push(v & 0xFF); }
    u16(v: number) { this.buf.push((v >> 8) & 0xFF, v & 0xFF); }
    u32(v: number) { this.buf.push((v >>> 24) & 0xFF, (v >>> 16) & 0xFF, (v >>> 8) & 0xFF, v & 0xFF); }
    i16(v: number) { const u = v < 0 ? v + 0x10000 : v; this.u16(u); }
    i32(v: number) { const u = v < 0 ? v + 0x1_0000_0000 : v; this.u32(u); }
    /** Variable-length encoding (SMF-style, 7 bits per byte, MSB = continuation). */
    vlq(v: number) {
        if (v < 0) v = 0;
        const out: number[] = [v & 0x7F];
        v >>>= 7;
        while (v > 0) {
            out.unshift((v & 0x7F) | 0x80);
            v >>>= 7;
        }
        for (const b of out) this.u8(b);
    }
    str(s: string) {
        const bytes = new TextEncoder().encode(s);
        this.u8(bytes.length);
        for (const b of bytes) this.u8(b);
    }
    bytes(arr: ArrayLike<number>) { for (let i = 0; i < arr.length; i++) this.u8(arr[i]); }
    toUint8Array(): Uint8Array { return new Uint8Array(this.buf); }
}

class _R {
    constructor(public src: Uint8Array, public pos = 0) {}
    u8 (): number { return this.src[this.pos++]; }
    u16(): number { return (this.u8() << 8) | this.u8(); }
    u32(): number { return ((this.u8() << 24) >>> 0) + (this.u8() << 16) + (this.u8() << 8) + this.u8(); }
    i16(): number { const u = this.u16(); return u >= 0x8000 ? u - 0x10000 : u; }
    i32(): number { const u = this.u32(); return u >= 0x80000000 ? u - 0x1_0000_0000 : u; }
    vlq(): number {
        let v = 0;
        let b: number;
        do {
            b = this.u8();
            v = (v << 7) | (b & 0x7F);
        } while (b & 0x80);
        return v;
    }
    str(): string {
        const len = this.u8();
        const slice = this.src.slice(this.pos, this.pos + len);
        this.pos += len;
        return new TextDecoder().decode(slice);
    }
}

function _writeEvent(w: _W, e: MidiEvent, prevTime: number): number {
    const delta = Math.max(0, Math.floor(e.time - prevTime));
    w.vlq(delta);

    switch (e.type) {
        case 'noteOn':
            w.u8(KIND.noteOn);
            w.u8(e.channel & 0xFF);
            w.u8(e.pitch   & 0xFF);
            w.u16(e.velocity & 0xFFFF);
            w.str(e.noteId);
            w.i16(Math.round(e.pitchBend ?? 0));
            w.u16(e.timbre   ?? 0);
            break;
        case 'noteOff':
            w.u8(KIND.noteOff);
            w.u8(e.channel & 0xFF);
            w.u8(e.pitch   & 0xFF);
            w.u16(e.velocity & 0xFFFF);
            w.str(e.noteId);
            break;
        case 'cc':
            w.u8(KIND.cc);
            w.u8(e.channel & 0xFF);
            w.u16(e.control & 0xFFFF);
            w.u16(e.value   & 0xFFFF);
            break;
        case 'pitchBend':
            w.u8(KIND.pitchBend);
            w.u8(e.channel & 0xFF);
            w.i32(e.value);
            break;
        case 'pressure':
            w.u8(KIND.pressure);
            w.u8(e.channel & 0xFF);
            w.u8(e.pitch !== undefined ? 1 : 0);
            if (e.pitch !== undefined) {
                w.u8(e.pitch & 0xFF);
                w.str(e.noteId ?? '');
            }
            w.u16(e.value & 0xFFFF);
            break;
        case 'programChange':
            w.u8(KIND.programChange);
            w.u8(e.channel & 0xFF);
            w.u8(e.program & 0xFF);
            w.u16(e.bank   ?? 0);
            break;
        case 'perNoteExpression':
            w.u8(KIND.perNoteExpression);
            w.u8(e.channel & 0xFF);
            w.u8(e.pitch   & 0xFF);
            w.str(e.noteId);
            w.str(e.name);
            // value as float32 (4 bytes)
            const buf = new ArrayBuffer(4);
            new DataView(buf).setFloat32(0, e.value, false);
            w.bytes(new Uint8Array(buf));
            break;
        case 'tempo':
            w.u8(KIND.tempo);
            w.u32(e.uPerQ);
            break;
        case 'timeSignature':
            w.u8(KIND.timeSignature);
            w.u8(e.numerator);
            w.u8(e.denominator);
            break;
        case 'meta':
            w.u8(KIND.meta);
            w.str(e.name);
            w.str(e.value);
            break;
    }
    return e.time;
}

function _readEvent(r: _R, prevTime: number): MidiEvent {
    const delta = r.vlq();
    const time  = prevTime + delta;
    const kind  = r.u8();
    const type  = KIND_TO_TYPE[kind];

    switch (type) {
        case 'noteOn': {
            const channel  = r.u8();
            const pitch    = r.u8();
            const velocity = r.u16();
            const noteId   = r.str();
            const pitchBend = r.i16();
            const timbre   = r.u16();
            const ev: NoteOnEvent = { type, time, channel, pitch, velocity, noteId };
            if (pitchBend !== 0) ev.pitchBend = pitchBend;
            if (timbre !== 0)    ev.timbre   = timbre;
            return ev;
        }
        case 'noteOff': {
            const channel  = r.u8();
            const pitch    = r.u8();
            const velocity = r.u16();
            const noteId   = r.str();
            return { type, time, channel, pitch, velocity, noteId };
        }
        case 'cc': {
            const channel = r.u8();
            const control = r.u16();
            const value   = r.u16();
            return { type, time, channel, control, value };
        }
        case 'pitchBend': {
            const channel = r.u8();
            const value   = r.i32();
            return { type, time, channel, value };
        }
        case 'pressure': {
            const channel = r.u8();
            const hasNote = r.u8();
            let noteId: string | undefined;
            let pitch : number | undefined;
            if (hasNote) {
                pitch  = r.u8();
                noteId = r.str();
            }
            const value = r.u16();
            const ev: PressureEvent = { type, time, channel, value };
            if (noteId !== undefined) ev.noteId = noteId;
            if (pitch  !== undefined) ev.pitch  = pitch;
            return ev;
        }
        case 'programChange': {
            const channel = r.u8();
            const program = r.u8();
            const bank    = r.u16();
            const ev: ProgramChangeEvent = { type, time, channel, program };
            if (bank !== 0) ev.bank = bank;
            return ev;
        }
        case 'perNoteExpression': {
            const channel = r.u8();
            const pitch   = r.u8();
            const noteId  = r.str();
            const name    = r.str();
            const slice = r.src.slice(r.pos, r.pos + 4);
            r.pos += 4;
            const value = new DataView(slice.buffer, slice.byteOffset, 4).getFloat32(0, false);
            return { type, time, channel, noteId, pitch, name, value };
        }
        case 'tempo':
            return { type, time, uPerQ: r.u32() };
        case 'timeSignature':
            return { type, time, numerator: r.u8(), denominator: r.u8() };
        case 'meta':
            return { type, time, name: r.str(), value: r.str() };
        default:
            throw new Error('Unknown event kind: ' + kind);
    }
}

// ── Public binary I/O ─────────────────────────────────────────────────────────

/** Serialise a MidiSong to the AMID binary format. */
export function writeBinary(song: MidiSong): Uint8Array {
    const w = new _W();
    // Header
    w.u32(AMID_MAGIC);
    w.u16(AMID_VERSION);
    w.u16(0); // flags reserved
    // Songmeta
    w.u32(song.uPerQ);
    w.u16(song.ppq);
    w.u8(song.timeSignature[0]);
    w.u8(song.timeSignature[1]);
    w.str(song.title  ?? '');
    w.str(song.author ?? '');
    // Tracks
    w.u16(song.tracks.length);
    for (const tr of song.tracks) {
        w.str(tr.id);
        w.str(tr.name);
        w.u8(tr.channel & 0xFF);
        w.str(tr.color ?? '');
        w.u32(tr.events.length);
        let prev = 0;
        for (const ev of tr.events) prev = _writeEvent(w, ev, prev);
    }
    return w.toUint8Array();
}

/** Parse an AMID binary blob back into a MidiSong. */
export function readBinary(bytes: Uint8Array): MidiSong {
    const r = new _R(bytes);
    const magic = r.u32();
    if (magic !== AMID_MAGIC) throw new Error('AMID: bad magic');
    const version = r.u16();
    if (version !== AMID_VERSION) throw new Error('AMID: unsupported version ' + version);
    r.u16(); // flags

    const uPerQ = r.u32();
    const ppq   = r.u16();
    const num   = r.u8();
    const den   = r.u8();
    const title  = r.str();
    const author = r.str();

    const trackCount = r.u16();
    const tracks: MidiTrack[] = [];
    for (let i = 0; i < trackCount; i++) {
        const id      = r.str();
        const name    = r.str();
        const channel = r.u8();
        const color   = r.str();
        const evCount = r.u32();
        const events: MidiEvent[] = [];
        let prev = 0;
        for (let j = 0; j < evCount; j++) {
            const ev = _readEvent(r, prev);
            events.push(ev);
            prev = ev.time;
        }
        const tr: MidiTrack = { id, name, channel, events };
        if (color) tr.color = color;
        tracks.push(tr);
    }

    const song: MidiSong = {
        $schema: 'arianna.io/midi/v1',
        uPerQ, ppq, timeSignature: [num, den], tracks,
    };
    if (title)  song.title  = title;
    if (author) song.author = author;
    return song;
}

// ── Default export ────────────────────────────────────────────────────────────

export const Midi = {
    Engine: MidiEngine,
    writeBinary,
    readBinary,
    noteToFreq,
    noteToName,
    nameToNote,
};

export default Midi;

if (typeof window !== 'undefined') {
    try { delete (window as any).Midi; } catch {}
    try { (window as any).Midi = Midi; } catch {}
}
