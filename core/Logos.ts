/**
 * @module Logos IR
 * @version 2.1.0
 *
 * Canonical, stratified, multi-dialect, function-free IR contract.
 * This module contains types only: no registries, callbacks, tables or executable values.
 */
export namespace Logos
{
    export type Id = string;
    export type SchemaVersion = string;
    export type DefinitionVersion = number;
    export type Revision = number;
    export type Primitive = null | boolean | number | string;
    export type Value = Primitive | readonly Value[] | { readonly [key: string]: Value };

    export type DefinitionKind =
        | 'namespace' | 'dialect' | 'platform' | 'target' | 'policy'
        | 'type' | 'style' | 'node' | 'component'
        | 'event' | 'event-target' | 'event-handler' | 'event-code' | 'event-binding' | 'event-broker'
        | 'signal' | 'binding' | 'expression' | 'mapping' | 'action'
        | 'tensor' | 'operation' | 'graph' | 'device' | 'vision-operation'
        | 'neural-model' | 'quantization' | 'model-transform'
        | 'constraint' | 'rewrite' | 'pass' | 'pipeline' | 'artifact' | 'resource';

    export interface DefinitionHeader<K extends DefinitionKind = DefinitionKind>
    {
        readonly Id: Id;
        readonly Kind: K;
        readonly DialectId: Id;
        readonly Version: DefinitionVersion;
        readonly Revision?: Revision;
        readonly Metadata?: Readonly<Record<string, Value>>;
        readonly Provenance?: Provenance;
        readonly Integrity?: Integrity;
    }

    export interface Hash
    {
        readonly Algorithm: 'sha256' | 'sha384' | 'sha512';
        readonly Value: string;
    }

    export interface Integrity
    {
        readonly Canonicalization: 'logos-c14n-v1';
        readonly Scope: 'definition' | 'fragment' | 'program' | 'artifact';
        readonly Hash: Hash;
        readonly SignatureAlgorithm?: 'ed25519' | 'ecdsa-p256' | 'rsa-pss-sha256';
        readonly KeyId?: string;
        readonly Signature?: string;
        readonly CertificateChain?: readonly string[];
        readonly ExcludedPaths?: readonly string[];
    }

    export interface Provenance
    {
        readonly Source?: string;
        readonly Tool?: { readonly Name: string; readonly Version: string };
        readonly Inputs?: readonly Hash[];
        readonly RequirementIds?: readonly string[];
        readonly BuildId?: string;
        readonly Timestamp?: string;
        readonly Metadata?: Readonly<Record<string, Value>>;
    }

    export type Stage = 'HIR' | 'MIR' | 'LIR';
    export type Profile = 'open' | 'standard' | 'regulated' | 'safety';
    export type DialectLevel = 'source' | 'semantic' | 'computational' | 'target';
    export type PlatformKind = 'web' | 'server' | 'native' | 'qnx' | 'vxworks' | 'embedded' | 'nvidia-gpu' | 'amd-gpu' | 'apple';
    export type MemorySpaceKind = 'host' | 'device' | 'unified' | 'shared' | 'constant' | 'texture';
    export type ExecutionModel = 'scalar' | 'simd' | 'simt' | 'dataflow' | 'event-driven';
    export type ElementType = 'f64' | 'f32' | 'f16' | 'bf16' | 'i64' | 'i32' | 'i16' | 'i8' | 'u8' | 'bool';

    export namespace Namespace
    {
        export type NamespaceKind = 'html' | 'svg' | 'mathml' | 'x3d' | 'custom' | 'ui' | 'events' | 'vision' | 'tensor' | 'neural' | 'cuda' | 'llvm' | 'device' | 'application';
        export interface Definition extends DefinitionHeader<'namespace'>
        {
            readonly NamespaceKind: NamespaceKind;
            readonly Name: string;
            readonly Uri?: string;
            readonly Prefix?: string;
        }
    }

    export namespace Dialect
    {
        export interface Definition extends DefinitionHeader<'dialect'>
        {
            readonly Name: string;
            readonly Level: DialectLevel;
            readonly TypeNames: readonly string[];
            readonly OperationNames: readonly string[];
            readonly LowersTo?: readonly Id[];
            readonly ValidatorRefs?: readonly string[];
        }
    }

    export namespace Platform
    {
        export interface Requirements
        {
            readonly CapabilityIds: readonly string[];
            readonly MemorySpaces?: readonly MemorySpaceKind[];
            readonly ExecutionModels?: readonly ExecutionModel[];
            readonly DataTypes?: readonly ElementType[];
            readonly MaxMemoryBytes?: number;
            readonly MaxNodes?: number;
            readonly DynamicAllocation?: boolean;
            readonly Threads?: boolean;
            readonly FloatingPoint?: boolean;
        }

        export interface Definition extends DefinitionHeader<'platform'>
        {
            readonly PlatformKind: PlatformKind;
            readonly Name: string;
            readonly PlatformVersion?: string;
            readonly Profile: Profile;
            readonly NamespaceIds: readonly Id[];
            readonly DialectIds: readonly Id[];
            readonly Capabilities: readonly string[];
            readonly MemorySpaces: readonly MemorySpaceKind[];
            readonly ExecutionModels: readonly ExecutionModel[];
            readonly DataTypes: readonly ElementType[];
        }
    }

    export namespace Target
    {
        export type TargetKind = 'dom' | 'html' | 'swiftui' | 'c' | 'cpp' | 'rust' | 'wasm' | 'cuda' | 'ptx' | 'spirv' | 'metal' | 'llvm' | 'binary-table';
        export interface Definition extends DefinitionHeader<'target'>
        {
            readonly TargetKind: TargetKind;
            readonly PlatformId: Id;
            readonly Name: string;
            readonly Triple?: string;
            readonly Features?: readonly string[];
        }
    }

    export namespace Policy
    {
        export interface Definition extends DefinitionHeader<'policy'>
        {
            readonly Profile: Profile;
            readonly AllowedHandlerKinds: readonly Events.HandlerKind[];
            readonly ForbidDynamicCode: boolean;
            readonly RequireSignedCode: boolean;
            readonly AllowedCodeLanguages?: readonly Events.CodeLanguage[];
            readonly CapabilityAllowList?: readonly string[];
        }
    }

    export namespace Type
    {
        export type Declaration = 'FUNCTION' | 'CLASS' | 'IDL' | 'STRUCT' | 'ENUM' | 'TRAIT' | 'PROTOCOL';
        export type TypeKind = 'standard' | 'custom';
        export interface Shadow { readonly Mode: 'open' | 'closed' | 'none'; readonly Options?: Readonly<Record<string, Value>>; }
        export interface Definition extends DefinitionHeader<'type'>
        {
            readonly Name: string;
            readonly Tags: readonly string[];
            readonly NamespaceId: Id;
            readonly Declaration: Declaration;
            readonly TypeKind: TypeKind;
            readonly Custom: boolean;
            readonly Native: boolean;
            readonly InterfaceRef?: string;
            readonly BaseTypeIds?: readonly Id[];
            readonly ConstructorRef?: string;
            readonly StyleIds?: readonly Id[];
            readonly Shadow?: Shadow;
            readonly TemplateRef?: string;
            readonly Slot?: string | null;
            readonly Attributes?: Readonly<Record<string, Primitive>>;
            readonly PropertySchemas?: readonly PropertySchema[];
            readonly EventIds?: readonly Id[];
        }
        export interface PropertySchema
        {
            readonly Name: string;
            readonly ValueType: string;
            readonly Required: boolean;
            readonly Mutable: boolean;
            readonly Default?: Value;
        }
    }

    export namespace Css
    {
        export type Declarations = Readonly<Record<string, string>>;
        export interface SelectorObject
        {
            readonly Type: string;
            readonly Name?: string;
            readonly Value?: string;
            readonly Media?: string;
            readonly Url?: string;
            readonly Prefix?: string;
            readonly Domain?: string;
            readonly Regex?: string;
            readonly Right?: boolean;
            readonly Left?: boolean;
            readonly And?: Readonly<Record<string, Value>>;
            readonly Or?: Readonly<Record<string, Value>>;
            readonly Not?: Readonly<Record<string, Value>>;
            readonly Extensions?: Readonly<Record<string, Value>>;
        }
        export type Selector = string | SelectorObject;
        export type Scope =
            | { readonly Kind: 'global' }
            | { readonly Kind: 'class'; readonly Name: string }
            | { readonly Kind: 'host' }
            | { readonly Kind: 'instance'; readonly Id: Id };
        export interface Rule
        {
            readonly Selector: Selector;
            readonly Declarations: Declarations;
            readonly Rules?: readonly Rule[];
        }
        export interface Definition extends DefinitionHeader<'style'>
        {
            readonly Name: string;
            readonly Scope: Scope;
            readonly Rules: readonly Rule[];
            readonly Extensions?: Readonly<Record<string, Value>>;
        }
    }

    export namespace Expression
    {
        export type Node =
            | { readonly Op: 'constant'; readonly Value: Value }
            | { readonly Op: 'reference'; readonly Path: string }
            | { readonly Op: 'not'; readonly Operand: Node }
            | { readonly Op: 'and' | 'or'; readonly Operands: readonly Node[] }
            | { readonly Op: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'add' | 'sub' | 'mul' | 'div'; readonly Left: Node; readonly Right: Node }
            | { readonly Op: 'call'; readonly OperationId: Id; readonly Arguments: readonly Node[] };
        export interface Definition extends DefinitionHeader<'expression'> { readonly Root: Node; }
    }

    export namespace Mapping
    {
        export interface Assignment { readonly TargetPath: string; readonly ExpressionId: Id; }
        export interface Definition extends DefinitionHeader<'mapping'>
        {
            readonly SourceSchema?: string;
            readonly TargetSchema?: string;
            readonly Assignments: readonly Assignment[];
        }
    }

    export namespace Action
    {
        export type ActionKind = 'native-reference' | 'graph' | 'bytecode' | 'remote';

        /**
         * Structured address for a native compiler/runtime primitive. This is data only: it never
         * carries a live callback or executable value. In Web LIR AriannA uses it to address
         * canonical static Real primitives 1:1 (for example RuntimeId='arianna.runtime',
         * Type='Real', Member='Append', Static=true).
         */
        export interface NativeAddress
        {
            readonly RuntimeId: Id;
            readonly Type: string;
            readonly Member: string;
            readonly Static: boolean;
        }

        export interface Instruction { readonly Op: string; readonly Arguments?: readonly Value[]; }
        export interface Definition extends DefinitionHeader<'action'>
        {
            readonly ActionKind: ActionKind;
            /** Legacy opaque reference retained for transport/backward compatibility. */
            readonly NativeReference?: string;
            /** Canonical structured native address used by MIR/LIR validation and lowering. */
            readonly NativeAddress?: NativeAddress;
            readonly CodeId?: Id;
            readonly Instructions?: readonly Instruction[];
            readonly InputSchema?: string;
            readonly OutputSchema?: string;
            readonly Capabilities?: readonly string[];
            readonly ResourceBudget?: ResourceBudget;
        }
        export interface ResourceBudget
        {
            readonly MaxDurationUs?: number;
            readonly MaxMemoryBytes?: number;
            readonly MaxStackBytes?: number;
            readonly MaxAllocations?: number;
            readonly MaxEmittedEvents?: number;
        }
    }

    export namespace Events
    {
        export type Phase = 'capture' | 'target' | 'bubble' | 'broker';
        export type Category = 'DOM' | 'Application' | 'Lifecycle' | 'State' | 'Message' | 'Timer' | 'Interrupt' | 'Device' | 'Compute' | 'Custom';
        export type State = 'Active' | 'Deprecated' | 'Experimental' | 'Disabled';
        export type HandlerKind = 'reference' | 'source' | 'bytecode' | 'native' | 'remote';
        export type CodeLanguage = 'javascript' | 'typescript' | 'webassembly' | 'llvm-ir' | 'c' | 'cpp' | 'rust' | 'swift' | 'bytecode' | 'expression' | 'none';
        export type Encoding = 'utf-8' | 'base64' | 'hex' | 'binary-reference';
        export type TargetKind = 'node' | 'component' | 'service' | 'device' | 'process' | 'channel' | 'topic' | 'selector' | 'kernel' | 'runtime';
        export type DispatchMode = 'synchronous' | 'sequential' | 'parallel' | 'first-success' | 'all-settled' | 'fire-and-forget';
        export type DeliveryGuarantee = 'at-most-once' | 'at-least-once' | 'effectively-once';

        export interface Event extends DefinitionHeader<'event'>
        {
            readonly Namespace: string;
            readonly Name: string;
            readonly QualifiedName: string;
            readonly Category: Category;
            readonly State: State;
            readonly PayloadSchema?: string;
            readonly ResultSchema?: string;
            readonly ErrorIds?: readonly Id[];
            readonly Bubbles: boolean;
            readonly Cancelable: boolean;
            readonly Composed: boolean;
            readonly TrustedOnly: boolean;
        }
        export interface Target extends DefinitionHeader<'event-target'>
        {
            readonly TargetKind: TargetKind;
            readonly Namespace?: string;
            readonly Reference: string;
            readonly PlatformId?: Id;
            readonly TypeId?: Id;
            readonly Path?: string;
        }
        export interface Code extends DefinitionHeader<'event-code'>
        {
            readonly Language: CodeLanguage;
            readonly Encoding: Encoding;
            readonly MediaType: string;
            readonly Source?: string;
            readonly ArtifactUri?: string;
            readonly EntryPoint?: string;
            readonly ExportName?: string;
            readonly SourceMap?: string;
            readonly Compiler?: { readonly Name: string; readonly Version: string; readonly Options: readonly string[]; readonly Target?: string };
        }
        export interface Handler extends DefinitionHeader<'event-handler'>
        {
            readonly Name: string;
            readonly HandlerKind: HandlerKind;
            readonly Reference: string;
            readonly CodeId?: Id;
            readonly ActionId?: Id;
            readonly InputSchema?: string;
            readonly OutputSchema?: string;
            readonly Async: boolean;
            readonly Pure: boolean;
            readonly Deterministic: boolean;
            readonly TimeoutMs?: number;
            readonly MaxRetries?: number;
            readonly Capabilities?: readonly string[];
            readonly Idempotent?: boolean;
            readonly IdempotencyExpressionId?: Id;
        }
        export interface Broker extends DefinitionHeader<'event-broker'>
        {
            readonly Name: string;
            readonly SourceTargetId?: Id;
            readonly DestinationTargetId: Id;
            readonly Enabled: boolean;
            readonly Priority: number;
            readonly PredicateExpressionId?: Id;
        }
        export interface Binding extends DefinitionHeader<'event-binding'>
        {
            readonly EventId: Id;
            readonly TargetId: Id;
            readonly HandlerId: Id;
            readonly ObserverTargetId?: Id;
            readonly Phase: Phase;
            readonly Priority: number;
            readonly Once: boolean;
            readonly Passive: boolean;
            readonly Enabled: boolean;
            readonly Propagate: boolean;
            readonly PreventDefault: boolean;
            readonly TrustedOnly: boolean;
            readonly BrokerIds?: readonly Id[];
            readonly ConditionExpressionId?: Id;
            readonly InputMappingId?: Id;
            readonly OutputMappingId?: Id;
            readonly DispatchMode: DispatchMode;
            readonly DeliveryGuarantee?: DeliveryGuarantee;
            readonly Durable?: boolean;
            readonly Ordered?: boolean;
            readonly SecurityPolicyId?: Id;
        }
        export interface Pool
        {
            readonly Events: readonly Event[];
            readonly Targets: readonly Target[];
            readonly Codes: readonly Code[];
            readonly Handlers: readonly Handler[];
            readonly Brokers: readonly Broker[];
            readonly Bindings: readonly Binding[];
        }
        export interface Envelope
        {
            readonly Schema: string;
            readonly SchemaVersion: SchemaVersion;
            readonly MessageId: Id;
            readonly CorrelationId?: Id;
            readonly CausationId?: Id;
            readonly Timestamp: string;
            readonly SourceTargetId?: Id;
            readonly DestinationTargetId?: Id;
            readonly EventId: Id;
            readonly BindingId?: Id;
            readonly Headers?: Readonly<Record<string, Value>>;
            readonly Payload: Value;
            readonly Security?: { readonly Principal?: string; readonly Roles?: readonly string[]; readonly Signature?: string; readonly Token?: string };
            readonly Trace?: { readonly TraceId?: string; readonly SpanId?: string; readonly ParentSpanId?: string };
        }
    }

    export namespace Reactive
    {
        export interface Signal extends DefinitionHeader<'signal'>
        {
            readonly ValueType: string;
            readonly InitialValue: Value;
            readonly Mutable: boolean;
        }
        export interface Binding extends DefinitionHeader<'binding'>
        {
            readonly SignalId: Id;
            readonly TargetNodeId: Id;
            readonly Property: string;
            readonly TransformExpressionId?: Id;
            readonly Direction: 'one-way' | 'two-way';
        }
    }

    export namespace Node
    {
        export type NodeKind = 'element' | 'text' | 'component' | 'resource' | 'operation';
        export interface Definition extends DefinitionHeader<'node'>
        {
            readonly NodeKind: NodeKind;
            readonly Path: string;
            readonly NamespaceId: Id;
            readonly TypeId?: Id;
            readonly ParentId?: Id;
            readonly ChildIds: readonly Id[];
            readonly Tag?: string;
            readonly Text?: string;
            readonly Attributes: Readonly<Record<string, Primitive>>;
            readonly StyleIds: readonly Id[];
            readonly EventBindingIds: readonly Id[];
            readonly ReactiveBindingIds: readonly Id[];
            readonly State?: Readonly<Record<string, Value>>;
        }
    }

    export namespace Component
    {
        export interface Definition extends DefinitionHeader<'component'>
        {
            readonly Name: string;
            readonly NamespaceId: Id;
            readonly TypeId: Id;
            readonly RootNodeId: Id;
            readonly NodeIds: readonly Id[];
            readonly StyleIds: readonly Id[];
            readonly EventBindingIds: readonly Id[];
            readonly SignalIds: readonly Id[];
        }
    }

    export namespace Compute
    {
        export interface Tensor extends DefinitionHeader<'tensor'>
        {
            readonly ElementType: ElementType;
            readonly Shape: readonly number[];
            readonly DynamicDimensions?: readonly boolean[];
            readonly Layout: 'row-major' | 'column-major' | 'nchw' | 'nhwc' | 'blocked' | 'custom';
            readonly MemorySpace?: MemorySpaceKind;
            readonly QuantizationId?: Id;
        }
        export interface Operation extends DefinitionHeader<'operation'>
        {
            readonly Namespace: string;
            readonly OperationType: string;
            readonly InputTensorIds: readonly Id[];
            readonly OutputTensorIds: readonly Id[];
            readonly Attributes: Readonly<Record<string, Value>>;
            readonly DeviceRequirements?: readonly string[];
        }
        export interface Graph extends DefinitionHeader<'graph'>
        {
            readonly Name: string;
            readonly InputTensorIds: readonly Id[];
            readonly OutputTensorIds: readonly Id[];
            readonly TensorIds: readonly Id[];
            readonly OperationIds: readonly Id[];
        }
        export interface Device extends DefinitionHeader<'device'>
        {
            readonly PlatformId: Id;
            readonly Name: string;
            readonly MemoryBytes?: number;
            readonly Capabilities: readonly string[];
        }
    }

    export namespace Vision
    {
        export interface Operation extends DefinitionHeader<'vision-operation'>
        {
            readonly OperationType: string;
            readonly InputIds: readonly Id[];
            readonly OutputIds: readonly Id[];
            readonly Parameters: Readonly<Record<string, Value>>;
        }
    }

    export namespace Neural
    {
        export interface TensorReference { readonly Name: string; readonly TensorId: Id; readonly Role: string; }
        export interface Model extends DefinitionHeader<'neural-model'>
        {
            readonly Architecture: string;
            readonly VocabularySize?: number;
            readonly ContextLength?: number;
            readonly HiddenSize?: number;
            readonly IntermediateSize?: number;
            readonly LayerCount?: number;
            readonly GraphId: Id;
            readonly Tensors: readonly TensorReference[];
            readonly TokenizerId?: Id;
            readonly GenerationConfigId?: Id;
        }
        export interface Quantization extends DefinitionHeader<'quantization'>
        {
            readonly Scheme: 'none' | 'int8' | 'int4' | 'fp8' | 'nf4' | 'mixed';
            readonly Granularity: 'tensor' | 'channel' | 'group';
            readonly GroupSize?: number;
            readonly Symmetric: boolean;
            readonly ScaleType: 'f32' | 'f16';
            readonly CalibrationDatasetId?: Id;
        }
        export interface ModelTransform extends DefinitionHeader<'model-transform'>
        {
            readonly SourceModelId: Id;
            readonly TargetModelId: Id;
            readonly PassIds: readonly Id[];
            readonly Validation?: { readonly CompareLogits?: boolean; readonly MaximumAbsoluteError?: number; readonly MaximumRelativeError?: number; readonly PerplexityTolerance?: number };
        }
    }

    export namespace Transform
    {
        export interface Constraint extends DefinitionHeader<'constraint'> { readonly ExpressionId: Id; readonly Message?: string; }
        export interface Rewrite extends DefinitionHeader<'rewrite'>
        {
            readonly MatchDialect: Id;
            readonly ReplaceDialect: Id;
            readonly MatchOperation: string;
            readonly ReplaceOperation: string;
            readonly ConditionExpressionId?: Id;
        }
        export interface Pass extends DefinitionHeader<'pass'>
        {
            readonly Name: string;
            readonly InputDialectId: Id;
            readonly OutputDialectId: Id;
            readonly PreconditionIds: readonly Id[];
            readonly RewriteIds: readonly Id[];
            readonly Preserves: readonly string[];
            readonly Invalidates: readonly string[];
            readonly CostModelId?: Id;
            readonly Deterministic: boolean;
        }
        export type OptimizationLevel = 'none' | 'size' | 'speed' | 'latency' | 'throughput' | 'memory';
        export interface Pipeline extends DefinitionHeader<'pipeline'>
        {
            readonly InputDialectId: Id;
            readonly OutputDialectId: Id;
            readonly PassIds: readonly Id[];
            readonly TargetPlatformId: Id;
            readonly OptimizationLevel: OptimizationLevel;
            readonly ValidationPolicyId?: Id;
        }
    }

    export namespace Artifact
    {
        export interface Definition extends DefinitionHeader<'artifact'>
        {
            readonly MediaType: string;
            readonly Uri?: string;
            readonly Inline?: string;
            readonly Encoding?: 'utf-8' | 'base64' | 'hex';
            readonly TargetId?: Id;
        }
    }

    export namespace Resource
    {
        export interface Definition extends DefinitionHeader<'resource'>
        {
            readonly ResourceType: string;
            readonly Uri?: string;
            readonly ContentHash?: Hash;
            readonly Attributes?: Readonly<Record<string, Value>>;
        }
    }

    export type Definition =
        | Namespace.Definition | Dialect.Definition | Platform.Definition | Target.Definition | Policy.Definition
        | Type.Definition | Css.Definition | Node.Definition | Component.Definition
        | Events.Event | Events.Target | Events.Code | Events.Handler | Events.Broker | Events.Binding
        | Reactive.Signal | Reactive.Binding | Expression.Definition | Mapping.Definition | Action.Definition
        | Compute.Tensor | Compute.Operation | Compute.Graph | Compute.Device | Vision.Operation
        | Neural.Model | Neural.Quantization | Neural.ModelTransform
        | Transform.Constraint | Transform.Rewrite | Transform.Pass | Transform.Pipeline
        | Artifact.Definition | Resource.Definition;

    export interface CapabilityRequirement
    {
        readonly Capability: string;
        readonly VersionRange?: string;
        readonly Optional?: boolean;
    }

    export interface ExternalReference
    {
        readonly Id: Id;
        readonly Domain: string;
        readonly Kind: DefinitionKind;
        readonly VersionRange?: string;
        readonly Integrity?: Hash;
        readonly Optional?: boolean;
        readonly SourceFragmentId?: Id;
    }

    export interface Fragment<TDomain extends string = string>
    {
        readonly Schema: 'urn:alchemia:logos:2';
        readonly SchemaVersion: SchemaVersion;
        readonly FragmentId: Id;
        readonly Revision: Revision;
        readonly Domain: TDomain;
        readonly Definitions: readonly Definition[];
        readonly References: readonly ExternalReference[];
        readonly Requirements: readonly CapabilityRequirement[];
        readonly Integrity?: Integrity;
        readonly Provenance?: Provenance;
    }

    export interface ProgramBase
    {
        readonly Schema: 'urn:alchemia:logos:2';
        readonly SchemaVersion: SchemaVersion;
        readonly ProgramId: Id;
        readonly Revision: Revision;
        readonly Stage: Stage;
        readonly Profile: Profile;
        readonly PlatformIds: readonly Id[];
        readonly ActivePlatformId?: Id;
        readonly TargetId?: Id;
        readonly RootNodeIds: readonly Id[];
        readonly Definitions: readonly Definition[];
        readonly UnresolvedReferences: readonly ExternalReference[];
        readonly Requirements: readonly CapabilityRequirement[];
        readonly Provenance?: Provenance;
        readonly Integrity?: Integrity;
    }

    export interface HIR extends ProgramBase
    {
        readonly Stage: 'HIR';
        readonly ActivePlatformId?: never;
        readonly TargetId?: never;
    }
    export interface MIR extends ProgramBase
    {
        readonly Stage: 'MIR';
        readonly ActivePlatformId: Id;
        readonly TargetId?: never;
    }
    export interface LIR extends ProgramBase
    {
        readonly Stage: 'LIR';
        readonly ActivePlatformId: Id;
        readonly TargetId: Id;
        readonly UnresolvedReferences: readonly [];
    }
    export type Program = HIR | MIR | LIR;

    export type PatchOp = 'add' | 'replace' | 'remove' | 'move' | 'test';
    export interface PatchOperation
    {
        readonly Op: PatchOp;
        readonly Path: string;
        readonly Value?: Value;
        readonly From?: string;
    }
    export interface FragmentPatch
    {
        readonly Schema: 'urn:alchemia:logos:2';
        readonly SchemaVersion: SchemaVersion;
        readonly FragmentId: Id;
        readonly BaseRevision: Revision;
        readonly TargetRevision: Revision;
        readonly Operations: readonly PatchOperation[];
        readonly Integrity?: Integrity;
    }
}

export default Logos;
