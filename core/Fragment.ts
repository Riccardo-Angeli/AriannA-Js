/**
 * @module    core/Fragment
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026
 *
 * # AriannA Fragment — universal grouping primitive
 *
 * A Fragment is an ordered, lightweight collection of nodes/Real/Virtual that
 * can be mounted into a host, unmounted, serialized, or composed inside any
 * other AriannA primitive. It is the single contract for "multi-root output"
 * shared by:
 *
 *   - Real    (Real.add(fragment))
 *   - Virtual (Virtual children pass-through)
 *   - Template (`<>...</>` JSX & `html\`...\`` multi-root)
 *   - JSX runtime
 *   - SSR serializer
 *
 * Identity semantics: a Fragment NEVER clones its members on mount — it MOVES
 * them. This preserves DOM identity, event listeners, sub-component state,
 * reactive bindings, and refs.
 *
 * @example Imperative
 *   const f = new Fragment(
 *       new Real('span').add('Hello, '),
 *       new Real('strong').add('world'),
 *       '!'
 *   );
 *   f.mount(host);
 *
 * @example In Real
 *   real.add(new Fragment('A', 'B', 'C'));
 *
 * @example Static factory (used by JSX runtime + html`<>...</>`)
 *   Fragment.of(a, b, c)
 */

export type FragmentChild =
    | string
    | Node
    | { render(): Node }       // Real
    | { render(): Element }    // Virtual rendered
    | Fragment
    | null
    | undefined
    | false;

export class Fragment
{
    /** Owned anchor comments that delimit this fragment when mounted. */
    #startAnchor: Comment | null = null;
    #endAnchor  : Comment | null = null;

    /** Live nodes currently between anchors after mount(). */
    #nodes: Node[] = [];

    /** Sources passed at construction time. Resolved at mount(). */
    readonly #sources: FragmentChild[];

    /** Optional disposer pool, populated by sub-templates / sub-effects. */
    #disposers: Array<() => void> = [];

    constructor(...children: FragmentChild[])
    {
        this.#sources = children;
    }

    /** Compose a fragment from any iterable of children (used by JSX/html). */
    static of(...children: FragmentChild[]): Fragment
    {
        return new Fragment(...children);
    }

    /** Number of resolved nodes (post-mount). */
    get length(): number { return this.#nodes.length; }

    /** Read-only view of mounted nodes. */
    get nodes(): readonly Node[] { return this.#nodes; }

    /**
     * Resolve children to concrete Nodes (no clone — move semantics).
     * Sub-fragments are flattened lazily here.
     */
    #resolve(): Node[]
    {
        const out: Node[] = [];
        for (const c of this.#sources) {
            if (c === null || c === undefined || c === false) continue;
            if (typeof c === 'string') { out.push(document.createTextNode(c)); continue; }
            if (c instanceof Node) { out.push(c); continue; }
            if (c instanceof Fragment) {
                // Resolve nested and own its disposers
                const inner = c.#resolve();
                for (const d of c.#disposers) this.#disposers.push(d);
                c.#disposers = [];
                for (const n of inner) out.push(n);
                continue;
            }
            // Duck-typed render() — Real / Virtual / Template results
            if (typeof (c as { render?: () => Node }).render === 'function') {
                try { out.push((c as { render: () => Node }).render()); }
                catch { /* skip */ }
                continue;
            }
        }
        return out;
    }

    /**
     * Mount the fragment into a host element. Inserts an anchor pair so we
     * can later unmount precisely without disturbing siblings. Returns this.
     *
     * @param host    target element
     * @param before  reference child to insert before (default: append at end)
     */
    mount(host: Element, before: Node | null = null): this
    {
        // If already mounted, unmount first
        if (this.#startAnchor) this.unmount();

        this.#startAnchor = document.createComment(' fragment-start ');
        this.#endAnchor   = document.createComment(' fragment-end ');

        const resolved = this.#resolve();
        const ref = before ?? null;
        host.insertBefore(this.#startAnchor, ref);
        for (const n of resolved) host.insertBefore(n, ref);
        host.insertBefore(this.#endAnchor, ref);
        this.#nodes = resolved;
        return this;
    }

    /**
     * Append a new child to this fragment (live mutation). If the fragment is
     * mounted, the node is moved into the live region right before the end
     * anchor.
     */
    append(child: FragmentChild): this
    {
        this.#sources.push(child);
        if (this.#endAnchor && this.#endAnchor.parentNode) {
            const tmp = new Fragment(child);
            const resolved = tmp.#resolve();
            for (const n of resolved) {
                this.#endAnchor.parentNode!.insertBefore(n, this.#endAnchor);
                this.#nodes.push(n);
            }
            for (const d of tmp.#disposers) this.#disposers.push(d);
        }
        return this;
    }

    /** Remove the fragment from its host. Anchors + nodes removed cleanly. */
    unmount(): this
    {
        for (const d of this.#disposers) { try { d(); } catch { /* swallow */ } }
        this.#disposers = [];
        for (const n of this.#nodes) {
            if (n.parentNode) n.parentNode.removeChild(n);
        }
        this.#nodes = [];
        if (this.#startAnchor?.parentNode) this.#startAnchor.parentNode.removeChild(this.#startAnchor);
        if (this.#endAnchor?.parentNode)   this.#endAnchor.parentNode.removeChild(this.#endAnchor);
        this.#startAnchor = null;
        this.#endAnchor   = null;
        return this;
    }

    /**
     * Materialize as a DocumentFragment (for situations where you need the
     * concrete browser API). Note: this still uses MOVE semantics — once
     * inserted via appendChild, the nodes belong to their new parent.
     */
    toDocumentFragment(): DocumentFragment
    {
        const out = document.createDocumentFragment();
        const resolved = this.#resolve();
        for (const n of resolved) out.appendChild(n);
        return out;
    }

    /** Lazy node access — useful before mount(). */
    render(): DocumentFragment { return this.toDocumentFragment(); }

    /** Attach a disposer to be called on unmount(). */
    addDisposer(d: () => void): this { this.#disposers.push(d); return this; }

    /** Serialize to outerHTML string (for SSR / Daedalus snapshots). */
    toString(): string
    {
        const tmp = document.createElement('div');
        const frag = this.toDocumentFragment();
        tmp.appendChild(frag);
        return tmp.innerHTML;
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Fragment', {
        value: Fragment, writable: false, enumerable: false, configurable: false,
    });
}

export default Fragment;
