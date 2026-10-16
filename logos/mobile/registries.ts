import type {Mapping,Domain,Platform,DeviceFamily} from './types.js';
/** Semantic mapping seeds, never implicit claims of universal equivalence. */
export const mappings: readonly Mapping[] = [
 ...([['text','Text','Text'],['button','Button','Button'],['stack.vertical','VStack','Column'],['stack.horizontal','HStack','Row']] as const).flatMap(([semantic,swift,compose])=>[
  {id:`swiftui:${semantic}`,domain:'component' as const,semantic,platform:'swiftui' as const,native:swift,fidelity:'adapted' as const,family:['mobile','watch','tv'] as const,limitations:['Platform-specific measurement, accessibility and focus must be validated']},
  {id:`compose:${semantic}`,domain:'component' as const,semantic,platform:'compose' as const,native:compose,fidelity:'adapted' as const,family:['mobile','watch','tv'] as const,limitations:['Platform-specific measurement, accessibility and focus must be validated']}
 ]),
 ...([['padding','.padding','Modifier.padding','style'],['tap','.onTapGesture','onClick','event'],['state','@State','mutableStateOf','reactivity'],['appear','.onAppear','DisposableEffect','lifecycle'],['navigation.stack','NavigationStack','NavHost','navigation']] as const).flatMap(([semantic,swift,compose,domain])=>[
  {id:`swiftui:${semantic}`,domain,semantic,platform:'swiftui' as const,native:swift,fidelity:'adapted' as const,family:['mobile','watch','tv'] as const,limitations:['Lifecycle/ordering semantics and platform availability differ']},
  {id:`compose:${semantic}`,domain,semantic,platform:'compose' as const,native:compose,fidelity:'adapted' as const,family:['mobile','watch','tv'] as const,limitations:['Lifecycle/ordering semantics and platform availability differ']}
 ]),
 {id:'swiftui:rotary',domain:'capability',semantic:'input.rotary',platform:'swiftui',native:'DigitalCrown',fidelity:'adapted',family:['watch']},
 {id:'compose:rotary',domain:'capability',semantic:'input.rotary',platform:'compose',native:'RotaryInput',fidelity:'adapted',family:['watch']},
 {id:'swiftui:focus',domain:'capability',semantic:'input.focus',platform:'swiftui',native:'FocusState',fidelity:'adapted',family:['tv','mobile']},
 {id:'compose:focus',domain:'capability',semantic:'input.focus',platform:'compose',native:'FocusRequester',fidelity:'adapted',family:['tv','mobile']}
];
export function queryMapping(platform:Platform,family:DeviceFamily,domain?:Domain):readonly Mapping[]{return mappings.filter(x=>x.platform===platform&&x.family.includes(family)&&(!domain||x.domain===domain));}
export function validateMappings():string[]{const ids=new Set<string>();const errors:string[]=[];for(const m of mappings){if(ids.has(m.id))errors.push(`Duplicate mapping ${m.id}`);ids.add(m.id);}return errors;}
