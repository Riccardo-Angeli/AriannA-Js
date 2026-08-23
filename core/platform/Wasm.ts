/** Zero-dependency WebAssembly host for AriannA. No generated glue and no runtime code generation. */
export namespace Wasm
{
    export type Imports = WebAssembly.Imports;
    export interface LoadOptions { Imports?: Imports; Signal?: AbortSignal; }

    export class Module
    {
        readonly Instance: WebAssembly.Instance;
        readonly Compiled: WebAssembly.Module;
        constructor(compiled: WebAssembly.Module, instance: WebAssembly.Instance)
        { this.Compiled = compiled; this.Instance = instance; }
        get Exports(): WebAssembly.Exports { return this.Instance.exports; }
        Export<T extends WebAssembly.ExportValue>(name: string): T
        {
            const value = this.Exports[name];
            if(value === undefined) throw new Error(`[arianna] Missing WASM export '${name}'.`);
            return value as T;
        }
    }

    async function Instantiate(source: string | URL | Response | BufferSource | WebAssembly.Module, options: LoadOptions = {}): Promise<Module>
    {
        if(options.Signal?.aborted) throw options.Signal.reason ?? new DOMException('WASM load aborted.', 'AbortError');
        const imports = options.Imports ?? {};
        if(source instanceof WebAssembly.Module)
            return new Module(source, await WebAssembly.instantiate(source, imports));
        if(typeof source === 'string' || source instanceof URL || source instanceof Response)
        {
            const response = source instanceof Response ? source : await fetch(source, { signal: options.Signal });
            if(!response.ok) throw new Error(`[arianna] WASM fetch failed: ${response.status} ${response.statusText}.`);
            if(typeof WebAssembly.instantiateStreaming === 'function')
            {
                try
                {
                    const result = await WebAssembly.instantiateStreaming(response.clone(), imports);
                    return new Module(result.module, result.instance);
                }
                catch(error)
                {
                    if(error instanceof WebAssembly.CompileError || error instanceof TypeError)
                    {
                        const bytes = await response.arrayBuffer();
                        const result = await WebAssembly.instantiate(bytes, imports);
                        return new Module(result.module, result.instance);
                    }
                    throw error;
                }
            }
            const bytes = await response.arrayBuffer();
            const result = await WebAssembly.instantiate(bytes, imports);
            return new Module(result.module, result.instance);
        }
        const result = await WebAssembly.instantiate(source, imports);
        return new Module(result.module, result.instance);
    }

    /** Canonical AriannA streaming WASM entry point. */
    export namespace Streaming
    {
        export async function Start(source: string | URL | Response | BufferSource | WebAssembly.Module, options: LoadOptions = {}): Promise<Module>
        { return Instantiate(source, options); }
    }

    /** Compatibility alias. Prefer Streaming.Start(). */
    export const Load = Streaming.Start;
}
export default Wasm;
