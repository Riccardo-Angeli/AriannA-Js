/**
 * @module    dom/Primitives
 * @version   2.0.0
 * @description Zero-dependency canonical DOM primitives used by compiler/runtime fast paths.
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 */
export namespace Primitives
{
    export const Create = (tag: string): Element => document.createElement(tag);
    export const CreateText = (value = ''): Text => document.createTextNode(value);
    export const CreateComment = (value = ''): Comment => document.createComment(value);
    export const CreateFragment = (): DocumentFragment => document.createDocumentFragment();
    export const CreateTemplate = (): HTMLTemplateElement => document.createElement('template');

    export const Append = (parent: Node, node: Node): Node => parent.appendChild(node);
    export const Before = (parent: Node, node: Node, anchor: Node | null): Node => parent.insertBefore(node, anchor);
    export const Insert = (parent: Node, node: Node, index: number): Node => parent.insertBefore(node, parent.childNodes[index] ?? null);
    export const Move = (parent: Node, node: Node, index: number): Node => Insert(parent, node, index);
    export const Remove = (node: Node): void => { node.parentNode?.removeChild(node); };

    export function Replace(target: Node | null | undefined, replacement: string | Node | null | undefined): Node | undefined
    {
        if(!target || !(target instanceof Node) || !target.parentNode || replacement == null) return undefined;
        let next: Node | null = null;
        if(typeof replacement === 'string')
        {
            const template = CreateTemplate();
            Html(template, replacement);
            next = template.content.firstElementChild ?? template.content.firstChild;
        }
        else if(replacement instanceof Node) next = replacement;
        if(!next) return undefined;
        if(next.parentNode) Remove(next);
        target.parentNode.replaceChild(next, target);
        return next;
    }

    export const Clear = (node: Node): void => { while(node.firstChild) node.removeChild(node.firstChild); };
    export const Text = (node: Text, value: string): void => { node.nodeValue = value; };
    export const Content = (node: Node, value: string): void => { node.textContent = value; };
    export const Html = (element: Element, value: string): void => { element.innerHTML = value; };
    export const AttachShadow = (host: Element, init: ShadowRootInit): ShadowRoot => host.shadowRoot ?? host.attachShadow(init);
    export const Attribute = (element: Element, name: string, value: string | null): void => { if(value === null) element.removeAttribute(name); else element.setAttribute(name, value); };
    export const Property = (element: Element, name: string, value: unknown): void => { (element as unknown as Record<string, unknown>)[name] = value; };
    export const Class = (element: Element, name: string, enabled: boolean): void => { element.classList.toggle(name, enabled); };
    export const Style = (element: HTMLElement, name: string, value: string | null): void => { if(value === null) element.style.removeProperty(name); else element.style.setProperty(name, value); };
    export const CssText = (element: HTMLElement, value: string): void => { element.style.cssText = value; };
}

export default Primitives;
