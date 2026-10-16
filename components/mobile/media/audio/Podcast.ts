/** Provider-neutral, zero-dependency Podcast component. No external imports.
 *  Each distribution ships its own independent Podcast.ts.
 *  Accepts pre-normalized episodes or an application-supplied async loader.
 */
export interface PodcastEpisode {
  id: string;
  title: string;
  audioUrl: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  durationSeconds?: number;
  author?: string;
  linkUrl?: string;
}
export interface PodcastPage {
  episodes: PodcastEpisode[];
  nextCursor?: string | null;
}
export type PodcastLoader = (request: {
  feedId: string;
  cursor?: string;
  limit: number;
  signal: AbortSignal;
}) => Promise<PodcastPage>;

export class Podcast extends HTMLElement {
  static get observedAttributes() { return ['title', 'feed-id', 'page-size']; }
  private readonly shell = this.attachShadow({ mode: 'open' });
  private readonly view = document.createElement('div');
  private readonly audio = new Audio();
  private controller?: AbortController;
  private loaderFn?: PodcastLoader;
  private items: PodcastEpisode[] = [];
  private nextCursor?: string;
  private activeId?: string;
  private busy = false;
  private failure = '';
  private connected = false;

  constructor() {
    super();
    this.audio.preload = 'none';
    this.audio.controls = true;
    this.audio.hidden = true;
    this.shell.append(this.view, this.audio);
    this.audio.addEventListener('play', () => this.dispatchEvent(new CustomEvent('podcast-play', { bubbles:true, composed:true, detail:{ episode:this.currentEpisode } })));
    this.audio.addEventListener('pause', () => this.dispatchEvent(new CustomEvent('podcast-pause', { bubbles:true, composed:true, detail:{ episode:this.currentEpisode } })));
    this.audio.addEventListener('ended', () => { this.activeId=undefined; this.render(); });
    this.audio.addEventListener('error', () => { this.failure='Riproduzione non disponibile'; this.render(); });
  }
  connectedCallback() { this.connected=true; this.render(); if(this.loaderFn && !this.items.length) void this.reload(); }
  disconnectedCallback() { this.connected=false; this.controller?.abort(); this.audio.pause(); }
  attributeChangedCallback() { if(this.connected) this.render(); }
  get currentEpisode(): PodcastEpisode | undefined { return this.items.find(e=>e.id===this.activeId); }
  get episodes(): PodcastEpisode[] { return [...this.items]; }
  set episodes(value: PodcastEpisode[]) { this.controller?.abort(); this.nextCursor=undefined; this.items=this.validate(value); this.activeId=undefined; this.audio.pause(); this.audio.removeAttribute('src'); this.render(); }
  get loader(): PodcastLoader | undefined { return this.loaderFn; }
  set loader(value: PodcastLoader | undefined) { this.loaderFn=value; this.items=[]; this.nextCursor=undefined; if(this.connected && value) void this.reload(); else this.render(); }
  async reload() {
    this.controller?.abort(); this.items=[]; this.nextCursor=undefined;
    this.audio.pause(); this.activeId=undefined;
    await this.loadMore();
  }
  async loadMore() {
    if(this.busy || !this.loaderFn) return;
    const controller=new AbortController(); this.controller?.abort(); this.controller=controller;
    this.busy=true; this.failure=''; this.render();
    try {
      const page=await this.loaderFn({ feedId:this.getAttribute('feed-id')??'', cursor:this.nextCursor, limit:this.pageSize, signal:controller.signal });
      if(controller.signal.aborted) return;
      if(!page || !Array.isArray(page.episodes)) throw new Error('Invalid PodcastPage');
      const existing=new Set(this.items.map(e=>e.id));
      this.items.push(...this.validate(page.episodes).filter(e=>!existing.has(e.id)));
      this.nextCursor=page.nextCursor || undefined;
    } catch(error) {
      if(!controller.signal.aborted) this.failure=error instanceof Error ? error.message : String(error);
    } finally { if(this.controller===controller) {this.busy=false; this.render();} }
  }
  private get pageSize() { const n=Number(this.getAttribute('page-size')??'20'); return Number.isInteger(n)?Math.max(1,Math.min(100,n)):20; }
  private validate(input:PodcastEpisode[]):PodcastEpisode[] {
    return input.filter(e=>e && typeof e.id==='string' && !!e.id && typeof e.title==='string' && typeof e.audioUrl==='string' && this.safeUrl(e.audioUrl));
  }
  private safeUrl(url:string):boolean { try { return new URL(url,document.baseURI).protocol==='https:' || new URL(url,document.baseURI).protocol==='http:'; } catch { return false; } }
  private formatDate(date?:string):string { if(!date) return ''; const d=new Date(date); return Number.isFinite(d.getTime())?d.toLocaleDateString('it-IT'):''; }
  private formatDuration(seconds?:number):string { if(!Number.isFinite(seconds) || seconds!<0) return ''; const n=Math.floor(seconds!); return `${Math.floor(n/3600)?Math.floor(n/3600)+'h ':''}${Math.floor(n%3600/60)}m`; }
  private create<K extends keyof HTMLElementTagNameMap>(tag:K, className?:string, text?:string):HTMLElementTagNameMap[K] {
    const el=document.createElement(tag); if(className) el.className=className; if(text!==undefined) el.textContent=text; return el;
  }
  private async toggle(episode:PodcastEpisode) {
    if(this.activeId===episode.id && !this.audio.paused) {this.audio.pause();this.render();return;}
    if(this.activeId!==episode.id) { this.audio.pause(); this.audio.src=episode.audioUrl; this.activeId=episode.id; }
    this.failure=''; this.render();
    try { await this.audio.play(); this.render(); }
    catch(error) { this.failure=error instanceof Error?error.message:String(error); this.render(); }
  }
  private render() {
    const root=this.view;
    root.replaceChildren();
    const style=this.create('style'); style.textContent=CSS; root.append(style);
    const layout=this.create('section','podcast');
    const header=this.create('header','header');
    header.append(this.create('h2','title',this.getAttribute('title')??'Podcast'));
    header.append(this.create('span','count',`${this.items.length} episodi`)); layout.append(header);
    const grid=this.create('div','episodes');
    for(const episode of this.items) {
      const card=this.create('article','episode');
      if(episode.imageUrl && this.safeUrl(episode.imageUrl)) { const image=this.create('img','cover'); image.src=episode.imageUrl; image.alt=''; image.loading='lazy'; card.append(image); }
      else card.append(this.create('div','cover fallback','♫'));
      const body=this.create('div','body'); body.append(this.create('strong','episode-title',episode.title));
      const info=[episode.author,this.formatDate(episode.publishedAt),this.formatDuration(episode.durationSeconds)].filter(Boolean).join(' · ');
      if(info) body.append(this.create('small','meta',info));
      if(episode.description) body.append(this.create('p','description',episode.description));
      card.append(body);
      const btn=this.create('button','play',this.activeId===episode.id && !this.audio.paused?'Pausa':'Play');
      btn.type='button'; btn.setAttribute('aria-label',`${btn.textContent}: ${episode.title}`); btn.addEventListener('click',()=>void this.toggle(episode)); card.append(btn); grid.append(card);
    }
    if(!this.items.length && !this.busy) grid.append(this.create('p','empty','Nessun episodio disponibile'));
    layout.append(grid);
    if(this.activeId) {
      const player=this.create('div','player');
      player.append(this.create('span','playing',this.currentEpisode?.title??''));
      layout.append(player);
    }
    if(this.failure) layout.append(this.create('p','error',this.failure));
    if(this.loaderFn && (this.nextCursor || this.busy)) {
      const more=this.create('button','more',this.busy?'Caricamento…':'Carica altri episodi'); more.type='button';more.disabled=this.busy;
      more.addEventListener('click',()=>void this.loadMore()); layout.append(more);
    }
    root.append(layout);
    this.audio.hidden = !this.activeId;
  }
}

const CSS = `:host audio{display:block;width:100%;margin-top:8px}:host audio[hidden]{display:none}:host{display:block;color:inherit;font:inherit}.podcast{display:flex;flex-direction:column;gap:14px;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}.header{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.title{font-size:1.25rem;line-height:1.2;margin:0}.count,.meta{font-size:.76rem;opacity:.7}.episodes{display:flex;flex-direction:column;gap:10px}.episode{display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:11px;padding:10px 8px;border-bottom:1px solid rgba(128,128,128,.22)}.cover{height:64px;width:64px;object-fit:cover;border-radius:10px}.fallback{background:#555;color:#fff;display:grid;place-items:center}.body{min-width:0;display:flex;flex-direction:column;gap:4px}.episode-title{font-size:.93rem;line-height:1.3;overflow-wrap:anywhere}.description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.8rem;margin:0;opacity:.8}.play{border:0;border-radius:12px;background:#8e001c;color:white;padding:12px 10px;min-height:44px;min-width:54px}.player{position:sticky;bottom:env(safe-area-inset-bottom);display:grid;gap:8px;padding:12px;background:#202020;color:white;border-radius:16px}.player audio{width:100%}.playing{font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.more{border-radius:12px;padding:14px;min-height:44px}.error{color:#e77}`;

// Native Custom Element is supported by AriannA Web and by WebKit/Tauri Mobile.
// Independently published bundles must not register the same tag together.
if(typeof customElements !== 'undefined' && !customElements.get('arianna-podcast')) {
  customElements.define('arianna-podcast', Podcast);
}
export default Podcast;
