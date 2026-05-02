/**
 * @module    arianna-audio
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * AriannA audio components — MIDI editors, sequencers, audio visualizers.
 *
 * @example
 *   import { PianoRoll } from 'ariannajs/components/audio';
 *
 *   const pr = new PianoRoll('#root', { bpm: 120 });
 *   pr.on('midi', evt => mySynth.send(evt));
 */

export { PianoRoll } from './PianoRoll.ts';
export type {
    PianoRollNote,
    PianoRollOptions,
    ExportedSequence,
    MidiEvent,
    Tool,
    RunState,
} from './PianoRoll.ts';
