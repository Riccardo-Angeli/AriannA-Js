import { Core }    from "./Core.ts";

/** @namespace   Events
 *  @memberof    Core
 *  @description `Events` and its types under one namespace. Synchronous, multi-target,
 *               multi-type DOM event helpers as static methods on the `Events` class. A
 *               preflight map (`Events.Types`, the canonical W3C-Level-3 keyword → interface
 *               table ported from the legacy engine) validates keywords in On/Off and lets Fire
 *               construct the correct Event subtype. For the AriannA pub/sub bus use Observable.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license)
 */
export namespace Events
{
    /** @typedef     NativeEvent
     *  @memberof    Core.Events
     *  @type        {globalThis.Event}
     *  @description Alias for the native DOM `Event`. The local `Event` class shadows the global, so
     *               wherever the native event type is meant (e.g. the value handed to a listener, or a
     *               `#build` result) this alias is used instead of `Event`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type NativeEvent = globalThis.Event;
    /** @name        Target
     *  @public
     *  @type        {EventTarget | string | EventTarget[]}
     *  @description A target the bus accepts: an EventTarget, a CSS selector string, or a list
     *               of targets.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type Target      = EventTarget | string | readonly EventTarget[];
    /** @typedef     Phase
     *  @memberof    Core.Events
     *  @type        {'capture' | 'bubble' | 'broker'}
     *  @description Propagation mode of a listener / dispatch. `capture` and `bubble` follow the node
     *               tree (via `Parent`); `broker` follows a custom `Broker` jump (`Brokers[label]`),
     *               enabling tree-skipping independent of the DOM hierarchy.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export type Phase       = 'capture' | 'bubble' | 'broker';

    /** @interface   EventType
     *  @memberof    Core.Events
     *  @description A preflight-table entry. `Name`: the canonical event name. `Interface`: the
     *               *name* (string) of its DOM Event interface — stored as a string so a missing
     *               or non-constructable type can never break the build.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export interface EventType
    {
        Name:       string;
        Interface:  string;
        Domain:     string;
        Category:   string;
        State:      string;
        Lifecycle?: boolean;
        CE?:        string | false;
    }

    /** @name        Types
     *  @public
     *  @static
     *  @readonly
     *  @type        {Readonly<Record<string, TypeSpec>>}
     *  @description Authoritative preflight table: every W3C-Level-3 event keyword → its
     *               canonical name and the *name* of its DOM Event interface (kept as a
     *               string so a missing/non-constructable interface, e.g. the deprecated
     *               MutationEvent, can never break the build or the runtime). Validates
     *               keywords (On/Off) and builds the right Event subtype (Fire). Ported from
     *               the legacy Component.Events.Types.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *///Interface: '$1Event',$2Domain: 'DOM', Category: '$1',
    export namespace Types
    {
        export const DOM: Readonly<Record<string, EventType>> = Object.freeze
        (
            {
                // ── W3C Standard & Modern Events ──────────────────────────────────────────
                click:                           { Name: 'click',                           Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                dblclick:                        { Name: 'dblclick',                        Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mouseenter:                      { Name: 'mouseenter',                      Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mouseleave:                      { Name: 'mouseleave',                      Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mousemove:                       { Name: 'mousemove',                       Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mouseout:                        { Name: 'mouseout',                        Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mouseover:                       { Name: 'mouseover',                       Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mouseup:                         { Name: 'mouseup',                         Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mousedown:                       { Name: 'mousedown',                       Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                mousewheel:                      { Name: 'mousewheel',                      Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Deprecated',Lifecycle: false, CE: false                      },
                contextmenu:                     { Name: 'contextmenu',                     Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                    State: 'Active',    Lifecycle: false, CE: false                      },
                wheel:                           { Name: 'wheel',                           Interface: 'WheelEvent',                   Domain: 'DOM', Category: 'Wheel',                    State: 'Active',    Lifecycle: false, CE: false                      },

                // ── Drag & Drop Events ──────────────────────────────────────────────────
                drag:                            { Name: 'drag',                            Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragend:                         { Name: 'dragend',                         Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragenter:                       { Name: 'dragenter',                       Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragleave:                       { Name: 'dragleave',                       Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragover:                        { Name: 'dragover',                        Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragstart:                       { Name: 'dragstart',                       Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                drop:                            { Name: 'drop',                            Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Active',     Lifecycle: false, CE: false                      },
                dragdrop:                        { Name: 'dragdrop',                        Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Deprecated', Lifecycle: false, CE: false                      },
                dragexit:                        { Name: 'dragexit',                        Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Deprecated', Lifecycle: false, CE: false                      },
                draggesture:                     { Name: 'draggesture',                     Interface: 'DragEvent',                    Domain: 'DOM', Category: 'Drag',                    State: 'Deprecated', Lifecycle: false, CE: false                      },

                // ── Keyboard Events ─────────────────────────────────────────────────────
                keypress:                        { Name: 'keypress',                        Interface: 'KeyboardEvent',                Domain: 'DOM', Category: 'Keyboard',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                keydown:                         { Name: 'keydown',                         Interface: 'KeyboardEvent',                Domain: 'DOM', Category: 'Keyboard',                State: 'Active',     Lifecycle: false, CE: false                      },
                keyup:                           { Name: 'keyup',                           Interface: 'KeyboardEvent',                Domain: 'DOM', Category: 'Keyboard',                State: 'Active',     Lifecycle: false, CE: false                      },

                // ── Animation & Transition Events ───────────────────────────────────────
                animationstart:                  { Name: 'animationstart',                  Interface: 'AnimationEvent',               Domain: 'DOM', Category: 'Animation',               State: 'Active',     Lifecycle: false, CE: false                      },
                animationend:                    { Name: 'animationend',                    Interface: 'AnimationEvent',               Domain: 'DOM', Category: 'Animation',               State: 'Active',     Lifecycle: false, CE: false                      },
                animationiteration:              { Name: 'animationiteration',              Interface: 'AnimationEvent',               Domain: 'DOM', Category: 'Animation',               State: 'Active',     Lifecycle: false, CE: false                      },
                transitionend:                   { Name: 'transitionend',                   Interface: 'TransitionEvent',              Domain: 'DOM', Category: 'Transition',              State: 'Active',     Lifecycle: false, CE: false                      },
                transitionstart:                 { Name: 'transitionstart',                 Interface: 'TransitionEvent',              Domain: 'DOM', Category: 'Transition',              State: 'Active',     Lifecycle: false, CE: false                      },

                // ── UI & Focus Events ───────────────────────────────────────────────────
                abort:                           { Name: 'abort',                           Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                DOMActivate:                     { Name: 'DOMActivate',                     Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Deprecated', Lifecycle: false, CE: false                      },
                error:                           { Name: 'error',                           Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                load:                            { Name: 'load',                            Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                resize:                          { Name: 'resize',                          Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                scroll:                          { Name: 'scroll',                          Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                select:                          { Name: 'select',                          Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Active',     Lifecycle: false, CE: false                      },
                unload:                          { Name: 'unload',                          Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozScrolledAreaChanged:          { Name: 'MozScrolledAreaChanged',          Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Deprecated', Lifecycle: false, CE: false                      },
                overflow:                        { Name: 'overflow',                        Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Deprecated', Lifecycle: false, CE: false                      },
                underflow:                       { Name: 'underflow',                       Interface: 'UIEvent',                      Domain: 'DOM', Category: 'UI',                      State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMFocusIn:                      { Name: 'DOMFocusIn',                      Interface: 'FocusEvent',                   Domain: 'DOM', Category: 'Focus',                   State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMFocusOut:                     { Name: 'DOMFocusOut',                     Interface: 'FocusEvent',                   Domain: 'DOM', Category: 'Focus',                   State: 'Deprecated', Lifecycle: false, CE: false                      },
                focusin:                         { Name: 'focusin',                         Interface: 'FocusEvent',                   Domain: 'DOM', Category: 'Focus',                   State: 'Active',     Lifecycle: false, CE: false                      },
                focusout:                        { Name: 'focusout',                        Interface: 'FocusEvent',                   Domain: 'DOM', Category: 'Focus',                   State: 'Active',     Lifecycle: false, CE: false                      },

                // ── Mutation Events (DOM Level 2) ───────────────────────────────────────
                DOMAttrModified:                 { Name: 'DOMAttrModified',                 Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMCharacterDataModified:        { Name: 'DOMCharacterDataModified',        Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMNodeInserted:                 { Name: 'DOMNodeInserted',                 Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMNodeInsertedIntoDocument:     { Name: 'DOMNodeInsertedIntoDocument',     Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMNodeRemoved:                  { Name: 'DOMNodeRemoved',                  Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMNodeRemovedFromDocument:      { Name: 'DOMNodeRemovedFromDocument',      Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMSubtreeModified:              { Name: 'DOMSubtreeModified',              Interface: 'MutationEvent',                Domain: 'DOM', Category: 'Mutation',                State: 'Deprecated', Lifecycle: false, CE: false                      },

                // ── Clipboard & Composition Events ──────────────────────────────────────
                cut:                             { Name: 'cut',                             Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Active',     Lifecycle: false, CE: false                      },
                copy:                            { Name: 'copy',                            Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Active',     Lifecycle: false, CE: false                      },
                paste:                           { Name: 'paste',                           Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Active',     Lifecycle: false, CE: false                      },
                beforecopy:                      { Name: 'beforecopy',                      Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Deprecated', Lifecycle: false, CE: false                      },
                beforecut:                       { Name: 'beforecut',                       Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Deprecated', Lifecycle: false, CE: false                      },
                beforepaste:                     { Name: 'beforepaste',                     Interface: 'ClipboardEvent',               Domain: 'DOM', Category: 'Clipboard',               State: 'Deprecated', Lifecycle: false, CE: false                      },
                compositionstart:                { Name: 'compositionstart',                Interface: 'CompositionEvent',             Domain: 'DOM', Category: 'Composition',             State: 'Active',     Lifecycle: false, CE: false                      },
                compositionupdate:               { Name: 'compositionupdate',               Interface: 'CompositionEvent',             Domain: 'DOM', Category: 'Composition',             State: 'Active',     Lifecycle: false, CE: false                      },
                compositionend:                  { Name: 'compositionend',                  Interface: 'CompositionEvent',             Domain: 'DOM', Category: 'Composition',             State: 'Active',     Lifecycle: false, CE: false                      },

                // ── Form & Input Events ─────────────────────────────────────────────────
                input:                           { Name: 'input',                           Interface: 'InputEvent',                   Domain: 'DOM', Category: 'Input',                   State: 'Active',     Lifecycle: false, CE: false                      },
                change:                          { Name: 'change',                          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                invalid:                         { Name: 'invalid',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                reset:                           { Name: 'reset',                           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                submit:                          { Name: 'submit',                          Interface: 'SubmitEvent',                  Domain: 'DOM', Category: 'Submit',                  State: 'Active',     Lifecycle: false, CE: false                      },
                formdata:                        { Name: 'formdata',                        Interface: 'FormDataEvent',                Domain: 'DOM', Category: 'FormData',                State: 'Active',     Lifecycle: false, CE: false                      },
                beforeinput:                     { Name: 'beforeinput',                     Interface: 'InputEvent',                   Domain: 'DOM', Category: 'Input',                   State: 'Active',     Lifecycle: false, CE: false                      },

                // ── Media & Resource Events ─────────────────────────────────────────────
                afterprint:                      { Name: 'afterprint',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                beforeprint:                     { Name: 'beforeprint',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                cached:                          { Name: 'cached',                          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                canplay:                         { Name: 'canplay',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                canplaythrough:                  { Name: 'canplaythrough',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                chargingchange:                  { Name: 'chargingchange',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                chargingtimechange:              { Name: 'chargingtimechange',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                dischargingtimechange:           { Name: 'dischargingtimechange',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMContentLoaded:                { Name: 'DOMContentLoaded',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                checking:                        { Name: 'checking',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                downloading:                     { Name: 'downloading',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                durationchange:                  { Name: 'durationchange',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                emptied:                         { Name: 'emptied',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                ended:                           { Name: 'ended',                           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                fullscreenchange:                { Name: 'fullscreenchange',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                fullscreenerror:                 { Name: 'fullscreenerror',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                languagechange:                  { Name: 'languagechange',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                levelchange:                     { Name: 'levelchange',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                loadeddata:                      { Name: 'loadeddata',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                loadedmetadata:                  { Name: 'loadedmetadata',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                noupdate:                        { Name: 'noupdate',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                obsolete:                        { Name: 'obsolete',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                offline:                         { Name: 'offline',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                online:                          { Name: 'online',                          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                open:                            { Name: 'open',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                orientationchange:               { Name: 'orientationchange',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                pause:                           { Name: 'pause',                           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                pointerlockchange:               { Name: 'pointerlockchange',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                pointerlockerror:                { Name: 'pointerlockerror',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                play:                            { Name: 'play',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                playing:                         { Name: 'playing',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                ratechange:                      { Name: 'ratechange',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                readystatechange:                { Name: 'readystatechange',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                seeked:                          { Name: 'seeked',                          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                seeking:                         { Name: 'seeking',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                stalled:                         { Name: 'stalled',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                success:                         { Name: 'success',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                suspend:                         { Name: 'suspend',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                timeupdate:                      { Name: 'timeupdate',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                updateready:                     { Name: 'updateready',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                visibilitychange:                { Name: 'visibilitychange',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                volumechange:                    { Name: 'volumechange',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                waiting:                         { Name: 'waiting',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                afterscriptexecute:              { Name: 'afterscriptexecute',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                beforescriptexecute:             { Name: 'beforescriptexecute',             Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozAudioAvailable:               { Name: 'MozAudioAvailable',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                hashchange:                      { Name: 'hashchange',                      Interface: 'HashChangeEvent',              Domain: 'DOM', Category: 'HashChange',              State: 'Active',     Lifecycle: false, CE: false                      },
                gamepadconnected:                { Name: 'gamepadconnected',                Interface: 'GamepadEvent',                 Domain: 'DOM', Category: 'Gamepad',                 State: 'Active',     Lifecycle: false, CE: false                      },
                gamepaddisconnected:             { Name: 'gamepaddisconnected',             Interface: 'GamepadEvent',                 Domain: 'DOM', Category: 'Gamepad',                 State: 'Active',     Lifecycle: false, CE: false                      },
                loadend:                         { Name: 'loadend',                         Interface: 'ProgressEvent',                Domain: 'DOM', Category: 'Progress',                State: 'Active',     Lifecycle: false, CE: false                      },
                loadstart:                       { Name: 'loadstart',                       Interface: 'ProgressEvent',                Domain: 'DOM', Category: 'Progress',                State: 'Active',     Lifecycle: false, CE: false                      },
                progress:                        { Name: 'progress',                        Interface: 'ProgressEvent',                Domain: 'DOM', Category: 'Progress',                State: 'Active',     Lifecycle: false, CE: false                      },
                timeout:                         { Name: 'timeout',                         Interface: 'ProgressEvent',                Domain: 'DOM', Category: 'Progress',                State: 'Active',     Lifecycle: false, CE: false                      },
                uploadprogress:                  { Name: 'uploadprogress',                  Interface: 'ProgressEvent',                Domain: 'DOM', Category: 'Progress',                State: 'Deprecated', Lifecycle: false, CE: false                      },

                // ── Touch & Pointer Events ──────────────────────────────────────────────
                touchcancel:                     { Name: 'touchcancel',                     Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                touchend:                        { Name: 'touchend',                        Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                touchenter:                      { Name: 'touchenter',                      Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                touchleave:                      { Name: 'touchleave',                      Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                touchmove:                       { Name: 'touchmove',                       Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                touchstart:                      { Name: 'touchstart',                      Interface: 'TouchEvent',                   Domain: 'DOM', Category: 'Touch',                   State: 'Active',     Lifecycle: false, CE: false                      },
                gotpointercapture:               { Name: 'gotpointercapture',               Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                lostpointercapture:              { Name: 'lostpointercapture',              Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointercancel:                   { Name: 'pointercancel',                   Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerdown:                     { Name: 'pointerdown',                     Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerenter:                    { Name: 'pointerenter',                    Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerleave:                    { Name: 'pointerleave',                    Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointermove:                     { Name: 'pointermove',                     Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerout:                      { Name: 'pointerout',                      Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerover:                     { Name: 'pointerover',                     Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerup:                       { Name: 'pointerup',                       Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },
                pointerrawupdate:                { Name: 'pointerrawupdate',                Interface: 'PointerEvent',                 Domain: 'DOM', Category: 'Pointer',                 State: 'Active',     Lifecycle: false, CE: false                      },

                // ── WebGL & Context Events ──────────────────────────────────────────────
                webglcontextlost:                { Name: 'webglcontextlost',                Interface: 'WebGLContextEvent',            Domain: 'DOM', Category: 'WebGLContext',            State: 'Active',     Lifecycle: false, CE: false                      },
                webglcontextrestored:            { Name: 'webglcontextrestored',            Interface: 'WebGLContextEvent',            Domain: 'DOM', Category: 'WebGLContext',            State: 'Active',     Lifecycle: false, CE: false                      },
                webglcontextcreationerror:       { Name: 'webglcontextcreationerror',       Interface: 'WebGLContextEvent',            Domain: 'DOM', Category: 'WebGLContext',            State: 'Active',     Lifecycle: false, CE: false                      },

                // ── New/Missing Standard Events (2026 Baseline) ─────────────────────────
                beforetoggle:                    { Name: 'beforetoggle',                    Interface: 'ToggleEvent',                  Domain: 'DOM', Category: 'Toggle',                  State: 'Active',     Lifecycle: false, CE: false                      },
                toggle:                          { Name: 'toggle',                          Interface: 'ToggleEvent',                  Domain: 'DOM', Category: 'Toggle',                  State: 'Active',     Lifecycle: false, CE: false                      },
                securitypolicyviolation:         { Name: 'securitypolicyviolation',         Interface: 'SecurityPolicyViolationEvent', Domain: 'DOM', Category: 'SecurityPolicyViolation', State: 'Active',     Lifecycle: false, CE: false                      },
                scrollend:                       { Name: 'scrollend',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },
                auxclick:                        { Name: 'auxclick',                        Interface: 'MouseEvent',                   Domain: 'DOM', Category: 'Mouse',                   State: 'Active',     Lifecycle: false, CE: false                      },
                beforexrselect:                  { Name: 'beforexrselect',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Active',     Lifecycle: false, CE: false                      },

                // ── Legacy/Vendor Specific (Maintained for Parity) ──────────────────────
                alerting:                        { Name: 'alerting',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                busy:                            { Name: 'busy',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                callschanged:                    { Name: 'callschanged',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                connected:                       { Name: 'connected',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                connecting:                      { Name: 'connecting',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                dialing:                         { Name: 'dialing',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                held:                            { Name: 'held',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                holding:                         { Name: 'holding',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                incoming:                        { Name: 'incoming',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                resuming:                        { Name: 'resuming',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                statechange:                     { Name: 'statechange',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                disconnecting:                   { Name: 'disconnecting',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                disconnected:                    { Name: 'disconnected',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                delivered:                       { Name: 'delivered',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                received:                        { Name: 'received',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                sent:                            { Name: 'sent',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                compassneedscalibration:         { Name: 'compassneedscalibration',         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                pagehide:                        { Name: 'pagehide',                        Interface: 'PageTransitionEvent',          Domain: 'DOM', Category: 'PageTransition',          State: 'Active',     Lifecycle: false, CE: false                      },
                pageshow:                        { Name: 'pageshow',                        Interface: 'PageTransitionEvent',          Domain: 'DOM', Category: 'PageTransition',          State: 'Active',     Lifecycle: false, CE: false                      },
                SVGAbort:                        { Name: 'SVGAbort',                        Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGError:                        { Name: 'SVGError',                        Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGLoad:                         { Name: 'SVGLoad',                         Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGResize:                       { Name: 'SVGResize',                       Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGScroll:                       { Name: 'SVGScroll',                       Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGUnload:                       { Name: 'SVGUnload',                       Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                SVGZoom:                         { Name: 'SVGZoom',                         Interface: 'SVGEvent',                     Domain: 'DOM', Category: 'SVG',                     State: 'Deprecated', Lifecycle: false, CE: false                      },
                storage:                         { Name: 'storage',                         Interface: 'StorageEvent',                 Domain: 'DOM', Category: 'Storage',                 State: 'Active',     Lifecycle: false, CE: false                      },
                beginEvent:                      { Name: 'beginEvent',                      Interface: 'TimeEvent',                    Domain: 'DOM', Category: 'Time',                    State: 'Deprecated', Lifecycle: false, CE: false                      },
                endEvent:                        { Name: 'endEvent',                        Interface: 'TimeEvent',                    Domain: 'DOM', Category: 'Time',                    State: 'Deprecated', Lifecycle: false, CE: false                      },
                repeatEvent:                     { Name: 'repeatEvent',                     Interface: 'TimeEvent',                    Domain: 'DOM', Category: 'Time',                    State: 'Deprecated', Lifecycle: false, CE: false                      },
                popstate:                        { Name: 'popstate',                        Interface: 'PopStateEvent',                Domain: 'DOM', Category: 'PopState',                State: 'Active',     Lifecycle: false, CE: false                      },
                message:                         { Name: 'message',                         Interface: 'MessageEvent',                 Domain: 'DOM', Category: 'Message',                 State: 'Active',     Lifecycle: false, CE: false                      },
                upgradeneeded:                   { Name: 'upgradeneeded',                   Interface: 'IDBVersionChangeEvent',        Domain: 'DOM', Category: 'IDBVersionChange',        State: 'Active',     Lifecycle: false, CE: false                      },
                versionchange:                   { Name: 'versionchange',                   Interface: 'IDBVersionChangeEvent',        Domain: 'DOM', Category: 'IDBVersionChange',        State: 'Active',     Lifecycle: false, CE: false                      },
                cardstatechange:                 { Name: 'cardstatechange',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                connectionInfoUpdate:            { Name: 'connectionInfoUpdate',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                cfstatechange:                   { Name: 'cfstatechange',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                datachange:                      { Name: 'datachange',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                dataerror:                       { Name: 'dataerror',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMMouseScroll:                  { Name: 'DOMMouseScroll',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                icccardlockerror:                { Name: 'icccardlockerror',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                iccinfochange:                   { Name: 'iccinfochange',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                localized:                       { Name: 'localized',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozBeforeResize:                 { Name: 'MozBeforeResize',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowserclose:                 { Name: 'mozbrowserclose',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsercontextmenu:           { Name: 'mozbrowsercontextmenu',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsererror:                 { Name: 'mozbrowsererror',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsericonchange:            { Name: 'mozbrowsericonchange',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowserlocationchange:        { Name: 'mozbrowserlocationchange',        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowserloadend:               { Name: 'mozbrowserloadend',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowserloadstart:             { Name: 'mozbrowserloadstart',             Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowseropenwindow:            { Name: 'mozbrowseropenwindow',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsersecuritychange:        { Name: 'mozbrowsersecuritychange',        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsershowmodalprompt:       { Name: 'mozbrowsershowmodalprompt',       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mozbrowsertitlechange:           { Name: 'mozbrowsertitlechange',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozGamepadButtonDown:            { Name: 'MozGamepadButtonDown',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozGamepadButtonUp:              { Name: 'MozGamepadButtonUp',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozMousePixelScroll:             { Name: 'MozMousePixelScroll',             Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozOrientation:                  { Name: 'MozOrientation',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                moztimechange:                   { Name: 'moztimechange',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozTouchDown:                    { Name: 'MozTouchDown',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozTouchMove:                    { Name: 'MozTouchMove',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozTouchUp:                      { Name: 'MozTouchUp',                      Interface: 'Event',                        Domain: 'Moz', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                disabled:                        { Name: 'disabled',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                enabled:                         { Name: 'enabled',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                statuschange:                    { Name: 'statuschange',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                smartcardInsert:                 { Name: 'smartcard-insert',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                smartcardRemove:                 { Name: 'smartcard-remove',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                stkcommand:                      { Name: 'stkcommand',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                stksessionend:                   { Name: 'stksessionend',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                text:                            { Name: 'text',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                ussdreceived:                    { Name: 'ussdreceived',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                voicechange:                     { Name: 'voicechange',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                broadcast:                       { Name: 'broadcast',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                CheckboxStateChange:             { Name: 'CheckboxStateChange',             Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                command:                         { Name: 'command',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                commandupdate:                   { Name: 'commandupdate',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMMenuItemActive:               { Name: 'DOMMenuItemActive',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMMenuItemInactive:             { Name: 'DOMMenuItemInactive',             Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                RadioStateChange:                { Name: 'RadioChange',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                ValueChange:                     { Name: 'ValueChange',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozSwipeGesture:                 { Name: 'MozSwipeGesture',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozMagnifyGestureStart:          { Name: 'MozMagnifyGestureStart',          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozMagnifyGestureUpdate:         { Name: 'MozMagnifyGestureUpdate',         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozMagnifyGesture:               { Name: 'MozMagnifyGesture',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozRotateGestureStart:           { Name: 'MozRotateGestureStart',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozRotateGestureUpdate:          { Name: 'MozRotateGestureUpdate',          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozRotateGesture:                { Name: 'MozRotateGesture',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozTapGesture:                   { Name: 'MozTapGesture',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozPressTapGesture:              { Name: 'MozPressTapGesture',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozEdgeUIGesture:                { Name: 'MozEdgeUIGesture',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozAfterPaint:                   { Name: 'MozAfterPaint',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMPopupBlocked:                 { Name: 'DOMPopupBlocked',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMWindowCreated:                { Name: 'DOMWindowCreated',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMWindowClose:                  { Name: 'DOMWindowClose',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMTitleChanged:                 { Name: 'DOMTitleChanged',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMLinkAdded:                    { Name: 'DOMLinkAdded',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMLinkRemoved:                  { Name: 'DOMLinkRemoved',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMMetaAdded:                    { Name: 'DOMMetaAdded',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMMetaRemoved:                  { Name: 'DOMMetaRemoved',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMWillOpenModalDialog:          { Name: 'DOMWillOpenModalDialog',          Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMModalDialogClosed:            { Name: 'DOMModalDialogClosed',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMAutoComplete:                 { Name: 'DOMAutoComplete',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                DOMFrameContentLoaded:           { Name: 'DOMFrameContentLoaded',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                AlertActive:                     { Name: 'AlertActive',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MozEnteredDomFullscreen:         { Name: 'MozEnteredDomFullscreen',         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSWindowClosing:                 { Name: 'SSWindowClosing',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSTabClosing:                    { Name: 'SSTabClosing',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSTabRestoring:                  { Name: 'SSTabRestoring',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSTabRestored:                   { Name: 'SSTabRestored',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSWindowStateReady:              { Name: 'SSWindowReady',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                SSWindowStateBusy:               { Name: 'SSWindowBusy',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                tabviewsearchenabled:            { Name: 'tabviewsearchenabled',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                tabviewsearchdisabled:           { Name: 'tabviewsearchdisabled',           Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                tabviewframeinitialized:         { Name: 'tabviewframeinitialized',         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                tabviewshown:                    { Name: 'tabviewshown',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                tabviewhidden:                   { Name: 'tabviewhidden',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabOpen:                         { Name: 'TabOpen',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabClose:                        { Name: 'TabClose',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabSelect:                       { Name: 'TabSelect',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabShow:                         { Name: 'TabShow',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabHide:                         { Name: 'TabHide',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabPinned:                       { Name: 'TabPinned',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                TabUnpinned:                     { Name: 'TabUnpinned',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                CssRuleViewRefreshed:            { Name: 'CssRuleViewRefreshed',            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                CssRuleViewChanged:              { Name: 'CssRuleViewChanged',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSFullscreenChange:              { Name: 'MSFullscreenChange',              Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSFullscreenError:               { Name: 'MSFullscreenError',               Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSGestureChange:                 { Name: 'MSGestureChange',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSGestureEnd:                    { Name: 'MSGestureEnd',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSGestureHold:                   { Name: 'MSGestureHold',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSGestureStart:                  { Name: 'MSGestureStart',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSGestureTap:                    { Name: 'MSGestureTap',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSInertiaStart:                  { Name: 'MSInertiaStart',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSManipulationStateChanged:      { Name: 'MSManipulationStateChanged',      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                mssitemodejumplistitemremoved:   { Name: 'mssitemodejumplistitemremoved',   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                MSContentZoom:                   { Name: 'MSContentZoom',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                msthumbnailclick:                { Name: 'msthumbnailclick',                Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                deactivate:                      { Name: 'deactivate',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                beforeupdate:                    { Name: 'beforeupdate',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                cellchange:                      { Name: 'cellchange',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                controlselect:                   { Name: 'controlselect',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                dataavailable:                   { Name: 'dataavailable',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                datasetchanged:                  { Name: 'datasetchanged',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                datasetcomplete:                 { Name: 'datasetcomplete',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                errorupdate:                     { Name: 'errorupdate',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                help:                            { Name: 'help',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                layoutcomplete:                  { Name: 'layoutcomplete',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                losecapture:                     { Name: 'losecapture',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                move:                            { Name: 'move',                            Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                moveend:                         { Name: 'moveend',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                movestart:                       { Name: 'movestart',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                propertychange:                  { Name: 'propertychange',                  Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                resizeend:                       { Name: 'resizeend',                       Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                resizestart:                     { Name: 'resizestart',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                rowenter:                        { Name: 'rowenter',                        Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                rowexit:                         { Name: 'rowexit',                         Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                rowsdelete:                      { Name: 'rowsdelete',                      Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                rowsinserted:                    { Name: 'rowsinserted',                    Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                selectionchange:                 { Name: 'selectionchange',                 Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                selectstart:                     { Name: 'selectstart',                     Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      },
                storagecommit:                   { Name: 'storagecommit',                   Interface: 'Event',                        Domain: 'DOM', Category: '',                        State: 'Deprecated', Lifecycle: false, CE: false                      }
            }
        );

        export const AriannA: Readonly<Record<string, EventType>> = Object.freeze
        (
            {
                Defining:                        { Name: 'Defining',                        Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                Defined:                         { Name: 'Defined',                         Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                Creating:                        { Name: 'Creating',                        Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'constructor'              },
                Created:                         { Name: 'Created',                         Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'constructor'              },
                InterfaceLoading:                { Name: 'InterfaceLoading',                Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                InterfaceLoaded:                 { Name: 'InterfaceLoaded',                 Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                NodeLoading:                     { Name: 'NodeLoading',                     Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                NodeLoaded:                      { Name: 'NodeLoaded',                      Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'connectedCallback'        },
                NodeAdding:                      { Name: 'NodeAdding',                      Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                NodeAdded:                       { Name: 'NodeAdded',                       Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                NodeRemoving:                    { Name: 'NodeRemoving',                    Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                NodeRemoved:                     { Name: 'NodeRemoved',                     Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                Connected:                       { Name: 'Connected',                       Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'connectedCallback'        },
                Disconnected:                    { Name: 'Disconnected',                    Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'disconnectedCallback'     },
                Adopted:                         { Name: 'Adopted',                         Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'adoptedCallback'          },
                SlotChange:                      { Name: 'SlotChange',                      Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                AttributeChanging:               { Name: 'AttributeChanging',               Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                AttributeChanged:                { Name: 'AttributeChanged',                Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: 'attributeChangedCallback' },
                PropertyChanging:                { Name: 'PropertyChanging',                Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                PropertyChanged:                 { Name: 'PropertyChanged',                 Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: true,  CE: false                      },
                DocumentLoading:                 { Name: 'DocumentLoading',                 Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: false, CE: false                      },
                DocumentLoaded:                  { Name: 'DocumentLoaded',                  Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: false, CE: false                      },
                Loading:                         { Name: 'Loading',                         Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: false, CE: false                      },
                Loaded:                          { Name: 'Loaded',                          Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: false, CE: false                      },
                Ready:                           { Name: 'Ready',                           Interface: 'CustomEvent',                  Domain: 'AriannA', Category: '',                    State: 'Active',     Lifecycle: false, CE: false                      },
                CssChanging:                     { Name: 'CssChanging',                     Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssChanged:                      { Name: 'CssChanged',                      Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssRuleChanging:                 { Name: 'CssRuleChanging',                 Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssRuleChanged:                  { Name: 'CssRuleChanged',                  Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssStylesheetChanging:           { Name: 'CssStylesheetChanging',           Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssStylesheetChanged:            { Name: 'CssStylesheetChanged',            Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssTransitionChanging:           { Name: 'CssTransitionChanging',           Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
                CssTransitionChanged:            { Name: 'CssTransitionChanged',            Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'CSS',                 State: 'Active',     Lifecycle: false, CE: false                      },
            } as const
        );

        export const Custom: Readonly<Record<string, EventType>> = Object.freeze({});
    }

    /** @interface   Broker
     *  @memberof    Core.Events
     *  @description A node in a custom propagation path (doubly-linked): `Current` is this hop, `Previous`
     *               the incoming hop, `Next` the outgoing one. In `broker` phase the dispatch follows
     *               `Next` forward (bubble-like) and `Previous` backward (capture-like), skipping the DOM
     *               tree. A single `Next` per broker keeps propagation linear.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export interface Broker
    {
        /**
         * @name        Name
         * @public
         * @memberof    Core.Events.Broker
         * @type        {string}
         * @description The broker label — matched against an event's `Broker` label(s).
         * @author      Riccardo Angeli
         * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         * @license     MIT / Commercial (dual license)
         */
        Name     : string;

        /**
         * @name        Current
         * @public
         * @memberof    Core.Events.Broker
         * @type        {Target}
         * @description The current hop — the target this broker edge is anchored on.
         * @author      Riccardo Angeli
         * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         * @license     MIT / Commercial (dual license)
         */
        Current  : Target;

        /**
         * @name        Previous
         * @public
         * @memberof    Core.Events.Broker
         * @type        {Target}
         * @description The previous hop — where the event came from (backward / capture).
         * @author      Riccardo Angeli
         * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         * @license     MIT / Commercial (dual license)
         */
        Previous : Target;

        /**
         * @name        Next
         * @public
         * @memberof    Core.Events.Broker
         * @type        {Target}
         * @description The next hop — where the event jumps to (forward / bubble).
         * @author      Riccardo Angeli
         * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         * @license     MIT / Commercial (dual license)
         */
        Next     : Target;
    }

    /** @interface   EventDescriptor
     *  @memberof    Core.Events
     *  @description The EVENT (SOT). Native `CustomEventInit` is generated from this in `Fire` when DOM.
     *               `Path` accumulates the linear traversed-node sequence; `Broker` is the single active
     *               broker label for this dispatch.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export interface EventDescriptor
    {
        /** @name        Type
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {string}
         *  @description The event type / name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Type         : string;

        /** @name        Cancelable
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {boolean=}
         *  @description Whether a listener may cancel (block) the event via `preventDefault()`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Cancelable?  : boolean;

        /** @name        Propagation
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {boolean=}
         *  @description Whether the event bubbles (maps to native `bubbles` when mirrored to DOM).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Propagation? : boolean;

        /** @name        Detail
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {Record<string, unknown>=}
         *  @description Custom payload; its declared keys are sealed readonly on the dispatched detail.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Detail?      : Record<string, unknown>;

        /** @name        Targets
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {Target=}
         *  @description Default target(s) for the instance wrapper's `fire()`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Targets?     : Target;

        /** @name        Path
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {string[]=}
         *  @description Propagation trace — the linear sequence of traversed node ids, filled once from the
         *               composed chain (`Broker` jump ∪ `Parent`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Path?        : string[];

        /** @name        Broker
         *  @public
         *  @memberof    Core.Events.EventDescriptor
         *  @type        {string=}
         *  @description The single active broker label for this dispatch (e.g. `'Router'`); when set, each
         *               node's `Brokers[label]` is jumped to instead of the tree parent. Absent → tree only.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Broker?      : string;
    }

    /** @interface   EventTargetDescriptor
     *  @memberof    Core.Events
     *  @description The TARGET (SOT): id, listener list, optional DOM `Node`, synthetic `Parent`, the
     *               resolved `Brokers` jump map (label → next descriptor, O(1)), and the per-type DOM
     *               `Intercepted` map funneling native events into the one `#dispatch`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export interface EventTargetDescriptor
    {
        /** @name        Id
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {string}
         *  @description Synthetic id / selector identifying this target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Id           : string;

        /** @name        Listeners
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {ListenerDescriptor[]}
         *  @description The registered listeners on this target (Source Of Truth).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Listeners    : ListenerDescriptor[];

        /** @name        Node
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {EventTarget=}
         *  @description The DOM materialization, present when this target is also a DOM node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Node?        : EventTarget;

        /** @name        Parent
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {EventTargetDescriptor=}
         *  @description The synthetic parent, for capture/bubble propagation independent of the DOM.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Parent?      : EventTargetDescriptor;

        /** @name        Brokers
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {Record<string, EventTargetDescriptor>=}
         *  @description Resolved jump map: broker label → the next target descriptor to jump to (O(1)),
         *               built from the public `Broker` inputs.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Brokers?     : Record<string, EventTargetDescriptor>;

        /** @name        Intercepted
         *  @public
         *  @memberof    Core.Events.EventTargetDescriptor
         *  @type        {Map<string, EventListener>=}
         *  @description Per-type DOM interceptors (one per event type); each funnels native events into the
         *               single controlled `#dispatch`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Intercepted? : Map<string, EventListener>;
    }

        export interface ListenerOptions
        {
                Passive? : boolean;
                Capture? : boolean;
                Once?    : boolean;
                Signal?  : AbortSignal;
                Phase?   : 'bubble' | 'capture';
        }

    /** @interface   ListenerDescriptor
     *  @memberof    Core.Events
     *  @description The LISTENER (SOT): runtime binding plus `Json` (W3C XML Events) and `XML` (node +
     *               outerHTML) serializable projections, so it exists independently of a live DOM.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export interface ListenerDescriptor
    {
        /** @name        UUID
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {string}
         *  @description Registry key in `Event.Listeners`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        UUID      : string;

        /** @name        Type
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {string}
         *  @description The event type listened for.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Type      : string;

        /** @name        Target
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {EventTarget | string}
         *  @description The listening target — a DOM node, or a synthetic id when off-DOM.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Target    : EventTarget | string;

        /** @name        Handler
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {EventListener}
         *  @description The listener function; lives only in the SOT (the DOM sees the interceptor).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Handler   : EventListener;

        /** @name        Phase
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {Phase}
         *  @description When it fires: `capture` / `bubble` (tree) or `broker` (custom path).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Phase     : Phase;

        /** @name        Brokers
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {string[]=}
         *  @description The broker labels this listener intercepts (relevant when `Phase` is `broker`): it
         *               fires if the event's `Broker` is among them.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Brokers?  : string[];

        /** @name        Once
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {boolean}
         *  @description Remove the listener after its first invocation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Once      : boolean;

        /** @name        Passive
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {boolean}
         *  @description Passive listener (never calls `preventDefault`), mirrored to native options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Passive   : boolean;

        /** @name        Untrusted
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {boolean}
         *  @description Synthetic (untrusted) origin — set for listeners created through the SOT bus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Untrusted : boolean;

        /** @name        Json
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {ListenerDescriptor.Json}
         *  @description The serializable W3C XML Events projection (DOM-free, IR-ready).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Json      : ListenerDescriptors.Json;

        /** @name        XML
         *  @public
         *  @memberof    Core.Events.ListenerDescriptor
         *  @type        {ListenerDescriptor.XML=}
         *  @description The node serialization (cloned node + outerHTML), when materialized to markup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        XML?      : ListenerDescriptors.XML;
    }

    /** @namespace   ListenerDescriptor
     *  @memberof    Core.Events
     *  @description Declaration-merged namespace holding the serializable projections of a
     *               `ListenerDescriptor`: `Json` (the W3C XML Events model) and `XML` (the node +
     *               outerHTML serialization). These let a listener exist and travel independently of a
     *               live DOM (VDOM / IR / SSR).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export namespace ListenerDescriptors
    {
        /** @interface   Json
         *  @memberof    Core.Events.ListenerDescriptor
         *  @description W3C XML Events model — fully serializable. `handler` is a lambda-table id (IR) or the
         *               function (runtime); node fields are references, so it is DOM-free.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export interface Json
        {
            /** @name        id
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Binding id (default `'ev'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            id            : string;

            /** @name        event
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Event type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            event         : string;

            /** @name        observer
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Node reference where the listener is registered.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            observer      : string;

            /** @name        target
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Node reference that must be the event target.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            target        : string;

            /** @name        handler
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string | EventListener}
             *  @description Lambda-table id (IR) or the listener function (runtime).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            handler       : string | EventListener;

            /** @name        phase
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {Phase}
             *  @description capture | bubble | broker.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            phase         : Phase;

            /** @name        brokers
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string[]=}
             *  @description Broker labels followed.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            brokers?      : string[];

            /** @name        path
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string[]=}
             *  @description Serialized custom path (node references).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            path?         : string[];

            /** @name        propagate
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {boolean}
             *  @description Continue propagation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            propagate     : boolean;

            /** @name        defaultAction
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Default-action directive.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            defaultAction : string;

            /** @name        namespace
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.Json
             *  @type        {string}
             *  @description Event namespace.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            namespace     : string;
        }

        /** @interface   XML
         *  @memberof    Core.Events.ListenerDescriptor
         *  @description Node serialization of the binding: the cloned node carrying the `:xml-events`
         *               attributes, and its `outerHTML`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export interface XML
        {
            /** @name        Node
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.XML
             *  @type        {Node}
             *  @description Cloned node carrying the `:event` / `:observer` / … attributes.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Node : Node;

            /** @name        Text
             *  @public
             *  @memberof    Core.Events.ListenerDescriptor.XML
             *  @type        {string}
             *  @description The node's `outerHTML`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Text : string;
        }
    }

    /** @name        eventsService
 *  @private
 *  @description Registers the 'events' service: Fire / On / Off delegating to `Events.Event`,
 *               so consumers reach the event bus through the kernel registry instead of
 *               importing Events directly.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license)
 */
    export const Service = new Core.Services.Service
    (
        'events',
        {
                    /** Fire an event on a target. */
                    Fire(target: Events.Target, event: string | Events.EventDescriptor): boolean { return Events.Event.Fire(target, event); },
                    /** Subscribe a handler to one or more event types. */
                    On(target: Events.Target, types: string, handler: EventListener, options?: AddEventListenerOptions &
                    { phase?: Events.Phase; brokers?: string[] }): Events.ListenerDescriptor[] { return Events.Event.On(target, types, handler, options); },
                    /** Unsubscribe a handler. */
                    Off(target: Events.Target, types: string, handler: EventListener): void { Events.Event.Off(target, types, handler); },
        }
    );

    /** Global Events Functions */

    /** @name        resolve
     *  @private
     *  @memberof    Core.Events.Types
     *  @description Resolve an event type to its `EventType` entry, searching the sub-tables in order
     *               DOM → AriannA → Custom (first match wins).
     *  @param       {string} type Event type / keyword.
     *  @returns     {EventType | undefined} The matching entry, or `undefined` when unknown.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    function Resolve(type: string): EventType | undefined
    { return Types.DOM[type] ?? Types.AriannA[type] ?? Types.Custom[type]; }

    /** @name        GetInterface
     *  @public
     *  @static
     *  @memberof    Core.Events.Types
     *  @description The name of the DOM Event interface for a type (e.g. `'click'` → `'MouseEvent'`),
     *               searching DOM → AriannA → Custom.
     *  @param       {string} type Event type.
     *  @returns     {string | undefined} The interface name, or `undefined` when the type is unknown.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Events.Types.GetInterface('click')  // 'MouseEvent'
     */
    export function GetInterface(type: string): string | undefined
    { return Resolve(type)?.Interface; }

    /** @name        GetCategory
     *  @public
     *  @static
     *  @memberof    Core.Events.Types
     *  @description The category of a type — `'DOM'` / `'AriannA'` / `'Moz'` / `'Custom'` / … — searching
     *               DOM → AriannA → Custom.
     *  @param       {string} type Event type.
     *  @returns     {string | undefined} The category, or `undefined` when the type is unknown.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Events.Types.GetCategory('arianna-ready')  // 'AriannA'
     */
    export function GetCategory(type: string): string | undefined
    { return Resolve(type)?.Category; }

    /** @name        GetState
     *  @public
     *  @static
     *  @memberof    Core.Events.Types
     *  @description The lifecycle state of a type — `'Active'` / `'Deprecated'` / … — searching
     *               DOM → AriannA → Custom. Useful to warn on deprecated events at On/Fire time.
     *  @param       {string} type Event type.
     *  @returns     {string | undefined} The state, or `undefined` when the type is unknown.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Events.Types.GetState('mousewheel')  // 'Deprecated'
     */
    export function GetState(type: string): string | undefined
    { return Resolve(type)?.State; }

    /** @class       Event
     *  @memberof    Core
     *  @classdesc   The event subsystem: static SOT bus (`On` / `Off` / `Fire` + query) over synthetic
     *               descriptors, mirroring to the DOM via a single per-type interceptor; plus an
     *               instantiable wrapper over a native event or an `EventDescriptor`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class Event
    {
            static
            {
                    if (typeof window !== 'undefined')
                    {
                            Object.defineProperty
                            (
                                window,
                                'Events',
                                {
                                        value        : Events,
                                        writable     : false,
                                        enumerable   : false,
                                        configurable : false,
                                }
                            );
                    }
            }
        /** @name        #doms
         *  @private
         *  @static
         *  @type        {WeakMap<EventTarget, EventTargetDescriptor>}
         *  @description DOM-backed registry — WeakMap so removed nodes are collectable (no leak).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #doms      = new WeakMap<EventTarget, EventTargetDescriptor>();

        /** @name        #synthetic
         *  @private
         *  @static
         *  @type        {Map<string, EventTargetDescriptor>}
         *  @description Synthetic (id-keyed) registry for off-DOM targets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #synthetic = new Map<string, EventTargetDescriptor>();

        /** @name        Listeners
         *  @public
         *  @static
         *  @readonly
         *  @type        {Map<string, ListenerDescriptor>}
         *  @description The listener log, keyed by UUID.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly Listeners = new Map<string, ListenerDescriptor>();

        /** @name        On
         *  @public
         *  @static
         *  @description Register a listener in the SOT for each type; if the target is a DOM node, ensure a
         *               single per-type interceptor (never the user handler directly).
         *  @param       {Target} target Target(s).
         *  @param       {string} types  Space/comma/pipe-separated types.
         *  @param       {EventListener} handler Listener.
         *  @param       {(AddEventListenerOptions & { phase?: Phase; brokers?: string[] })=} options Options + phase / brokers.
         *  @returns     {ListenerDescriptor[]} The registered descriptors.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static On(target: Target, types: string, handler: EventListener, options?: AddEventListenerOptions & { phase?: Phase; brokers?: string[] }): ListenerDescriptor[]
        {
            const out: ListenerDescriptor[] = [];
            for (const desc of Event.#targets(target))
                for (const type of types.split(/\s+|,|\|/g).filter(Boolean)) {
                    const phase: Phase = options?.phase ?? (options?.capture ? 'capture' : 'bubble');
                    const json: ListenerDescriptors.Json = { id: 'ev', event: type, observer: desc.Id, target: desc.Id, handler: handler.name || handler, phase, brokers: options?.brokers, propagate: true, defaultAction: '', namespace: '' };
                    const l: ListenerDescriptor = { UUID: Event.#uuid(), Type: type, Target: desc.Node ?? desc.Id, Handler: handler, Phase: phase, Brokers: options?.brokers, Once: !!options?.once, Passive: !!options?.passive, Untrusted: true, Json: Object.freeze(json) };
                    desc.Listeners.push(l); Event.Listeners.set(l.UUID, l);
                    if (desc.Node) Event.#intercept(desc, type);
                    out.push(l);
                }
            return out;
        }

        /** @name        Off
         *  @public
         *  @static
         *  @description Remove matching listeners from the SOT; when the last listener of a type on a DOM node
         *               is gone, remove that node's interceptor.
         *  @param       {Target} target Target(s).
         *  @param       {string} types  Event types.
         *  @param       {EventListener} handler Listener to remove.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Off(target: Target, types: string, handler: EventListener): void
        {
            for (const desc of Event.#targets(target))
                for (const type of types.split(/\s+|,|\|/g).filter(Boolean)) {
                    desc.Listeners = desc.Listeners.filter(l => { const hit = l.Type === type && l.Handler === handler; if (hit) Event.Listeners.delete(l.UUID); return !hit; });
                    if (desc.Node && !desc.Listeners.some(l => l.Type === type)) Event.#unintercept(desc, type);
                }
        }

        /** @name        Fire
         *  @public
         *  @static
         *  @description Dispatch from an `EventDescriptor` (or type string) through the single controlled
         *               `#dispatch` (capture → target → bubble, composing the broker jump into `Path`).
         *  @param       {Target} target Target(s).
         *  @param       {string | EventDescriptor} event Descriptor, or a type string.
         *  @returns     {boolean} `false` when blocked (defaultPrevented), else `true`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Fire(target: Target, event: string | EventDescriptor): boolean
        {
            const ed: EventDescriptor = typeof event === 'string' ? { Type: event } : event;
            let ok = true;
            for (const desc of Event.#targets(target)) if (Event.#dispatch(desc, ed)) ok = false;
            return ok;
        }

        /** @name        GetListener
         *  @public
         *  @static
         *  @description Look up a listener by UUID.
         *  @param       {string} uuid Listener UUID.
         *  @returns     {ListenerDescriptor | undefined} The listener, or undefined.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static GetListener(uuid: string): ListenerDescriptor | undefined { return Event.Listeners.get(uuid); }

        /** @name        #intercept
         *  @private
         *  @static
         *  @description Ensure a single DOM interceptor for `(node, type)`: it captures the native event and
         *               starts the one controlled `#dispatch`. Idempotent per type; a `__arianna` marker
         *               prevents multiple runs when a native event bubbles through several interceptors.
         *  @param       {EventTargetDescriptor} desc Target.
         *  @param       {string} type Event type.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #intercept(desc: EventTargetDescriptor, type: string): void
        {
            desc.Intercepted ??= new Map();
            if (desc.Intercepted.has(type)) return;
            const interceptor: EventListener = (native) => {
                const n = native as NativeEvent & { __arianna?: boolean };
                if (n.__arianna) return;
                n.__arianna = true;
                const ed: EventDescriptor = { Type: native.type, Detail: (native as CustomEvent).detail ?? undefined, Path: [] };
                if (Event.#dispatch(desc, ed)) { native.preventDefault(); native.stopPropagation(); }
            };
            desc.Intercepted.set(type, interceptor);
            try { desc.Node!.addEventListener(type, interceptor); } catch { /* (2.2) fragile native element */ }
        }

        /** @name        #unintercept
         *  @private
         *  @static
         *  @description Remove a node's interceptor for a type.
         *  @param       {EventTargetDescriptor} desc Target.
         *  @param       {string} type Event type.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #unintercept(desc: EventTargetDescriptor, type: string): void
        {
            const i = desc.Intercepted?.get(type);
            if (i && desc.Node) { try { desc.Node.removeEventListener(type, i); } catch { /* (2.2) */ } desc.Intercepted!.delete(type); }
        }

        /** @name        #dispatch
         *  @private
         *  @static
         *  @description The one synthetic dispatch. Builds the chain composing the single active broker jump
         *               (`ed.Broker` → the node's `Brokers[label]`, O(1)) with the tree `Parent` — guarded by
         *               a `Set` against cycles (2.1). Fills `Path` once from the chain (linear), then runs
         *               listeners across capture → target → bubble. The synthetic `ev` inherits prototypally
         *               from the `EventDescriptor`.
         *  @param       {EventTargetDescriptor} desc The origin target descriptor.
         *  @param       {EventDescriptor} ed The event descriptor.
         *  @returns     {boolean} `true` when blocked (a listener called `preventDefault()`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #dispatch(desc: EventTargetDescriptor, ed: EventDescriptor): boolean
        {
            let stopped = false, prevented = false;

            const ev = Object.assign(Object.create(ed as object), {
                type: ed.Type, target: desc.Node ?? desc.Id, currentTarget: null as unknown, detail: Event.#seal(ed.Detail),
                preventDefault(): void { prevented = true; }, stopPropagation(): void { stopped = true; },
            }) as unknown as NativeEvent;

            const label = ed.Broker;

            const chain: EventTargetDescriptor[] = [];
            const seen = new Set<EventTargetDescriptor>();
            for (let d: EventTargetDescriptor | undefined = desc; d && !seen.has(d); ) {
                seen.add(d); chain.push(d);
                const hop: EventTargetDescriptor | undefined = label ? d.Brokers?.[label] : undefined;
                d = hop ?? d.Parent;
            }
            ed.Path = chain.map(c => c.Id);

            const visit = (d: EventTargetDescriptor, cap: boolean): void => {
                (ev as unknown as { currentTarget: unknown }).currentTarget = d.Node ?? d.Id;
                for (const l of [...d.Listeners]) {
                    if (l.Type !== ed.Type) continue;
                    const match = l.Phase === 'broker' ? (!!label && (l.Brokers ?? []).includes(label)) : (l.Phase === (cap ? 'capture' : 'bubble'));
                    if (!match) continue;
                    l.Handler(ev);
                    if (l.Once) Event.Off(d.Node ?? d.Id, ed.Type, l.Handler);
                    if (stopped) break;
                }
            };
            for (let i = chain.length - 1; i > 0 && !stopped; i--) visit(chain[i], true);
            if (!stopped) visit(chain[0], chain.length === 1);
            for (let i = 1; i < chain.length && !stopped; i++) visit(chain[i], false);
            return prevented;
        }

        /** @name        #targets
         *  @private
         *  @static
         *  @description Resolve a Target into its descriptor(s), creating as needed (WeakMap for DOM, Map for
         *               synthetic).
         *  @param       {Target} t Target(s).
         *  @returns     {EventTargetDescriptor[]} Descriptors.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #targets(t: Target): EventTargetDescriptor[]
        {
            if (typeof t === 'string')
            {
                if (typeof document !== 'undefined')
                {
                    const nodes = Array.from(document.querySelectorAll<Element>(t));
                    if (nodes.length)
                        return nodes.map(n => Event.#forNode(n));
                }
                let d = Event.#synthetic.get(t);
                if (!d)
                {
                    d = { Id: t, Listeners: [] };
                    Event.#synthetic.set(t, d);
                }
                return [d];
            }
            const list: readonly EventTarget[] = Array.isArray(t) ? (t as readonly EventTarget[]) : [t as EventTarget];
            return list.map(n => Event.#forNode(n));
        }

        /** @name        #forNode
         *  @private
         *  @static
         *  @description Get-or-create the descriptor for a DOM EventTarget (WeakMap-backed).
         *  @param       {EventTarget} node The DOM target.
         *  @returns     {EventTargetDescriptor} Its descriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #forNode(node: EventTarget): EventTargetDescriptor
        {
            let d = Event.#doms.get(node); if (!d)
        { d = { Id: Event.#uuid(), Listeners: [], Node: node }; Event.#doms.set(node, d); }
            return d;
        }

        /** @name        #build
         *  @private
         *  @static
         *  @description Construct the native Event subtype for `type` (falls back to CustomEvent) — used by
         *               the instance wrapper / optional external dispatch.
         *  @param       {string} type Event type.
         *  @param       {CustomEventInit=} init Init dict.
         *  @returns     {NativeEvent} The constructed event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #build(type: string, init?: CustomEventInit): NativeEvent
        {
            const iface = GetInterface(type);
            if (iface && typeof window !== 'undefined') { const C = (window as unknown as Record<string, unknown>)[iface]; if (typeof C === 'function') { try { return new (C as new (t: string, i?: unknown) => NativeEvent)(type, { bubbles: true, composed: true, ...init }); } catch { /* non-constructable */ } } }
            return new CustomEvent(type, { bubbles: true, composed: true, ...init });
        }

        /** @name        #seal
         *  @private
         *  @static
         *  @description Seal declared detail props as readonly (Core.Scopes.Readonly).
         *  @param       {Record<string, unknown>=} src Source detail.
         *  @returns     {Record<string, unknown>} Sealed detail.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #seal(src?: Record<string, unknown>): Record<string, unknown> { const d: Record<string, unknown> = {};
            for (const k of Object.keys(src ?? {}))
                Object.defineProperty(d, k, { value: src![k], ...Core.Scopes.Readonly }); return d; }

        /** @name        #uuid
         *  @private
         *  @static
         *  @description Fresh identifier for a listener / synthetic target.
         *  @returns     {string} A UUID.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #uuid(): string { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ev-' + Math.random().toString(16).slice(2); }

        // ── instance wrapper ─────────────────────────────────────────────────────

        /** @name        #native
         *  @private
         *  @type        {NativeEvent | null}
         *  @description Wrapped native DOM event (eager form), or null for a descriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #native : NativeEvent | null;

        /** @name        #spec
         *  @private
         *  @type        {EventDescriptor | null}
         *  @description Custom descriptor (lazy / VDOM form), or null when wrapping a native event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #spec   : EventDescriptor | null;

        /** @name        #detail
         *  @private
         *  @type        {Record<string, unknown>}
         *  @description The (sealed) custom detail.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #detail : Record<string, unknown>;

        /** @name        constructor
         *  @public
         *  @description Wrap a native DOM event (eager) or a custom `EventDescriptor` (lazy / VDOM); a
         *               descriptor's `Detail` is sealed readonly.
         *  @param       {NativeEvent | EventDescriptor} source Native event or descriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        constructor(source: NativeEvent | EventDescriptor)
        {
            if (source instanceof globalThis.Event) { this.#native = source; this.#spec = null; this.#detail = ((source as CustomEvent).detail ?? {}) as Record<string, unknown>; }
            else { this.#native = null; this.#spec = source; this.#detail = Event.#seal(source.Detail); }
        }

        /** @name        target
         *  @public
         *  @readonly
         *  @type        {EventTarget | null}
         *  @description The native event's target, or null for a lazy descriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get target(): EventTarget | null { return this.#native?.target ?? null; }

        /** @name        detail
         *  @public
         *  @readonly
         *  @type        {Record<string, unknown>}
         *  @description The (sealed) custom detail.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get detail(): Record<string, unknown> { return this.#detail; }

        /** @name        on
         *  @public
         *  @description Add a listener (delegates to the static SOT bus).
         *  @param       {Target} target Target(s).
         *  @param       {string} types  Types.
         *  @param       {EventListener} cb Listener.
         *  @param       {(AddEventListenerOptions & { phase?: Phase; brokers?: string[] })=} opts Options.
         *  @returns     {this} This event (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        on(target: Target, types: string, cb: EventListener, opts?: AddEventListenerOptions & { phase?: Phase; brokers?: string[] }): this { Event.On(target, types, cb, opts); return this; }

        /** @name        off
         *  @public
         *  @description Remove a listener (delegates to the static SOT bus).
         *  @param       {Target} target Target(s).
         *  @param       {string} types  Types.
         *  @param       {EventListener} cb Listener.
         *  @returns     {this} This event (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        off(target: Target, types: string, cb: EventListener): this { Event.Off(target, types, cb); return this; }

        /** @name        fire
         *  @public
         *  @description Dispatch: re-dispatch the wrapped native, or fire the descriptor via the SOT bus.
         *  @param       {Target=} target Override target(s).
         *  @returns     {this} This event (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        fire(target?: Target): this
        {
            if (this.#native) { const t = target ?? this.#native.target; if (t) (Array.isArray(t) ? t : [t]).forEach(el => { try { (el as EventTarget).dispatchEvent(this.#native!); } catch { /* (2.2) */ } }); return this; }
            Event.Fire(target ?? this.#spec!.Targets ?? [], this.#spec!);
            return this;
        }

        /** @name        prevent
         *  @public
         *  @description `preventDefault()` on the wrapped native event.
         *  @returns     {this} This event (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        prevent(): this { this.#native?.preventDefault(); return this; }

        /** @name        stop
         *  @public
         *  @description `stopPropagation()` on the wrapped native event.
         *  @returns     {this} This event (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        stop(): this { this.#native?.stopPropagation(); return this; }
    }
}

export default Events;