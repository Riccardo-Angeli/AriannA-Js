/** Optional movable, dockable and resizable topology window. No renderer ownership. */
import Dockable from '../2D/modifiers/Dockable.ts';
import type { Canvas3D } from './Canvas3D.ts';
import Selection3D from './Selection3D.ts';

export interface SceneGraphOptions {
 canvas:Canvas3D.Canvas3D;
 object?:Canvas3D.Mesh3;
 selection?:InstanceType<typeof Selection3D>;
 theme?:'dark'|'light';
}
/** new SceneGraph({canvas, object}). Window and Dock remain independently accessible. */
export class SceneGraph {
 public readonly Window:HTMLElement;
 public readonly Dock:InstanceType<typeof Dockable>;
 public readonly Selection:InstanceType<typeof Selection3D>;
 private owned=false;
 private cleanup:()=>void;
 constructor(options:SceneGraphOptions){
  const {canvas,object}=options;
  this.owned=!!object&&!options.selection;
  this.Selection=options.selection??(object?new Selection3D():canvas.Selection);
  if(this.owned){
   // Use a structural adapter without impersonating a native HTMLElement.
   this.Selection.attach({selectionSurface:canvas.selectionSurface,getMeshes:()=>[object!],
    rayFromClient:canvas.rayFromClient.bind(canvas),projectWorld:canvas.projectWorld.bind(canvas),
    localToWorld:canvas.localToWorld.bind(canvas),onFrame:canvas.onFrame.bind(canvas),
    getBoundingClientRect:canvas.getBoundingClientRect.bind(canvas),
    appendChild:canvas.appendChild.bind(canvas),addEventListener:canvas.addEventListener.bind(canvas),
    removeEventListener:canvas.removeEventListener.bind(canvas),getAttribute:canvas.getAttribute.bind(canvas)
   } as unknown as Parameters<InstanceType<typeof Selection3D>['attach']>[0]);
  }
  this.Window=this.Selection.Window;
  this.Window.querySelector('header')?.remove();
  this.Window.querySelector('.Selection3DWindow-Modes')?.remove();
  this.Window.style.cssText='position:relative;width:100%;height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;overflow:hidden;background:#292d31;color:#e5e8ea;font:11px/1.5 system-ui';
  this.Window.dataset.theme=options.theme??(canvas.getAttribute('theme')==='light'?'light':'dark');
  // AriannA append(parent) mounts the component into its argument.
  // Use the native child API to keep the window inside the canvas.
  canvas.appendChild(this.Window);
  this.Dock=new Dockable(this.Window,{container:canvas,position:'float',title:'SceneGraph',width:248,height:320,minWidth:190,minHeight:140,theme:this.Window.dataset.theme as 'dark'|'light',barPosition:'bottom',contentInsets:{top:0,bottom:0}});
  const layout=()=>{
   const header=canvas.querySelector<HTMLElement>('.Canvas3D-Toolbar:not(.Canvas3D-SelectionBar):not(.Canvas3D-TransformFooter)');
   const footer=canvas.querySelector<HTMLElement>('.Canvas3D-TransformFooter');
   const top=header?.offsetHeight??0;
   this.Dock.configure({contentInsets:{top,bottom:footer?.offsetHeight??0}});
  };
  layout();
  if(this.Dock.Wrapper){this.Dock.Wrapper.style.left='12px';this.Dock.Wrapper.style.top=((canvas.querySelector<HTMLElement>('.Canvas3D-Toolbar')?.offsetHeight??0)+6)+'px';}
  const observer=new ResizeObserver(layout);observer.observe(canvas);
  for(const element of canvas.querySelectorAll<HTMLElement>('.Canvas3D-Toolbar'))observer.observe(element);
  canvas.addEventListener('arianna:toolbar-layout',layout);
  this.Selection.refreshWindow(true);
  const dispose=()=>this.destroy();canvas.addEventListener('arianna:canvas-dispose',dispose,{once:true});
  this.cleanup=()=>{observer.disconnect();canvas.removeEventListener('arianna:toolbar-layout',layout);canvas.removeEventListener('arianna:canvas-dispose',dispose);};
 }
 public refresh():void{this.Selection.refreshWindow(true);}
 public destroy():void{this.cleanup?.();this.Dock.destroy();this.Window.remove();if(this.owned)this.Selection.detach();}
}
export default SceneGraph;
