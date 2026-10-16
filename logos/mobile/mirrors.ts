import type {NativeSymbol,Platform,DeviceFamily,Domain} from './types.js';
/** Explicit seed inventory; not a complete Apple/Android SDK catalog. */
export const nativeMirrors: readonly NativeSymbol[] = [
 {platform:'swiftui',name:'Text',domain:'component',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'Button',domain:'component',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'VStack',domain:'component',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'HStack',domain:'component',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'NavigationStack',domain:'navigation',minVersion:'iOS 16 / watchOS 9 / tvOS 16',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'@State',domain:'reactivity',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'.onAppear',domain:'lifecycle',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'.onTapGesture',domain:'event',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'.padding',domain:'style',family:['mobile','watch','tv']},
 {platform:'swiftui',name:'DigitalCrown',domain:'capability',family:['watch']},
 {platform:'swiftui',name:'FocusState',domain:'capability',family:['tv','mobile']},
 {platform:'compose',name:'Text',domain:'component',family:['mobile','watch','tv']},
 {platform:'compose',name:'Button',domain:'component',family:['mobile','watch','tv']},
 {platform:'compose',name:'Column',domain:'component',family:['mobile','watch','tv']},
 {platform:'compose',name:'Row',domain:'component',family:['mobile','watch','tv']},
 {platform:'compose',name:'NavHost',domain:'navigation',family:['mobile','watch','tv']},
 {platform:'compose',name:'mutableStateOf',domain:'reactivity',family:['mobile','watch','tv']},
 {platform:'compose',name:'DisposableEffect',domain:'lifecycle',family:['mobile','watch','tv']},
 {platform:'compose',name:'onClick',domain:'event',family:['mobile','watch','tv']},
 {platform:'compose',name:'Modifier.padding',domain:'style',family:['mobile','watch','tv']},
 {platform:'compose',name:'RotaryInput',domain:'capability',family:['watch']},
 {platform:'compose',name:'FocusRequester',domain:'capability',family:['tv','mobile']}
];
export function queryMirror(platform:Platform,family:DeviceFamily,domain?:Domain):readonly NativeSymbol[] {return nativeMirrors.filter(s=>s.platform===platform&&s.family.includes(family)&&(!domain||s.domain===domain));}
