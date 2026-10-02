/**
 * @module components/graphics/3D/Csg
 * @description Generic Constructive Solid Geometry controller for Canvas3D.
 * Operands are existing Canvas3D meshes selected with the mouse or supplied from code.
 * Primitive creation belongs to demos/applications, not to this component.
 */
import { Component, Css, Templates } from '../../../core/index.ts';
import Three from '../../../additionals/Three.ts';
import type { Canvas3D as Canvas3DNamespace } from './Canvas3D.ts';

const html=Templates.Template.Html;

export namespace Csg
{
    export type Operation='union'|'intersection'|'subtract'|'subtract-reverse';
    export type Mode='single'|'gallery';
    export type OperandSlot='a'|'b';
    export type Operand=Canvas3DNamespace.Mesh3;

    interface CanvasHost extends HTMLElement
    {
        scene:Canvas3DNamespace.Scene3;
        camera:Canvas3DNamespace.Camera3;
        canvas?:HTMLCanvasElement;
        addMesh?(id:string,mesh:Canvas3DNamespace.Mesh3):Canvas3DNamespace.Mesh3;
        removeMesh?(source:string|Canvas3DNamespace.Mesh3):unknown;
        invalidate?():void;
    }

    interface RuntimeState
    {
        canvas:CanvasHost|null;
        meshes:Canvas3DNamespace.Mesh3[];
        mode:Mode;
        operation:Operation;
        a:Operand|null;
        b:Operand|null;
        pickSlot:OperandSlot;
        picking:boolean;
        built:boolean;
        drag:{id:number;x:number;y:number;left:number;top:number}|null;
        selectionCleanup:(()=>void)|null;
        history:{result:Operand;operands:[Operand,Operand];consumed:boolean;visible:[boolean,boolean]}[];
    }

    const Runtime=new WeakMap<HTMLElement,RuntimeState>();
    const S=(host:HTMLElement):RuntimeState=>
    {
        let s=Runtime.get(host);
        if(!s)
        {
            s={canvas:null,meshes:[],mode:'single',operation:'union',a:null,b:null,pickSlot:'a',picking:false,built:false,drag:null,selectionCleanup:null,history:[]};
            Runtime.set(host,s);
        }
        return s;
    };

    const cloneGeometry=(g:Canvas3DNamespace.Geometry3):Canvas3DNamespace.Geometry3=>({
        vertices:g.vertices.map(v=>({...v})),
        normals:g.normals.map(v=>({...v})),
        indices:[...g.indices],
        clone(){return cloneGeometry(this);},
    });

    const canvasGeometry=(g:Three.BufferGeometry):Canvas3DNamespace.Geometry3=>
    {
        const vertices:Canvas3DNamespace.Vec3[]=[],normals:Canvas3DNamespace.Vec3[]=[],indices:number[]=[];
        for(let i=0;i<g.positions.length;i+=3)vertices.push({x:g.positions[i],y:g.positions[i+1],z:g.positions[i+2]});
        for(let i=0;i<g.normals.length;i+=3)normals.push({x:g.normals[i],y:g.normals[i+1],z:g.normals[i+2]});
        if(g.indices.length)for(const i of g.indices)indices.push(i);else for(let i=0;i<vertices.length;i++)indices.push(i);
        while(normals.length<vertices.length)normals.push({x:0,y:0,z:1});
        return {vertices,normals,indices,clone(){return cloneGeometry(this);}};
    };

    const threeGeometry=(g:Canvas3DNamespace.Geometry3):Three.BufferGeometry=>
    {
        const positions:number[]=[],normals:number[]=[];
        for(const v of g.vertices)positions.push(v.x,v.y,v.z);
        for(const n of g.normals)normals.push(n.x,n.y,n.z);
        const out=new Three.BufferGeometry().setPositions(positions).setIndices(g.indices);
        if(normals.length===positions.length)out.setNormals(normals);else out.computeNormals();
        return out;
    };

    const threeMesh=(mesh:Operand):Three.Mesh=>
    {
        const out=new Three.Mesh(threeGeometry(mesh.geometry));
        out.position.x=mesh.position.x;out.position.y=mesh.position.y;out.position.z=mesh.position.z;
        out.rotation.x=mesh.rotation.x;out.rotation.y=mesh.rotation.y;out.rotation.z=mesh.rotation.z;
        out.scale.x=mesh.scale.x;out.scale.y=mesh.scale.y;out.scale.z=mesh.scale.z;
        out.updateMatrixWorld();
        return out;
    };

    const resultMesh=(g:Three.BufferGeometry,color:string,label:string):Canvas3DNamespace.Mesh3=>({
        geometry:canvasGeometry(g),
        position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},visible:true,
        userData:{color,name:label,csgGenerated:true,csgSelectable:true},
    });

    const opLabel=(op:Operation)=>op==='union'?'Union (A ∪ B)':op==='intersection'?'Intersection (A ∩ B)':op==='subtract-reverse'?'Subtraction (B − A)':'Subtraction (A − B)';
    const colorFor=(op:Operation)=>op==='union'?'#58a6ff':op==='intersection'?'#a371f7':op==='subtract-reverse'?'#f0883e':'#3fb950';
    const sub=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const cross=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const dot=(a:Canvas3DNamespace.Vec3,b:Canvas3DNamespace.Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;
    const norm=(v:Canvas3DNamespace.Vec3):Canvas3DNamespace.Vec3=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l};};

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-csg,.Csg',{Background:'rgba(28,32,37,.94)',Border:'1px solid #454c54',BorderRadius:'9px',BoxShadow:'0 14px 40px rgba(0,0,0,.28)',Color:'#d7dde3',Display:'block',Font:'11px/1.25 system-ui',MinHeight:'235px',MinWidth:'270px',Overflow:'hidden',Position:'absolute',Right:'14px',Top:'58px',Width:'320px',ZIndex:'30'}),
        new Css.Rule('.Csg-Header',{AlignItems:'center',Background:'#24292f',BorderBottom:'1px solid #3b4249',Cursor:'move',Display:'flex',FontWeight:'700',Gap:'8px',JustifyContent:'space-between',Padding:'9px 10px',UserSelect:'none'}),
        new Css.Rule('.Csg-Body',{Display:'grid',Gap:'9px',Padding:'10px'}),
        new Css.Rule('.Csg-Row',{AlignItems:'center',Display:'grid',Gap:'7px',GridTemplateColumns:'84px 1fr'}),
        new Css.Rule('.Csg-Label',{Color:'#9ea7af',FontSize:'10px',FontWeight:'650'}),
        new Css.Rule('.Csg-Input',{Background:'#15191d',Border:'1px solid #414850',BorderRadius:'5px',BoxSizing:'border-box',Color:'#e7edf3',Font:'11px system-ui',Height:'28px',MinWidth:'0',Padding:'0 7px',Width:'100%'}),
        new Css.Rule('.Csg-Operand',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'54px minmax(0,1fr)'}),
        new Css.Rule('.Csg-OperandName',{Background:'#15191d',Border:'1px solid #414850',BorderRadius:'5px',BoxSizing:'border-box',Color:'#dce3e9',Height:'28px',LineHeight:'26px',Overflow:'hidden',Padding:'0 7px',TextOverflow:'ellipsis',WhiteSpace:'nowrap'}),
        new Css.Rule('.Csg-Button',{Background:'#292f35',Border:'1px solid #49515a',BorderRadius:'5px',Color:'#dbe2e8',Cursor:'pointer',Font:'700 10px system-ui',Height:'29px'}),
        new Css.Rule('.Csg-Button[data-primary="true"]',{BorderColor:'#e40c88',Color:'#ff72bd'}),
        new Css.Rule('.Csg-Pick[data-active="true"]',{BorderColor:'#e40c88',BoxShadow:'0 0 0 1px rgba(228,12,136,.18)',Color:'#ff72bd'}),
        new Css.Rule('.Csg-Actions',{Display:'grid',Gap:'6px',GridTemplateColumns:'repeat(3,minmax(0,1fr))'}),
        new Css.Rule('.Csg-Hint',{Color:'#89939d',Font:'9px/1.35 system-ui'}),
        new Css.Rule('.Csg-Legend',{BorderTop:'1px solid #3b4249',Display:'grid',Gap:'5px',MarginTop:'2px',PaddingTop:'8px'}),
        new Css.Rule('.Csg-LegendItem',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'9px 1fr'}),
        new Css.Rule('.Csg-Swatch',{BorderRadius:'50%',Height:'7px',Width:'7px'}),
        new Css.Rule('.Csg-Footer',{Color:'#77818b',Font:'9px ui-monospace,monospace'}),
        new Css.Rule('.Csg-Resize',{Background:'transparent',Border:'0',Position:'absolute',ZIndex:'40'}),
        new Css.Rule('arianna-csg[theme="light"],.Csg[theme="light"]',{Background:'rgba(255,255,255,.96)',BorderColor:'#c5cbd0',Color:'#31383f'}),
        new Css.Rule('arianna-csg[theme="light"] .Csg-Header,.Csg[theme="light"] .Csg-Header',{Background:'#f2f4f6',BorderBottomColor:'#d3d8dc'}),
        new Css.Rule('arianna-csg[theme="light"] .Csg-Input,.Csg[theme="light"] .Csg-Input,arianna-csg[theme="light"] .Csg-OperandName,.Csg[theme="light"] .Csg-OperandName',{Background:'#fff',BorderColor:'#c9cfd4',Color:'#242a30'}),
        new Css.Rule('arianna-csg[theme="light"] .Csg-Button,.Csg[theme="light"] .Csg-Button',{Background:'#f5f6f7',BorderColor:'#c9cfd4',Color:'#30363c'}),
    ]);

    @Component('arianna-csg',Styles,{Shadow:false,Attributes:['for','mode','operation','theme','preserve-operands']})
    export class Csg extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            this.classList.add('Csg');
            const st=S(this);this.syncAttributes();
            if(!st.built){this.renderPanel();this.installResize();st.built=true;}
            queueMicrotask(()=>this.bind());
        }
        public onUnmount():void{this.clearResults();const st=S(this);st.selectionCleanup?.();st.selectionCleanup=null;st.history.length=0;st.a=null;st.b=null;st.canvas=null;}
        public onAttributeChanged():void{if(!this.isConnected)return;this.syncAttributes();this.renderPanel();queueMicrotask(()=>{if(this.isConnected)this.bind();});}

        public bind(canvas?:HTMLElement|null):this
        {
            const st=S(this),id=this.getAttribute('for');
            const target=canvas??(id?document.getElementById(id):this.parentElement?.querySelector('arianna-canvas-3d'))??null;
            if(target&&'scene' in target&&'camera' in target)
            {
                if(st.canvas!==target)
                {
                    st.selectionCleanup?.();
                    st.canvas=target as CanvasHost;
                    this.wireSelection();
                }
            }
            return this;
        }
        public setMode(mode:Mode):this{this.setAttribute('mode',mode);return this;}
        public setOperation(operation:Operation):this{S(this).operation=operation;this.setAttribute('operation',operation);return this;}
        public beginPick(slot:OperandSlot):this{S(this).pickSlot=slot;S(this).picking=true;this.renderPanel();return this;}
        public setOperands(a:Operand|null,b:Operand|null):this{const st=S(this);st.a=a;st.b=b;st.pickSlot=a&&!b?'b':'a';this.clearResults();this.renderPanel();return this;}
        public getOperands():Readonly<{a:Operand|null;b:Operand|null}>{const st=S(this);return{a:st.a,b:st.b};}
        public clearSelection():this{const st=S(this);st.a=null;st.b=null;st.pickSlot='a';this.clearResults();this.renderPanel();this.emitSelection();return this;}

        /** Commit the selected Boolean. By default the result replaces both operands. */
        public commit(consumeOperands?:boolean):Canvas3DNamespace.Mesh3|null
        {
            const st=S(this),canvas=st.canvas;if(!canvas||!st.a||!st.b||st.a===st.b)return null;
            consumeOperands??=!this.hasAttribute('preserve-operands');
            const a=st.a,b=st.b,operation=st.operation;
            const visibility:[boolean,boolean]=[a.visible,b.visible];
            const evaluated=this.evaluate(a,b,operation);
            const result=resultMesh(evaluated.geometry,colorFor(operation),opLabel(operation));
            result.userData.id=`csg-${operation}-${Date.now().toString(36)}-${st.history.length}`;
            this.clearResults();
            if(consumeOperands)
            {
                a.visible=false;b.visible=false;
            }
            if(canvas.addMesh)canvas.addMesh(String(result.userData.id),result);
            else canvas.scene.add(result);
            canvas.invalidate?.();
            st.history.push({result,operands:[a,b],consumed:consumeOperands,visible:visibility});
            st.a=null;st.b=null;st.pickSlot='a';this.renderPanel();this.emitSelection();
            this.dispatchEvent(new CustomEvent('arianna:csg-commit',{bubbles:true,composed:true,detail:{result,operation,operands:[a,b],consumed:consumeOperands,source:this}}));
            return result;
        }

        /** Restore the exact operand objects and transforms retained at commit. */
        public undo():this
        {
            const st=S(this),entry=st.history.pop();if(!entry||!st.canvas)return this;
            this.clearResults();if(st.canvas.removeMesh)st.canvas.removeMesh(entry.result);else st.canvas.scene.remove(entry.result);
            if(entry.consumed){entry.operands[0].visible=entry.visible[0];entry.operands[1].visible=entry.visible[1];}
            [st.a,st.b]=entry.operands;st.pickSlot='a';this.renderPanel();st.canvas.invalidate?.();this.emitSelection();
            this.dispatchEvent(new CustomEvent('arianna:csg-undo',{bubbles:true,composed:true,detail:{operands:entry.operands,result:entry.result,source:this}}));return this;
        }
        public reset():this{while(S(this).history.length)this.undo();this.clearResults();this.renderPanel();return this;}

        /** Evaluate one Boolean using two existing Canvas3D meshes. */
        public evaluate(a:Operand,b:Operand,operation:Operation):Three.Mesh
        {
            const A=threeMesh(a),B=threeMesh(b);
            if(operation==='union')return Three.CSG.union(A,B);
            if(operation==='intersection')return Three.CSG.intersect(A,B);
            if(operation==='subtract-reverse')return Three.CSG.subtract(B,A);
            return Three.CSG.subtract(A,B);
        }

        public rebuild():this
        {
            const st=S(this);this.clearResults();
            if(!st.canvas||!st.a||!st.b||st.a===st.b)return this;
            if(st.mode==='gallery')this.buildGallery();else this.buildSingle();
            this.dispatchEvent(new CustomEvent('arianna:csg-change',{bubbles:true,composed:true,detail:{a:st.a,b:st.b,mode:st.mode,operation:st.operation}}));
            return this;
        }

        private syncAttributes():void
        {
            const st=S(this),mode=this.getAttribute('mode'),op=this.getAttribute('operation');
            st.mode=mode==='gallery'?'gallery':'single';
            if(op==='union'||op==='intersection'||op==='subtract'||op==='subtract-reverse')st.operation=op;
        }
        private scene():Canvas3DNamespace.Scene3|null{return S(this).canvas?.scene??null;}
        private addResult(item:Canvas3DNamespace.Mesh3):void{const scene=this.scene();if(!scene)return;scene.add(item);S(this).meshes.push(item);}
        private clearResults():void{const scene=this.scene(),st=S(this);if(scene)for(const item of st.meshes)scene.remove(item);st.meshes.length=0;}
        private meshName(mesh:Operand|null):string
        {
            if(!mesh)return '— click an object —';
            const value=mesh.userData.name??mesh.userData.label??mesh.userData.id;
            if(typeof value==='string'&&value.trim())return value;
            const i=S(this).canvas?.scene.children.indexOf(mesh)??-1;
            return i>=0?`Mesh ${i+1}`:'Mesh';
        }
        private buildSingle():void
        {
            const st=S(this);if(!st.a||!st.b)return;
            const result=this.evaluate(st.a,st.b,st.operation);
            this.addResult(resultMesh(result.geometry,colorFor(st.operation),opLabel(st.operation)));
        }
        private geometryCenter(g:Canvas3DNamespace.Geometry3):Canvas3DNamespace.Vec3
        {
            if(!g.vertices.length)return{x:0,y:0,z:0};
            let x=0,y=0,z=0;for(const v of g.vertices){x+=v.x;y+=v.y;z+=v.z;}const n=g.vertices.length;return{x:x/n,y:y/n,z:z/n};
        }
        private buildGallery():void
        {
            const st=S(this);if(!st.a||!st.b)return;
            const ops:Operation[]=['union','intersection','subtract','subtract-reverse'];
            const xs=[-3.9,-1.3,1.3,3.9],targetY=-1.85;
            ops.forEach((op,col)=>
            {
                const result=this.evaluate(st.a!,st.b!,op),m=resultMesh(result.geometry,colorFor(op),opLabel(op)),c=this.geometryCenter(m.geometry);
                m.position.x=xs[col]-c.x;m.position.y=targetY-c.y;m.position.z=-c.z;
                this.addResult(m);
            });
        }

        private renderPanel():void
        {
            const st=S(this),resize=[...this.querySelectorAll('.Csg-Resize')];
            const head=document.createElement('header');head.className='Csg-Header';head.textContent='Csg';this.wireDrag(head);
            const body=document.createElement('div');body.className='Csg-Body';
            const row=(name:string,control:HTMLElement)=>{const r=document.createElement('label');r.className='Csg-Row';const l=document.createElement('span');l.className='Csg-Label';l.textContent=name;r.append(l,control);body.appendChild(r);};
            const select=(items:[string,string][],value:string,fn:(v:string)=>void)=>{const s=document.createElement('select');s.className='Csg-Input';for(const [v,t] of items){const o=document.createElement('option');o.value=v;o.textContent=t;o.selected=v===value;s.appendChild(o);}s.onchange=()=>fn(s.value);return s;};
            const operand=(slot:OperandSlot,mesh:Operand|null)=>
            {
                const wrap=document.createElement('div');wrap.className='Csg-Operand';
                const pick=document.createElement('button');pick.type='button';pick.className='Csg-Button Csg-Pick';pick.dataset.active=String(st.picking&&st.pickSlot===slot);pick.textContent=`Pick ${slot.toUpperCase()}`;pick.onclick=()=>this.beginPick(slot);
                const name=document.createElement('select');name.className='Csg-Input';const empty=document.createElement('option');empty.value='';empty.textContent='Choose solid';name.appendChild(empty);
                const candidates=st.canvas?.scene.children.filter(item=>item.visible&&item.userData.csgSelectable!==false&&!st.meshes.includes(item))??[];
                candidates.forEach((item,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=this.meshName(item);option.selected=item===mesh;name.appendChild(option);});
                name.onchange=()=>{st[slot]=name.value===''?null:candidates[Number(name.value)];this.clearResults();this.emitSelection();};
                wrap.append(pick,name);return wrap;
            };
            row('Operand A',operand('a',st.a));
            row('Operand B',operand('b',st.b));
            row('Operation',select([['union','Union'],['intersection','Intersection'],['subtract','Subtraction (A − B)'],['subtract-reverse','Subtraction (B − A)']],st.operation,v=>this.setOperation(v as Operation)));
            const hint=document.createElement('div');hint.className='Csg-Hint';hint.textContent=!st.picking?'Choose A/B, move the axes, then Apply. Undo/Reset restores the operands.':st.pickSlot==='a'?'Click a mesh in the viewport to set Operand A.':'Click a different mesh in the viewport to set Operand B.';body.appendChild(hint);
            const actions=document.createElement('div');actions.className='Csg-Actions';
            const all=document.createElement('button');all.type='button';all.className='Csg-Button';all.textContent='Undo';all.disabled=!st.history.length;all.onclick=()=>this.undo();
            const apply=document.createElement('button');apply.className='Csg-Button';apply.type='button';apply.disabled=!st.a||!st.b||st.a===st.b;apply.textContent='Apply';apply.title='Create result and replace operands';apply.onclick=()=>this.commit();
            const clear=document.createElement('button');clear.type='button';clear.className='Csg-Button';clear.textContent='Reset';clear.onclick=()=>this.reset();
            actions.append(all,apply,clear);body.appendChild(actions);

            const footer=document.createElement('div');footer.className='Csg-Footer';footer.textContent='Operands come from the Canvas3D scene · click to select';body.appendChild(footer);
            this.replaceChildren(head,body,...resize);
        }

        private emitSelection():void
        {
            const st=S(this);this.dispatchEvent(new CustomEvent('arianna:csg-select',{bubbles:true,composed:true,detail:{a:st.a,b:st.b,pickSlot:st.pickSlot}}));
        }
        private choose(mesh:Operand):void
        {
            const st=S(this);if(mesh.userData.csgSelectable===false)return;
            if(st.pickSlot==='a')
            {
                st.a=mesh;
                if(st.b===mesh)st.b=null;
                st.pickSlot='b';
            }
            else
            {
                if(st.a===mesh)return;
                st.b=mesh;st.pickSlot='a';
            }
            this.clearResults();this.renderPanel();this.emitSelection();
        }

        private wireSelection():void
        {
            const st=S(this),host=st.canvas,surface=host?.canvas;if(!host||!surface)return;
            let down:{id:number;x:number;y:number}|null=null;
            const onDown=(e:PointerEvent)=>{if(e.button===0)down={id:e.pointerId,x:e.clientX,y:e.clientY};};
            const onUp=(e:PointerEvent)=>
            {
                if(!down||down.id!==e.pointerId)return;
                const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>5)return;
                if(!st.picking)return;const mesh=this.pick(e.clientX,e.clientY);if(mesh){this.choose(mesh);st.picking=false;this.renderPanel();}
            };
            const onCancel=()=>{down=null;};
            surface.addEventListener('pointerdown',onDown);
            surface.addEventListener('pointerup',onUp);
            surface.addEventListener('pointercancel',onCancel);
            st.selectionCleanup=()=>{surface.removeEventListener('pointerdown',onDown);surface.removeEventListener('pointerup',onUp);surface.removeEventListener('pointercancel',onCancel);};
        }

        private transform(v:Canvas3DNamespace.Vec3,m:Operand):Canvas3DNamespace.Vec3
        {
            let x=v.x*m.scale.x,y=v.y*m.scale.y,z=v.z*m.scale.z;
            let c=Math.cos(m.rotation.x),s=Math.sin(m.rotation.x);[y,z]=[y*c-z*s,y*s+z*c];
            c=Math.cos(m.rotation.y);s=Math.sin(m.rotation.y);[x,z]=[x*c+z*s,-x*s+z*c];
            c=Math.cos(m.rotation.z);s=Math.sin(m.rotation.z);[x,y]=[x*c-y*s,x*s+y*c];
            return{x:x+m.position.x,y:y+m.position.y,z:z+m.position.z};
        }
        private pointInTriangle(px:number,py:number,a:{x:number;y:number},b:{x:number;y:number},c:{x:number;y:number}):boolean
        {
            const d=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(d)<1e-8)return false;
            const u=((b.y-c.y)*(px-c.x)+(c.x-b.x)*(py-c.y))/d;
            const v=((c.y-a.y)*(px-c.x)+(a.x-c.x)*(py-c.y))/d;
            const w=1-u-v;return u>=0&&v>=0&&w>=0;
        }
        private pick(clientX:number,clientY:number):Operand|null
        {
            const host=S(this).canvas,surface=host?.canvas;if(!host||!surface)return null;
            const rect=surface.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return null;
            const px=(clientX-rect.left)*(surface.width/rect.width),py=(clientY-rect.top)*(surface.height/rect.height);
            const camera=host.camera.position,target={x:0,y:0,z:0};
            const forward=norm(sub(target,camera)),right=norm(cross(forward,{x:0,y:1,z:0})),up=cross(right,forward),focal=surface.height*.82;
            let best:Operand|null=null,bestDepth=Infinity;
            for(const mesh of host.scene.children)
            {
                if(!mesh.visible||mesh.userData.csgGenerated===true||mesh.userData.csgSelectable===false)continue;
                const projected=mesh.geometry.vertices.map(v=>
                {
                    const world=this.transform(v,mesh),rel=sub(world,camera),z=dot(rel,forward);
                    return{x:surface.width/2+focal*dot(rel,right)/Math.max(.08,z),y:surface.height/2-focal*dot(rel,up)/Math.max(.08,z),z};
                });
                const idx=mesh.geometry.indices;
                for(let i=0;i<idx.length;i+=3)
                {
                    const a=projected[idx[i]],b=projected[idx[i+1]],c=projected[idx[i+2]];if(!a||!b||!c||a.z<=.08||b.z<=.08||c.z<=.08)continue;
                    if(!this.pointInTriangle(px,py,a,b,c))continue;
                    const depth=(a.z+b.z+c.z)/3;if(depth<bestDepth){bestDepth=depth;best=mesh;}
                }
            }
            return best;
        }

        private wireDrag(head:HTMLElement):void
        {
            head.onpointerdown=e=>
            {
                if(e.button!==0)return;e.preventDefault();const left=this.offsetLeft,top=this.offsetTop;
                S(this).drag={id:e.pointerId,x:e.clientX,y:e.clientY,left,top};
                this.style.right='auto';this.style.bottom='auto';this.style.left=`${left}px`;this.style.top=`${top}px`;
                try{head.setPointerCapture(e.pointerId);}catch{}
            };
            head.onpointermove=e=>
            {
                const d=S(this).drag;if(!d||d.id!==e.pointerId)return;
                const parent=this.offsetParent as HTMLElement|null,maxLeft=parent?Math.max(0,parent.clientWidth-this.offsetWidth):Number.POSITIVE_INFINITY,maxTop=parent?Math.max(0,parent.clientHeight-this.offsetHeight):Number.POSITIVE_INFINITY;
                this.style.left=`${Math.max(0,Math.min(maxLeft,d.left+e.clientX-d.x))}px`;this.style.top=`${Math.max(0,Math.min(maxTop,d.top+e.clientY-d.y))}px`;
            };
            const up=(e:PointerEvent)=>{if(S(this).drag?.id===e.pointerId)S(this).drag=null;};head.onpointerup=up;head.onpointercancel=up;
        }
        private installResize():void
        {
            const edges=[['n','top:-7px;left:14px;right:14px;height:14px','n-resize'],['s','bottom:-7px;left:14px;right:14px;height:14px','s-resize'],['e','right:-7px;top:14px;bottom:14px;width:14px','e-resize'],['w','left:-7px;top:14px;bottom:14px;width:14px','w-resize'],['ne','right:-8px;top:-8px;width:18px;height:18px','ne-resize'],['nw','left:-8px;top:-8px;width:18px;height:18px','nw-resize'],['se','right:-8px;bottom:-8px;width:18px;height:18px','se-resize'],['sw','left:-8px;bottom:-8px;width:18px;height:18px','sw-resize']] as const;
            for(const [edge,css,cursor] of edges)
            {
                const h=document.createElement('div');h.className='Csg-Resize';h.style.cssText=`${css};cursor:${cursor};touch-action:none`;
                let s:{id:number;x:number;y:number;l:number;t:number;w:number;h:number}|null=null;
                h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();s={id:e.pointerId,x:e.clientX,y:e.clientY,l:this.offsetLeft,t:this.offsetTop,w:this.offsetWidth,h:this.offsetHeight};this.style.right='auto';this.style.bottom='auto';this.style.left=`${s.l}px`;this.style.top=`${s.t}px`;try{h.setPointerCapture(e.pointerId);}catch{}};
                h.onpointermove=e=>
                {
                    if(!s||s.id!==e.pointerId)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;let l=s.l,t=s.t,w=s.w,hh=s.h;
                    if(edge.includes('e'))w+=dx;if(edge.includes('s'))hh+=dy;if(edge.includes('w')){w-=dx;l+=dx;}if(edge.includes('n')){hh-=dy;t+=dy;}
                    const minW=270,minH=220;if(w<minW){if(edge.includes('w'))l-=minW-w;w=minW;}if(hh<minH){if(edge.includes('n'))t-=minH-hh;hh=minH;}
                    const parent=this.offsetParent as HTMLElement|null;if(parent){l=Math.max(0,l);t=Math.max(0,t);w=Math.min(w,Math.max(minW,parent.clientWidth-l));hh=Math.min(hh,Math.max(minH,parent.clientHeight-t));}
                    this.style.left=`${l}px`;this.style.top=`${t}px`;this.style.width=`${w}px`;this.style.height=`${hh}px`;
                };
                h.onpointerup=h.onpointercancel=e=>{if(s?.id===e.pointerId)s=null;};this.appendChild(h);
            }
        }
    }
}

export type CsgOperation=Csg.Operation;
export type CsgMode=Csg.Mode;
export type CsgOperand=Csg.Operand;
/** Explicit decorated component value for bundle/barrel registration. */
export const CsgComponent=Csg.Csg;
export default Csg.Csg;
