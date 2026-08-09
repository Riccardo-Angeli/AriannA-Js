import ts from 'typescript';
export interface TemplateSite { start:number; end:number; text:string; kind:'instance'|'static'|'other'; promotable:boolean; }
export function Analyze(source:string, fileName='component.ts'):TemplateSite[]{
 const sf=ts.createSourceFile(fileName,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS); const sites:TemplateSite[]=[];
 function visit(n:ts.Node){
  if(ts.isTaggedTemplateExpression(n)&&n.tag.getText(sf)==='html'){
   const noSub=ts.isNoSubstitutionTemplateLiteral(n.template); let kind:'instance'|'static'|'other'='other';
   const p=n.parent;
   if(ts.isBinaryExpression(p)&&p.operatorToken.kind===ts.SyntaxKind.EqualsToken&&p.left.getText(sf)==='this.template') kind='instance';
   else if(ts.isPropertyDeclaration(p)&&p.modifiers?.some(m=>m.kind===ts.SyntaxKind.StaticKeyword)) kind='static';
   sites.push({start:n.getStart(sf),end:n.end,text:noSub?(n.template as ts.NoSubstitutionTemplateLiteral).text:'',kind,promotable:noSub});
  }
  ts.forEachChild(n,visit);
 }
 visit(sf); return sites;
}
