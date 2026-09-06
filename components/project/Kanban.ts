/**
 * @module    components/project/Kanban
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA project Kanban board. Jira-style workflow ergonomics with
 *              AriannA visual language, Dark/Light themes and drag/reorder support.
 */

import { Component, Css, Templates } from '../../core/index.ts';

export namespace Kanban
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'highest' | 'critical';
        export type IssueType = 'task' | 'story' | 'bug' | 'epic' | 'subtask' | 'research' | 'ops';
    }

    export namespace Interfaces
    {
        export interface Actor
        {
            id: string;
            name: string;
            avatar?: string;
            initials?: string;
            color?: string;
            status?: 'online' | 'away' | 'busy' | 'offline';
        }

        export interface Column
        {
            id: string;
            title: string;
            limit?: number;
            accent?: string;
            collapsed?: boolean;
        }

        export interface Task
        {
            id: string;
            key?: string;
            columnId: string;
            title: string;
            description?: string;
            type?: Types.IssueType;
            priority?: Types.Priority;
            labels?: string[];
            assigneeIds?: string[];
            reporterId?: string;
            storyPoints?: number;
            dueAt?: string;
            comments?: number;
            attachments?: number;
            subtasks?: number;
            completedSubtasks?: number;
            blocked?: boolean;
            flagged?: boolean;
            order?: number;
        }

        export interface KanbanOptions
        {
            theme?: Types.Theme;
            title?: string;
            subtitle?: string;
            projectKey?: string;
            columns?: Column[];
            tasks?: Task[];
            actors?: Actor[];
            readonly?: boolean;
            compact?: boolean;
            showToolbar?: boolean;
        }
    }

    const html = Templates.Template.Html;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-kanban, .AriannaKanban', {
            '--Kanban-Accent': '#e40c88',
            Background: '#111317',
            Border: '1px solid #242830',
            BorderRadius: '8px',
            BoxSizing: 'border-box',
            Color: '#e7eaf0',
            Display: 'block',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            MinWidth: '0',
            Overflow: 'hidden',
            Width: '100%'
        }),
        new Css.Rule('.Kanban-Shell', { Display: 'grid', GridTemplateRows: 'auto auto minmax(300px,1fr)', MinHeight: '420px' }),
        new Css.Rule('.Kanban-Header', {
            AlignItems: 'center', Background: '#171a20', BorderBottom: '1px solid #272b33', Display: 'flex', Gap: '12px', Padding: '14px 16px'
        }),
        new Css.Rule('.Kanban-ProjectMark', {
            AlignItems: 'center', Background: 'linear-gradient(145deg,#e40c88,#99206f)', BorderRadius: '6px', Color: '#fff', Display: 'inline-flex', FontSize: '10px', FontWeight: '800', Height: '30px', JustifyContent: 'center', LetterSpacing: '.06em', Width: '30px'
        }),
        new Css.Rule('.Kanban-TitleBlock', { MinWidth: '0' }),
        new Css.Rule('.Kanban-Title', { FontSize: '17px', FontWeight: '760', LetterSpacing: '-.01em', Margin: '0', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Kanban-Subtitle', { Color: '#9299a6', FontSize: '11px', MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Kanban-HeaderFill', { Flex: '1 1 auto' }),
        new Css.Rule('.Kanban-HeaderButton', {
            Appearance: 'none', Background: '#252a32', Border: '1px solid #353b45', BorderRadius: '5px', Color: '#d8dce3', Cursor: 'pointer', Font: '650 11px/1 var(--arianna-font,system-ui,sans-serif)', Height: '30px', Padding: '0 10px'
        }),
        new Css.Rule('.Kanban-HeaderButton[data-primary="true"]', { Background: '#e40c88', BorderColor: '#e40c88', Color: '#fff' }),
        new Css.Rule('.Kanban-Toolbar', {
            AlignItems: 'center', Background: '#14171c', BorderBottom: '1px solid #262a31', Display: 'flex', FlexWrap: 'wrap', Gap: '8px', Padding: '9px 16px'
        }),
        new Css.Rule('.Kanban-Search', {
            Appearance: 'none', Background: '#0d0f13', Border: '1px solid #333843', BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e8ebef', Font: '12px/1.2 var(--arianna-font,system-ui,sans-serif)', Height: '30px', MinWidth: '180px', Outline: 'none', Padding: '0 10px', Width: 'min(320px,40vw)'
        }),
        new Css.Rule('.Kanban-Search:focus', { BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.16)' }),
        new Css.Rule('.Kanban-ToolbarLabel', { Color: '#8f97a3', FontSize: '10px', FontWeight: '650', LetterSpacing: '.05em', TextTransform: 'uppercase' }),
        new Css.Rule('.Kanban-ActorStack', { AlignItems: 'center', Display: 'flex', MarginLeft: '2px' }),
        new Css.Rule('.Kanban-Actor', {
            AlignItems: 'center', Background: '#343a44', Border: '2px solid #14171c', BorderRadius: '50%', Color: '#fff', Display: 'inline-flex', FontSize: '8px', FontWeight: '800', Height: '24px', JustifyContent: 'center', MarginLeft: '-5px', Overflow: 'hidden', Width: '24px'
        }),
        new Css.Rule('.Kanban-Actor:first-child', { MarginLeft: '0' }),
        new Css.Rule('.Kanban-Actor img', { Height: '100%', ObjectFit: 'cover', Width: '100%' }),
        new Css.Rule('.Kanban-Board', {
            AlignItems: 'start', Background: '#101216', Display: 'grid', Gap: '10px', GridAutoColumns: 'minmax(250px,1fr)', GridAutoFlow: 'column', MinHeight: '0', Overflow: 'auto', Padding: '12px'
        }),
        new Css.Rule('.Kanban-Column', {
            Background: '#171a20', Border: '1px solid #252a31', BorderRadius: '7px', BoxSizing: 'border-box', Display: 'grid', GridTemplateRows: 'auto minmax(72px,1fr)', MaxWidth: '360px', MinWidth: '250px', Overflow: 'hidden'
        }),
        new Css.Rule('.Kanban-ColumnHeader', { AlignItems: 'center', Display: 'flex', Gap: '8px', Padding: '10px 10px 8px' }),
        new Css.Rule('.Kanban-ColumnAccent', { Background: 'var(--Kanban-ColumnAccent,#e40c88)', BorderRadius: '2px', Height: '13px', Width: '3px' }),
        new Css.Rule('.Kanban-ColumnTitle', { FontSize: '11px', FontWeight: '760', LetterSpacing: '.04em', TextTransform: 'uppercase' }),
        new Css.Rule('.Kanban-ColumnCount', { Background: '#262b33', BorderRadius: '999px', Color: '#aab1bc', FontSize: '9px', FontWeight: '700', Padding: '2px 6px' }),
        new Css.Rule('.Kanban-ColumnLimit', { Color: '#777f8b', FontSize: '9px', MarginLeft: 'auto' }),
        new Css.Rule('.Kanban-Column[data-over-limit="true"] .Kanban-ColumnLimit', { Color: '#ff6a64', FontWeight: '750' }),
        new Css.Rule('.Kanban-ColumnLane', { Display: 'grid', Gap: '7px', MinHeight: '72px', Padding: '0 7px 8px' }),
        new Css.Rule('.Kanban-ColumnLane[data-drop="true"]', { Background: 'rgba(228,12,136,.055)', Outline: '1px dashed rgba(228,12,136,.58)', OutlineOffset: '-4px' }),
        new Css.Rule('.Kanban-Card', {
            Background: '#20242b', Border: '1px solid #303640', BorderRadius: '6px', BoxShadow: '0 1px 2px rgba(0,0,0,.24)', BoxSizing: 'border-box', Cursor: 'grab', Display: 'grid', Gap: '8px', Padding: '9px 10px', Position: 'relative', UserSelect: 'none'
        }),
        new Css.Rule('.Kanban-Card:hover', { BorderColor: '#454c58', BoxShadow: '0 3px 10px rgba(0,0,0,.24)' }),
        new Css.Rule('.Kanban-Card[data-dragging="true"]', { Opacity: '.34' }),
        new Css.Rule('.Kanban-Card[data-blocked="true"]', { BoxShadow: 'inset 3px 0 0 #df504b,0 1px 2px rgba(0,0,0,.24)' }),
        new Css.Rule('.Kanban-CardTop', { AlignItems: 'center', Display: 'flex', Gap: '6px' }),
        new Css.Rule('.Kanban-IssueType', {
            AlignItems: 'center', Background: '#2f7bdc', BorderRadius: '3px', Color: '#fff', Display: 'inline-flex', FontSize: '7px', FontWeight: '800', Height: '15px', JustifyContent: 'center', MinWidth: '15px', Padding: '0 4px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.Kanban-IssueType[data-type="bug"]', { Background: '#d94f4a' }),
        new Css.Rule('.Kanban-IssueType[data-type="story"]', { Background: '#50a66a' }),
        new Css.Rule('.Kanban-IssueType[data-type="epic"]', { Background: '#8d63d4' }),
        new Css.Rule('.Kanban-TaskKey', { Color: '#848d9a', Font: '650 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace' }),
        new Css.Rule('.Kanban-Priority', { Color: '#8f98a5', FontSize: '10px', MarginLeft: 'auto' }),
        new Css.Rule('.Kanban-Priority[data-priority="highest"], .Kanban-Priority[data-priority="critical"]', { Color: '#ff6560' }),
        new Css.Rule('.Kanban-CardTitle', { Color: '#edf0f4', FontSize: '12px', FontWeight: '620', LineHeight: '1.32' }),
        new Css.Rule('.Kanban-Labels', { Display: 'flex', FlexWrap: 'wrap', Gap: '4px' }),
        new Css.Rule('.Kanban-Label', { Background: '#2b3038', BorderRadius: '3px', Color: '#aeb5bf', FontSize: '8px', Padding: '2px 5px' }),
        new Css.Rule('.Kanban-CardFooter', { AlignItems: 'center', Display: 'flex', Gap: '7px', MinHeight: '22px' }),
        new Css.Rule('.Kanban-Meta', { Color: '#7d8693', FontSize: '9px', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Kanban-CardActors', { Display: 'flex', MarginLeft: 'auto' }),
        new Css.Rule('.Kanban-CardActor', {
            AlignItems: 'center', Background: '#353c47', Border: '2px solid #20242b', BorderRadius: '50%', Color: '#fff', Display: 'inline-flex', FontSize: '7px', FontWeight: '800', Height: '20px', JustifyContent: 'center', MarginLeft: '-5px', Overflow: 'hidden', Width: '20px'
        }),
        new Css.Rule('.Kanban-CardActor img', { Height: '100%', ObjectFit: 'cover', Width: '100%' }),
        new Css.Rule('.Kanban-Empty', { Color: '#6f7783', FontSize: '10px', Padding: '12px 8px 16px', TextAlign: 'center' }),

        new Css.Rule('arianna-kanban[theme="light"], .AriannaKanban[theme="light"]', { Background: '#f7f8fa', BorderColor: '#d5d9df', Color: '#17202b' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Header, .AriannaKanban[theme="light"] .Kanban-Header', { Background: '#fff', BorderBottomColor: '#dfe2e6' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Subtitle, .AriannaKanban[theme="light"] .Kanban-Subtitle', { Color: '#66717f' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Toolbar, .AriannaKanban[theme="light"] .Kanban-Toolbar', { Background: '#f7f8fa', BorderBottomColor: '#dfe2e6' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Search, .AriannaKanban[theme="light"] .Kanban-Search', { Background: '#fff', BorderColor: '#c9ced5', Color: '#1f2933' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-HeaderButton, .AriannaKanban[theme="light"] .Kanban-HeaderButton', { Background: '#fff', BorderColor: '#cdd2d8', Color: '#394453' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Board, .AriannaKanban[theme="light"] .Kanban-Board', { Background: '#f1f3f6' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Column, .AriannaKanban[theme="light"] .Kanban-Column', { Background: '#f8f9fb', BorderColor: '#d6dae0' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-ColumnCount, .AriannaKanban[theme="light"] .Kanban-ColumnCount', { Background: '#e7eaf0', Color: '#596575' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Card, .AriannaKanban[theme="light"] .Kanban-Card', { Background: '#fff', BorderColor: '#d3d8de', BoxShadow: '0 1px 2px rgba(20,30,45,.08)' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-CardTitle, .AriannaKanban[theme="light"] .Kanban-CardTitle', { Color: '#1e2937' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-Label, .AriannaKanban[theme="light"] .Kanban-Label', { Background: '#eef1f5', Color: '#596576' }),
        new Css.Rule('arianna-kanban[theme="light"] .Kanban-CardActor, .AriannaKanban[theme="light"] .Kanban-CardActor', { BorderColor: '#fff' })
    ]);

    @Component('arianna-kanban', Styles, {
        Shadow: false,
        Attributes: ['theme', 'title', 'subtitle', 'project-key', 'readonly', 'compact', 'show-toolbar']
    })
    export class Kanban extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _columns?: Interfaces.Column[];
        private _tasks?: Interfaces.Task[];
        private _actors?: Interfaces.Actor[];
        private _query = '';
        private _draggedTaskId?: string;
        private _bound?: boolean;

        constructor(options: Interfaces.KanbanOptions = {})
        {
            super();
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.title) this.setAttribute('title', options.title);
            if(options.subtitle) this.setAttribute('subtitle', options.subtitle);
            if(options.projectKey) this.setAttribute('project-key', options.projectKey);
            if(options.readonly) this.setAttribute('readonly', '');
            if(options.compact) this.setAttribute('compact', '');
            if(options.showToolbar === false) this.setAttribute('show-toolbar', 'false');
            if(options.columns) this._columns = options.columns.slice();
            if(options.tasks) this._tasks = options.tasks.slice();
            if(options.actors) this._actors = options.actors.slice();
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public onConnected(): void
        {
            this.classList.add('AriannaKanban');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.EnsureDefaults();
            this.Render();
            this.Bind();
        }

        public onAttributeChanged(): void
        {
            if(this.isConnected) this.Render();
        }

        public get columns(): Interfaces.Column[] { this.EnsureDefaults(); return (this._columns ?? []).slice(); }
        public set columns(value: Interfaces.Column[]) { this._columns = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }
        public get tasks(): Interfaces.Task[] { this.EnsureDefaults(); return (this._tasks ?? []).slice(); }
        public set tasks(value: Interfaces.Task[]) { this._tasks = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }
        public get actors(): Interfaces.Actor[] { this.EnsureDefaults(); return (this._actors ?? []).slice(); }
        public set actors(value: Interfaces.Actor[]) { this._actors = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }

        public setColumns(value: Interfaces.Column[]): this { this.columns = value; return this; }
        public setTasks(value: Interfaces.Task[]): this { this.tasks = value; return this; }
        public setActors(value: Interfaces.Actor[]): this { this.actors = value; return this; }

        public addTask(task: Interfaces.Task): this
        {
            this.EnsureDefaults();
            this._tasks = [...(this._tasks ?? []), { ...task }];
            this.RenderIfConnected();
            this.Emit('arianna:kanban-task-add', { task });
            return this;
        }

        public updateTask(id: string, patch: Partial<Interfaces.Task>): this
        {
            this.EnsureDefaults();
            this._tasks = (this._tasks ?? []).map(task => task.id === id ? { ...task, ...patch, id: task.id } : task);
            this.RenderIfConnected();
            this.Emit('arianna:kanban-task-update', { id, patch });
            return this;
        }

        public removeTask(id: string): this
        {
            this.EnsureDefaults();
            const task = (this._tasks ?? []).find(item => item.id === id);
            this._tasks = (this._tasks ?? []).filter(item => item.id !== id);
            this.RenderIfConnected();
            this.Emit('arianna:kanban-task-remove', { id, task });
            return this;
        }

        public moveTask(taskId: string, columnId: string, index = Number.POSITIVE_INFINITY): this
        {
            this.EnsureDefaults();
            const tasks = this._tasks ?? [];
            const current = tasks.find(task => task.id === taskId);
            if(!current) return this;

            const target = tasks.filter(task => task.columnId === columnId && task.id !== taskId).sort(this.SortByOrder);
            const safeIndex = Math.max(0, Math.min(target.length, Number.isFinite(index) ? Math.floor(index) : target.length));
            target.splice(safeIndex, 0, { ...current, columnId });

            const orderById = new Map<string, number>();
            target.forEach((task, order) => orderById.set(task.id, order));
            this._tasks = tasks.map(task => task.id === taskId
                ? { ...task, columnId, order: orderById.get(taskId) ?? safeIndex }
                : task.columnId === columnId && orderById.has(task.id)
                    ? { ...task, order: orderById.get(task.id) }
                    : task);

            this.RenderIfConnected();
            this.Emit('arianna:kanban-move', { taskId, fromColumnId: current.columnId, columnId, index: safeIndex });
            return this;
        }

        private EnsureDefaults(): void
        {
            if(typeof this._query !== 'string') this._query = '';
            if(!this._columns)
            {
                this._columns = [
                    { id: 'backlog', title: 'Backlog', accent: '#7f8793' },
                    { id: 'progress', title: 'In Progress', limit: 4, accent: '#2f7bdc' },
                    { id: 'review', title: 'Review', limit: 3, accent: '#9a67d8' },
                    { id: 'done', title: 'Done', accent: '#4aa86d' }
                ];
            }
            if(!this._actors)
            {
                this._actors = [
                    { id: 'ra', name: 'Riccardo', initials: 'RA', color: '#e40c88', status: 'online' },
                    { id: 'ar', name: 'Arianna', initials: 'AR', color: '#4d8fff', status: 'online' },
                    { id: 'qa', name: 'QA', initials: 'QA', color: '#7a63d2', status: 'busy' }
                ];
            }
            if(!this._tasks)
            {
                this._tasks = [
                    { id: 'a-21', key: 'ARI-21', columnId: 'backlog', title: 'Keyboard navigation for board', type: 'story', priority: 'medium', labels: ['UX'], assigneeIds: ['ar'], storyPoints: 3, order: 0 },
                    { id: 'a-18', key: 'ARI-18', columnId: 'backlog', title: 'Persist board filters in workspace', type: 'task', priority: 'low', labels: ['State'], assigneeIds: ['qa'], storyPoints: 2, order: 1 },
                    { id: 'a-15', key: 'ARI-15', columnId: 'progress', title: 'Release candidate component audit', type: 'epic', priority: 'highest', labels: ['2.0', 'Release'], assigneeIds: ['ra', 'qa'], storyPoints: 8, comments: 5, order: 0 },
                    { id: 'a-16', key: 'ARI-16', columnId: 'progress', title: 'Graphics theme parity', type: 'task', priority: 'high', labels: ['Graphics'], assigneeIds: ['ra'], storyPoints: 5, order: 1 },
                    { id: 'a-12', key: 'ARI-12', columnId: 'review', title: 'Composite runtime constructor properties', type: 'bug', priority: 'high', labels: ['Runtime'], assigneeIds: ['qa'], comments: 2, order: 0 },
                    { id: 'a-07', key: 'ARI-7', columnId: 'done', title: 'AudioTrackEditor light theme', type: 'bug', priority: 'medium', labels: ['Audio'], assigneeIds: ['ra'], storyPoints: 3, subtasks: 4, completedSubtasks: 4, order: 0 }
                ];
            }
        }

        private RenderIfConnected(): void
        {
            if(this.isConnected) this.Render();
        }

        private Render(): void
        {
            this.EnsureDefaults();
            const title = this.getAttribute('title') || 'Project board';
            const subtitle = this.getAttribute('subtitle') || 'Plan, track and ship work.';
            const projectKey = (this.getAttribute('project-key') || 'ARI').toUpperCase();
            const showToolbar = this.getAttribute('show-toolbar') !== 'false';

            const shell = document.createElement('div'); shell.className = 'Kanban-Shell';
            const header = document.createElement('header'); header.className = 'Kanban-Header';
            const mark = document.createElement('span'); mark.className = 'Kanban-ProjectMark'; mark.textContent = projectKey.slice(0, 2);
            const block = document.createElement('div'); block.className = 'Kanban-TitleBlock';
            const h2 = document.createElement('h2'); h2.className = 'Kanban-Title'; h2.textContent = title;
            const sub = document.createElement('div'); sub.className = 'Kanban-Subtitle'; sub.textContent = subtitle;
            block.append(h2, sub);
            const fill = document.createElement('span'); fill.className = 'Kanban-HeaderFill';
            const add = document.createElement('button'); add.type = 'button'; add.className = 'Kanban-HeaderButton'; add.dataset.primary = 'true'; add.dataset.action = 'add'; add.textContent = '+ Create';
            const more = document.createElement('button'); more.type = 'button'; more.className = 'Kanban-HeaderButton'; more.dataset.action = 'more'; more.textContent = '•••';
            header.append(mark, block, fill, add, more);
            shell.append(header);

            const toolbar = document.createElement('div'); toolbar.className = 'Kanban-Toolbar';
            if(showToolbar)
            {
                const search = document.createElement('input'); search.className = 'Kanban-Search'; search.type = 'search'; search.placeholder = 'Search this board'; search.value = this._query; search.dataset.role = 'search';
                const people = document.createElement('span'); people.className = 'Kanban-ToolbarLabel'; people.textContent = 'People';
                const stack = document.createElement('span'); stack.className = 'Kanban-ActorStack';
                (this._actors ?? []).slice(0, 5).forEach(actor => stack.append(this.ActorNode(actor, 'Kanban-Actor')));
                const all = document.createElement('button'); all.type = 'button'; all.className = 'Kanban-HeaderButton'; all.dataset.action = 'filter-all'; all.textContent = 'All work';
                toolbar.append(search, people, stack, all);
            }
            shell.append(toolbar);

            const board = document.createElement('div'); board.className = 'Kanban-Board';
            const query = this._query.trim().toLowerCase();
            const filtered = (this._tasks ?? []).filter(task => !query || [task.title, task.key, ...(task.labels ?? [])].some(value => String(value ?? '').toLowerCase().includes(query)));

            for(const column of this._columns ?? [])
            {
                const tasks = filtered.filter(task => task.columnId === column.id).sort(this.SortByOrder);
                const columnNode = document.createElement('section'); columnNode.className = 'Kanban-Column'; columnNode.dataset.columnId = column.id;
                columnNode.dataset.overLimit = String(!!column.limit && tasks.length > column.limit);
                columnNode.style.setProperty('--Kanban-ColumnAccent', column.accent || '#e40c88');

                const ch = document.createElement('header'); ch.className = 'Kanban-ColumnHeader';
                const ca = document.createElement('span'); ca.className = 'Kanban-ColumnAccent';
                const ct = document.createElement('span'); ct.className = 'Kanban-ColumnTitle'; ct.textContent = column.title;
                const cc = document.createElement('span'); cc.className = 'Kanban-ColumnCount'; cc.textContent = String(tasks.length);
                const cl = document.createElement('span'); cl.className = 'Kanban-ColumnLimit'; cl.textContent = column.limit ? `${tasks.length}/${column.limit}` : '';
                ch.append(ca, ct, cc, cl);

                const lane = document.createElement('div'); lane.className = 'Kanban-ColumnLane'; lane.dataset.columnId = column.id;
                if(tasks.length === 0)
                {
                    const empty = document.createElement('div'); empty.className = 'Kanban-Empty'; empty.textContent = 'Drop work here'; lane.append(empty);
                }
                else tasks.forEach(task => lane.append(this.CardNode(task)));

                columnNode.append(ch, lane); board.append(columnNode);
            }
            shell.append(board);
            this.replaceChildren(shell);
        }

        private CardNode(task: Interfaces.Task): HTMLElement
        {
            const card = document.createElement('article'); card.className = 'Kanban-Card'; card.dataset.taskId = task.id; card.dataset.blocked = String(!!task.blocked); card.draggable = !this.hasAttribute('readonly');
            const top = document.createElement('div'); top.className = 'Kanban-CardTop';
            const type = document.createElement('span'); type.className = 'Kanban-IssueType'; type.dataset.type = task.type || 'task'; type.textContent = (task.type || 'task').slice(0, 1).toUpperCase();
            const key = document.createElement('span'); key.className = 'Kanban-TaskKey'; key.textContent = task.key || task.id;
            const pri = document.createElement('span'); pri.className = 'Kanban-Priority'; pri.dataset.priority = task.priority || 'medium'; pri.textContent = this.PriorityGlyph(task.priority || 'medium');
            top.append(type, key, pri);
            const title = document.createElement('div'); title.className = 'Kanban-CardTitle'; title.textContent = task.title;
            card.append(top, title);

            if(task.labels?.length)
            {
                const labels = document.createElement('div'); labels.className = 'Kanban-Labels';
                task.labels.forEach(value => { const n = document.createElement('span'); n.className = 'Kanban-Label'; n.textContent = value; labels.append(n); });
                card.append(labels);
            }

            const footer = document.createElement('div'); footer.className = 'Kanban-CardFooter';
            if(task.storyPoints != null) { const n = document.createElement('span'); n.className = 'Kanban-Meta'; n.textContent = `${task.storyPoints} SP`; footer.append(n); }
            if(task.comments) { const n = document.createElement('span'); n.className = 'Kanban-Meta'; n.textContent = `◌ ${task.comments}`; footer.append(n); }
            if(task.subtasks) { const n = document.createElement('span'); n.className = 'Kanban-Meta'; n.textContent = `☑ ${task.completedSubtasks ?? 0}/${task.subtasks}`; footer.append(n); }
            const actors = document.createElement('span'); actors.className = 'Kanban-CardActors';
            (task.assigneeIds ?? []).map(id => (this._actors ?? []).find(actor => actor.id === id)).filter((actor): actor is Interfaces.Actor => !!actor).slice(0, 3).forEach(actor => actors.append(this.ActorNode(actor, 'Kanban-CardActor')));
            footer.append(actors); card.append(footer);
            return card;
        }

        private ActorNode(actor: Interfaces.Actor, className: string): HTMLElement
        {
            const node = document.createElement('span'); node.className = className; node.title = actor.name; node.style.background = actor.color || '#3a4350';
            if(actor.avatar)
            {
                const img = document.createElement('img'); img.alt = actor.name; img.src = actor.avatar; node.append(img);
            }
            else node.textContent = actor.initials || actor.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
            return node;
        }

        private Bind(): void
        {
            if(this._bound) return;
            this._bound = true;

            this.addEventListener('input', event =>
            {
                const input = event.target as HTMLInputElement;
                if(input?.dataset.role !== 'search') return;
                this._query = input.value;
                this.Render();
                const next = this.querySelector<HTMLInputElement>('[data-role="search"]');
                next?.focus();
                if(next) next.setSelectionRange(this._query.length, this._query.length);
            });

            this.addEventListener('click', event =>
            {
                const target = event.target as Element | null;
                const button = target?.closest?.('[data-action]') as HTMLElement | null;
                if(button)
                {
                    if(button.dataset.action === 'add') this.Emit('arianna:kanban-create-request');
                    else if(button.dataset.action === 'more') this.Emit('arianna:kanban-menu-request');
                    else if(button.dataset.action === 'filter-all') { this._query = ''; this.Render(); }
                    return;
                }
                const card = target?.closest?.('.Kanban-Card') as HTMLElement | null;
                if(card?.dataset.taskId) this.Emit('arianna:kanban-task-open', { taskId: card.dataset.taskId, task: (this._tasks ?? []).find(item => item.id === card.dataset.taskId) });
            });

            this.addEventListener('dragstart', event =>
            {
                if(this.hasAttribute('readonly')) { event.preventDefault(); return; }
                const card = (event.target as Element | null)?.closest?.('.Kanban-Card') as HTMLElement | null;
                if(!card?.dataset.taskId) return;
                this._draggedTaskId = card.dataset.taskId;
                card.dataset.dragging = 'true';
                event.dataTransfer?.setData('text/plain', this._draggedTaskId);
                if(event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
            });

            this.addEventListener('dragover', event =>
            {
                const lane = (event.target as Element | null)?.closest?.('.Kanban-ColumnLane') as HTMLElement | null;
                if(!lane) return;
                event.preventDefault();
                if(event.dataTransfer) event.dataTransfer.dropEffect = 'move';
                this.querySelectorAll<HTMLElement>('.Kanban-ColumnLane').forEach(item => item.dataset.drop = String(item === lane));
            });

            this.addEventListener('drop', event =>
            {
                const lane = (event.target as Element | null)?.closest?.('.Kanban-ColumnLane') as HTMLElement | null;
                if(!lane?.dataset.columnId) return;
                event.preventDefault();
                const taskId = this._draggedTaskId || event.dataTransfer?.getData('text/plain');
                if(taskId)
                {
                    const cards = Array.from(lane.querySelectorAll<HTMLElement>('.Kanban-Card'));
                    const y = event.clientY;
                    let index = cards.length;
                    for(let i = 0; i < cards.length; i++)
                    {
                        const rect = cards[i].getBoundingClientRect();
                        if(y < rect.top + rect.height / 2) { index = i; break; }
                    }
                    this.moveTask(taskId, lane.dataset.columnId, index);
                }
                this.ClearDragState();
            });

            this.addEventListener('dragend', () => this.ClearDragState());
        }

        private ClearDragState(): void
        {
            this._draggedTaskId = undefined;
            this.querySelectorAll<HTMLElement>('.Kanban-Card').forEach(card => card.removeAttribute('data-dragging'));
            this.querySelectorAll<HTMLElement>('.Kanban-ColumnLane').forEach(lane => lane.removeAttribute('data-drop'));
        }

        private SortByOrder(a: Interfaces.Task, b: Interfaces.Task): number
        {
            return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
        }

        private PriorityGlyph(priority: Types.Priority): string
        {
            return priority === 'critical' ? '‼' : priority === 'highest' ? '↑↑' : priority === 'high' ? '↑' : priority === 'low' ? '↓' : priority === 'lowest' ? '↓↓' : '•';
        }

        private Emit(type: string, detail: Record<string, unknown> = {}): void
        {
            this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, board: this, source: this } }));
        }
    }
}

export const KanbanComponent = Kanban.Kanban;
export { KanbanComponent as KanbanBoard };
export type KanbanOptions = Kanban.Interfaces.KanbanOptions;
export type KanbanActor = Kanban.Interfaces.Actor;
export type KanbanColumn = Kanban.Interfaces.Column;
export type KanbanTask = Kanban.Interfaces.Task;
export default Kanban.Kanban;
