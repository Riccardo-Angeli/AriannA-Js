/**
 * @module components/composite/Chat
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description WhatsApp / Signal-style AriannA chat with fuchsia AriannA accent.
 */
import { Component, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;

export namespace Chat
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type MessageStatus = 'sent' | 'delivered' | 'read';
    }

    export namespace Interfaces
    {
        export interface ChatUser { id:string; name:string; avatar?:string; online?:boolean; }
        export interface ChatMessage
        {
            id:string; author:string; text?:string; image?:string;
            file?:{name:string;url:string;size?:number}; ts:number;
            status?:Types.MessageStatus; replyTo?:string; reactions?:Record<string,number>; system?:boolean;
        }
        export interface ChatConversation
        {
            id:string; peer:ChatUser; title?:string; unread?:number; messages?:ChatMessage[]; typing?:boolean;
        }
        export interface ChatOptions { me?:ChatUser; conversations?:ChatConversation[]; theme?:Types.Theme; }
    }

    const esc = (v:unknown) => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
    const initials = (name:string) => name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase() ?? '').join('') || 'A';
    const time = (ts:number) => new Date(ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.Chat', { Background:'#202428', Border:'1px solid #121517', BorderRadius:'8px', BoxSizing:'border-box', Color:'#e5e8ea', Display:'block', FontFamily:'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', Height:'560px', MaxWidth:'100%', MinWidth:'0', Overflow:'hidden', Width:'100%' }),
        new Css.Rule('.Chat-Shell', { Display:'grid', GridTemplateColumns:'290px 1fr', Height:'100%', MinHeight:'0' }),
        new Css.Rule('.Chat-Sidebar', { Background:'#25292d', BorderRight:'1px solid #111417', Display:'grid', GridTemplateRows:'56px 48px 1fr', MinHeight:'0' }),
        new Css.Rule('.Chat-SidebarHeader', { AlignItems:'center', Background:'linear-gradient(180deg,#363b40,#25292d)', BorderBottom:'1px solid #121517', Display:'flex', Gap:'9px', Padding:'8px 11px' }),
        new Css.Rule('.Chat-MeAvatar,.Chat-Avatar', { AlignItems:'center', Background:'linear-gradient(135deg,#e40c88,#ff68b5)', Border:'1px solid rgba(255,255,255,.18)', BorderRadius:'50%', BoxShadow:'inset 0 1px 0 rgba(255,255,255,.22)', Color:'#fff', Display:'inline-flex', Flex:'0 0 auto', FontSize:'11px', FontWeight:'800', Height:'34px', JustifyContent:'center', Overflow:'hidden', Width:'34px' }),
        new Css.Rule('.Chat-MeAvatar img,.Chat-Avatar img', { Height:'100%', ObjectFit:'cover', Width:'100%' }),
        new Css.Rule('.Chat-SidebarTitle', { FontSize:'12px', FontWeight:'750' }),
        new Css.Rule('.Chat-SidebarMeta', { Color:'#8f979f', FontSize:'9px', MarginTop:'2px' }),
        new Css.Rule('.Chat-SidebarActions', { Display:'flex', Gap:'3px', MarginLeft:'auto' }),
        new Css.Rule('.Chat-IconButton', { AlignItems:'center', Appearance:'none', Background:'linear-gradient(180deg,#444a50,#30353a)', Border:'1px solid #15181a', BorderRadius:'50%', Color:'#d7dce0', Cursor:'pointer', Display:'inline-flex', Font:'600 12px/1 var(--arianna-font,system-ui,sans-serif)', Height:'28px', JustifyContent:'center', Padding:'0', Width:'28px' }),
        new Css.Rule('.Chat-IconButton:hover', { Background:'linear-gradient(180deg,#50575d,#373c41)' }),
        new Css.Rule('.Chat-SearchWrap', { AlignItems:'center', Display:'flex', Padding:'7px 9px' }),
        new Css.Rule('.Chat-Search', { Appearance:'none', Background:'#181c20', Border:'1px solid #353b40', BorderRadius:'7px', BoxSizing:'border-box', Color:'#e2e6e9', Font:'11px/1.3 var(--arianna-font,system-ui,sans-serif)', Outline:'none', Padding:'8px 10px', Width:'100%' }),
        new Css.Rule('.Chat-Search:focus', { BorderColor:'#e40c88', BoxShadow:'0 0 0 2px rgba(228,12,136,.16)' }),
        new Css.Rule('.Chat-Conversations', { MinHeight:'0', OverflowY:'auto', Padding:'3px 5px 7px' }),
        new Css.Rule('.Chat-Conversation', { AlignItems:'center', Background:'transparent', Border:'0', BorderRadius:'6px', Color:'inherit', Cursor:'pointer', Display:'grid', Gap:'8px', GridTemplateColumns:'40px 1fr auto', Padding:'8px 7px', TextAlign:'left', Width:'100%' }),
        new Css.Rule('.Chat-Conversation:hover', { Background:'#2c3136' }),
        new Css.Rule('.Chat-Conversation[data-active="true"]', { Background:'linear-gradient(90deg,rgba(228,12,136,.20),rgba(228,12,136,.06))', BoxShadow:'inset 3px 0 0 #e40c88' }),
        new Css.Rule('.Chat-ConvName', { FontSize:'11px', FontWeight:'730', Overflow:'hidden', TextOverflow:'ellipsis', WhiteSpace:'nowrap' }),
        new Css.Rule('.Chat-ConvPreview', { Color:'#929aa2', FontSize:'9px', MarginTop:'3px', Overflow:'hidden', TextOverflow:'ellipsis', WhiteSpace:'nowrap' }),
        new Css.Rule('.Chat-ConvTime', { Color:'#7f878e', FontSize:'8px' }),
        new Css.Rule('.Chat-Unread', { AlignItems:'center', Background:'#e40c88', BorderRadius:'999px', Color:'#fff', Display:'flex', FontSize:'8px', FontWeight:'800', Height:'17px', JustifyContent:'center', MarginLeft:'auto', MarginTop:'5px', MinWidth:'17px', Padding:'0 4px' }),
        new Css.Rule('.Chat-Main', { Background:'#1d2125', Display:'grid', GridTemplateRows:'58px 1fr auto 54px', MinHeight:'0', Position:'relative' }),
        new Css.Rule('.Chat-Main::before', { BackgroundImage:'radial-gradient(circle at 20% 25%,rgba(255,255,255,.028) 0 1px,transparent 1px),radial-gradient(circle at 70% 70%,rgba(255,255,255,.022) 0 1px,transparent 1px)', BackgroundSize:'36px 36px,48px 48px', Content:'""', Inset:'58px 0 54px', PointerEvents:'none', Position:'absolute' }),
        new Css.Rule('.Chat-Header', { AlignItems:'center', Background:'linear-gradient(180deg,#363b40,#25292d)', BorderBottom:'1px solid #121517', Display:'flex', Gap:'10px', Padding:'8px 12px', ZIndex:'1' }),
        new Css.Rule('.Chat-HeaderName', { FontSize:'12px', FontWeight:'760' }),
        new Css.Rule('.Chat-HeaderStatus', { Color:'#8e969e', FontSize:'9px', MarginTop:'2px' }),
        new Css.Rule('.Chat-HeaderActions', { Display:'flex', Gap:'4px', MarginLeft:'auto' }),
        new Css.Rule('.Chat-Thread', { Display:'flex', FlexDirection:'column', Gap:'5px', MinHeight:'0', OverflowY:'auto', Padding:'15px 22px 12px', ZIndex:'1' }),
        new Css.Rule('.Chat-Day', { AlignSelf:'center', Background:'rgba(13,15,17,.72)', Border:'1px solid #353a3f', BorderRadius:'999px', Color:'#9199a1', FontSize:'8px', Margin:'4px 0 8px', Padding:'4px 8px' }),
        new Css.Rule('.Chat-Message', { AlignSelf:'flex-start', Background:'#2b3035', Border:'1px solid #383e43', BorderRadius:'3px 11px 11px 11px', BoxShadow:'0 1px 2px rgba(0,0,0,.20)', MaxWidth:'min(72%,520px)', Padding:'7px 9px 5px', Position:'relative' }),
        new Css.Rule('.Chat-Message[data-own="true"]', { AlignSelf:'flex-end', Background:'linear-gradient(145deg,#bd0b74,#e40c88)', BorderColor:'#f03b9f', BorderRadius:'11px 3px 11px 11px', Color:'#fff' }),
        new Css.Rule('.Chat-MessageText', { FontSize:'11px', LineHeight:'1.38', OverflowWrap:'anywhere', WhiteSpace:'pre-wrap' }),
        new Css.Rule('.Chat-MessageMeta', { AlignItems:'center', Color:'#9aa2aa', Display:'flex', FontSize:'7.5px', Gap:'4px', JustifyContent:'flex-end', MarginTop:'3px' }),
        new Css.Rule('.Chat-Message[data-own="true"] .Chat-MessageMeta', { Color:'rgba(255,255,255,.74)' }),
        new Css.Rule('.Chat-Checks', { Color:'#83d8ff', FontWeight:'800', LetterSpacing:'-2px' }),
        new Css.Rule('.Chat-Typing', { Color:'#e40c88', FontSize:'9px', Padding:'0 22px 8px', ZIndex:'1' }),
        new Css.Rule('.Chat-Composer', { AlignItems:'center', Background:'linear-gradient(180deg,#30353a,#24282c)', BorderTop:'1px solid #121517', Display:'grid', Gap:'7px', GridTemplateColumns:'30px 1fr 34px', Padding:'8px 10px', ZIndex:'1' }),
        new Css.Rule('.Chat-Input', { Appearance:'none', Background:'#181c20', Border:'1px solid #3a4046', BorderRadius:'18px', BoxSizing:'border-box', Color:'#e7eaed', Font:'11px/1.3 var(--arianna-font,system-ui,sans-serif)', Outline:'none', Padding:'9px 13px', Width:'100%' }),
        new Css.Rule('.Chat-Input:focus', { BorderColor:'#e40c88', BoxShadow:'0 0 0 2px rgba(228,12,136,.15)' }),
        new Css.Rule('.Chat-Send', { AlignItems:'center', Appearance:'none', Background:'linear-gradient(180deg,#f02a98,#c50975)', Border:'1px solid #9e075d', BorderRadius:'50%', BoxShadow:'inset 0 1px 0 rgba(255,255,255,.22)', Color:'#fff', Cursor:'pointer', Display:'flex', FontSize:'13px', Height:'34px', JustifyContent:'center', Padding:'0', Width:'34px' }),
        new Css.Rule('.Chat[theme="light"]', { Background:'#eef0f2', BorderColor:'#b9bec3', Color:'#25292d' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Sidebar', { Background:'#eef0f2', BorderRightColor:'#b9bec3' }),
        new Css.Rule('.Chat[theme="light"] .Chat-SidebarHeader,.Chat[theme="light"] .Chat-Header', { Background:'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderColor:'#b9bec3' }),
        new Css.Rule('.Chat[theme="light"] .Chat-IconButton', { Background:'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor:'#b9bec3', Color:'#383e43' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Search,.Chat[theme="light"] .Chat-Input', { Background:'#fff', BorderColor:'#c1c6cb', Color:'#30363b' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Conversation:hover', { Background:'#e2e5e8' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Conversation[data-active="true"]', { Background:'linear-gradient(90deg,rgba(228,12,136,.13),rgba(228,12,136,.035))' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Main', { Background:'#fafafa' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Main::before', { BackgroundImage:'radial-gradient(circle at 20% 25%,rgba(38,44,49,.04) 0 1px,transparent 1px),radial-gradient(circle at 70% 70%,rgba(38,44,49,.03) 0 1px,transparent 1px)' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Message', { Background:'#fff', BorderColor:'#d6dadd', Color:'#30353a' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Message[data-own="true"]', { Background:'linear-gradient(145deg,#d10a7e,#e40c88)', BorderColor:'#bf0a72', Color:'#fff' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Day', { Background:'rgba(238,240,242,.92)', BorderColor:'#c7ccd0', Color:'#656c73' }),
        new Css.Rule('.Chat[theme="light"] .Chat-Composer', { Background:'linear-gradient(180deg,#f4f6f7,#dde1e4)', BorderTopColor:'#b9bec3' })
    ]);

    const demoMe:Interfaces.ChatUser={id:'me',name:'AriannA',online:true};
    const demoConversations:Interfaces.ChatConversation[]=[
        {id:'design',peer:{id:'livia',name:'Livia',online:true},unread:2,messages:[
            {id:'m1',author:'livia',text:'The new graphics palette looks much cleaner.',ts:Date.now()-3600000,status:'read'},
            {id:'m2',author:'me',text:'Perfect. I am keeping the AriannA fuchsia accent and the DAW tonal system.',ts:Date.now()-3500000,status:'read'},
            {id:'m3',author:'livia',text:'Great — send me the Workflow pass too.',ts:Date.now()-3200000,status:'delivered'}
        ]},
        {id:'team',peer:{id:'team',name:'AriannA Team',online:true},messages:[{id:'t1',author:'team',text:'Build is green.',ts:Date.now()-8600000,status:'read'}]},
        {id:'audio',peer:{id:'audio',name:'Audio Lab'},messages:[{id:'a1',author:'audio',text:'Channel strips approved.',ts:Date.now()-86400000,status:'read'}]}
    ];

    @Component('arianna-chat', Styles, { Shadow:false, Attributes:['theme','active'], Properties:['me','conversations'] })
    export class Chat extends HTMLDivElement
    {
        public static readonly Styles=Styles;
        public template=html``;
        private _me:Interfaces.ChatUser=demoMe;
        private _conversations:Interfaces.ChatConversation[]=structuredClone(demoConversations);
        private _active='design';
        private _search='';

        private EnsureState():void
        {
            if(!this._me || typeof this._me !== 'object') this._me=demoMe;
            if(!Array.isArray(this._conversations)) this._conversations=structuredClone(demoConversations);
            if(typeof this._active !== 'string') this._active='';
            if(typeof this._search !== 'string') this._search='';
        }

        constructor(options:Interfaces.ChatOptions={})
        {
            super(); if(options.theme) this.setAttribute('theme',options.theme);
            if(options.me) this._me=options.me; if(options.conversations) this._conversations=options.conversations;
        }
        public onCreated():void { requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();}); }
        public onConnected():void { this.EnsureState(); this.classList.add('Chat'); if(!this.hasAttribute('theme'))this.setAttribute('theme','dark'); this._active=this.getAttribute('active')||this._conversations[0]?.id||''; this.Render(); }
        public onAttributeChanged(name:string):void { this.EnsureState(); if(name==='active')this._active=this.getAttribute('active')||''; if(this.isConnected)this.Render(); }
        public get me():Interfaces.ChatUser{this.EnsureState();return this._me;} public set me(v:Interfaces.ChatUser){this.EnsureState();this._me=v||demoMe; if(this.isConnected)this.Render();}
        public get conversations():Interfaces.ChatConversation[]{this.EnsureState();return this._conversations;} public set conversations(v:Interfaces.ChatConversation[]){this.EnsureState();this._conversations=Array.isArray(v)?v:[]; if(this.isConnected)this.Render();}
        public setMe(u:Interfaces.ChatUser):this{this.me=u;return this;}
        public addConversation(c:Interfaces.ChatConversation):this{this.EnsureState();if(!c||!c.id||!c.peer)return this;this._conversations=[...this._conversations,c]; if(!this._active)this._active=c.id; if(this.isConnected)this.Render();return this;}
        public selectConversation(id:string):this{this.EnsureState();if(this._conversations.some(c=>c.id===id)){this._active=id;this.setAttribute('active',id);if(this.isConnected)this.Render();}return this;}
        public addMessage(conversationId:string,msg:Interfaces.ChatMessage):this{this.EnsureState();const c=this._conversations.find(x=>x.id===conversationId); if(c){c.messages??=[];c.messages.push(msg);if(this.isConnected)this.Render();}return this;}
        public setMessageStatus(conversationId:string,messageId:string,status:Types.MessageStatus):this{this.EnsureState();const m=this._conversations.find(c=>c.id===conversationId)?.messages?.find(x=>x.id===messageId);if(m){m.status=status;if(this.isConnected)this.Render();}return this;}
        public setPeerTyping(conversationId:string,typing:boolean):this{this.EnsureState();const c=this._conversations.find(x=>x.id===conversationId);if(c){c.typing=typing;if(this.isConnected)this.Render();}return this;}

        private Avatar(user:Interfaces.ChatUser|undefined,cls='Chat-Avatar'):HTMLElement
        {
            const safe=user??demoMe;
            const a=document.createElement('span');a.className=cls;
            if(safe.avatar){const img=document.createElement('img');img.src=safe.avatar;img.alt='';a.append(img);} else a.textContent=initials(safe.name);return a;
        }

        private Render():void
        {
            this.EnsureState();
            const shell=document.createElement('section');shell.className='Chat-Shell';
            const side=document.createElement('aside');side.className='Chat-Sidebar';
            const sh=document.createElement('header');sh.className='Chat-SidebarHeader';sh.append(this.Avatar(this._me,'Chat-MeAvatar'));
            const st=document.createElement('div');st.innerHTML=`<div class="Chat-SidebarTitle">${esc(this._me.name)}</div><div class="Chat-SidebarMeta">${this._me.online?'online':'offline'}</div>`;sh.append(st);
            const actions=document.createElement('div');actions.className='Chat-SidebarActions';actions.innerHTML='<button class="Chat-IconButton" type="button" title="New chat">＋</button><button class="Chat-IconButton" type="button" title="Menu">⋮</button>';sh.append(actions);
            const sw=document.createElement('div');sw.className='Chat-SearchWrap';const search=document.createElement('input');search.className='Chat-Search';search.placeholder='Search or start new chat';search.value=this._search;search.addEventListener('input',()=>{this._search=search.value;this.Render();});sw.append(search);
            const list=document.createElement('div');list.className='Chat-Conversations';
            for(const c of this._conversations.filter(c=>(c.title||c.peer.name).toLowerCase().includes(this._search.toLowerCase())))
            {
                const b=document.createElement('button');b.type='button';b.className='Chat-Conversation';b.dataset.active=String(c.id===this._active);b.append(this.Avatar(c.peer));
                const center=document.createElement('div');const last=c.messages?.at(-1);center.innerHTML=`<div class="Chat-ConvName">${esc(c.title||c.peer.name)}</div><div class="Chat-ConvPreview">${esc(c.typing?'typing…':last?.text||'No messages yet')}</div>`;b.append(center);
                const meta=document.createElement('div');meta.innerHTML=`<div class="Chat-ConvTime">${last?time(last.ts):''}</div>${c.unread?`<div class="Chat-Unread">${c.unread}</div>`:''}`;b.append(meta);b.addEventListener('click',()=>this.selectConversation(c.id));list.append(b);
            }
            side.append(sh,sw,list);
            const main=document.createElement('main');main.className='Chat-Main';const conv=this._conversations.find(c=>c.id===this._active)??this._conversations[0];
            const hh=document.createElement('header');hh.className='Chat-Header'; if(conv){hh.append(this.Avatar(conv.peer));const info=document.createElement('div');info.innerHTML=`<div class="Chat-HeaderName">${esc(conv.title||conv.peer.name)}</div><div class="Chat-HeaderStatus">${conv.typing?'typing…':conv.peer.online?'online':'last seen recently'}</div>`;hh.append(info);} const ha=document.createElement('div');ha.className='Chat-HeaderActions';ha.innerHTML='<button class="Chat-IconButton" type="button">⌕</button><button class="Chat-IconButton" type="button">⋮</button>';hh.append(ha);
            const thread=document.createElement('div');thread.className='Chat-Thread';const day=document.createElement('div');day.className='Chat-Day';day.textContent='TODAY';thread.append(day);
            for(const m of conv?.messages??[]){if(m.system){const sys=document.createElement('div');sys.className='Chat-Day';sys.textContent=m.text||'';thread.append(sys);continue;}const own=m.author===this._me.id;const box=document.createElement('div');box.className='Chat-Message';box.dataset.own=String(own);const txt=document.createElement('div');txt.className='Chat-MessageText';txt.textContent=m.text||'';const meta=document.createElement('div');meta.className='Chat-MessageMeta';meta.innerHTML=`<span>${time(m.ts)}</span>${own?`<span class="Chat-Checks">${m.status==='sent'?'✓':'✓✓'}</span>`:''}`;box.append(txt,meta);thread.append(box);}
            const typing=document.createElement('div');typing.className='Chat-Typing';typing.textContent=conv?.typing?`${conv.peer.name} is typing…`:'';
            const composer=document.createElement('footer');composer.className='Chat-Composer';composer.innerHTML='<button class="Chat-IconButton" type="button">＋</button>';const input=document.createElement('input');input.className='Chat-Input';input.placeholder='Message';const send=document.createElement('button');send.type='button';send.className='Chat-Send';send.textContent='➤';const doSend=()=>{const text=input.value.trim();if(!text||!conv)return;this.addMessage(conv.id,{id:`m-${Date.now()}`,author:this._me.id,text,ts:Date.now(),status:'sent'});this.dispatchEvent(new CustomEvent('arianna:send',{bubbles:true,composed:true,detail:{conversationId:conv.id,text}}));};send.addEventListener('click',doSend);input.addEventListener('keydown',e=>{if(e.key==='Enter')doSend();});composer.append(input,send);
            main.append(hh,thread,typing,composer);shell.append(side,main);this.replaceChildren(shell);requestAnimationFrame(()=>{thread.scrollTop=thread.scrollHeight;});
        }
    }
}
export type ChatOptions=Chat.Interfaces.ChatOptions; export type ChatConversation=Chat.Interfaces.ChatConversation; export type ChatMessage=Chat.Interfaces.ChatMessage; export type ChatUser=Chat.Interfaces.ChatUser; export type MessageStatus=Chat.Types.MessageStatus;
export default Chat.Chat;
