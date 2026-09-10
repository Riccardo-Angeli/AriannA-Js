/**
 * @module additionals/Colors
 * @description AriannA colour mathematics for UI pickers, gradients and conversion readouts.
 * Public channel ranges are intentionally UI-friendly: RGB 0..255, H 0..360,
 * percentages 0..100, XYZ 0..100, Lab/Luv/UVW in their conventional CIE scales.
 */

export interface RGB { r:number; g:number; b:number; a?:number; }
export interface HSL { h:number; s:number; l:number; a?:number; }
export interface HSV { h:number; s:number; v:number; a?:number; }
export interface OKHSL { h:number; s:number; l:number; a?:number; }
export interface OKHSV { h:number; s:number; v:number; a?:number; }
export interface CMYK { c:number; m:number; y:number; k:number; a?:number; }
export interface XYZ { X:number; Y:number; Z:number; a?:number; }
export interface CIELAB { L:number; a:number; b:number; alpha?:number; }
export interface CIELUV { L:number; u:number; v:number; a?:number; }
export interface CIEUVW { U:number; V:number; W:number; a?:number; }
export interface OKLAB { L:number; a:number; b:number; alpha?:number; }
export interface OKLCH { L:number; C:number; h:number; a?:number; }
export interface WebColorFormats {
    hex:string; hexa:string; rgb:string; rgba:string; hsl:string; hsla:string;
    cssSrgb:string; webSafe:string;
}
export interface ColorConversions {
    srgba: Required<RGB>;
    rgb: RGB; hsl:HSL; hsv:HSV; okhsl:OKHSL; okhsv:OKHSV; cmyk:CMYK;
    xyz:XYZ; lab:CIELAB; luv:CIELUV; uvw:CIEUVW; oklab:OKLAB; oklch:OKLCH;
    web:WebColorFormats;
}
export type ColorSpace = 'rgb'|'hsl'|'hsv'|'okhsl'|'okhsv'|'cmyk'|'xyz'|'lab'|'luv'|'uvw'|'oklab'|'oklch'|'hex';
export type AnyColor = RGB|HSL|HSV|OKHSL|OKHSV|CMYK|XYZ|CIELAB|CIELUV|CIEUVW|OKLAB|OKLCH|Record<string,number>;

export const clamp=(n:number,lo:number,hi:number):number=>Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
export const clamp01=(n:number):number=>clamp(n,0,1);
export const wrap360=(n:number):number=>((n%360)+360)%360;
const wrap01=(n:number):number=>((n%1)+1)%1;
const EPS=1e-12;
const D65={X:95.047,Y:100,Z:108.883};

export function parseHex(value:string):RGB|null {
    let s=String(value??'').trim().replace(/^#/,'');
    if(s.length===3||s.length===4)s=s.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(s))return null;
    return {r:parseInt(s.slice(0,2),16),g:parseInt(s.slice(2,4),16),b:parseInt(s.slice(4,6),16),a:s.length===8?parseInt(s.slice(6,8),16)/255:1};
}
export function rgbToHex(rgb:RGB,includeAlpha=false):string {
    const q=(n:number)=>clamp(Math.round(n),0,255).toString(16).padStart(2,'0');
    const base=`#${q(rgb.r)}${q(rgb.g)}${q(rgb.b)}`;
    return includeAlpha?`${base}${q((rgb.a??1)*255)}`:base;
}

const srgbToLinear=(v:number):number=>{v=clamp01(v);return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
const linearToSrgb=(v:number):number=>v<=0.0031308?12.92*v:1.055*Math.pow(Math.max(v,0),1/2.4)-0.055;

export function rgbToHsl({r,g,b,a}:RGB):HSL {
    const R=clamp01(r/255),G=clamp01(g/255),B=clamp01(b/255),max=Math.max(R,G,B),min=Math.min(R,G,B),d=max-min,l=(max+min)/2;
    let h=0,s=0;
    if(d>EPS){s=d/(1-Math.abs(2*l-1)); if(max===R)h=60*(((G-B)/d)%6);else if(max===G)h=60*((B-R)/d+2);else h=60*((R-G)/d+4);}
    return {h:wrap360(h),s:s*100,l:l*100,a};
}
export function hslToRgb({h,s,l,a}:HSL):RGB {
    h=wrap360(h);const S=clamp01(s/100),L=clamp01(l/100),C=(1-Math.abs(2*L-1))*S,X=C*(1-Math.abs((h/60)%2-1)),m=L-C/2;let R=0,G=0,B=0;
    if(h<60){R=C;G=X}else if(h<120){R=X;G=C}else if(h<180){G=C;B=X}else if(h<240){G=X;B=C}else if(h<300){R=X;B=C}else{R=C;B=X}
    return {r:clamp((R+m)*255,0,255),g:clamp((G+m)*255,0,255),b:clamp((B+m)*255,0,255),a};
}
export function rgbToHsv({r,g,b,a}:RGB):HSV {
    const R=clamp01(r/255),G=clamp01(g/255),B=clamp01(b/255),max=Math.max(R,G,B),min=Math.min(R,G,B),d=max-min;let h=0;
    if(d>EPS){if(max===R)h=60*(((G-B)/d)%6);else if(max===G)h=60*((B-R)/d+2);else h=60*((R-G)/d+4);}
    return {h:wrap360(h),s:(max<=EPS?0:d/max)*100,v:max*100,a};
}
export function hsvToRgb({h,s,v,a}:HSV):RGB {
    h=wrap360(h);const S=clamp01(s/100),V=clamp01(v/100),C=V*S,X=C*(1-Math.abs((h/60)%2-1)),m=V-C;let R=0,G=0,B=0;
    if(h<60){R=C;G=X}else if(h<120){R=X;G=C}else if(h<180){G=C;B=X}else if(h<240){G=X;B=C}else if(h<300){R=X;B=C}else{R=C;B=X}
    return {r:(R+m)*255,g:(G+m)*255,b:(B+m)*255,a};
}
export function rgbToCmyk({r,g,b,a}:RGB):CMYK {
    const R=clamp01(r/255),G=clamp01(g/255),B=clamp01(b/255),k=1-Math.max(R,G,B); if(k>=1-EPS)return{c:0,m:0,y:0,k:100,a};
    return {c:(1-R-k)/(1-k)*100,m:(1-G-k)/(1-k)*100,y:(1-B-k)/(1-k)*100,k:k*100,a};
}
export function cmykToRgb({c,m,y,k,a}:CMYK):RGB {const C=clamp01(c/100),M=clamp01(m/100),Y=clamp01(y/100),K=clamp01(k/100);return{r:255*(1-C)*(1-K),g:255*(1-M)*(1-K),b:255*(1-Y)*(1-K),a};}

export function rgbToXyz({r,g,b,a}:RGB):XYZ {
    const R=srgbToLinear(r/255),G=srgbToLinear(g/255),B=srgbToLinear(b/255);
    return {X:(R*.4124564+G*.3575761+B*.1804375)*100,Y:(R*.2126729+G*.7151522+B*.072175)*100,Z:(R*.0193339+G*.119192+B*.9503041)*100,a};
}
export function xyzToRgb({X,Y,Z,a}:XYZ):RGB {
    X/=100;Y/=100;Z/=100;const R=X*3.2404542-Y*1.5371385-Z*.4985314,G=-X*.969266+Y*1.8760108+Z*.041556,B=X*.0556434-Y*.2040259+Z*1.0572252;
    return {r:clamp(linearToSrgb(R)*255,0,255),g:clamp(linearToSrgb(G)*255,0,255),b:clamp(linearToSrgb(B)*255,0,255),a};
}
const cieF=(t:number):number=>t>216/24389?Math.cbrt(t):(841/108)*t+4/29;
const cieFinv=(t:number):number=>t>6/29?t*t*t:(108/841)*(t-4/29);
export function xyzToLab({X,Y,Z,a}:XYZ):CIELAB {const fx=cieF(X/D65.X),fy=cieF(Y/D65.Y),fz=cieF(Z/D65.Z);return{L:116*fy-16,a:500*(fx-fy),b:200*(fy-fz),alpha:a};}
export function labToXyz({L,a,b,alpha}:CIELAB):XYZ {const fy=(L+16)/116,fx=fy+a/500,fz=fy-b/200;return{X:D65.X*cieFinv(fx),Y:D65.Y*cieFinv(fy),Z:D65.Z*cieFinv(fz),a:alpha};}
export const rgbToLab=(rgb:RGB):CIELAB=>xyzToLab(rgbToXyz(rgb));
export const labToRgb=(lab:CIELAB):RGB=>xyzToRgb(labToXyz(lab));

const uvPrime=(xyz:XYZ):[number,number]=>{const d=xyz.X+15*xyz.Y+3*xyz.Z;return d>EPS?[4*xyz.X/d,9*xyz.Y/d]:[0,0];};
const [D65_UP,D65_VP]=uvPrime({...D65});
export function xyzToLuv(xyz:XYZ):CIELUV {const [up,vp]=uvPrime(xyz),yr=xyz.Y/D65.Y,L=yr>216/24389?116*Math.cbrt(yr)-16:(24389/27)*yr;return{L,u:13*L*(up-D65_UP),v:13*L*(vp-D65_VP),a:xyz.a};}
export function luvToXyz({L,u,v,a}:CIELUV):XYZ {if(L<=EPS)return{X:0,Y:0,Z:0,a};const up=u/(13*L)+D65_UP,vp=v/(13*L)+D65_VP;const fy=(L+16)/116,Y=D65.Y*cieFinv(fy);if(Math.abs(vp)<EPS)return{X:0,Y,Z:0,a};const X=9*Y*up/(4*vp),Z=Y*(12-3*up-20*vp)/(4*vp);return{X,Y,Z,a};}
export const rgbToLuv=(rgb:RGB):CIELUV=>xyzToLuv(rgbToXyz(rgb));
export const luvToRgb=(luv:CIELUV):RGB=>xyzToRgb(luvToXyz(luv));
/** Backward-compatible aliases; these now correctly represent rectangular CIELUV rather than LCh(uv). */
export const rgbToCieluv=rgbToLuv; export const cieluvToRgb=luvToRgb;

const uv1960=(xyz:XYZ):[number,number]=>{const d=xyz.X+15*xyz.Y+3*xyz.Z;return d>EPS?[4*xyz.X/d,6*xyz.Y/d]:[0,0];};
const [D65_U60,D65_V60]=uv1960({...D65});
export function xyzToUvw(xyz:XYZ):CIEUVW {const [u,v]=uv1960(xyz),W=25*Math.cbrt(Math.max(0,xyz.Y/D65.Y))-17;return{U:13*W*(u-D65_U60),V:13*W*(v-D65_V60),W,a:xyz.a};}
export function uvwToXyz({U,V,W,a}:CIEUVW):XYZ {if(W<=-17+EPS)return{X:0,Y:0,Z:0,a};const yr=Math.pow((W+17)/25,3),Y=D65.Y*yr;if(Math.abs(W)<EPS)return{X:Y*D65.X/D65.Y,Y,Z:Y*D65.Z/D65.Y,a};const u=U/(13*W)+D65_U60,v=V/(13*W)+D65_V60;if(Math.abs(v)<EPS)return{X:0,Y,Z:0,a};const d=6*Y/v,X=u*d/4,Z=(d-X-15*Y)/3;return{X,Y,Z,a};}
export const rgbToUvw=(rgb:RGB):CIEUVW=>xyzToUvw(rgbToXyz(rgb));
export const uvwToRgb=(uvw:CIEUVW):RGB=>xyzToRgb(uvwToXyz(uvw));

interface LinRGB{r:number;g:number;b:number}
function linearSrgbToOklab({r,g,b}:LinRGB):OKLAB {const l=.4122214708*r+.5363325363*g+.0514459929*b,m=.2119034982*r+.6806995451*g+.1073969566*b,s=.0883024619*r+.2817188376*g+.6299787005*b,lr=Math.cbrt(l),mr=Math.cbrt(m),sr=Math.cbrt(s);return{L:.2104542553*lr+.793617785*mr-.0040720468*sr,a:1.9779984951*lr-2.428592205*mr+.4505937099*sr,b:.0259040371*lr+.7827717662*mr-.808675766*sr};}
function oklabToLinearSrgb({L,a,b}:OKLAB):LinRGB {const l_=L+.3963377774*a+.2158037573*b,m_=L-.1055613458*a-.0638541728*b,s_=L-.0894841775*a-1.291485548*b,l=l_**3,m=m_**3,s=s_**3;return{r:4.0767416621*l-3.3077115913*m+.2309699292*s,g:-1.2684380046*l+2.6097574011*m-.3413193965*s,b:-.0041960863*l-.7034186147*m+1.707614701*s};}
export function rgbToOklab({r,g,b,a}:RGB):OKLAB {const lab=linearSrgbToOklab({r:srgbToLinear(r/255),g:srgbToLinear(g/255),b:srgbToLinear(b/255)});return{...lab,alpha:a};}
export function oklabToRgb({L,a,b,alpha}:OKLAB):RGB {const q=oklabToLinearSrgb({L,a,b});return{r:clamp(linearToSrgb(q.r)*255,0,255),g:clamp(linearToSrgb(q.g)*255,0,255),b:clamp(linearToSrgb(q.b)*255,0,255),a:alpha};}
export function rgbToOklch(rgb:RGB):OKLCH {const lab=rgbToOklab(rgb),C=Math.hypot(lab.a,lab.b),h=C<EPS?0:wrap360(Math.atan2(lab.b,lab.a)*180/Math.PI);return{L:lab.L,C,h,a:rgb.a};}
export function oklchToRgb({L,C,h,a}:OKLCH):RGB {const rad=wrap360(h)*Math.PI/180;return oklabToRgb({L,a:C*Math.cos(rad),b:C*Math.sin(rad),alpha:a});}

interface LC{L:number;C:number} interface ST{S:number;T:number}
const toe=(x:number):number=>{const k1=.206,k2=.03,k3=(1+k1)/(1+k2),q=k3*x-k1;return .5*(q+Math.sqrt(q*q+4*k2*k3*x));};
const toeInv=(x:number):number=>{const k1=.206,k2=.03,k3=(1+k1)/(1+k2);return(x*x+k1*x)/(k3*(x+k2));};
function computeMaxSaturation(a:number,b:number):number {let k0:number,k1:number,k2:number,k3:number,k4:number,wl:number,wm:number,ws:number;if(-1.88170328*a-.80936493*b>1){k0=1.19086277;k1=1.76576728;k2=.59662641;k3=.75515197;k4=.56771245;wl=4.0767416621;wm=-3.3077115913;ws=.2309699292;}else if(1.81444104*a-1.19445276*b>1){k0=.73956515;k1=-.45954404;k2=.08285427;k3=.1254107;k4=.14503204;wl=-1.2684380046;wm=2.6097574011;ws=-.3413193965;}else{k0=1.35733652;k1=-.00915799;k2=-1.1513021;k3=-.50559606;k4=.00692167;wl=-.0041960863;wm=-.7034186147;ws=1.707614701;}let S=k0+k1*a+k2*b+k3*a*a+k4*a*b;const kl=.3963377774*a+.2158037573*b,km=-.1055613458*a-.0638541728*b,ks=-.0894841775*a-1.291485548*b,l_=1+S*kl,m_=1+S*km,s_=1+S*ks,l=l_**3,m=m_**3,s=s_**3,ld=3*kl*l_*l_,md=3*km*m_*m_,sd=3*ks*s_*s_,ld2=6*kl*kl*l_,md2=6*km*km*m_,sd2=6*ks*ks*s_,f=wl*l+wm*m+ws*s,f1=wl*ld+wm*md+ws*sd,f2=wl*ld2+wm*md2+ws*sd2;const den=f1*f1-.5*f*f2;if(Math.abs(den)>EPS)S-=f*f1/den;return S;}
function findCusp(a:number,b:number):LC {const S=computeMaxSaturation(a,b),rgb=oklabToLinearSrgb({L:1,a:S*a,b:S*b}),max=Math.max(rgb.r,rgb.g,rgb.b,EPS),L=Math.cbrt(1/max);return{L,C:L*S};}
function toST(c:LC):ST{return{S:c.C/Math.max(c.L,EPS),T:c.C/Math.max(1-c.L,EPS)};}
function findGamutIntersection(a:number,b:number,L1:number,C1:number,L0:number,cusp=findCusp(a,b)):number {let t:number;if((L1-L0)*cusp.C-(cusp.L-L0)*C1<=0)t=cusp.C*L0/(C1*cusp.L+cusp.C*(L0-L1));else{t=cusp.C*(L0-1)/(C1*(cusp.L-1)+cusp.C*(L0-L1));const dL=L1-L0,dC=C1,kl=.3963377774*a+.2158037573*b,km=-.1055613458*a-.0638541728*b,ks=-.0894841775*a-1.291485548*b,ldt=dL+dC*kl,mdt=dL+dC*km,sdt=dL+dC*ks,L=L0*(1-t)+t*L1,C=t*C1,l_=L+C*kl,m_=L+C*km,s_=L+C*ks,l=l_**3,m=m_**3,s=s_**3,ld=3*ldt*l_*l_,md=3*mdt*m_*m_,sd=3*sdt*s_*s_,ld2=6*ldt*ldt*l_,md2=6*mdt*mdt*m_,sd2=6*sdt*sdt*s_;const step=(f:number,f1:number,f2:number)=>{const den=f1*f1-.5*f*f2;if(Math.abs(den)<EPS)return Infinity;const u=f1/den;return u>=0?-f*u:Infinity;};const tr=step(4.0767416621*l-3.3077115913*m+.2309699292*s-1,4.0767416621*ld-3.3077115913*md+.2309699292*sd,4.0767416621*ld2-3.3077115913*md2+.2309699292*sd2),tg=step(-1.2684380046*l+2.6097574011*m-.3413193965*s-1,-1.2684380046*ld+2.6097574011*md-.3413193965*sd,-1.2684380046*ld2+2.6097574011*md2-.3413193965*sd2),tb=step(-.0041960863*l-.7034186147*m+1.707614701*s-1,-.0041960863*ld-.7034186147*md+1.707614701*sd,-.0041960863*ld2-.7034186147*md2+1.707614701*sd2);t+=Math.min(tr,tg,tb);}return t;}
function stMid(a:number,b:number):ST {return{S:.11516993+1/(7.4477897+4.1590124*b+a*(-2.19557347+1.75198401*b+a*(-2.13704948-10.02301043*b+a*(-4.24894561+5.38770819*b+4.69891013*a)))),T:.11239642+1/(1.6132032-.68124379*b+a*(.40370612+.90148123*b+a*(-.27087943+.6122399*b+a*(.00299215-.45399568*b-.14661872*a))))};}
function getCs(L:number,a:number,b:number):{C0:number;Cmid:number;Cmax:number}{const cusp=findCusp(a,b),Cmax=findGamutIntersection(a,b,L,1,L,cusp),mx=toST(cusp),tri=Math.min(L*mx.S,(1-L)*mx.T),k=tri>EPS?Cmax/tri:0,mid=stMid(a,b),Ca=L*mid.S,Cb=(1-L)*mid.T,Cmid=Ca>EPS&&Cb>EPS?.9*k*Math.sqrt(Math.sqrt(1/(1/(Ca**4)+1/(Cb**4)))):0,Ca0=L*.4,Cb0=(1-L)*.8,C0=Ca0>EPS&&Cb0>EPS?Math.sqrt(1/(1/(Ca0*Ca0)+1/(Cb0*Cb0))):0;return{C0,Cmid,Cmax};}

export function okhslToRgb({h,s,l,a}:OKHSL):RGB {const H=wrap360(h)/360,S=clamp01(s/100),lr=clamp01(l/100);if(lr<=EPS)return{r:0,g:0,b:0,a};if(lr>=1-EPS)return{r:255,g:255,b:255,a};const ang=2*Math.PI*H,aa=Math.cos(ang),bb=Math.sin(ang),L=toeInv(lr),{C0,Cmid,Cmax}=getCs(L,aa,bb);let C=0;if(S<.8){const t=1.25*S,k1=.8*C0,k2=Cmid>EPS?1-k1/Cmid:0;C=t*k1/Math.max(1-k2*t,EPS);}else{const t=(S-.8)/.2,k0=Cmid,k1=C0>EPS?.2*Cmid*Cmid*1.25*1.25/C0:0,k2=(Cmax-Cmid)>EPS?1-k1/(Cmax-Cmid):0;C=k0+t*k1/Math.max(1-k2*t,EPS);}const q=oklabToLinearSrgb({L,a:C*aa,b:C*bb});return{r:clamp(linearToSrgb(q.r)*255,0,255),g:clamp(linearToSrgb(q.g)*255,0,255),b:clamp(linearToSrgb(q.b)*255,0,255),a};}
export function rgbToOkhsl({r,g,b,a}:RGB):OKHSL {const lab=linearSrgbToOklab({r:srgbToLinear(r/255),g:srgbToLinear(g/255),b:srgbToLinear(b/255)}),C=Math.hypot(lab.a,lab.b),lr=toe(lab.L);if(C<EPS)return{h:0,s:0,l:lr*100,a};const aa=lab.a/C,bb=lab.b/C,h=wrap01(Math.atan2(bb,aa)/(2*Math.PI)),{C0,Cmid,Cmax}=getCs(lab.L,aa,bb);let S=0;if(C<Cmid){const k1=.8*C0,k2=Cmid>EPS?1-k1/Cmid:0,t=C/Math.max(k1+k2*C,EPS);S=t*.8;}else{const k0=Cmid,k1=C0>EPS?.2*Cmid*Cmid*1.25*1.25/C0:0,k2=(Cmax-Cmid)>EPS?1-k1/(Cmax-Cmid):0,t=(C-k0)/Math.max(k1+k2*(C-k0),EPS);S=.8+.2*t;}return{h:h*360,s:clamp01(S)*100,l:clamp01(lr)*100,a};}

export function okhsvToRgb({h,s,v,a}:OKHSV):RGB {const H=wrap360(h)/360,S=clamp01(s/100),V=clamp01(v/100);if(V<=EPS)return{r:0,g:0,b:0,a};const ang=2*Math.PI*H,aa=Math.cos(ang),bb=Math.sin(ang),mx=toST(findCusp(aa,bb)),S0=.5,k=1-S0/mx.S,den=S0+mx.T-mx.T*k*S,Lv=1-S*S0/den,Cv=S*mx.T*S0/den;let L=V*Lv,C=V*Cv,Lvt=toeInv(Lv),Cvt=Lv>EPS?Cv*Lvt/Lv:0,Lnew=toeInv(L);if(L>EPS)C=C*Lnew/L;L=Lnew;const scaleRgb=oklabToLinearSrgb({L:Lvt,a:aa*Cvt,b:bb*Cvt}),max=Math.max(scaleRgb.r,scaleRgb.g,scaleRgb.b,0,EPS),scale=Math.cbrt(1/max);L*=scale;C*=scale;const q=oklabToLinearSrgb({L,a:C*aa,b:C*bb});return{r:clamp(linearToSrgb(q.r)*255,0,255),g:clamp(linearToSrgb(q.g)*255,0,255),b:clamp(linearToSrgb(q.b)*255,0,255),a};}
export function rgbToOkhsv({r,g,b,a}:RGB):OKHSV {const lab=linearSrgbToOklab({r:srgbToLinear(r/255),g:srgbToLinear(g/255),b:srgbToLinear(b/255)}),C0=Math.hypot(lab.a,lab.b);if(C0<EPS)return{h:0,s:0,v:clamp01(toe(lab.L))*100,a};const aa=lab.a/C0,bb=lab.b/C0,h=wrap01(Math.atan2(bb,aa)/(2*Math.PI)),mx=toST(findCusp(aa,bb)),S0=.5,k=1-S0/mx.S;let L=lab.L,C=C0;const t=mx.T/(C+L*mx.T),Lv=t*L,Cv=t*C,Lvt=toeInv(Lv),Cvt=Lv>EPS?Cv*Lvt/Lv:0,scaleRgb=oklabToLinearSrgb({L:Lvt,a:aa*Cvt,b:bb*Cvt}),max=Math.max(scaleRgb.r,scaleRgb.g,scaleRgb.b,0,EPS),scale=Math.cbrt(1/max);L/=scale;C/=scale;const Lt=toe(L);if(L>EPS)C=C*Lt/L;L=Lt;const V=Lv>EPS?L/Lv:0,S=(S0+mx.T)*Cv/Math.max(mx.T*S0+mx.T*k*Cv,EPS);return{h:h*360,s:clamp01(S)*100,v:clamp01(V)*100,a};}

function nearestWebSafe(n:number):number {return clamp(Math.round(n/51)*51,0,255);}
export function webFormats(rgb:RGB):WebColorFormats {const a=clamp01(rgb.a??1),h=rgbToHsl(rgb),R=Math.round(clamp(rgb.r,0,255)),G=Math.round(clamp(rgb.g,0,255)),B=Math.round(clamp(rgb.b,0,255));return{hex:rgbToHex(rgb),hexa:rgbToHex({...rgb,a},true),rgb:`rgb(${R} ${G} ${B})`,rgba:`rgba(${R}, ${G}, ${B}, ${a.toFixed(3)})`,hsl:`hsl(${h.h.toFixed(1)} ${h.s.toFixed(1)}% ${h.l.toFixed(1)}%)`,hsla:`hsla(${h.h.toFixed(1)}, ${h.s.toFixed(1)}%, ${h.l.toFixed(1)}%, ${a.toFixed(3)})`,cssSrgb:`color(srgb ${(R/255).toFixed(4)} ${(G/255).toFixed(4)} ${(B/255).toFixed(4)} / ${a.toFixed(3)})`,webSafe:rgbToHex({r:nearestWebSafe(R),g:nearestWebSafe(G),b:nearestWebSafe(B)})};}
export function convertAll(rgb:RGB):ColorConversions {const a=clamp01(rgb.a??1),base={r:clamp(rgb.r,0,255),g:clamp(rgb.g,0,255),b:clamp(rgb.b,0,255),a};return{srgba:{...base,a},rgb:base,hsl:rgbToHsl(base),hsv:rgbToHsv(base),okhsl:rgbToOkhsl(base),okhsv:rgbToOkhsv(base),cmyk:rgbToCmyk(base),xyz:rgbToXyz(base),lab:rgbToLab(base),luv:rgbToLuv(base),uvw:rgbToUvw(base),oklab:rgbToOklab(base),oklch:rgbToOklch(base),web:webFormats(base)};}

export function toRgb(space:ColorSpace,color:any):RGB {switch(space){case'rgb':return color as RGB;case'hsl':return hslToRgb(color);case'hsv':return hsvToRgb(color);case'okhsl':return okhslToRgb(color);case'okhsv':return okhsvToRgb(color);case'cmyk':return cmykToRgb(color);case'xyz':return xyzToRgb(color);case'lab':return labToRgb(color);case'luv':return luvToRgb(color);case'uvw':return uvwToRgb(color);case'oklab':return oklabToRgb(color);case'oklch':return oklchToRgb(color);case'hex':return parseHex(String(color))??{r:0,g:0,b:0,a:1};}}
export function fromRgb(space:ColorSpace,rgb:RGB):any {switch(space){case'rgb':return{...rgb};case'hsl':return rgbToHsl(rgb);case'hsv':return rgbToHsv(rgb);case'okhsl':return rgbToOkhsl(rgb);case'okhsv':return rgbToOkhsv(rgb);case'cmyk':return rgbToCmyk(rgb);case'xyz':return rgbToXyz(rgb);case'lab':return rgbToLab(rgb);case'luv':return rgbToLuv(rgb);case'uvw':return rgbToUvw(rgb);case'oklab':return rgbToOklab(rgb);case'oklch':return rgbToOklch(rgb);case'hex':return rgbToHex(rgb);}}
export function formatCss(space:ColorSpace,color:any):string {const rgb=space==='rgb'?color as RGB:toRgb(space,color);if(space==='hsl'){const c=color as HSL;return`hsl(${c.h.toFixed(1)} ${c.s.toFixed(1)}% ${c.l.toFixed(1)}% / ${(c.a??1).toFixed(3)})`;}if(space==='oklab'){const c=color as OKLAB;return`oklab(${(c.L*100).toFixed(2)}% ${c.a.toFixed(4)} ${c.b.toFixed(4)} / ${(c.alpha??1).toFixed(3)})`;}if(space==='oklch'){const c=color as OKLCH;return`oklch(${(c.L*100).toFixed(2)}% ${c.C.toFixed(4)} ${c.h.toFixed(2)} / ${(c.a??1).toFixed(3)})`;}return webFormats(rgb).rgba;}
export function rgbToCube({r,g,b}:RGB):number{return(clamp(Math.round(r),0,255)<<16)|(clamp(Math.round(g),0,255)<<8)|clamp(Math.round(b),0,255);}
export function cubeToRgb(i:number):RGB{return{r:(i>>16)&255,g:(i>>8)&255,b:i&255,a:1};}

export const Colors={parseHex,rgbToHex,rgbToHsl,hslToRgb,rgbToHsv,hsvToRgb,rgbToOkhsl,okhslToRgb,rgbToOkhsv,okhsvToRgb,rgbToCmyk,cmykToRgb,rgbToXyz,xyzToRgb,rgbToLab,labToRgb,rgbToLuv,luvToRgb,rgbToCieluv,cieluvToRgb,rgbToUvw,uvwToRgb,rgbToOklab,oklabToRgb,rgbToOklch,oklchToRgb,webFormats,convertAll,toRgb,fromRgb,formatCss,rgbToCube,cubeToRgb,clamp,clamp01,wrap360};
if(typeof window!=='undefined'&&!Object.prototype.hasOwnProperty.call(window,'Colors')){try{Object.defineProperty(window,'Colors',{value:Colors,writable:false,enumerable:false,configurable:false});}catch{}}
export default Colors;
