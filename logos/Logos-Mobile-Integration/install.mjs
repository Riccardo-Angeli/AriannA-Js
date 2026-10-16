#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,cpSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const home=dirname(fileURLToPath(import.meta.url));
const root=resolve(home,'../..');
const operation=process.argv[2] || 'check';
const protectedFiles=JSON.parse(readFileSync(join(home,'protected-sha256.json'),'utf8'));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function ensureRoot(){if(!existsSync(join(root,'package.json'))||!existsSync(join(root,'core/Logos.ts')))throw Error(`Directory inattesa: ${root}. Metti questa folder in arianna-js/logos/Logos-Mobile-Integration`);}
function guard(){let fail=0;for(const [relative,expected] of Object.entries(protectedFiles)){let path=join(root,relative);if(!existsSync(path)){console.error('MISSING',relative);fail++;continue;}let actual=sha(path);if(actual===expected)console.log('OK ',relative);else {console.error('CHANGED',relative,'(differisce dalla baseline dello ZIP); non procedo automaticamente');fail++;}}return fail===0;}
function installed(){return existsSync(join(root,'logos/mobile/index.ts'));}
function check(){console.log(`AriannA root: ${root}`);console.log(`Integration: ${home}`);console.log('Logos Mobile installato:',installed()?'SI':'NO');return guard();}
ensureRoot();
if(operation==='check'){process.exit(check()?0:1)}
if(operation==='install'){
 if(!check())throw Error('Baseline diversa: verifica manualmente i file protetti prima di installare.');
 const dest=join(root,'logos/mobile');if(existsSync(dest))throw Error('logos/mobile esiste già: per sicurezza non sovrascrivo nulla.');
 const pkgPath=join(root,'package.json');const pkg=JSON.parse(readFileSync(pkgPath,'utf8'));
 const subpath='./logos/mobile';const proposed={import:'./logos/mobile/index.ts'};
 if(pkg.exports?.[subpath] && JSON.stringify(pkg.exports[subpath])!==JSON.stringify(proposed))throw Error('Export ./logos/mobile già presente con valore diverso');
 const scripts={'logos:mobile:check':'node logos/Logos-Mobile-Integration/install.mjs verify','logos:mobile:audit':'node logos/Logos-Mobile-Integration/install.mjs audit'};
 for(const [key,value] of Object.entries(scripts))if(pkg.scripts?.[key] && pkg.scripts[key]!==value)throw Error(`Script ${key} già presente con valore diverso`);
 const backup=join(home,'package.json.before-logos-mobile.backup');if(existsSync(backup))throw Error('Backup package.json già presente; installazione interrotta.');
 mkdirSync(dirname(dest),{recursive:true});cpSync(join(home,'overlay/logos/mobile'),dest,{recursive:true,errorOnExist:true,force:false});
 pkg.exports??={};pkg.exports[subpath]=proposed;pkg.scripts??={};Object.assign(pkg.scripts,scripts);
 if(!pkg.files?.includes('logos/mobile/'))pkg.files=[...(pkg.files||[]),'logos/mobile/'];
 copyFileSync(pkgPath,backup);writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n');
 console.log('INSTALL OK. Backup:',backup);console.log('Ora: npm run logos:mobile:check && npm run logos:mobile:audit');
 process.exit(0);
}
if(operation==='verify'){
 if(!check()||!installed())process.exit(1);
 const {spawnSync}=await import('node:child_process');
 const result=spawnSync('npx',['--no-install','tsc','-p','logos/mobile/tsconfig.json'],{cwd:root,stdio:'inherit',shell:false});process.exit(result.status??1);
}
if(operation==='audit'){
 if(!installed())throw Error('Non installato. Prima: node logos/Logos-Mobile-Integration/install.mjs install');
 const mirrors=readFileSync(join(root,'logos/mobile/mirrors.ts'),'utf8');const registries=readFileSync(join(root,'logos/mobile/registries.ts'),'utf8');
 console.log('Seed audit (non copertura completa SDK):',JSON.stringify({swiftUI:mirrors.includes("platform:'swiftui'"),compose:mirrors.includes("platform:'compose'"),watch:mirrors.includes("family:['watch']"),tv:mirrors.includes("family:['tv'"),registry:registries.includes('export const mappings')},null,2));
 process.exit(0);
}
throw Error(`Comando sconosciuto: ${operation}. Usa check, install, verify, audit`);
