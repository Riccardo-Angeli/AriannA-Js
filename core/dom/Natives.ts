/**
 * @module      core/dom/Natives
 * @version     2.0.0
 * @description Native DOM namespace metadata pack. Owns the built-in HTML, SVG, MathML and X3D definitions and
 *              registers them behind the kernel service seam. Full distributions may install this pack;
 *              slim runtimes may omit it and fall back to native DOM creation through Real.
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Services } from '../kernel/Services.ts';

import type { Interfaces } from '../definitions/Interfaces.ts';

export namespace Natives
{
    export type Installation = Partial<
        {
            html   : Interfaces.Namespaces.Runtime;
            svg    : Interfaces.Namespaces.Runtime;
            mathML : Interfaces.Namespaces.Runtime;
            x3d    : Interfaces.Namespaces.Runtime;
        }>;

    let installation: Installation | null = null;

    export function Install(): Installation
    {
        if(installation)
        {
            return installation;
        }

        const namespaces = Services.Namespaces;
        if(!namespaces)
        {
            return {};
        }

        const html = namespaces.Create('html', {
            Uri: 'http://www.w3.org/1999/xhtml',
            NS: false,
            Base: HTMLElement,
            Schema: 'http://www.w3.org/1999/xhtml',
            Documentation: { w3c: 'https://html.spec.whatwg.org/' },
            Types: {
                Standard: {
                    Interfaces: {
                        HTMLElement: {
                            Tags: [
                                'address', 'article', 'footer', 'header', 'section', 'nav', 'dd', 'dt',
                                'figcaption', 'figure', 'main', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code',
                                'dfn', 'em', 'i', 'mark', 'rt', 'rtc', 'ruby', 's', 'samp', 'small', 'strong',
                                'sub', 'sup', 'u', 'var', 'wbr', 'area', 'noscript', 'noembed', 'plaintext',
                                'strike', 'tt', 'summary', 'acronym', 'basefont', 'big', 'center',
                            ]
                        },
                        HTMLUnknownElement: { Tags: ['isindex', 'spacer', 'menuitem', 'decorator', 'applet', 'blink', 'keygen'] },
                        HTMLHtmlElement: { Tags: ['html'] },
                        HTMLBaseElement: { Tags: ['base'] },
                        HTMLHeadElement: { Tags: ['head'] },
                        HTMLLinkElement: { Tags: ['link'] },
                        HTMLMetaElement: { Tags: ['meta'] },
                        HTMLStyleElement: { Tags: ['style'] },
                        HTMLTitleElement: { Tags: ['title'] },
                        HTMLPreElement: { Tags: ['pre', 'listing', 'xmp'] },
                        HTMLHeadingElement: { Tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
                        HTMLDivElement: { Tags: ['div'] },
                        HTMLDListElement: { Tags: ['dl'] },
                        HTMLHRElement: { Tags: ['hr'] },
                        HTMLLIElement: { Tags: ['li'] },
                        HTMLOListElement: { Tags: ['ol'] },
                        HTMLParagraphElement: { Tags: ['p'] },
                        HTMLUListElement: { Tags: ['ul'] },
                        HTMLAnchorElement: { Tags: ['a'] },
                        HTMLBRElement: { Tags: ['br'] },
                        HTMLQuoteElement: { Tags: ['quote'] },
                        HTMLSpanElement: { Tags: ['span'] },
                        HTMLAudioElement: { Tags: ['audio'] },
                        HTMLImageElement: { Tags: ['img'] },
                        HTMLMapElement: { Tags: ['map'] },
                        HTMLTrackElement: { Tags: ['track'] },
                        HTMLVideoElement: { Tags: ['video'] },
                        HTMLEmbedElement: { Tags: ['embed'] },
                        HTMLIFrameElement: { Tags: ['iframe'] },
                        HTMLObjectElement: { Tags: ['object'] },
                        HTMLParamElement: { Tags: ['param'] },
                        HTMLSourceElement: { Tags: ['source'] },
                        HTMLCanvasElement: { Tags: ['canvas'] },
                        HTMLScriptElement: { Tags: ['script'] },
                        HTMLModElement: { Tags: ['ins', 'del'] },
                        HTMLTableCaptionElement: { Tags: ['caption'] },
                        HTMLTableColElement: { Tags: ['col', 'colgroup'] },
                        HTMLTableElement: { Tags: ['table'] },
                        HTMLTableSectionElement: { Tags: ['tbody', 'thead', 'tfoot'] },
                        HTMLTableCellElement: { Tags: ['td', 'th'] },
                        HTMLTableRowElement: { Tags: ['tr'] },
                        HTMLButtonElement: { Tags: ['button'] },
                        HTMLDataListElement: { Tags: ['datalist'] },
                        HTMLFieldSetElement: { Tags: ['fieldset'] },
                        HTMLFormElement: { Tags: ['form'] },
                        HTMLInputElement: { Tags: ['input'] },
                        HTMLLabelElement: { Tags: ['label'] },
                        HTMLLegendElement: { Tags: ['legend'] },
                        HTMLOptGroupElement: { Tags: ['optgroup'] },
                        HTMLOptionElement: { Tags: ['option'] },
                        HTMLProgressElement: { Tags: ['progress'] },
                        HTMLSelectElement: { Tags: ['select'] },
                        HTMLTextAreaElement: { Tags: ['textarea'] },
                        HTMLMenuElement: { Tags: ['menu'] },
                        HTMLDirectoryElement: { Tags: ['dir'] },
                        HTMLFrameElement: { Tags: ['frame'] },
                        HTMLFrameSetElement: { Tags: ['frameset'] }
                    },
                    Tags: {}
                },
                Custom: { Constructors: {}, Tags: {} },
            }
        });
        const svg = namespaces.Create('svg', {
            Uri: 'http://www.w3.org/2000/svg',
            NS: true,
            Base: SVGElement,
            Schema: 'http://www.w3.org/2000/svg',
            Documentation: { w3c: 'https://www.w3.org/TR/SVG2/' },
            Types: {
                Standard: {
                    Interfaces: {
                        SVGAElement: { Tags: ['a'] },
                        SVGAltGlyphDefElement: { Tags: ['altglyph'] },
                        SVGAltGlyphElement: { Tags: ['altglyph'] },
                        SVGAltGlyphItemElement: { Tags: ['altglyph'] },
                        SVGAnimateColorElement: { Tags: ['animatecolor'] },
                        SVGAnimateElement: { Tags: ['animate'] },
                        SVGAnimateMotionElement: { Tags: ['animatemotion'] },
                        SVGAnimateTransformElement: { Tags: ['animatetransform'] },
                        SVGAnimationElement: { Tags: ['animate', 'animatemotion', 'animatetransform'] },
                        SVGCircleElement: { Tags: ['circle'] },
                        SVGClipPathElement: { Tags: ['clippath'] },
                        SVGCursorElement: { Tags: ['cursor'] },
                        SVGDefsElement: { Tags: ['defs'] },
                        SVGDescElement: { Tags: ['desc'] },
                        SVGEllipseElement: { Tags: ['ellipse'] },
                        SVGFEBlendElement: { Tags: ['feblend'] },
                        SVGFEColorMatrixElement: { Tags: ['fecolormatrix'] },
                        SVGFEComponentTransferElement: { Tags: ['fecomponenttransfer'] },
                        SVGFECompositeElement: { Tags: ['fecomposite'] },
                        SVGFEConvolveMatrixElement: { Tags: ['feconvolvematrix'] },
                        SVGFEDiffuseLightingElement: { Tags: ['fediffuselighting'] },
                        SVGFEDisplacementMapElement: { Tags: ['fedispatchmap'] },
                        SVGForeignObjectElement: { Tags: ['foreignobject'] },
                        SVGGElement: { Tags: ['g'] },
                        SVGGlyphElement: { Tags: ['glyph'] },
                        SVGGlyphRefElement: { Tags: ['glyphref'] },
                        SVGGradientElement: { Tags: ['lineargradient', 'radialgradient'] },
                        SVGHKernElement: { Tags: ['hkern'] },
                        SVGImageElement: { Tags: ['image'] },
                        SVGLinearGradientElement: { Tags: ['lineargradient'] },
                        SVGLineElement: { Tags: ['line'] },
                        SVGMarkerElement: { Tags: ['marker'] },
                        SVGMaskElement: { Tags: ['mask'] },
                        SVGMetadataElement: { Tags: ['metadata'] },
                        SVGMissingGlyphElement: { Tags: ['missing-glyph'] },
                        SVGMPathElement: { Tags: ['mpath'] },
                        SVGPathElement: { Tags: ['path'] },
                        SVGPolygonElement: { Tags: ['polygon'] },
                        SVGPolylineElement: { Tags: ['polyline'] },
                        SVGRadialGradientElement: { Tags: ['radialgradient'] },
                        SVGRectElement: { Tags: ['rect'] },
                        SVGScriptElement: { Tags: ['script'] },
                        SVGSetElement: { Tags: ['set'] },
                        SVGStopElement: { Tags: ['stop'] },
                        SVGStyleElement: { Tags: ['style'] },
                        SVGSVGElement: { Tags: ['svg'] },
                        SVGSwitchElement: { Tags: ['switch'] },
                        SVGSymbolElement: { Tags: ['symbol'] },
                        SVGTextContentElement: { Tags: ['text', 'tspan', 'tref', 'altglyph', 'textpath'] },
                        SVGTextElement: { Tags: ['text'] },
                        SVGTextPathElement: { Tags: ['textpath'] },
                        SVGTextPositioningElement: { Tags: ['altglyph', 'text', 'tspan'] },
                        SVGTitleElement: { Tags: ['title'] },
                        SVGTRefElement: { Tags: ['tref'] },
                        SVGTSpanElement: { Tags: ['tspan'] },
                        SVGUseElement: { Tags: ['use'] },
                        SVGViewElement: { Tags: ['view'] },
                        SVGVKernElement: { Tags: ['vkern'] }
                    },
                    Tags: {},
                },
                Custom: { Constructors: {}, Tags: {} }
            }
        });
        const mathML = namespaces.Create('mathML', {
            Uri: 'http://www.w3.org/1998/Math/MathML',
            NS: true,
            Base: (typeof MathMLElement !== 'undefined' ? MathMLElement : HTMLElement),
            Schema: 'http://www.w3.org/1998/Math/MathML',
            Documentation: { w3c: 'https://www.w3.org/TR/MathML3/' },
            Types: {
                Standard: {
                    Interfaces: {
                        MathMLElement: {
                            Tags: [
                                'math', 'mi', 'mo', 'mn', 'ms', 'mspace', 'mtext',
                                'mfrac', 'msqrt', 'mroot', 'mstyle', 'merror', 'mpadded', 'mphantom',
                                'mrow', 'mfenced', 'menclose',
                                'msub', 'msup', 'msubsup', 'munder', 'mover', 'munderover', 'mmultiscripts',
                                'mtable', 'mtr', 'mtd', 'mlabeledtr',
                                'maction',
                            ]
                        },
                    },
                    Tags: {}
                },
                Custom: { Constructors: {}, Tags: {} }
            }
        });
        const x3d = namespaces.Create('x3d', {
            Uri: 'http://www.web3d.org/specifications/x3d-namespace',
            NS: true,
            Base: HTMLElement,
            Schema: 'http://www.web3d.org/specifications/x3d-namespace',
            Documentation: { w3c: 'https://www.web3d.org/specifications/x3d-4.0/' },
            Types: {
                Standard: {
                    Interfaces: {},
                    Tags: {}
                },
                Custom: { Constructors: {}, Tags: {} }
            }
        });
        installation = { html, svg, mathML, x3d };

        return installation;
        
    }

    new Services.Service<{ Install(): Installation }>('natives', { Install });
}

export default Natives;
