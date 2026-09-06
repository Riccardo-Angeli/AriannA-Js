/**
 * @module components/composite
 * @description AriannA composite components barrel.
 */

export { Chat } from './Chat.ts';
export type { ChatOptions, ChatConversation, ChatMessage, ChatUser, MessageStatus } from './Chat.ts';

export { CodeEditor } from './CodeEditor.ts';
export type { CodeEditorOptions, CodeEditorLanguage, CodeEditorTheme } from './CodeEditor.ts';

// Workflow is the canonical product name. NodeEditor remains a compatibility export.
export { NodeEditor, Workflow } from './Workflow.ts';
export type {
    WorkflowOptions, NodeEditorOptions, NodeSchema, NodeInstance, WireInstance,
    PortSpec, ParamSpec, RunState, WireStatus, TypeCheckFn
} from './Workflow.ts';

import ChatClass from './Chat.ts';
import { CodeEditor as CodeEditorNamespace } from './CodeEditor.ts';
import WorkflowClass from './Workflow.ts';

export const CompositeComponents = Object.freeze({
    Chat: ChatClass,
    CodeEditor: CodeEditorNamespace.CodeEditor,
    Workflow: WorkflowClass,
    NodeEditor: WorkflowClass,
});

export default CompositeComponents;
