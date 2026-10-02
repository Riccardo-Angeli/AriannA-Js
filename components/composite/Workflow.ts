/**
 * @module components/composite/Workflow
 * @author Riccardo Angeli
 * @version 2.3.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description Schema-driven dockable workflow editor with typed ports and arithmetic graph execution.
 */
import { Component, Css, Templates } from '../../core/index.ts';
import Canvas2D from '../graphics/2D/Canvas2D.ts';
import Grid2D from '../graphics/2D/Grid2D.ts';
import SelectionRectangle from '../graphics/SelectionRectangle.ts';
import Dockable from '../graphics/2D/modifiers/Dockable.ts';

const html = Templates.Template.Html;

export namespace NodeEditor
{
    export namespace Types
    {
        export type Operation = 'module' | 'input' | 'output' | 'number' | 'result' | 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power' | 'root' | 'log' | 'exp';
        export type Theme = 'dark' | 'light';
        export type WireStatus = 'connected-ok' | 'connected-warn' | 'connected-error';
        export type RunState = 'idle' | 'running' | 'paused';
        export type TypeCheckFn = (srcType: string, dstType: string) => WireStatus | null;
    }

    export namespace Interfaces
    {
        export interface PortSpec { id: string; type: string; label?: string; }

        export interface ParamSpec
        {
            id: string;
            type: 'number' | 'string' | 'boolean' | 'enum';
            label?: string;
            default?: unknown;
            min?: number;
            max?: number;
            options?: string[];
        }

        export interface NodeSchema
        {
            type: string;
            name: string;
            category: string;
            color?: string;
            icon?: string;
            inputs: PortSpec[];
            outputs: PortSpec[];
            params?: ParamSpec[];
            description?: string;
            /** Optional numeric execution contract; the catalog remains application supplied. */
            operation?: Types.Operation;
        }

        export interface Graph { nodes:NodeInstance[]; wires:WireInstance[]; }
        export interface Clipboard extends Graph {format:'arianna-workflow-selection';version:1;}

        export interface NodeInstance
        {
            id: string;
            type: string;
            x: number;
            y: number;
            schema: NodeSchema;
            params?: Record<string, unknown>;
            graph?: Graph;
        }

        export interface WireInstance
        {
            id: string;
            srcNodeId: string;
            srcPortId: string;
            srcType: string;
            dstNodeId: string;
            dstPortId: string;
            dstType: string;
            status: Types.WireStatus;
        }

        export interface NodeEditorOptions
        {
            schemas?: NodeSchema[];
            typeCheck?: Types.TypeCheckFn;
            theme?: Types.Theme;
            nodes?: NodeInstance[];
            wires?: WireInstance[];
        }
    }

    /** Only graph composition primitives are built in; applications supply their operand catalog. */
    export const IOSchemas:Interfaces.NodeSchema[]=[
        {type:'empty',name:'Empty',category:'IO',operation:'module',icon:'□',color:'#a56de2',inputs:[{id:'in',type:'number',label:'In'}],outputs:[{id:'out',type:'number',label:'Out'}]},
        {type:'input',name:'Input',category:'IO',operation:'input',icon:'→',color:'#4d93e6',inputs:[],outputs:[{id:'out',type:'number'}],params:[{id:'portId',type:'string',label:'External input ID',default:'in'},{id:'portType',type:'enum',label:'Type',default:'number',options:['number','float','integer']},{id:'value',type:'number',label:'Preview value',default:0}]},
        {type:'output',name:'Output',category:'IO',operation:'output',icon:'←',color:'#82be4c',inputs:[{id:'value',type:'number'}],outputs:[],params:[{id:'portId',type:'string',label:'External output ID',default:'out'},{id:'portType',type:'enum',label:'Type',default:'number',options:['number','float','integer']}]}
    ];
    const Catalog=(schemas:Interfaces.NodeSchema[])=>[...schemas,...IOSchemas.filter(b=>!schemas.some(s=>s.type===b.type))].map(s=>['number','result','input','output','module'].includes(s.operation??'')?{...s,category:'IO'}:s);
    const EmptyGraph=():Interfaces.Graph=>({nodes:IOSchemas.slice(1).map((schema,i)=>({id:i?'module-output':'module-input',type:schema.type,x:i?370:40,y:100,schema:structuredClone(schema),params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))})),wires:[]});

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.NodeEditor', {
            Background: '#202428', Border: '1px solid #121517', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#e5e8ea', Display: 'block',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            Height: '640px', MaxWidth: '100%', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-Shell', {
            Display: 'grid', GridTemplateRows: '38px minmax(0,1fr)', Height: '100%', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40,#25292d)',
            BorderBottom: '1px solid #111417', Display: 'flex', Gap: '4px', Padding: '5px 7px', OverflowX:'auto'
        }),
        new Css.Rule('.NodeEditor-Title', { FontSize: '11px', FontWeight: '760', MarginRight: '5px' }),
        new Css.Rule('.NodeEditor-State', {
            Color: '#8d969e', Font: '9px/1 var(--arianna-font,system-ui,sans-serif)', MarginRight: 'auto'
        }),
        new Css.Rule('.NodeEditor-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#444a50,#30353a)',
            Border: '1px solid #15181a', BorderRadius: '3px', Color: '#dce0e3',
            Cursor: 'pointer', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '25px', Padding: '0 7px', FlexShrink:'0'
        }),
        new Css.Rule('.NodeEditor-Button:disabled', { Opacity: '.45', Cursor: 'default' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]:disabled', {Opacity:'1'}),
        new Css.Rule('.NodeEditor-Button:hover', { Background: 'linear-gradient(180deg,#51585e,#383d42)' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]', {
            Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',
            BorderColor:'#e40c88',Color:'#fff',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'
        }),
        new Css.Rule('.NodeEditor-Button:focus-visible,.NodeEditor-Input:focus-visible,.NodeEditor-PaletteSearch:focus-visible', {Outline:'2px solid #e40c88',OutlineOffset:'2px'}),

        /*
         * Playground-like LEFT PANE | WORKSPACE | INSPECTOR
         */
        new Css.Rule('.NodeEditor-Body', {
            Display: 'grid', GridTemplateColumns: '190px minmax(0,1fr) 190px', OverflowX:'auto', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-Palette', {
            Background: '#1b1e22', BorderRight: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '42px 39px minmax(0,1fr)', MinHeight: '0', MinWidth: '0'
        }),
        new Css.Rule('.NodeEditor-PaletteHeader', {
            AlignItems: 'center', Background: '#202429', BorderBottom: '1px solid #101316',
            Display: 'flex', Gap: '8px', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-PaletteTitle', {
            Color: '#c7cdd2', Font: '800 9px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.08em', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCount', {
            Background: '#111418', Border: '1px solid #343a40', BorderRadius: '9px',
            Color: '#89939c', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)',
            MarginLeft: 'auto', MinWidth: '20px', Padding: '3px 5px', TextAlign: 'center'
        }),
        new Css.Rule('.NodeEditor-PaletteSearchWrap', {
            AlignItems: 'center', BorderBottom: '1px solid #111417', Display: 'flex', Padding: '6px 8px'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch', {
            Appearance: 'none', Background: '#121519', Border: '1px solid #343a40',
            BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e4e7ea',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)', Height: '27px',
            Outline: 'none', Padding: '0 8px', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)'
        }),
        new Css.Rule('.NodeEditor-PaletteBody', {
            MinHeight: '0', OverflowY: 'auto', Padding: '5px 6px 10px'
        }),
        new Css.Rule('.NodeEditor-PaletteCategory', { MarginTop: '4px' }),
        new Css.Rule('.NodeEditor-PaletteCategoryHeader', {
            AlignItems: 'center', Color: '#89929a', Display: 'flex',
            Font: '800 8px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.04em', Padding: '7px 5px 5px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCategoryCount', {
            Color: '#626b73', FontWeight: '700', MarginLeft: 'auto'
        }),
        new Css.Rule('.NodeEditor-Module', {
            AlignItems: 'center', Background: '#22272c', Border: '1px solid transparent',
            BorderRadius: '5px', Cursor: 'grab', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '29px minmax(0,1fr)', MarginBottom: '3px',
            Padding: '6px', UserSelect: 'none'
        }),
        new Css.Rule('.NodeEditor-Module:hover', {
            Background: '#292f34', BorderColor: '#444b52'
        }),
        new Css.Rule('.NodeEditor-Module[data-dragging="true"]', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)', Opacity: '.72'
        }),
        new Css.Rule('.NodeEditor-ModuleIcon', {
            AlignItems: 'center', Background: 'var(--module-color,#e40c88)', BorderRadius: '5px',
            Color: '#fff', Display: 'flex', Font: '800 10px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '27px', JustifyContent: 'center', Overflow: 'hidden', Width: '27px'
        }),
        new Css.Rule('.NodeEditor-ModuleName', {
            Color: '#dce1e5', Font: '720 9px/1.15 var(--arianna-font,system-ui,sans-serif)',
            Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-ModuleDescription', {
            Color: '#78828b', Font: '8px/1.25 var(--arianna-font,system-ui,sans-serif)',
            MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-PaletteEmpty', {
            Color: '#77818a', Font: '9px/1.4 var(--arianna-font,system-ui,sans-serif)',
            Padding: '14px 8px', TextAlign: 'center'
        }),

        new Css.Rule('.NodeEditor-Workspace', {
            BackgroundColor: '#1b1f22',
            BackgroundImage: 'radial-gradient(circle,#3a4045 1px,transparent 1px)',
            BackgroundSize: '20px 20px', MinWidth: '260px', Overflow: 'auto', Position: 'relative'
        }),
        new Css.Rule('.NodeEditor-Workspace[data-drag-over="true"]', {
            BoxShadow: 'inset 0 0 0 2px #e40c88'
        }),
        new Css.Rule('.NodeEditor-Workspace::after', {
            Background: 'radial-gradient(circle at 50% 45%,transparent 0 45%,rgba(0,0,0,.18) 100%)',
            Content: '""', Inset: '0', PointerEvents: 'none', Position: 'absolute'
        }),
        new Css.Rule('.NodeEditor-Wires', {
            Height: '100%', Inset: '0', Overflow: 'visible', PointerEvents: 'none',
            Position: 'absolute', Width: '100%', ZIndex: '1'
        }),
        new Css.Rule('.NodeEditor-Wire', { Fill: 'none', Stroke: '#fff', StrokeWidth: '2',StrokeLinejoin:'round',StrokeLinecap:'round' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-warn"]', { Stroke: '#fff' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-error"]', { Stroke: '#fff' }),
        new Css.Rule('.NodeEditor-Node', {
            Background: '#2a2f33', Border: '1px solid #43494e', BorderRadius: '10px',
            BoxShadow: '0 7px 18px rgba(0,0,0,.28)', Width:'174px', MinWidth: '174px', BoxSizing:'border-box',
            Position: 'absolute', UserSelect: 'none', ZIndex: '2'
        }),
        new Css.Rule('.NodeEditor-Node[data-selected="true"]', {
            BorderColor: '#e40c88',
            BoxShadow: '0 0 0 2px rgba(228,12,136,.16),0 8px 20px rgba(0,0,0,.32)'
        }),
        new Css.Rule('.NodeEditor-NodeHeader', {
            AlignItems: 'center', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '32px 1fr auto', Padding: '9px 10px 7px'
        }),
        new Css.Rule('.NodeEditor-NodeIcon', {
            AlignItems: 'center', Background: 'var(--node-color,#e40c88)', BorderRadius: '8px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.22)', Color: '#fff',
            Display: 'flex', FontSize: '13px', Height: '30px', JustifyContent: 'center', Width: '30px'
        }),
        new Css.Rule('.NodeEditor-NodeName', { FontSize: '10px', FontWeight: '760' }),
        new Css.Rule('.NodeEditor-NodeType', { Color: '#8f979f', FontSize: '8px', MarginTop: '2px' }),
        new Css.Rule('.NodeEditor-NodeMenu', { Color: '#8f979f', FontSize: '14px' }),
        new Css.Rule('.NodeEditor-NodeBody', {
            BorderTop: '1px solid #3a4045', Color: '#aab1b7', FontSize: '8.5px',
            LineHeight: '1.35', Padding: '7px 10px 9px'
        }),
        new Css.Rule('.NodeEditor-Port', {
            AlignItems: 'center', Display: 'flex', FontSize: '8px', Gap: '5px',
            Position: 'absolute', Top: '50%', Transform: 'translateY(-50%)'
        }),
        new Css.Rule('.NodeEditor-Port[data-side="in"]', { Left: '-7px' }),
        new Css.Rule('.NodeEditor-Port[data-side="out"]', { Right: '-7px' }),
        new Css.Rule('.NodeEditor-PortDot', {
            Background: '#202428', Border: '2px solid #4eb0a5', BorderRadius: '50%',
            BoxShadow: '0 0 0 2px #1b1f22', Height: '9px', Width: '9px'
        }),
        new Css.Rule('.NodeEditor-Add', {
            AlignItems: 'center', Appearance: 'none', Background: '#2a2f33',
            Border: '1px solid #4a5056', BorderRadius: '50%', Color: '#c8ced3',
            Cursor: 'pointer', Display: 'flex', FontSize: '16px', Height: '34px',
            JustifyContent: 'center', Position: 'absolute', Width: '34px', ZIndex: '3'
        }),

        new Css.Rule('.NodeEditor-Inspector', {
            Background: '#24282c', BorderLeft: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '44px 1fr', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-InspectorHeader', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#33383d,#292d31)',
            BorderBottom: '1px solid #15181a', Display: 'flex', FontSize: '10px',
            FontWeight: '760', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-InspectorBody', { OverflowY: 'auto', Padding: '10px' }),
        new Css.Rule('.NodeEditor-SectionTitle', {
            Color: '#7f8890', FontSize: '8px', FontWeight: '800',
            LetterSpacing: '.09em', Margin: '9px 0 6px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-Info', {
            Background: '#1c2024', Border: '1px solid #353a40', BorderRadius: '6px',
            FontSize: '9px', LineHeight: '1.4', Padding: '8px'
        }),
        new Css.Rule('.NodeEditor-Param', { Display: 'grid', Gap: '4px', MarginBottom: '8px' }),
        new Css.Rule('.NodeEditor-Param label', { Color: '#8f979f', FontSize: '8px' }),
        new Css.Rule('.NodeEditor-Input', {
            Appearance: 'none', Background: '#171b1e', Border: '1px solid #40464c',
            BorderRadius: '4px', Color: '#e0e4e7',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)',
            Outline: 'none', Padding: '7px'
        }),
        new Css.Rule('.NodeEditor-Input:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.13)'
        }),

        new Css.Rule('.NodeEditor[theme="light"]', {
            Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Toolbar,.NodeEditor[theme="light"] .NodeEditor-InspectorHeader', {
            Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button', {
            Background: 'linear-gradient(180deg,#f9fbfc,#e0e4e7)', BorderColor: '#b8bdc2', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Palette', {
            Background: '#f4f5f6', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteHeader', {
            Background: '#e8ebed', BorderColor: '#c6cacf'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteTitle', { Color: '#4b545c' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCount', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#667079'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearchWrap', { BorderColor: '#c7ccd0' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearch', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCategoryHeader', { Color: '#6e7881' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module', {
            Background: '#fff', BorderColor: '#d7dbde'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module:hover', {
            Background: '#f7f8f9', BorderColor: '#aeb5bb'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleName', { Color: '#333a40' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleDescription', { Color: '#7a838b' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Workspace', {
            BackgroundColor: '#fafafa',
            BackgroundImage: 'radial-gradient(circle,#c6cacd 1px,transparent 1px)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Node', {
            Background: '#fff', BorderColor: '#c6cbd0', BoxShadow: '0 6px 16px rgba(0,0,0,.12)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-NodeBody', {
            BorderTopColor: '#e2e4e6', Color: '#626970'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Inspector', {
            Background: '#e5e8ea', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Info,.NodeEditor[theme="light"] .NodeEditor-Input', {
            Background: '#fff', BorderColor: '#c5cacf', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]', {Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',BorderColor:'#e40c88',Color:'#fff'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-State,.NodeEditor[theme="light"] .NodeEditor-SectionTitle,.NodeEditor[theme="light"] .NodeEditor-Param label', {Color:'#626a71'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PortDot', {Background:'#fff',BoxShadow:'0 0 0 2px #eef0f2'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Add', {Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Wire,.NodeEditor[state="paused"] .NodeEditor-Wire', {StrokeDasharray:'none'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Workspace', {BoxShadow:'inset 0 0 0 1px #e40c8855'})
,

        new Css.Rule('.NodeEditor-Body',{Display:'block',Position:'relative',Overflow:'hidden',MinWidth:'0'}),
        new Css.Rule('.NodeEditor-Viewport',{Position:'absolute',Inset:'0',MinWidth:'0',MinHeight:'0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas',{Width:'100%',Height:'100%',MinHeight:'0',Border:'0',BorderRadius:'0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas .Canvas2D-Artboard',{Width:'calc(100% - 24px)',Height:'calc(100% - 24px)'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas .Canvas2D-World',{Overflow:'visible'}),
        new Css.Rule('.NodeEditor .NodeEditor-Workspace,.NodeEditor[theme="light"] .NodeEditor-Workspace',{Background:'none',Position:'absolute',Inset:'0',Overflow:'visible',MinWidth:'0',PointerEvents:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Node',{PointerEvents:'auto',Overflow:'hidden'}),
        new Css.Rule('.NodeEditor .NodeEditor-NodeBody',{Padding:'8px 24px 12px',MinHeight:'52px',BoxSizing:'border-box'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port',{Appearance:'none',Position:'absolute',Transform:'none',Width:'16px',Height:'7px',Padding:'0',Border:'1px solid #ffffff40',Background:'linear-gradient(180deg,#858c92,#414950)',Cursor:'crosshair',ZIndex:'3',BoxSizing:'border-box'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-side="in"]',{Left:'0',Right:'auto',BorderRadius:'0 4px 4px 0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-side="out"]',{Right:'0',Left:'auto',BorderRadius:'4px 0 0 4px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-ok"]',{Background:'linear-gradient(180deg,#ecffb7 0%,#b1ef38 38%,#6ab800 75%,#3b6e00)',BoxShadow:'0 0 5px #a5f72a99,inset 0 1px 2px #fff9'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-warn"]',{Background:'linear-gradient(180deg,#eadb88,#b69a14 40%,#786300)',BoxShadow:'0 0 5px #c2a32377,inset 0 1px 2px #fff7'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-error"]',{Background:'linear-gradient(180deg,#ffc0b8,#ff4545 40%,#a90707)',BoxShadow:'0 0 5px #ff333399,inset 0 1px 2px #fff8'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-pending="true"]',{Outline:'2px solid #e40c88',OutlineOffset:'-2px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire',{Stroke:'#fff',StrokeWidth:'2',Filter:'drop-shadow(0 1px 1px #0008)',PointerEvents:'none',Cursor:'pointer'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire[data-preview="true"]',{StrokeDasharray:'none',PointerEvents:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-active="true"],.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]',{Background:'linear-gradient(180deg,#444a50,#30353a)',BorderColor:'#15181a',Color:'#dce0e3',BoxShadow:'none'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button:disabled',{Opacity:'1'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-kind="run"][data-active="true"] .NodeEditor-ControlGlyph',{Color:'#adff2f',TextShadow:'0 0 4px #afff32,0 0 10px #80ee44'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-kind="stop"][data-active="true"] .NodeEditor-ControlGlyph',{Color:'#ff4545',TextShadow:'0 0 4px #ff4545,0 0 10px #ff2222'}),
        new Css.Rule('.NodeEditor .NodeEditor-PaletteCategoryHeader',{Appearance:'none',Width:'100%',Border:'0',Background:'transparent',Cursor:'pointer',TextAlign:'left'}),
        new Css.Rule('.NodeEditor .NodeEditor-Palette,.NodeEditor .NodeEditor-Inspector',{Width:'100%',Height:'100%',MinHeight:'0',BoxSizing:'border-box'}),
        new Css.Rule('.NodeEditor .NodeEditor-Input',{Width:'100%',BoxSizing:'border-box',MinWidth:'0',MarginBottom:'4px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Result',{Display:'block',FontSize:'22px',TextAlign:'center',Color:'inherit',Padding:'4px 0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Base',{Appearance:'none',Color:'inherit',Background:'transparent',Border:'1px solid #8886',BorderRadius:'3px',Cursor:'text',Padding:'2px 5px',MarginBottom:'4px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Error',{Color:'#eb9d42',FontSize:'9px',MarginTop:'4px'}),
        new Css.Rule('.NodeEditor [hidden]',{Display:'none'}),
        new Css.Rule('.NodeEditor [data-grid2d]',{Filter:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire[data-selected="true"]',{Stroke:'#fff',Filter:'drop-shadow(0 0 3px #e40c88) drop-shadow(0 1px 1px #0008)'}),
        new Css.Rule('.NodeEditor .NodeEditor-WireHit',{Fill:'none',Stroke:'transparent',StrokeWidth:'10',StrokeDasharray:'none',PointerEvents:'stroke',Cursor:'pointer'}),
        new Css.Rule('.NodeEditor-WireMenu',{Position:'fixed',ZIndex:'2147483647',MinWidth:'170px',MaxWidth:'calc(100vw - 16px)',Padding:'4px',Display:'grid',Gap:'2px',Background:'#292d31',Color:'#e4e8eb',Border:'1px solid #44474e',BorderRadius:'6px',BoxShadow:'0 12px 32px #0008',Font:'11px/1.3 var(--arianna-font,system-ui,sans-serif)'}),
        new Css.Rule('.NodeEditor-WireMenu button',{Appearance:'none',TextAlign:'left',Border:'0',BorderRadius:'4px',Padding:'7px 10px',Font:'inherit',Cursor:'pointer',Color:'inherit',Background:'transparent'}),
        new Css.Rule('.NodeEditor-WireMenu button:hover,.NodeEditor-WireMenu button:focus-visible',{Outline:'none',Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff'}),
        new Css.Rule('.NodeEditor-WireMenu[data-theme="light"]',{Background:'#eef0f2',Color:'#25292d',BorderColor:'#b9bec3'}),
        new Css.Rule('.NodeEditor-WireMenuInfo',{Padding:'6px 10px',Color:'inherit',Opacity:'.75',FontSize:'10px',OverflowWrap:'anywhere',BorderBottom:'1px solid #8885'})
    
    ]);

    interface Runtime {
        canvas:Canvas2D|null; grid:Grid2D|null; docks:Dockable[];
        dockPositions:Array<'left'|'right'|'top'|'bottom'|'float'>;
        dockRects:Array<{left:string;top:string;width:string;height:string}>;
        viewport:ReturnType<Canvas2D['getViewport']>|null;
        controller:AbortController|null; resize:ResizeObserver|null;
        collapsed:Set<string>; values:Map<string,number>; errors:Map<string,string>;
        selection:SelectionRectangle|null; selectedNodes:Set<string>; selectedWires:Set<string>; syncingSelection:boolean; pasteCount:number;
        modules:Map<string,{editor:NodeEditor;close:(save?:boolean)=>void}>; bindings:Record<string,number>|null; outputs:Map<string,Map<string,number>>;
        selectedWire:string|null; closeMenu:(()=>void)|null;
        pending:{node:string;port:string}|null; pointer:{x:number;y:number}|null;
        frame:number|null; urls:Set<string>; timers:Set<ReturnType<typeof setTimeout>>;
    }
    let clipboard:Interfaces.Clipboard|null=null;
    let sequence=0;const Unique=(prefix:string)=>`${prefix}-${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2,7)}`;
    const runtimes=new WeakMap<HTMLElement,Runtime>();

    // Additive rules preserve the established Dark/Light AriannA palette.
    @Component('arianna-node-editor',Styles, {
        Shadow:false,Attributes:['theme','state'],Properties:['schemas','nodes','wires']
    })
    export class NodeEditor extends HTMLDivElement {
        public static readonly Styles=Styles;
        public template=html``;
        private _schemas:Interfaces.NodeSchema[]=[];
        private _nodes:Interfaces.NodeInstance[]=[];
        private _wires:Interfaces.WireInstance[]=[];
        private _state:Types.RunState='idle';
        private _selected:string|null=null;
        private _typeCheck:Types.TypeCheckFn=(a,b)=>this.CheckType(a,b);
        private _runController:AbortController|null=null;

        private runtime():Runtime {
            let r=runtimes.get(this);
            if(!r){r={canvas:null,grid:null,docks:[],dockPositions:['left','right'],dockRects:[],viewport:null,controller:null,resize:null,collapsed:new Set(),values:new Map(),errors:new Map(),selection:null,selectedNodes:new Set(),selectedWires:new Set(),syncingSelection:false,pasteCount:0,modules:new Map(),bindings:null,outputs:new Map(),selectedWire:null,closeMenu:null,pending:null,pointer:null,frame:null,urls:new Set(),timers:new Set()};runtimes.set(this,r);}return r;
        }
        private EnsureState():void {
            if(!Array.isArray(this._schemas))this._schemas=[];this._schemas=Catalog(this._schemas);
            if(!Array.isArray(this._nodes))this._nodes=[];
            if(!Array.isArray(this._wires))this._wires=[];
            if(!['idle','running','paused'].includes(this._state))this._state='idle';
            if(typeof this._selected!=='string')this._selected=null;
            if(typeof this._typeCheck!=='function')this._typeCheck=(a,b)=>this.CheckType(a,b);
        }
        constructor(options:Interfaces.NodeEditorOptions={}) {
            super();if(options.theme)this.setAttribute('theme',options.theme);
            this._schemas=options.schemas??[];this._nodes=structuredClone(options.nodes??[]);this._wires=structuredClone(options.wires??[]);
            if(options.typeCheck)this._typeCheck=options.typeCheck;
        }
        public onCreated():void {
            const r=this.runtime();if(r.frame!==null)cancelAnimationFrame(r.frame);
            r.frame=requestAnimationFrame(()=>{r.frame=null;if(this.isConnected&&!this.querySelector('.NodeEditor-Shell'))this.onConnected();});
        }
        public onConnected():void {this.EnsureState();this.classList.add('NodeEditor');if(!this.hasAttribute('tabindex'))this.tabIndex=0;if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render();}
        public onAttributeChanged(name:string):void {
            if(name==='state'){const value=this.getAttribute('state'),next=value==='running'||value==='paused'?value:'idle';if(next!==this._state)this.setRunState(next);}
            else if(name==='theme'&&this.isConnected)this.Render();
        }
        public onDisconnected():void {const r=this.runtime();for(const item of [...r.modules.values()])item.close(false);this.Stop();if(r.frame!==null)cancelAnimationFrame(r.frame);r.frame=null;this.DisposeView();for(const t of r.timers)clearTimeout(t);r.timers.clear();for(const u of r.urls)URL.revokeObjectURL(u);r.urls.clear();}
        public onUnmount():void {this.onDisconnected();}
        public get schemas():Interfaces.NodeSchema[]{this.EnsureState();return this._schemas;}
        public set schemas(v:Interfaces.NodeSchema[]){this.EnsureState();this._schemas=Catalog(Array.isArray(v)?v:[]);if(this.isConnected)this.Render();}
        public get nodes():Interfaces.NodeInstance[]{this.EnsureState();return this._nodes;}
        public set nodes(v:Interfaces.NodeInstance[]){this.EnsureState();this._nodes=(Array.isArray(v)?v:[]).map(n=>structuredClone(n));if(this.isConnected)this.Render();}
        public get wires():Interfaces.WireInstance[]{this.EnsureState();return this._wires;}
        public set wires(v:Interfaces.WireInstance[]){this.EnsureState();this._wires=structuredClone(Array.isArray(v)?v:[]);this.Revalidate();if(this.isConnected)this.Render();}
        public setSchemas(v:Interfaces.NodeSchema[]):this{this.schemas=v;return this;}
        public setTypeCheck(fn:Types.TypeCheckFn):this{this._typeCheck=fn;this.Revalidate();this.Refresh();return this;}
        public get Canvas():Canvas2D|null{return this.runtime().canvas;}
        public get Grid():Grid2D|null{return this.runtime().grid;}
        public get Panels():readonly Dockable[]{return this.runtime().docks;}
        public get Results():ReadonlyMap<string,number>{return new Map(this.runtime().values);}
        public get Errors():ReadonlyMap<string,string>{return new Map(this.runtime().errors);}
        public get runState():Types.RunState{this.EnsureState();return this._state;}
        public get RunSignal():AbortSignal|null{return this._runController?.signal??null;}
        public setRunState(state:Types.RunState):this {
            this.EnsureState();if(!['idle','running','paused'].includes(state))throw new TypeError('Invalid Workflow state: '+state);
            const previous=this._state;
            if(state==='running'&&(!this._runController||this._runController.signal.aborted))this._runController=new AbortController();
            if(state==='idle'){this._runController?.abort(new DOMException('Workflow stopped.','AbortError'));this._runController=null;this.runtime().pending=null;}
            this._state=state;if(this.getAttribute('state')!==state)this.setAttribute('state',state);this.UpdateRunControls();
            if(previous!==state)this.dispatchEvent(new CustomEvent('arianna:workflow-state',{bubbles:true,composed:true,detail:{state,previous,signal:this.RunSignal,source:this}}));
            return this;
        }
        public Run():this {this.setRunState('running');this.Evaluate();return this;}
        public Pause():this{return this.setRunState('paused');}
        public Stop():this{this.setRunState('idle');this.UpdatePorts();this.RenderWires();return this;}
        private UpdateRunControls():void {
            const status=this.querySelector('.NodeEditor-State');if(status)status.textContent='— '+this._state;
            for(const kind of ['run','pause','stop']){const b=this.querySelector<HTMLButtonElement>(`.NodeEditor-Button[data-kind="${kind}"]`);if(!b)continue;const active=kind==='run'?this._state==='running':kind==='stop'?this._state==='idle':this._state==='paused';b.dataset.active=String(active);b.setAttribute('aria-pressed',String(active));b.disabled=kind==='pause'&&this._state!=='running';}
        }
        private CheckType(a:string,b:string):Types.WireStatus {
            const numeric=['number','float','integer'];return a===b||b==='any'||(numeric.includes(a)&&numeric.includes(b))?'connected-ok':'connected-error';
        }
        public addNode(type:string,x:number,y:number,id=`node-${Date.now()}-${Math.random().toString(36).slice(2,8)}`):Interfaces.NodeInstance {
            this.EnsureState();const schema=this._schemas.find(s=>s.type===type);if(!schema)throw new Error('Workflow: unknown schema '+type);
            if(this._nodes.some(n=>n.id===id))throw new Error('Workflow: duplicate node '+id);
            const node:Interfaces.NodeInstance={id,type,x,y,schema:structuredClone(schema),params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))};if(schema.operation==='module')node.graph=EmptyGraph();if(schema.operation==='input'||schema.operation==='output'){const base=String(node.params?.portId??(schema.operation==='input'?'in':'out'));let portId=base,index=2;while(this._nodes.some(n=>n.schema.operation===schema.operation&&n.params?.portId===portId))portId=base+index++;(node.params??={}).portId=portId;}this._nodes.push(node);if(this.isConnected)this.Render();return node;
        }
        public removeNode(id:string):void {
            this.EnsureState();this.runtime().modules.get(id)?.close(false);this._nodes=this._nodes.filter(n=>n.id!==id);this._wires=this._wires.filter(w=>w.srcNodeId!==id&&w.dstNodeId!==id);this.runtime().selectedNodes.delete(id);if(this._selected===id)this._selected=null;this.Changed(true);
        }
        public addWire(srcNodeId:string,srcPortId:string,dstNodeId:string,dstPortId:string):Interfaces.WireInstance|null {
            this.EnsureState();const src=this._nodes.find(n=>n.id===srcNodeId),dst=this._nodes.find(n=>n.id===dstNodeId);
            const a=src?.schema.outputs.find(p=>p.id===srcPortId),b=dst?.schema.inputs.find(p=>p.id===dstPortId);
            if(!a||!b||srcNodeId===dstNodeId)return null;
            this._wires=this._wires.filter(w=>!(w.dstNodeId===dstNodeId&&w.dstPortId===dstPortId));
            const wire={id:`wire-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,srcNodeId,srcPortId,dstNodeId,dstPortId,srcType:a.type,dstType:b.type,status:this._typeCheck(a.type,b.type)??'connected-error'};
            this._wires.push(wire);this.runtime().pending=null;this.Changed();return wire;
        }
        public removeWire(id:string):void{this._wires=this.wires.filter(w=>w.id!==id);const r=this.runtime();if(r.selectedWire===id)r.selectedWire=null;r.closeMenu?.();this.Changed();}
        public AddInput(id:string):PortSpec|null {
            const node=this.nodes.find(n=>n.id===id);if(!node||!node.schema.operation||['number','result','module','input','output'].includes(node.schema.operation))return null;
            const i=node.schema.inputs.length+1,port={id:'input-'+i,type:'number',label:'Input '+i};node.schema.inputs.push(port);this.Changed(true);return port;
        }
        public SetParameter(id:string,key:string,value:unknown):this {
            const node=this.nodes.find(n=>n.id===id);if(!node)return this;const previousPortId=String(node.params?.portId??'in');(node.params??={})[key]=value;
            const preview=this.runtime().bindings;if(node.schema.operation==='input'&&preview){if(key==='value')preview[String(node.params?.portId??'in')]=Number(value);if(key==='portId'){preview[String(value)]=preview[previousPortId]??Number(node.params?.value??0);if(String(value)!==previousPortId)delete preview[previousPortId];}}
            if(key==='numberType'&&node.schema.operation==='number')for(const port of node.schema.outputs)port.type=String(value);
            if(key==='portType'&&(node.schema.operation==='input'||node.schema.operation==='output'))for(const port of node.schema.operation==='input'?node.schema.outputs:node.schema.inputs)port.type=String(value);
            this.Changed();return this;
        }
        private Revalidate():void {
            for(const w of this._wires){const a=this._nodes.find(n=>n.id===w.srcNodeId)?.schema.outputs.find(p=>p.id===w.srcPortId),b=this._nodes.find(n=>n.id===w.dstNodeId)?.schema.inputs.find(p=>p.id===w.dstPortId);w.srcType=a?.type??'';w.dstType=b?.type??'';w.status=a&&b?(this._typeCheck(a.type,b.type)??'connected-error'):'connected-error';}
        }
        private Changed(render=false):void {
            const r=this.runtime();if(r.selectedWire&&!this._wires.some(w=>w.id===r.selectedWire)){r.selectedWire=null;r.closeMenu?.();}
            this.Revalidate();this.runtime().errors.clear();if(this.runState==='running')this.Evaluate();
            else this.Refresh();if(render&&this.isConnected)this.Render();
            this.dispatchEvent(new CustomEvent('arianna:workflow-change',{bubbles:true,composed:true,detail:this.export()}));
        }
        /** Execute independently addressed output ports, including nested custom modules. */
        public Evaluate():ReadonlyMap<string,number> {
            this.EnsureState();this.Revalidate();const r=this.runtime();r.values.clear();r.errors.clear();r.outputs.clear();let steps=0;
            const engine=(graph:Interfaces.Graph,bindings:Record<string,()=>number>|null,depth:number)=>{
                if(depth>32)throw new Error('Module nesting limit (32)');
                const memo=new Map<string,number>(),visiting=new Set<string>();
                const children=new Map<string,ReturnType<typeof engine>>();
                const read=(id:string,portId?:string):number=>{
                    if(++steps>10000)throw new Error('Workflow execution limit (10000)');
                    const node=graph.nodes.find(n=>n.id===id);if(!node)throw new Error('Missing source '+id);
                    const port=portId??node.schema.outputs[0]?.id??'',key=JSON.stringify([id,port]);
                    if(memo.has(key))return memo.get(key)!;if(visiting.has(key))throw new Error('Cycle detected');visiting.add(key);
                    const input=(i:number):number=>{
                        const p=node.schema.inputs[i];if(!p)throw new Error('Missing input');const w=graph.wires.find(w=>w.dstNodeId===id&&w.dstPortId===p.id);
                        if(!w){if(i===1&&['log','exp'].includes(node.schema.operation??''))return Number(node.params?.base??(node.schema.operation==='log'?10:Math.E));throw new Error('Connect '+(p.label??p.id));}
                        const source=graph.nodes.find(n=>n.id===w.srcNodeId)?.schema.outputs.find(p=>p.id===w.srcPortId);
                        if(!source||this._typeCheck(source.type,p.type)==='connected-error'||this._typeCheck(source.type,p.type)===null)throw new Error('Invalid connection type');
                        return read(w.srcNodeId,w.srcPortId);
                    };
                    try {
                        const op=node.schema.operation;let value:number;
                        if(op==='number'||op==='input'){
                            const boundary=String(node.params?.portId??'in');
                            if(op==='input'&&bindings){const binding=bindings[boundary];if(!binding)throw new Error('Connect input '+boundary);value=binding();}
                            else {const raw=String(node.params?.value??(op==='input'?0:'')).trim();if(!raw)throw new Error('Enter a number');value=Number(raw);}
                            if((node.params?.numberType??node.params?.portType)==='integer'&&!Number.isInteger(value))throw new Error('Integer required');
                        }else if(op==='module'){
                            const inner=node.graph;if(!inner)throw new Error('Empty module has no graph');
                            let child=children.get(id);if(!child){const bound:Record<string,()=>number>=Object.create(null);node.schema.inputs.forEach((p,i)=>bound[p.id]=()=>input(i));child=engine(inner,bound,depth+1);children.set(id,child);}
                            const out=inner.nodes.find(n=>n.schema.operation==='output'&&String(n.params?.portId??'out')===port);if(!out)throw new Error('Missing module output '+port);value=child.read(out.id);
                        }else {
                            const values=node.schema.inputs.map((_,i)=>input(i));if(!values.length)throw new Error('No inputs');const [a,b]=values;
                            switch(op){
                                case 'result':case 'output':value=a;break;
                                case 'add':value=values.reduce((x,y)=>x+y);break;
                                case 'subtract':value=values.reduce((x,y)=>x-y);break;
                                case 'multiply':value=values.reduce((x,y)=>x*y);break;
                                case 'divide':value=values.reduce((x,y)=>{if(y===0)throw new Error('Division by zero');return x/y;});break;
                                case 'modulo':value=values.reduce((x,y)=>{if(y===0)throw new Error('Modulo by zero');return x%y;});break;
                                case 'power':value=values.reduce((x,y)=>Math.pow(x,y));break;
                                case 'root':value=values.reduce((x,y)=>{if(y===0)throw new Error('Root degree cannot be zero');return x<0&&Number.isInteger(y)&&Math.abs(y%2)===1?-Math.pow(-x,1/y):Math.pow(x,1/y);});break;
                                case 'log':if(a<=0||b<=0||b===1)throw new Error('Logarithm domain / base');value=Math.log(a)/Math.log(b);for(const base of values.slice(2)){if(base<=0||base===1||value<=0)throw new Error('Logarithm domain / base');value=Math.log(value)/Math.log(base);}break;
                                case 'exp':value=Math.pow(b,a);for(const base of values.slice(2))value=Math.pow(base,value);break;
                                default:throw new Error('No numeric operation declared');
                            }
                        }
                        if(!Number.isFinite(value))throw new Error('Non-finite result');memo.set(key,value);return value;
                    }finally{visiting.delete(key);}
                };
                return {read};
            };
            const bindings=r.bindings?Object.fromEntries(Object.entries(r.bindings).map(([k,v])=>[k,()=>v])):null;
            const run=engine({nodes:this._nodes,wires:this._wires},bindings,0);
            for(const node of this._nodes.filter(n=>n.schema.operation)){
                const ports=node.schema.outputs.length?node.schema.outputs.map(p=>p.id):[''];
                for(const port of ports)try{const value=run.read(node.id,port);let out=r.outputs.get(node.id);if(!out){out=new Map();r.outputs.set(node.id,out);}out.set(port,value);if(port===ports[0])r.values.set(node.id,value);}catch(error){r.errors.set(node.id,error instanceof Error?error.message:String(error));}
            }
            for(const w of this._wires)if(w.status!=='connected-error'&&(r.errors.has(w.srcNodeId)||r.errors.has(w.dstNodeId)))w.status='connected-warn';
            this.Refresh();this.dispatchEvent(new CustomEvent('arianna:workflow-result',{bubbles:true,composed:true,detail:{values:new Map(r.values),outputs:this.Outputs,errors:new Map(r.errors)}}));return new Map(r.values);
        }
        public get Outputs():ReadonlyMap<string,ReadonlyMap<string,number>>{return new Map([...this.runtime().outputs].map(([id,ports])=>[id,new Map(ports)]));}
        public export(){this.EnsureState();return {nodes:structuredClone(this._nodes),wires:structuredClone(this._wires),state:this._state};}
        public ExportJSON(filename='workflow.json'):this {
            const data=this.export(),event=new CustomEvent('arianna:export',{bubbles:true,composed:true,cancelable:true,detail:data});if(!this.dispatchEvent(event))return this;
            const r=this.runtime(),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));r.urls.add(url);
            const link=document.createElement('a');link.href=url;link.download=filename;link.style.display='none';document.body.appendChild(link);link.click();link.remove();
            const timer=setTimeout(()=>{URL.revokeObjectURL(url);r.urls.delete(url);r.timers.delete(timer);},1500);r.timers.add(timer);return this;
        }
        public get Selection():SelectionRectangle|null{return this.runtime().selection;}
        public get SelectedNodes():readonly Interfaces.NodeInstance[]{return this.nodes.filter(n=>this.runtime().selectedNodes.has(n.id));}
        public get SelectedWires():readonly Interfaces.WireInstance[]{return this.wires.filter(w=>this.runtime().selectedWires.has(w.id));}
        private PaintSelection():void {
            const r=this.runtime();for(const el of this.querySelectorAll<HTMLElement>('.NodeEditor-Node'))el.dataset.selected=String(r.selectedNodes.has(el.dataset.nodeId!));
            for(const selector of ['.NodeEditor-Wire','.NodeEditor-WireHit'])for(const el of this.querySelectorAll<HTMLElement>(selector)){const selected=r.selectedWires.has(el.dataset.wireId!);el.dataset.selected=String(selected);if(selector==='.NodeEditor-WireHit')el.setAttribute('aria-pressed',String(selected));}
        }
        private SyncSelection():void {
            const r=this.runtime();this.PaintSelection();if(!r.selection||r.syncingSelection)return;r.syncingSelection=true;
            try{const elements=[...this.querySelectorAll<HTMLElement>('.NodeEditor-Node')].filter(e=>r.selectedNodes.has(e.dataset.nodeId!));elements.push(...[...this.querySelectorAll<HTMLElement>('.NodeEditor-WireHit')].filter(e=>r.selectedWires.has(e.dataset.wireId!)));r.selection.select(elements);}finally{r.syncingSelection=false;}
        }
        public SelectNodes(ids:Iterable<string>,operation:'replace'|'add'|'subtract'|'toggle'='replace'):this {
            const r=this.runtime();r.closeMenu?.();if(operation==='replace'){r.selectedNodes.clear();r.selectedWires.clear();r.selectedWire=null;}
            for(const id of ids)if(this.nodes.some(n=>n.id===id)){if(operation==='subtract'||operation==='toggle'&&r.selectedNodes.has(id))r.selectedNodes.delete(id);else r.selectedNodes.add(id);}
            this._selected=[...r.selectedNodes][0]??null;this.SyncSelection();this.FillInspector();return this;
        }
        public ClearSelection():this {const r=this.runtime();r.closeMenu?.();r.selectedNodes.clear();r.selectedWires.clear();r.selectedWire=null;this._selected=null;this.SyncSelection();this.FillInspector();return this;}
        public DeleteSelection():this {
            const r=this.runtime(),ids=new Set(r.selectedNodes),wireIds=new Set(r.selectedWires);if(r.selectedWire)wireIds.add(r.selectedWire);
            for(const id of ids)r.modules.get(id)?.close(false);
            this._nodes=this.nodes.filter(n=>!ids.has(n.id));this._wires=this.wires.filter(w=>!wireIds.has(w.id)&&!ids.has(w.srcNodeId)&&!ids.has(w.dstNodeId));this.ClearSelection();this.Changed(true);if(this.isConnected)this.focus({preventScroll:true});return this;
        }
        /** Shared in-app clipboard works on file:// and without browser clipboard permission. */
        public Copy():Interfaces.Clipboard|null {
            const r=this.runtime(),nodes=this.SelectedNodes,ids=new Set(nodes.map(n=>n.id));
            const wires=this.wires.filter(w=>ids.has(w.srcNodeId)&&ids.has(w.dstNodeId)||!nodes.length&&r.selectedWires.has(w.id));
            if(!nodes.length&&!wires.length)return null;
            clipboard=structuredClone({format:'arianna-workflow-selection',version:1,nodes:[...nodes],wires});r.pasteCount=0;
            this.dispatchEvent(new CustomEvent('arianna:workflow-copy',{bubbles:true,composed:true,detail:structuredClone(clipboard)}));return structuredClone(clipboard);
        }
        public Cut():Interfaces.Clipboard|null {const data=this.Copy();if(data)this.DeleteSelection();return data;}
        public Paste(data:Interfaces.Clipboard|null=clipboard,position?:{x:number;y:number}):Interfaces.NodeInstance[] {
            if(!data||data.format!=='arianna-workflow-selection'||data.version!==1)return [];
            const r=this.runtime(),copy=structuredClone(data),mapping=new Map<string,string>();
            const offset=24*(++r.pasteCount),left=copy.nodes.length?Math.min(...copy.nodes.map(n=>n.x)):0,top=copy.nodes.length?Math.min(...copy.nodes.map(n=>n.y)):0;
            for(const node of copy.nodes){const old=node.id;node.id=Unique('node');mapping.set(old,node.id);node.x+=position?position.x-left:offset;node.y+=position?position.y-top:offset;
                if(node.schema.operation==='input'||node.schema.operation==='output'){let id=String(node.params?.portId??(node.schema.operation==='input'?'in':'out')),base=id,i=2;while([...this.nodes,...copy.nodes.filter(n=>n!==node)].some(n=>n.schema.operation===node.schema.operation&&n.params?.portId===id))id=base+i++;(node.params??={}).portId=id;}}
            this._nodes.push(...copy.nodes);
            for(const wire of copy.wires){const src=mapping.get(wire.srcNodeId)??(!copy.nodes.length?wire.srcNodeId:''),dst=mapping.get(wire.dstNodeId)??(!copy.nodes.length?wire.dstNodeId:'');if(!src||!dst||!this.nodes.some(n=>n.id===src)||!this.nodes.some(n=>n.id===dst))continue;
                this._wires=this._wires.filter(w=>w.dstNodeId!==dst||w.dstPortId!==wire.dstPortId);this._wires.push({...wire,id:Unique('wire'),srcNodeId:src,dstNodeId:dst});}
            this.SelectNodes(copy.nodes.map(n=>n.id));this.Changed(true);if(this.isConnected)this.focus({preventScroll:true});return copy.nodes;
        }
        /** Bind internal Input/Output nodes to stable external port IDs. */
        public SetModuleGraph(id:string,graph:Interfaces.Graph):this {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='module');if(!node)throw new Error('Unknown custom module '+id);
            const copy=structuredClone(graph),ports=(op:'input'|'output'):Interfaces.PortSpec[]=>{
                const result=copy.nodes.filter(n=>n.schema.operation===op).map(n=>{
                    const portId=String(n.params?.portId??(op==='input'?'in':'out')).trim();if(!portId)throw new Error('An IO port needs an ID');
                    const incoming=copy.wires.find(w=>w.dstNodeId===n.id&&w.dstPortId===n.schema.inputs[0]?.id),source=incoming&&copy.nodes.find(n=>n.id===incoming.srcNodeId)?.schema.outputs.find(p=>p.id===incoming.srcPortId);
                    return {id:portId,label:portId,type:op==='output'&&source?source.type:String(n.params?.portType??'number')};
                });if(new Set(result.map(p=>p.id)).size!==result.length)throw new Error('Duplicate '+op+' port IDs');return result;
            };
            const inputs=ports('input'),outputs=ports('output');node.graph=copy;node.schema.inputs=inputs;node.schema.outputs=outputs;
            this._wires=this.wires.filter(w=>w.srcNodeId!==id||outputs.some(p=>p.id===w.srcPortId)).filter(w=>w.dstNodeId!==id||inputs.some(p=>p.id===w.dstPortId));
            this.Changed(true);return this;
        }
        public OpenModule(id:string):NodeEditor {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='module');if(!node)throw new Error('Unknown custom module '+id);
            const r=this.runtime(),existing=r.modules.get(id);if(existing){existing.editor.focus({preventScroll:true});return existing.editor;}
            this.Evaluate();
            const doc=this.ownerDocument,theme=this.getAttribute('theme')==='light'?'light':'dark',panel=doc.createElement('section');
            panel.style.cssText='display:grid;grid-template-rows:34px minmax(0,1fr);gap:0;min-width:0;min-height:0;box-sizing:border-box';
            const toolbar=doc.createElement('header');toolbar.style.cssText='display:flex;align-items:center;gap:6px;padding:4px 7px;background:'+(theme==='light'?'#e4e7e9':'#25292d');
            const save=doc.createElement('button'),cancel=doc.createElement('button'),error=doc.createElement('span');save.type=cancel.type='button';save.className=cancel.className='NodeEditor-Button';save.textContent='Apply & Close';cancel.textContent='Cancel';error.style.color='#e85d54';error.style.font='11px system-ui';toolbar.append(save,cancel,error);
            const child=new NodeEditor();child.setAttribute('theme',theme);child.classList.add('NodeEditor');child.style.setProperty('height','100%','important');child.style.setProperty('min-height','0','important');
            child.schemas=structuredClone(this.schemas);const graph=structuredClone(node.graph??EmptyGraph());child.nodes=graph.nodes;child.wires=graph.wires;const bound:Record<string,number>=Object.create(null);for(const input of graph.nodes.filter(n=>n.schema.operation==='input')){const pid=String(input.params?.portId??'in'),wire=this.wires.find(w=>w.dstNodeId===id&&w.dstPortId===pid);bound[pid]=(wire?r.outputs.get(wire.srcNodeId)?.get(wire.srcPortId):undefined)??Number(input.params?.value??0);}if(Object.keys(bound).length)child.runtime().bindings=bound;panel.append(toolbar,child);doc.body.appendChild(panel);
            const dock=new Dockable();dock.attach(panel,{container:doc.body,title:node.schema.name+' · '+id,position:'float',theme,width:Math.max(360,Math.min(1000,(doc.defaultView?.innerWidth??1000)-40)),height:Math.max(300,Math.min(720,(doc.defaultView?.innerHeight??760)-40))});
            if(dock.Wrapper){dock.Wrapper.style.left='20px';dock.Wrapper.style.top='20px';dock.Wrapper.style.zIndex='100000';}
            let closed=false;const close=(commit=true)=>{
                if(closed)return;
                if(commit){try{for(const item of [...child.runtime().modules.values()])item.close(true);if(child.runtime().modules.size)throw new Error('Resolve the open nested module before closing.');const data=child.export();this.SetModuleGraph(id,{nodes:data.nodes,wires:data.wires});this.Evaluate();}catch(e){error.textContent=e instanceof Error?e.message:String(e);return;}}
                closed=true;r.modules.delete(id);child.onUnmount();dock.destroy();panel.remove();if(this.isConnected)this.focus({preventScroll:true});
            };
            r.modules.set(id,{editor:child,close});save.onclick=()=>close(true);cancel.onclick=()=>close(false);
            child.onConnected();child.Evaluate();child.Fit();return child;
        }
        public CloseModule(id:string,save=true):this{this.runtime().modules.get(id)?.close(save);return this;}
        private MathLabel(schema:Interfaces.NodeSchema,base?:number):Element {
            const ns='http://www.w3.org/1998/Math/MathML',make=(tag:string,text?:string)=>{const el=document.createElementNS(ns,tag);if(text!==undefined)el.textContent=text;return el;};
            const math=make('math');math.setAttribute('aria-label',schema.name);const op=schema.operation;
            const symbols:Record<string,string>={add:'+',subtract:'−',multiply:'×',divide:'÷',modulo:'mod',number:'123',result:'=',module:'□',input:'→',output:'←'};
            if(op==='power'||op==='exp'){const sup=make('msup');sup.append(make('mi',op==='power'?'x':String(base??Math.E)),make('mi',op==='power'?'y':'x'));math.appendChild(sup);}
            else if(op==='root'){const root=make('mroot');root.append(make('mi','x'),make('mi','y'));math.appendChild(root);}
            else if(op==='log'){const row=make('mrow'),sub=make('msub');sub.append(make('mi','log'),make('mn',String(base??10)));row.append(sub,make('mi','x'));math.appendChild(row);}
            else math.appendChild(make(op==='number'?'mn':'mo',symbols[op??'']??schema.icon??'◆'));
            return math;
        }
        private ValueLabel(value:number|undefined):Element {
            const math=document.createElementNS('http://www.w3.org/1998/Math/MathML','math'),mn=document.createElementNS(math.namespaceURI,'mn');mn.textContent=value===undefined?'—':String(Number(value.toPrecision(12)));math.appendChild(mn);return math;
        }
        private CreatePalette(workspace: HTMLElement): HTMLElement
        {
            const palette = document.createElement('aside');
            palette.className = 'NodeEditor-Palette';

            const header = document.createElement('div');
            header.className = 'NodeEditor-PaletteHeader';

            const title = document.createElement('span');
            title.className = 'NodeEditor-PaletteTitle';
            title.textContent = 'Modules';

            const count = document.createElement('span');
            count.className = 'NodeEditor-PaletteCount';
            count.textContent = String(this._schemas.length);

            header.append(title, count);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'NodeEditor-PaletteSearchWrap';

            const search = document.createElement('input');
            search.className = 'NodeEditor-PaletteSearch';
            search.type = 'search';
            search.placeholder = 'Filter modules…';
            search.autocomplete = 'off';
            search.spellcheck = false;

            searchWrap.appendChild(search);

            const body = document.createElement('div');
            body.className = 'NodeEditor-PaletteBody';

            const categories = new Map<string, Interfaces.NodeSchema[]>();

            for(const schema of this._schemas)
            {
                const category = schema.category || 'Other';
                const list = categories.get(category) ?? [];
                list.push(schema);
                categories.set(category, list);
            }

            for(const [categoryName, schemas] of categories)
            {
                const category = document.createElement('section');
                category.className = 'NodeEditor-PaletteCategory';
                category.dataset.category = categoryName.toLowerCase();

                const categoryHeader = document.createElement('button');
                categoryHeader.type='button';
                categoryHeader.className = 'NodeEditor-PaletteCategoryHeader';

                const categoryLabel = document.createElement('span');
                categoryLabel.textContent = (this.runtime().collapsed.has(categoryName)?'▸ ':'▾ ')+categoryName;

                const categoryCount = document.createElement('span');
                categoryCount.className = 'NodeEditor-PaletteCategoryCount';
                categoryCount.textContent = String(schemas.length);

                categoryHeader.append(categoryLabel, categoryCount);
                category.appendChild(categoryHeader);
                const list=document.createElement('div');list.hidden=this.runtime().collapsed.has(categoryName);
                categoryHeader.setAttribute('aria-expanded',String(!list.hidden));
                categoryHeader.onclick=()=>{list.hidden=!list.hidden;categoryLabel.textContent=(list.hidden?'▸ ':'▾ ')+categoryName;categoryHeader.setAttribute('aria-expanded',String(!list.hidden));if(list.hidden)this.runtime().collapsed.add(categoryName);else this.runtime().collapsed.delete(categoryName);};
                category.appendChild(list);

                for(const schema of schemas)
                {
                    const module = document.createElement('div');
                    module.className = 'NodeEditor-Module';
                    module.draggable = true;
                    module.tabIndex = 0;
                    module.setAttribute('role', 'button');
                    module.dataset.schemaType = schema.type;
                    module.dataset.search = `${schema.name} ${schema.category} ${schema.description ?? ''}`.toLowerCase();
                    module.style.setProperty('--module-color', schema.color || '#e40c88');
                    module.title = `Drag ${schema.name} onto the workflow`;

                    const icon = document.createElement('span');
                    icon.className = 'NodeEditor-ModuleIcon';
                    icon.appendChild(this.MathLabel(schema));

                    const info = document.createElement('div');

                    const name = document.createElement('div');
                    name.className = 'NodeEditor-ModuleName';
                    name.textContent = schema.name;

                    const description = document.createElement('div');
                    description.className = 'NodeEditor-ModuleDescription';
                    description.textContent = schema.description || schema.category;

                    info.append(name, description);
                    module.append(icon, info);

                    module.addEventListener('dragstart', (event: DragEvent) =>
                    {
                        if(!event.dataTransfer) return;
                        event.dataTransfer.effectAllowed = 'copy';
                        event.dataTransfer.setData('application/x-arianna-workflow-node', schema.type);
                        event.dataTransfer.setData('text/plain', schema.type);
                        module.dataset.dragging = 'true';
                    });

                    module.addEventListener('dragend', () =>
                    {
                        delete module.dataset.dragging;
                        delete workspace.dataset.dragOver;
                    });

                    module.addEventListener('dblclick', () =>
                    {
                        const rect = workspace.getBoundingClientRect();
                        const p=this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2);
                        const x=p.x-87,y=p.y-40;
                        this.addNode(schema.type, x, y);
                    });

                    module.addEventListener('keydown', (event: KeyboardEvent) =>
                    {
                        if(event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        const rect = workspace.getBoundingClientRect();
                        this.addNode(
                            schema.type,
                            this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2).x-87,
                            this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2).y-40
                        );
                    });

                    list.appendChild(module);
                }

                body.appendChild(category);
            }

            const empty = document.createElement('div');
            empty.className = 'NodeEditor-PaletteEmpty';
            empty.textContent = 'No modules match.';
            empty.hidden = true;
            body.appendChild(empty);

            search.addEventListener('input', () =>
            {
                const query = search.value.trim().toLowerCase();
                let totalVisible = 0;

                body.querySelectorAll<HTMLElement>('.NodeEditor-PaletteCategory').forEach(category =>
                {
                    let categoryVisible = 0;

                    category.querySelectorAll<HTMLElement>('.NodeEditor-Module').forEach(module =>
                    {
                        const visible = !query || (module.dataset.search ?? '').includes(query);
                        module.hidden = !visible;
                        if(visible) categoryVisible++;
                    });

                    category.hidden = categoryVisible === 0;
                    totalVisible += categoryVisible;

                    const categoryCount = category.querySelector<HTMLElement>('.NodeEditor-PaletteCategoryCount');
                    if(categoryCount) categoryCount.textContent = String(categoryVisible);
                });

                count.textContent = String(totalVisible);
                empty.hidden = totalVisible !== 0;
            });

            palette.append(header, searchWrap, body);
            return palette;
        }


        private LocalPoint(x:number,y:number):{x:number;y:number} {
            const canvas=this.runtime().canvas;if(!canvas)return {x,y};const svg=canvas.drawingSurface,matrix=svg.getScreenCTM();
            if(matrix){const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(matrix.inverse());return {x:q.x,y:q.y};}
            return canvas.screenToWorld({x,y});
        }
        private DisposeView():void {
            const r=this.runtime();r.closeMenu?.();r.controller?.abort();r.controller=null;r.selection?.detach();r.selection=null;r.resize?.disconnect();r.resize=null;
            if(r.canvas)r.viewport=r.canvas.getViewport();
            for(const [i,d] of r.docks.entries()){r.dockPositions[i]=d.Position;const w=d.Wrapper;if(w&&d.Position==='float')r.dockRects[i]={left:w.style.left,top:w.style.top,width:w.style.width,height:w.style.height};d.destroy();}
            r.docks=[];r.grid?.detach();r.grid=null;r.canvas?.onUnmount();r.canvas=null;
        }
        private UpdateInsets():void {
            const r=this.runtime(),viewport=this.querySelector<HTMLElement>('.NodeEditor-Viewport');if(!viewport)return;
            const insets={top:0,bottom:0,left:0,right:0};for(const dock of r.docks){const pos=dock.Position,w=dock.Wrapper;if(pos!=='float'&&w)insets[pos]=Math.max(insets[pos],pos==='top'||pos==='bottom'?w.offsetHeight:w.offsetWidth);}
            for(const pos of ['top','bottom','left','right'] as const)viewport.style[pos]=insets[pos]+'px';
            const world=r.canvas?.world,svg=r.canvas?.drawingSurface;if(world&&svg)svg.setAttribute('viewBox',`0 0 ${Math.max(1,world.clientWidth)} ${Math.max(1,world.clientHeight)}`);this.RenderWires();
        }
        private BindWorkspaceDrop(target:HTMLElement):void {
            target.addEventListener('dragover',(e:DragEvent)=>{if(e.dataTransfer){e.preventDefault();e.dataTransfer.dropEffect='copy';}});
            target.addEventListener('drop',(e:DragEvent)=>{e.preventDefault();const type=e.dataTransfer?.getData('application/x-arianna-workflow-node');if(!type)return;const p=this.LocalPoint(e.clientX,e.clientY);this.addNode(type,p.x-87,p.y-30);});
        }
        private WirePath(points:Array<{x:number;y:number}>,radius=8):string {
            const clean=points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y);if(!clean.length)return '';let path=`M ${clean[0].x} ${clean[0].y}`;
            for(let i=1;i<clean.length-1;i++){const a=clean[i-1],b=clean[i],c=clean[i+1],before=Math.hypot(b.x-a.x,b.y-a.y),after=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(radius,before/2,after/2);if(!r||(b.x-a.x)*(c.y-b.y)===(b.y-a.y)*(c.x-b.x)){path+=` L ${b.x} ${b.y}`;continue;}path+=` L ${b.x+(a.x-b.x)*r/before} ${b.y+(a.y-b.y)*r/before} Q ${b.x} ${b.y} ${b.x+(c.x-b.x)*r/after} ${b.y+(c.y-b.y)*r/after}`;}
            const end=clean[clean.length-1];return path+` L ${end.x} ${end.y}`;
        }
        private RenderWires():void {
            const r=this.runtime(),workspace=this.querySelector<HTMLElement>('.NodeEditor-Workspace'),svg=workspace?.querySelector<SVGSVGElement>('.NodeEditor-Wires');if(!workspace||!svg)return;svg.replaceChildren();
            svg.style.width=Math.max(r.canvas?.world.clientWidth??1,...this._nodes.map(n=>n.x+230))+'px';svg.style.height=Math.max(r.canvas?.world.clientHeight??1,...this._nodes.map(n=>n.y+240))+'px';
            const portPoint=(id:string,port:string,side:'in'|'out')=>{const n=this._nodes.find(n=>n.id===id);if(!n)return null;const i=(side==='in'?n.schema.inputs:n.schema.outputs).findIndex(p=>p.id===port);if(i<0)return null;return {x:n.x+(side==='out'?174:0),y:n.y+66+i*22};};
            const draw=(a:{x:number;y:number},b:{x:number;y:number},id?:string,status?:string)=>{
                const points=b.x-a.x>=32?[a,{x:(a.x+b.x)/2,y:a.y},{x:(a.x+b.x)/2,y:b.y},b]:[a,{x:a.x+24,y:a.y},{x:a.x+24,y:Math.max(a.y,b.y)+80},{x:b.x-24,y:Math.max(a.y,b.y)+80},{x:b.x-24,y:b.y},b];
                const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('class','NodeEditor-Wire');path.setAttribute('d',this.WirePath(points));
                if(id){
                    path.dataset.wireId=id;path.dataset.status=status;path.dataset.selected=String(r.selectedWire===id);
                    // Invisible hit area makes a 2px wire easy to select without changing its appearance.
                    const hit=document.createElementNS('http://www.w3.org/2000/svg','path');hit.setAttribute('class','NodeEditor-WireHit');hit.setAttribute('d',this.WirePath(points));hit.dataset.wireId=id;hit.dataset.selectable='wire';hit.setAttribute('role','button');hit.setAttribute('aria-label','Select connection '+id);hit.setAttribute('aria-pressed',String(r.selectedWire===id));
                    for(const element of [hit,path]){
                        element.addEventListener('pointerdown',e=>{e.stopPropagation();});
                        element.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey){this.focus({preventScroll:true});this.PaintSelection();return;}this.SelectWire(id);});
                        element.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();this.removeWire(id);});
                        element.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();this.SelectWire(id);this.OpenWireMenu(id,e.clientX,e.clientY);});
                    }
                    svg.appendChild(hit);
                }else path.dataset.preview='true';svg.appendChild(path);
            };
            for(const w of this._wires){const a=portPoint(w.srcNodeId,w.srcPortId,'out'),b=portPoint(w.dstNodeId,w.dstPortId,'in');if(a&&b)draw(a,b,w.id,w.status);}
            if(r.pending&&r.pointer){const a=portPoint(r.pending.node,r.pending.port,'out');if(a)draw(a,r.pointer);}this.SyncSelection();
        }
        /** Selection belongs to the editor instance; keyboard actions never affect another Workflow. */
        public get SelectedWire():Interfaces.WireInstance|null {
            return this.wires.find(w=>w.id===this.runtime().selectedWire)??null;
        }
        public SelectWire(id:string|null):this {
            const r=this.runtime();r.closeMenu?.();r.selectedWire=id&&this.wires.some(w=>w.id===id)?id:null;
            if(r.selectedWire){r.selectedNodes.clear();r.selectedWires=new Set([r.selectedWire]);this._selected=null;r.pending=null;this.FillInspector();this.focus({preventScroll:true});}else r.selectedWires.clear();this.SyncSelection();
            for(const selector of ['.NodeEditor-Wire','.NodeEditor-WireHit'])for(const el of this.querySelectorAll<SVGElement>(selector)){
                const selected=el.dataset.wireId===r.selectedWire;el.dataset.selected=String(selected);
                if(selector==='.NodeEditor-WireHit')el.setAttribute('aria-pressed',String(selected));
            }
            return this;
        }
        private HandleWireKey(event:KeyboardEvent):void {
            const target=event.target as HTMLElement|null;
            if(target?.closest('.NodeEditor')!==this&&target!==this)return;
            if(target?.isContentEditable||target?.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]'))return;
            const r=this.runtime(),command=event.ctrlKey||event.metaKey,key=event.key.toLowerCase();
            if(command&&['a','c','x','v'].includes(key)){event.preventDefault();event.stopPropagation();if(key==='a')this.SelectNodes(this.nodes.map(n=>n.id));else if(key==='c')this.Copy();else if(key==='x')this.Cut();else this.Paste();return;}
            if(event.key==='Escape'){r.closeMenu?.();r.pending=null;this.ClearSelection();this.Refresh();return;}
            if(['Delete','Del','Backspace'].includes(event.key)&&(r.selectedNodes.size||r.selectedWires.size||r.selectedWire)){event.preventDefault();event.stopPropagation();this.DeleteSelection();}
        }
        private OpenWireMenu(id:string,x:number,y:number):void {
            const r=this.runtime();r.closeMenu?.();const wire=this.wires.find(w=>w.id===id);if(!wire)return;
            const doc=this.ownerDocument,view=doc.defaultView,menu=doc.createElement('div');menu.className='NodeEditor-WireMenu';menu.dataset.theme=this.getAttribute('theme')==='light'?'light':'dark';menu.setAttribute('role','menu');menu.setAttribute('aria-label','Connection options');
            const info=doc.createElement('div');info.className='NodeEditor-WireMenuInfo';info.textContent=`${wire.srcNodeId}.${wire.srcPortId} → ${wire.dstNodeId}.${wire.dstPortId} · ${wire.status}`;menu.appendChild(info);
            const control=new AbortController();
            const close=(restore=false)=>{control.abort();menu.remove();if(r.closeMenu===dismiss)r.closeMenu=null;if(restore&&this.isConnected)this.focus({preventScroll:true});};
            const dismiss=()=>close(false);r.closeMenu=dismiss;
            const focusNode=(nodeId:string)=>{close();this.SelectNodes([nodeId]);this.focus({preventScroll:true});};
            const entries:Array<[string,()=>void]>=[
                ['Delete connection',()=>{close(true);this.removeWire(id);}],
                ['Select source node',()=>focusNode(wire.srcNodeId)],
                ['Select destination node',()=>focusNode(wire.dstNodeId)]
            ];
            const buttons=entries.map(([label,action])=>{const b=doc.createElement('button');b.type='button';b.textContent=label;b.setAttribute('role','menuitem');b.onclick=action;menu.appendChild(b);return b;});
            doc.body.appendChild(menu);const rect=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(x,(view?.innerWidth??800)-rect.width-8))+'px';menu.style.top=Math.max(8,Math.min(y,(view?.innerHeight??600)-rect.height-8))+'px';buttons[0].focus();
            doc.addEventListener('pointerdown',e=>{if(!menu.contains(e.target as Node))close();},{capture:true,signal:control.signal});
            menu.addEventListener('keydown',e=>{
                if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
                if(e.key==='Delete'||e.key==='Del'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();close(true);this.removeWire(id);return;}
                if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Home'||e.key==='End'){
                    e.preventDefault();const i=buttons.indexOf(doc.activeElement as HTMLButtonElement);const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length;buttons[next].focus();
                }else if(e.key==='Tab')close();
            },{signal:control.signal});
            doc.addEventListener('scroll',dismiss,{capture:true,signal:control.signal});view?.addEventListener('resize',dismiss,{signal:control.signal});
        }
        private UpdatePorts():void {
            const r=this.runtime();for(const el of this.querySelectorAll<HTMLElement>('.NodeEditor-Port')){
                const node=el.dataset.nodeId!,port=el.dataset.portId!,side=el.dataset.side;
                const wires=this._wires.filter(w=>side==='in'?w.dstNodeId===node&&w.dstPortId===port:w.srcNodeId===node&&w.srcPortId===port);
                const status=wires.some(w=>w.status==='connected-error')?'connected-error':wires.some(w=>w.status==='connected-warn')?'connected-warn':wires.length?'connected-ok':'unconnected';
                el.dataset.status=status;el.dataset.pending=String(side==='out'&&r.pending?.node===node&&r.pending?.port===port);
                el.title=(side==='in'?'Input ':'Output ')+port+' · '+status+(r.errors.has(node)?' · '+r.errors.get(node):'');
            }
        }
        private Refresh():void {
            const r=this.runtime();this.UpdatePorts();this.RenderWires();
            for(const el of this.querySelectorAll<HTMLElement>('.NodeEditor-Result')){el.replaceChildren(this.ValueLabel(r.values.get(el.dataset.resultId!)));}
            for(const el of this.querySelectorAll<HTMLElement>('.NodeEditor-Error')){el.textContent=r.errors.get(el.dataset.errorId!)??'';}
        }
        private MakeNode(node:Interfaces.NodeInstance):HTMLElement {
            const el=document.createElement('article');el.className='NodeEditor-Node';el.dataset.nodeId=node.id;el.dataset.selectable='node';el.dataset.selected=String(this.runtime().selectedNodes.has(node.id));el.style.left=node.x+'px';el.style.top=node.y+'px';el.style.setProperty('--node-color',node.schema.color??'#e40c88');
            const header=document.createElement('header');header.className='NodeEditor-NodeHeader';const icon=document.createElement('span');icon.className='NodeEditor-NodeIcon';icon.appendChild(this.MathLabel(node.schema,Number(node.params?.base??(node.schema.operation==='log'?10:Math.E))));const name=document.createElement('div');name.className='NodeEditor-NodeName';name.textContent=node.schema.name;header.append(icon,name);el.appendChild(header);
            const body=document.createElement('div');body.className='NodeEditor-NodeBody';const op=node.schema.operation;
            if(op==='number'){
                const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.className='NodeEditor-Input';input.value=String(node.params?.value??'0');input.setAttribute('aria-label','Number');input.addEventListener('input',()=>this.SetParameter(node.id,'value',input.value));
                const select=document.createElement('select');select.className='NodeEditor-Input';select.setAttribute('aria-label','Number type');for(const type of ['number','float','integer']){const o=document.createElement('option');o.value=type;o.textContent=type;select.appendChild(o);}select.value=String(node.params?.numberType??'number');select.onchange=()=>this.SetParameter(node.id,'numberType',select.value);body.append(input,select);
            }else if(op==='result'||op==='output'){const result=document.createElement('output');result.className='NodeEditor-Result';result.dataset.resultId=node.id;result.appendChild(this.ValueLabel(this.runtime().values.get(node.id)));body.appendChild(result);}
            else if(op==='module'){
                const open=document.createElement('button');open.type='button';open.className='NodeEditor-Button';open.textContent='Open content';open.onclick=()=>this.OpenModule(node.id);body.appendChild(open);
                const count=document.createElement('div');count.textContent=`${node.graph?.nodes.length??0} modules · double-click to edit`;body.appendChild(count);
                el.addEventListener('dblclick',event=>{if((event.target as Element).closest('input,select,.NodeEditor-Port'))return;event.preventDefault();event.stopPropagation();this.OpenModule(node.id);});
            }else if(op==='input'){
                const preview=document.createElement('input');preview.className='NodeEditor-Input';preview.type='number';preview.value=String(this.runtime().bindings?.[String(node.params?.portId??'in')]??node.params?.value??0);preview.setAttribute('aria-label','Input preview value');preview.oninput=()=>this.SetParameter(node.id,'value',Number(preview.value));body.appendChild(preview);
            }
            else if(op){
                if(op==='log'||op==='exp'){
                    const base=document.createElement('button');base.type='button';base.className='NodeEditor-Base';base.title='Click to edit the base (replaces a wired base)';base.appendChild(this.MathLabel(node.schema,Number(node.params?.base??(op==='log'?10:Math.E))));
                    base.onclick=()=>{const input=document.createElement('input');input.type='number';input.className='NodeEditor-Input';input.value=String(node.params?.base??(op==='log'?10:Math.E));input.setAttribute('aria-label','Base');base.replaceWith(input);input.focus();const commit=()=>{const port=node.schema.inputs[1];if(port)this._wires=this._wires.filter(w=>w.dstNodeId!==node.id||w.dstPortId!==port.id);this.SetParameter(node.id,'base',Number(input.value));this.Render();};input.onchange=commit;input.onkeydown=e=>{if(e.key==='Enter')commit();if(e.key==='Escape')this.Render();};};body.appendChild(base);icon.style.cursor='text';icon.title=base.title;icon.onclick=()=>base.click();
                }
                const add=document.createElement('button');add.type='button';add.className='NodeEditor-Button';add.textContent='+ input';add.title='Add another input (left associative)';add.onclick=()=>this.AddInput(node.id);body.appendChild(add);
            }else body.textContent=node.schema.description??'Workflow node';
            if(op==='input'||op==='output'){
                const port=document.createElement('input');port.className='NodeEditor-Input';port.value=String(node.params?.portId??(op==='input'?'in':'out'));port.setAttribute('aria-label','External port ID');port.title='Port ID exposed on the parent module';port.onchange=()=>this.SetParameter(node.id,'portId',port.value.trim());body.appendChild(port);
            }
            const error=document.createElement('div');error.className='NodeEditor-Error';error.dataset.errorId=node.id;body.appendChild(error);el.appendChild(body);
            el.style.minHeight=Math.max(108,80+Math.max(node.schema.inputs.length,node.schema.outputs.length)*22)+'px';
            for(const side of ['in','out'] as const)for(const [i,port] of (side==='in'?node.schema.inputs:node.schema.outputs).entries()){
                const button=document.createElement('button');button.type='button';button.className='NodeEditor-Port';button.dataset.nodeId=node.id;button.dataset.portId=port.id;button.dataset.side=side;button.style.top=(62.5+i*22)+'px';button.setAttribute('aria-label',`${node.schema.name} ${side} ${port.label??port.id}`);
                button.onpointerdown=e=>{e.stopPropagation();if(e.button!==0||side!=='out')return;const r=this.runtime();const start={x:e.clientX,y:e.clientY};let dragged=false;const gesture=new AbortController();r.controller?.signal.addEventListener('abort',()=>gesture.abort(),{once:true,signal:gesture.signal});
                    document.addEventListener('pointermove',move=>{if(move.pointerId!==e.pointerId)return;if(Math.hypot(move.clientX-start.x,move.clientY-start.y)>3)dragged=true;if(dragged){r.pending={node:node.id,port:port.id};r.pointer=this.LocalPoint(move.clientX,move.clientY);this.Refresh();}},{signal:gesture.signal});
                    document.addEventListener('pointerup',up=>{if(up.pointerId!==e.pointerId)return;gesture.abort();if(!dragged)return;const target=document.elementFromPoint(up.clientX,up.clientY)?.closest<HTMLElement>('.NodeEditor-Port');if(target&&this.contains(target)&&target.dataset.side==='in')this.addWire(node.id,port.id,target.dataset.nodeId!,target.dataset.portId!);else{r.pending=null;this.Refresh();}button.dataset.suppressClick='true';},{signal:gesture.signal});document.addEventListener('pointercancel',()=>{gesture.abort();r.pending=null;this.Refresh();},{once:true,signal:gesture.signal});};
                button.onclick=e=>{e.stopPropagation();if(button.dataset.suppressClick){delete button.dataset.suppressClick;return;}const r=this.runtime();if(side==='out')r.pending=r.pending?.node===node.id&&r.pending.port===port.id?null:{node:node.id,port:port.id};else if(r.pending)this.addWire(r.pending.node,r.pending.port,node.id,port.id);this.Refresh();};
                button.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();this._wires=this._wires.filter(w=>side==='in'?!(w.dstNodeId===node.id&&w.dstPortId===port.id):!(w.srcNodeId===node.id&&w.srcPortId===port.id));this.Changed();};el.appendChild(button);
            }
            el.addEventListener('pointerdown',e=>{
                if(e.button!==0||(e.target as Element).closest('button,input,select,math'))return;e.stopPropagation();this.runtime().closeMenu?.();
                const r=this.runtime();if(!r.selectedNodes.has(node.id)){if(e.ctrlKey||e.metaKey||e.altKey)return;this.SelectNodes([node.id],e.shiftKey?'add':'replace');}this.focus({preventScroll:true});
                const p=this.LocalPoint(e.clientX,e.clientY),starts=new Map(this.nodes.filter(n=>this.runtime().selectedNodes.has(n.id)).map(n=>[n.id,{x:n.x,y:n.y}])),start={x:node.x,y:node.y};el.setPointerCapture(e.pointerId);
                const gesture=new AbortController();this.runtime().controller?.signal.addEventListener('abort',()=>gesture.abort(),{once:true,signal:gesture.signal});
                el.addEventListener('pointermove',move=>{if(move.pointerId!==e.pointerId)return;const q=this.LocalPoint(move.clientX,move.clientY);let next={x:start.x+q.x-p.x,y:start.y+q.y-p.y};const c=this.runtime().canvas;if(c?.getSnap().enabled)next=c.snapPoint(next);const dx=next.x-start.x,dy=next.y-start.y;for(const n of this.nodes){const origin=starts.get(n.id);if(!origin)continue;n.x=origin.x+dx;n.y=origin.y+dy;}for(const item of this.querySelectorAll<HTMLElement>('.NodeEditor-Node')){const n=this.nodes.find(n=>n.id===item.dataset.nodeId);if(n){item.style.left=n.x+'px';item.style.top=n.y+'px';}}this.RenderWires();},{signal:gesture.signal});
                const end=()=>{gesture.abort();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);};el.addEventListener('pointerup',end,{signal:gesture.signal});el.addEventListener('pointercancel',end,{signal:gesture.signal});
            });return el;
        }
        private FillInspector():void {
            const body=this.querySelector<HTMLElement>('.NodeEditor-InspectorBody');if(!body)return;body.replaceChildren();const node=this._nodes.find(n=>n.id===this._selected);
            const info=document.createElement('div');info.className='NodeEditor-Info';info.textContent=this.runtime().selectedNodes.size>1?`${this.runtime().selectedNodes.size} modules selected · ${[...this.runtime().selectedNodes].join(', ')}`:node?`${node.schema.name} · ${node.id}`:'Select a node. Connect output → input by click or drag. Double-click a wire to remove it.';body.appendChild(info);if(!node)return;
            for(const param of node.schema.params??[]){const row=document.createElement('label');row.className='NodeEditor-Param';row.textContent=param.label??param.id;const input=document.createElement('input');input.className='NodeEditor-Input';input.value=String(node.params?.[param.id]??param.default??'');input.onchange=()=>{this.SetParameter(node.id,param.id,param.type==='number'?Number(input.value):input.value);this.Render();};row.appendChild(input);body.appendChild(row);}
            const del=document.createElement('button');del.type='button';del.className='NodeEditor-Button';del.textContent='Remove node';del.onclick=()=>this.removeNode(node.id);body.appendChild(del);
        }
        public Fit():this {
            const canvas=this.runtime().canvas;if(!canvas||!this._nodes.length)return this;const world=canvas.world;
            const x=Math.min(...this._nodes.map(n=>n.x)),y=Math.min(...this._nodes.map(n=>n.y)),right=Math.max(...this._nodes.map(n=>n.x+174)),bottom=Math.max(...this._nodes.map(n=>n.y+180));
            const zoom=Math.max(.1,Math.min(1,(world.clientWidth-50)/(right-x),(world.clientHeight-50)/(bottom-y)));canvas.setZoom(zoom);canvas.panTo((world.clientWidth/2-(x+right)/2)*zoom,(world.clientHeight/2-(y+bottom)/2)*zoom);return this;
        }
        private Render():void {
            this.EnsureState();for(const [id,item] of [...this.runtime().modules])if(!this._nodes.some(n=>n.id===id))item.close(false);this.DisposeView();const r=this.runtime();r.controller=new AbortController();const theme=this.getAttribute('theme')==='light'?'light':'dark';
            const shell=document.createElement('section');shell.className='NodeEditor-Shell';const toolbar=document.createElement('header');toolbar.className='NodeEditor-Toolbar';const title=document.createElement('div');title.className='NodeEditor-Title';title.textContent='AriannA Workflow';const state=document.createElement('div');state.className='NodeEditor-State';toolbar.append(title,state);
            const actions:[string,string,string,()=>unknown][]=[['run','▶','Play',()=>this.Run()],['pause','Ⅱ','Pause',()=>this.Pause()],['stop','■','Stop',()=>this.Stop()],['fit','⌖','Fit',()=>this.Fit()],['copy','','Copy',()=>this.Copy()],['cut','','Cut',()=>this.Cut()],['paste','','Paste',()=>this.Paste()],['delete','','Delete',()=>this.DeleteSelection()],['clear','','Clear',()=>{this.Stop();this._nodes=[];this._wires=[];this._selected=null;for(const item of [...r.modules.values()])item.close(false);r.values.clear();r.errors.clear();r.selectedWire=null;r.selectedNodes.clear();r.selectedWires.clear();this.Render();}],['export','','Export JSON',()=>this.ExportJSON()]];
            for(const [kind,glyph,label,action] of actions){const b=document.createElement('button');b.type='button';b.className='NodeEditor-Button';b.dataset.kind=kind;const span=document.createElement('span');span.className='NodeEditor-ControlGlyph';span.textContent=glyph;b.append(span,document.createTextNode(' '+label));b.onclick=action;toolbar.appendChild(b);}
            const body=document.createElement('div');body.className='NodeEditor-Body';const viewport=document.createElement('div');viewport.className='NodeEditor-Viewport';body.appendChild(viewport);shell.append(toolbar,body);this.replaceChildren(shell);
            const canvas=new Canvas2D();canvas.setAttribute('theme',theme);canvas.classList.add('NodeEditor-Canvas');canvas.style.setProperty('height','100%','important');canvas.style.setProperty('min-height','0','important');viewport.appendChild(canvas);r.canvas=canvas;
            const world=canvas.world;canvas.drawingSurface.style.pointerEvents='none';const grid=new Grid2D();grid.configure({kind:'dotted',subdivisions:1,stepX:20,stepY:20,majorEvery:5,...(theme==='dark'?{minorOpacity:.12,majorOpacity:.22}:{})});grid.attach(canvas);canvas.useGrid(grid);canvas.setGrid({enabled:true,size:20,subdivisions:1});r.grid=grid;
            if(r.viewport){canvas.setZoom(r.viewport.zoom);canvas.panTo(r.viewport.panX,r.viewport.panY);canvas.setTilt(r.viewport.tilt);}
            const workspace=document.createElement('div');workspace.className='NodeEditor-Workspace';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','NodeEditor-Wires');workspace.appendChild(svg);for(const node of this._nodes)workspace.appendChild(this.MakeNode(node));world.appendChild(workspace);this.BindWorkspaceDrop(viewport);
            viewport.addEventListener('pointermove',e=>{if(r.pending){r.pointer=this.LocalPoint(e.clientX,e.clientY);this.RenderWires();}});
            const selection=new SelectionRectangle();selection.options={mode:'2d',activation:'always',directionSensitive:false,rule:'intersect'};r.selection=selection;
            selection.addEventListener('arianna:selection-change',()=>{if(r.syncingSelection)return;r.selectedNodes.clear();r.selectedWires.clear();for(const item of selection.selected){const element=item as HTMLElement;if(element.dataset.nodeId)r.selectedNodes.add(element.dataset.nodeId);else if(element.dataset.wireId)r.selectedWires.add(element.dataset.wireId);}r.selectedWire=[...r.selectedWires][0]??null;this._selected=[...r.selectedNodes][0]??null;r.pending=null;this.PaintSelection();this.FillInspector();},{signal:r.controller.signal});
            canvas.selectionSurface.addEventListener('pointerdown',event=>{if(!(event.target as Element).closest('button,input,select,textarea,[contenteditable="true"]'))this.focus({preventScroll:true});},{capture:true,signal:r.controller.signal});
            selection.attach(canvas);this.SyncSelection();
            const navigation=()=>{selection.options={enabled:canvas.navigation==='none'};};canvas.addEventListener('arianna:navigation-change',navigation,{signal:r.controller.signal});navigation();
            const palette=this.CreatePalette(viewport),inspector=document.createElement('aside');inspector.className='NodeEditor-Inspector';const ih=document.createElement('div');ih.className='NodeEditor-InspectorHeader';ih.textContent='Node';const ib=document.createElement('div');ib.className='NodeEditor-InspectorBody';inspector.append(ih,ib);
            for(const [i,panel] of [palette,inspector].entries()){
                body.appendChild(panel);const dock=new Dockable();dock.attach(panel,{container:body,title:i===0?'Modules':'Inspector',theme,position:r.dockPositions[i]??(i===0?'left':'right'),width:190,height:360,dockWidth:190,dockHeight:180});r.docks.push(dock);const rect=r.dockRects[i];if(dock.Position==='float'&&rect&&dock.Wrapper)Object.assign(dock.Wrapper.style,rect);
                panel.addEventListener('arianna:dock-end',()=>this.UpdateInsets());
            }
            this.addEventListener('keydown',e=>this.HandleWireKey(e),{signal:r.controller.signal});
            r.resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>this.UpdateInsets()):null;r.resize?.observe(body);for(const d of r.docks)if(d.Wrapper)r.resize?.observe(d.Wrapper);
            this.UpdateInsets();this.FillInspector();this.UpdateRunControls();this.Refresh();this.SyncSelection();
        }
    }

}

export type NodeEditorOptions = NodeEditor.Interfaces.NodeEditorOptions;
export type NodeSchema = NodeEditor.Interfaces.NodeSchema;
export type NodeInstance = NodeEditor.Interfaces.NodeInstance;
export type WireInstance = NodeEditor.Interfaces.WireInstance;
export type PortSpec = NodeEditor.Interfaces.PortSpec;
export type ParamSpec = NodeEditor.Interfaces.ParamSpec;
export type RunState = NodeEditor.Types.RunState;
export type WireStatus = NodeEditor.Types.WireStatus;
export type TypeCheckFn = NodeEditor.Types.TypeCheckFn;

/** Canonical public name for the workflow editor. The legacy NodeEditor namespace/tag remains compatible. */
export const Workflow = NodeEditor.NodeEditor;
export type WorkflowOptions = NodeEditor.Interfaces.NodeEditorOptions;

export default Workflow;

export type WorkflowGraph=NodeEditor.Interfaces.Graph;
export type WorkflowClipboard=NodeEditor.Interfaces.Clipboard;
