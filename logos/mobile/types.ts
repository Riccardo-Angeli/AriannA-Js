/** Logos Mobile additive contracts. No runtime imports from canonical Logos. */
export type DeviceFamily = 'mobile' | 'watch' | 'tv';
export type Platform = 'swiftui' | 'compose' | 'arianna';
export type Domain = 'component' | 'style' | 'reactivity' | 'event' | 'lifecycle' | 'navigation' | 'capability';
export type Fidelity = 'exact' | 'adapted' | 'unsupported';
export interface NativeSymbol { readonly platform:Platform;readonly name:string;readonly minVersion?:string;readonly family:readonly DeviceFamily[];readonly domain:Domain;readonly documentation?:string; }
export interface Mapping { readonly id:string;readonly domain:Domain;readonly semantic:string;readonly platform:Platform;readonly native:string;readonly fidelity:Fidelity;readonly limitations?:readonly string[];readonly family:readonly DeviceFamily[]; }
export interface Diagnostic {readonly code:string;readonly message:string;readonly severity:'info'|'warning'|'error'; readonly path?:string;}
export interface IRNode {readonly type:string;readonly props?:Readonly<Record<string,unknown>>;readonly children?:readonly IRNode[];readonly extensions?:Readonly<Record<string,unknown>>;}
export interface MobileDocument {readonly format:'logos-mobile/1';readonly device:DeviceFamily;readonly root:IRNode;readonly provenance?:Readonly<Record<string,unknown>>;readonly extensions?:Readonly<Record<string,unknown>>;}
export interface Translation {readonly document:MobileDocument;readonly diagnostics:readonly Diagnostic[];readonly lossless:boolean;}
