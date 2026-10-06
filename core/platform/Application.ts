/**
 * @module core/platform/Application
 * @author Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description Instance-scoped composition of State, Context, Router and actions.
 */
import { States } from '../reactivity/State.ts';
import { Contexts } from '../reactivity/Context.ts';
import { Namespaces } from '../dom/Namespaces.ts';
import { Routers } from './Router.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';
import type { Types } from '../definitions/Types.ts';

export namespace Applications
{
    export type Options=Interfaces.Application.Options;
    export type Step=Types.Application.Step;
    export type Action=Types.Application.Action;
    let sequence=0;
    /** Owns its resources; it does not alter the global Services registry. */
    export class Application
    {
        readonly Name:string;
        readonly State:States.State<unknown>;
        readonly Context:Contexts.Context<unknown>;
        readonly Router:Routers.Router;
        readonly #id=++sequence;
        readonly #services=new Map<string,unknown>();
        readonly #actions=new Map<string,Action>();
        readonly #workflows=new Map<string,readonly Step[]>();
        readonly #components=new Map<string,string>();
        readonly #mounted=new Set<Element>();
        #started=false;
        #disposed=false;
        constructor(options:Options={})
        {
            this.Name=options.Name??'Application';
            this.State=new States.State<unknown>(options.State??{}, {Name:this.Name});
            this.Context=new Contexts.Context<unknown>(`application.${this.#id}`,options.Context??{});
            this.Router=new Routers.Router(options.Router??{Mode:'memory'});
        }
        get Started():boolean{return this.#started;}
        private assertActive():void{if(this.#disposed)throw new Error('Application was disposed.');}
        Use<T>(name:string,value:T):this{this.assertActive();this.#services.set(name,value);return this;}
        Provides(name:string):boolean{return this.#services.has(name);}
        Service<T=unknown>(name:string):T{this.assertActive();if(!this.#services.has(name))throw new Error(`Unknown service: ${name}`);return this.#services.get(name) as T;}
        Action(name:string,handler:Action):this{this.assertActive();this.#actions.set(name,handler);return this;}
        async Run<T=unknown>(name:string,input?:unknown):Promise<T>{this.assertActive();const action=this.#actions.get(name);if(!action)throw new Error(`Unknown action: ${name}`);return await action(input,this) as T;}
        Orchestration(name:string,steps:readonly Step[]):this{this.assertActive();this.#workflows.set(name,steps.map(step=>typeof step==='string'?step:[...step]));return this;}
        async Execute(name:string,input?:unknown):Promise<unknown>
        {
            this.assertActive();const steps=this.#workflows.get(name);if(!steps)throw new Error(`Unknown orchestration: ${name}`);
            let value=input;for(const step of steps){this.assertActive();value=typeof step==='string'?await this.Run(step,value):await Promise.all(step.map(action=>this.Run(action,value)));}return value;
        }
        Component(name:string,constructor:typeof HTMLElement):this
        {
            this.assertActive();if(this.#components.has(name))throw new Error(`Component already registered: ${name}`);
            const tag=`arianna-app-${this.#id}-${this.#components.size}`;
            // Application registrations own a unique constructor name and registry identity.
            const Registered = class extends constructor {};
            Object.defineProperty(Registered,'name',{value:`Application${this.#id}Component${this.#components.size}`});
            if(!Namespaces.Namespace.Define(tag,Registered,HTMLElement))throw new Error(`Cannot register component: ${name}`);
            this.#components.set(name,tag);return this;
        }
        Components():string[]{return [...this.#components.keys()];}
        MountComponent(name:string,parent:Element|DocumentFragment,args:unknown[]=[]):Element
        {
            this.assertActive();const tag=this.#components.get(name);if(!tag)throw new Error(`Unknown component: ${name}`);
            const node=Namespaces.Namespace.Create(tag,args);if(!node)throw new Error(`Cannot construct component: ${name}`);
            parent.appendChild(node);this.#mounted.add(node);return node;
        }
        Start():this{this.assertActive();if(!this.#started){this.Router.Start();this.#started=true;}return this;}
        Stop():this{this.Router.Dispose();this.#started=false;return this;}
        Dispose():void
        {
            if(this.#disposed)return;this.Stop();this.#disposed=true;
            for(const node of this.#mounted)node.remove();this.#mounted.clear();
            this.State.Dispose();this.Context.Dispose();this.#services.clear();this.#actions.clear();this.#workflows.clear();this.#components.clear();
        }
    }
}
export default Applications.Application;
