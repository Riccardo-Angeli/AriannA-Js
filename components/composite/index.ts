/**
 * @module    components/composite
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Composite widgets — full-featured complex UIs combining many primitives.
 *
 *   • NodeEditor  — generic node-graph editor with palette + canvas + wires
 *                   (backbone of Daedalus visual composer)
 *   • Chat        — WhatsApp / Signal-style chat (sidebar + thread + composer)
 *   • CodeEditor  — pure-AriannA code editor: syntax highlight, line numbers,
 *                   indent, ctrl+D duplicate, ctrl+/ comment, auto-brackets,
 *                   alt-up/down move lines. Languages: js/ts/jsx/tsx/html/css/json.
 *
 *   import { NodeEditor, Chat, CodeEditor } from 'arianna/components/composite';
 */

export { NodeEditor } from './NodeEditor.ts';
export type {
    NodeEditorOptions, NodeSchema, NodeInstance, WireInstance,
    PortSpec, ParamSpec, RunState, WireStatus, TypeCheckFn,
} from './NodeEditor.ts';

export { Chat } from './Chat.ts';
export type {
    ChatOptions, ChatConversation, ChatMessage, ChatUser, MessageStatus,
} from './Chat.ts';

export { CodeEditor } from './CodeEditor.ts';
export type { CodeEditorOptions, CodeEditorLanguage } from './CodeEditor.ts';
