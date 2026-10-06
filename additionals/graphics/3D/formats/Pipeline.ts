import type {ModelLoadOptions,LoaderAny,Loader2D,Loader3D,LoadResult} from './Types.ts';
interface Codecs{PLYLoader:any;DXFLoader:any;STLLoader:any;OBJLoader:any;GLTFLoader:any;GLBLoader:any;FBXLoader:any;}
export function createImportPipeline(codecs:Codecs){const {PLYLoader,DXFLoader,STLLoader,OBJLoader,GLTFLoader,GLBLoader,FBXLoader}=codecs;
class ImportPipeline
    {
        #loaders: Map<string, { loader: LoaderAny; kind: '2d' | '3d' }> = new Map();

        register(extension: string, loader: LoaderAny, kind: '2d' | '3d' = '3d'): this
        {
            this.#loaders.set(extension.toLowerCase(), { loader, kind });
            return this;
        }

        extensions(): string[] { return Array.from(this.#loaders.keys()); }

        async load(file: File, options:ModelLoadOptions={}): Promise<LoadResult>
        {
            const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
            const entry = this.#loaders.get(ext);
            if (!entry) throw new Error(`ImportPipeline: no loader for ${ext}`);

            if (entry.kind === '2d') {
                const text = await file.text();
                const data = (entry.loader as Loader2D).parse(text);
                return { kind: '2d', format: ext.slice(1), data };
            } else {
                const buf = await file.arrayBuffer();
                const data = await (entry.loader as Loader3D).parse(buf,options);
                return { kind: '3d', format: ext.slice(1), data };
            }
        }

        async loadURL(url: string, options:ModelLoadOptions={}): Promise<LoadResult>
        {
            const r = await fetch(url,{signal:options.signal});
            if (!r.ok) throw new Error(`ImportPipeline: HTTP ${r.status} for ${url}`);
            const blob = await r.blob();
            const resolved=r.url||url;const name = new URL(resolved,options.baseURL??globalThis.location?.href).pathname.split('/').pop() ?? 'asset';
            const file = new File([blob], name);
            return this.load(file,{...options,baseURL:options.baseURL??resolved});
        }

        /** Pre-built pipeline with every loader implemented in this module. */
        static withDefaults(): ImportPipeline
        {
            const p = new ImportPipeline();
            p.register('.ply',  PLYLoader as never, '3d');
            p.register('.dxf',  DXFLoader as never, '2d');
            p.register('.stl',  {parse:(i:ArrayBuffer)=>{const g=STLLoader.parse(i);return{positions:g.positions,normals:g.normals,indices:g.indices,format:'stl',vertexCount:g.vertexCount,triangleCount:g.positions.length/9};}} as Loader3D,'3d');
            p.register('.obj',  {parse:(i:string|ArrayBuffer)=>{const g=OBJLoader.parse(typeof i==='string'?i:new TextDecoder().decode(i));return{positions:g.positions,normals:g.normals,uvs:g.uvs,indices:g.indices,format:'obj',vertexCount:g.vertexCount,triangleCount:(g.indices.length||g.vertexCount)/3};}} as Loader3D,'3d');
            p.register('.gltf', GLTFLoader as never, '3d');
            p.register('.glb',  GLBLoader, '3d');
            p.register('.fbx',  FBXLoader, '3d');
            return p;
        }
    }
return ImportPipeline;
}
