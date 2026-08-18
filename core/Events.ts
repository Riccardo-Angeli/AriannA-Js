import { Core }     from './Core.ts';
import { Services } from './Service.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

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
    /** @name        NativeEvent
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for NativeEvent.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type NativeEvent           = SchemaTypes.Events.NativeEvent;
    /** @name        Target
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Target.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Target                = SchemaTypes.Events.Target;
    /** @name        Phase
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Phase.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Phase                 = SchemaTypes.Events.Phase;
    /** @name        EventType
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventType.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventType             = SchemaInterfaces.Events.EventType;
    /** @name        Broker
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Broker.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Broker                = SchemaInterfaces.Events.Broker;
    /** @name        EventDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventDescriptor       = SchemaInterfaces.Events.EventDescriptor;
    /** @name        EventTargetDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventTargetDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventTargetDescriptor = SchemaInterfaces.Events.EventTargetDescriptor;
    /** @name        ListenerDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ListenerDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ListenerDescriptor    = SchemaInterfaces.Events.ListenerDescriptor;
    /** @name        ListenerJson
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ListenerJson.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ListenerJson          = SchemaInterfaces.Events.Json;
    /** @name        ListenerXML
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ListenerXML.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ListenerXML           = SchemaInterfaces.Events.XML;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract       = SchemaInterfaces.Events.Service;

    /** @name        CollectionTarget
     *  @public
     *  @constant
     *  @description Canonical synthetic Events target used by reactive collection notifications.
     *               The target is synthetic rather than DOM-backed, so Real, Virtual and Template
     *               can consume the same collection event stream without coupling to one renderer.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const CollectionTarget = 'arianna-collection';


    /** @name        Registry
     *  @private
     *  @type        {typeof Registry}
     *  @description Runtime class responsible for the Registry capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    class Registry
    {
        static readonly DOM: Readonly<Record<string, EventType>> = Object.freeze
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

        static readonly AriannA: Readonly<Record<string, EventType>> = Object.freeze
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
                CollectionChanging:              { Name: 'CollectionChanging',              Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'Reactivity',          State: 'Active',     Lifecycle: false, CE: false                      },
                CollectionChanged:               { Name: 'CollectionChanged',               Interface: 'CustomEvent',                  Domain: 'AriannA', Category: 'Reactivity',          State: 'Active',     Lifecycle: false, CE: false                      },
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

        static readonly Custom: Readonly<Record<string, EventType>> = Object.freeze({});
    }

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
        /** @name        Registry
         *  @public
         *  @static
         *  @readonly
         *  @type        {typeof Registry}
         *  @description Canonical runtime registry for DOM, AriannA, and custom event metadata.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly Registry = Registry;

        /** @name        Resolve
         *  @private
         *  @static
         *  @param       {string} type Event type or keyword.
         *  @returns     {EventType | undefined} Registered event metadata.
         *  @description Resolve an event type in deterministic order: DOM, AriannA, then Custom.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Resolve(type: string): EventType | undefined
        {
            return Registry.DOM[type] ??
                Registry.AriannA[type] ??
                Registry.Custom[type];
        }

        /** @name        GetInterface
         *  @public
         *  @static
         *  @param       {string} type Event type.
         *  @returns     {string | undefined} DOM Event interface name.
         *  @description Return the native DOM Event interface associated with a registered event type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetInterface(type: string): string | undefined
        {
            return Event.#Resolve(type)?.Interface;
        }

        /** @name        GetCategory
         *  @public
         *  @static
         *  @param       {string} type Event type.
         *  @returns     {string | undefined} Registered category.
         *  @description Return the category associated with a registered event type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetCategory(type: string): string | undefined
        {
            return Event.#Resolve(type)?.Category;
        }

        /** @name        GetState
         *  @public
         *  @static
         *  @param       {string} type Event type.
         *  @returns     {string | undefined} Lifecycle state.
         *  @description Return the lifecycle state associated with a registered event type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static GetState(type: string): string | undefined
        {
            return Event.#Resolve(type)?.State;
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
        static readonly Listeners = new Map<string, WeakRef<ListenerDescriptor>>();

        static readonly #ListenerFinalizer =
            typeof FinalizationRegistry !== 'undefined'
                ? new FinalizationRegistry<string>
                (
                    uuid => { Event.Listeners.delete(uuid); }
                )
                : null;

        /** Number of AriannA listeners per event type. Lets producers avoid constructing and
         *  dispatching framework-only lifecycle events when nobody consumes them. */
        static readonly #TypeCounts = new Map<string, number>();

        static Has(type: string): boolean
        {
            return (Event.#TypeCounts.get(type) ?? 0) > 0;
        }

        static readonly #TypeLists =
            new Map<string, readonly string[]>();

        static #Types(types: string): readonly string[]
        {
            const cached =
                Event.#TypeLists.get(types);

            if(cached)
            {
                return cached;
            }

            const parsed =
                Object.freeze
                (
                    types
                        .split(/\s+|,|\|/g)
                        .filter(Boolean)
                );

            Event.#TypeLists.set(types, parsed);

            return parsed;
        }

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
        static On
        (
            target  : Target,
            types   : string,
            handler : EventListener,
            options?: AddEventListenerOptions &
            {
                phase?   : Phase;
                brokers? : string[];
            }
        ): ListenerDescriptor[]
        {
            const eventTypes =
                Event.#Types(types);

            const phase:
                Phase =
                    options?.phase ??
                    (
                        options?.capture
                            ? 'capture'
                            : 'bubble'
                    );

            const out:
                ListenerDescriptor[] =
                    [];

            for(const descriptor of Event.#targets(target))
            {
                for(const type of eventTypes)
                {
                    const json:
                        ListenerJson =
                        {
                            id            : 'ev',
                            event         : type,
                            observer      : descriptor.Id,
                            target        : descriptor.Id,
                            handler       : handler.name || handler,
                            phase,
                            brokers       : options?.brokers,
                            propagate     : true,
                            defaultAction : '',
                            namespace     : ''
                        };

                    const listener:
                        ListenerDescriptor =
                        {
                            UUID      : Event.#uuid(),
                            Type      : type,
                            Target    : descriptor.Node ?? descriptor.Id,
                            Handler   : handler,
                            Phase     : phase,
                            Brokers   : options?.brokers,
                            Once      : options?.once === true,
                            Passive   : options?.passive === true,
                            Untrusted : true,
                            Json      : Object.freeze(json)
                        };

                    descriptor.Listeners.push(listener);
                    Event.Listeners.set(listener.UUID, new WeakRef(listener));
                    Event.#ListenerFinalizer?.register(listener, listener.UUID, listener);
                    Event.#TypeCounts.set(type, (Event.#TypeCounts.get(type) ?? 0) + 1);

                    if(descriptor.Node)
                    {
                        Event.#intercept(descriptor, type);
                    }

                    out.push(listener);
                }
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
        static Off
        (
            target  : Target,
            types   : string,
            handler : EventListener
        ): void
        {
            for(const descriptor of Event.#targets(target))
            {
                for(const type of Event.#Types(types))
                {
                    let remaining =
                        false;

                    for
                    (
                        let index = descriptor.Listeners.length - 1;
                        index >= 0;
                        index--
                    )
                    {
                        const listener =
                            descriptor.Listeners[index];

                        if(listener.Type !== type)
                        {
                            continue;
                        }

                        if(listener.Handler === handler)
                        {
                            descriptor.Listeners.splice(index, 1);
                            Event.Listeners.delete(listener.UUID);
                            Event.#ListenerFinalizer?.unregister(listener);

                            const count = Event.#TypeCounts.get(type) ?? 0;
                            if(count <= 1) Event.#TypeCounts.delete(type);
                            else           Event.#TypeCounts.set(type, count - 1);
                        }
                        else
                        {
                            remaining =
                                true;
                        }
                    }

                    if(descriptor.Node && !remaining)
                    {
                        Event.#unintercept(descriptor, type);
                    }
                }
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
            if(!Event.Has(ed.Type)) return true;

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
        static GetListener(uuid: string): ListenerDescriptor | undefined
        {
            const ref = Event.Listeners.get(uuid);
            const listener = ref?.deref();

            if(!listener && ref)
            {
                Event.Listeners.delete(uuid);
            }

            return listener;
        }

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
            /*
             * DOM-compatible phase order:
             *
             *   1. capture on ancestors, root -> parent;
             *   2. capture listeners on the target;
             *   3. bubble listeners on the target;
             *   4. bubble on ancestors, parent -> root.
             *
             * The previous implementation visited a standalone target only as
             * capture (`chain.length === 1`), so ordinary bubble listeners
             * registered through Event.On never ran. This was why Fire('ping')
             * appeared completely inert in the Playground.
             */
            for
            (
                let index = chain.length - 1;
                index > 0 && !stopped;
                index--
            )
            {
                visit(chain[index], true);
            }

            if(!stopped)
            {
                visit(chain[0], true);
            }

            if(!stopped)
            {
                visit(chain[0], false);
            }

            for
            (
                let index = 1;
                index < chain.length && !stopped;
                index++
            )
            {
                visit(chain[index], false);
            }

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
            const iface = Event.GetInterface(type);
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

    /** @name        Service
     *  @private
     *  @constant
     *  @memberof    Events
     *  @description Registers the canonical Events service while all behavior remains implemented by `Event`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'events',
        {
            Fire
            (
                target : Target,
                event  : string | EventDescriptor
            ): boolean
            {
                return Event.Fire(target, event);
            },

            On
            (
                target   : Target,
                types    : string,
                handler  : EventListener,
                options? : AddEventListenerOptions &
                    {
                        phase?   : Phase;
                        brokers? : string[];
                    }
            ): ListenerDescriptor[]
            {
                return Event.On(target, types, handler, options);
            },

            Off
            (
                target  : Target,
                types   : string,
                handler : EventListener
            ): void
            {
                Event.Off(target, types, handler);
            },

            GetInterface(type: string): string | undefined
            {
                return Event.GetInterface(type);
            },

            GetCategory(type: string): string | undefined
            {
                return Event.GetCategory(type);
            },

            GetState(type: string): string | undefined
            {
                return Event.GetState(type);
            }
        }
    );
}

export default Events.Event;
