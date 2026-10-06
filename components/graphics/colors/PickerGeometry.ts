/** Continuous square/disc mapping keeps every SV combination selectable in a circular surface. */
export function squareToDisc(u:number,v:number):[number,number]{return[u*Math.sqrt(Math.max(0,1-v*v/2)),v*Math.sqrt(Math.max(0,1-u*u/2))];}
export function discToSquare(x:number,y:number):[number,number]{const r=Math.hypot(x,y);if(r>1){x/=r;y/=r;}const a=2+x*x-y*y,b=2-x*x+y*y,k=2*Math.SQRT2;return[(Math.sqrt(Math.max(0,a+k*x))-Math.sqrt(Math.max(0,a-k*x)))/2,(Math.sqrt(Math.max(0,b+k*y))-Math.sqrt(Math.max(0,b-k*y)))/2];}
export interface GradientLine{start:{x:number;y:number};end:{x:number;y:number};}
/** CSS angle is clockwise from up. Endpoints are stored as fractions of the preview. */
export function lineAngle(line:GradientLine,width:number,height:number):number{return(Math.atan2((line.end.x-line.start.x)*width,-(line.end.y-line.start.y)*height)*180/Math.PI+360)%360;}
export function projectOnLine(x:number,y:number,line:GradientLine,width:number,height:number):number{const dx=(line.end.x-line.start.x)*width,dy=(line.end.y-line.start.y)*height,d=dx*dx+dy*dy;return d>1e-9?Math.max(0,Math.min(1,((x-line.start.x)*width*dx+(y-line.start.y)*height*dy)/d)):0;}
