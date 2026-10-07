import type {Three} from '../Three.ts';
import type {ModelLoadOptions,ModelPrimitive,Model3DAsset,Mesh3DLike,DXFEntity,DXFEntityList,DxfToSvgOptions,Loader2D,Loader3D,LoaderAny,LoadResult} from './Types.ts';
type Engine=Pick<typeof Three,'BufferGeometry'|'Mesh'|'Vec2'|'Vec3'|'Vec4'|'Quaternion'|'Mat4'|'MeshBasicMaterial'>;
type BufferGeometry=Three.BufferGeometry;type Mesh=Three.Mesh;type Vec3=Three.Vec3;
export function createDxf(engine:Engine){
const {BufferGeometry,Mesh,Vec2,Vec3,Vec4,Quaternion,Mat4,MeshBasicMaterial}=engine;
const DXFLoader = {

        /** Parse a DXF text string into a normalized entity list. */
        parse(text: string): DXFEntityList
        {
            const lines = text.replace(/\r\n/g, '\n').split('\n');
            const pairs: { code: number; value: string }[] = [];
            for (let i = 0; i + 1 < lines.length; i += 2) {
                const code = parseInt(lines[i].trim(), 10);
                const value = lines[i + 1] ?? '';
                if (!Number.isNaN(code)) pairs.push({ code, value });
            }

            const entities: DXFEntity[] = [];
            const layers: Map<string, { color: number; name: string }> = new Map();
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const bump = (x: number, y: number) => {
                if (x < minX) minX = x; if (x > maxX) maxX = x;
                if (y < minY) minY = y; if (y > maxY) maxY = y;
            };

            let i = 0;
            let section: string | null = null;
            let inEntity = false;
            let curType = '';
            let cur: Record<string, unknown> = {};
            const flush = () => {
                if (!curType) return;
                const layer = (cur.layer as string) ?? '0';
                const color = cur.color as number | undefined;
                try {
                    switch (curType) {
                        case 'LINE':
                            entities.push({ type: 'LINE',
                                x1: +(cur.x1 ?? 0), y1: +(cur.y1 ?? 0),
                                x2: +(cur.x2 ?? 0), y2: +(cur.y2 ?? 0),
                                layer, color });
                            bump(+(cur.x1 ?? 0), +(cur.y1 ?? 0));
                            bump(+(cur.x2 ?? 0), +(cur.y2 ?? 0));
                            break;
                        case 'CIRCLE':
                            entities.push({ type: 'CIRCLE',
                                cx: +(cur.x1 ?? 0), cy: +(cur.y1 ?? 0),
                                r: +(cur.radius ?? 0), layer, color });
                            bump(+(cur.x1 ?? 0) - +(cur.radius ?? 0), +(cur.y1 ?? 0) - +(cur.radius ?? 0));
                            bump(+(cur.x1 ?? 0) + +(cur.radius ?? 0), +(cur.y1 ?? 0) + +(cur.radius ?? 0));
                            break;
                        case 'ARC':
                            entities.push({ type: 'ARC',
                                cx: +(cur.x1 ?? 0), cy: +(cur.y1 ?? 0),
                                r: +(cur.radius ?? 0),
                                startAngle: +(cur.startAngle ?? 0),
                                endAngle:   +(cur.endAngle ?? 0),
                                layer, color });
                            bump(+(cur.x1 ?? 0) - +(cur.radius ?? 0), +(cur.y1 ?? 0) - +(cur.radius ?? 0));
                            bump(+(cur.x1 ?? 0) + +(cur.radius ?? 0), +(cur.y1 ?? 0) + +(cur.radius ?? 0));
                            break;
                        case 'POINT':
                            entities.push({ type: 'POINT', x: +(cur.x1 ?? 0), y: +(cur.y1 ?? 0), layer, color });
                            bump(+(cur.x1 ?? 0), +(cur.y1 ?? 0));
                            break;
                        case 'TEXT':
                        case 'MTEXT':
                            entities.push({ type: curType, x: +(cur.x1 ?? 0), y: +(cur.y1 ?? 0),
                                height: +(cur.height ?? 1), value: (cur.value as string) ?? '', layer, color });
                            bump(+(cur.x1 ?? 0), +(cur.y1 ?? 0));
                            break;
                        case 'LWPOLYLINE':
                        case 'POLYLINE': {
                            const pts = cur.points as [number, number][] ?? [];
                            if (pts.length === 0) break;
                            entities.push({ type: curType,
                                points: pts, closed: !!cur.closed, layer, color });
                            for (const [x, y] of pts) bump(x, y);
                            break;
                        }
                        case 'ELLIPSE':
                            entities.push({ type: 'ELLIPSE',
                                cx: +(cur.x1 ?? 0), cy: +(cur.y1 ?? 0),
                                rx: +(cur.rx ?? 1), ry: +(cur.ry ?? 1),
                                rotation: +(cur.rotation ?? 0), layer, color });
                            break;
                        case 'INSERT':
                            entities.push({ type: 'INSERT',
                                x: +(cur.x1 ?? 0), y: +(cur.y1 ?? 0),
                                blockName: (cur.blockName as string) ?? '', layer });
                            break;
                    }
                } catch (e) {
                    console.warn(`[Three] DXFLoader failed entity ${curType}:`, e);
                }
                curType = '';
                cur = {};
            };

            for (i = 0; i < pairs.length; i++) {
                const { code, value } = pairs[i];

                if (code === 0) {
                    flush();
                    if (value === 'SECTION') {
                        inEntity = false;
                        section = null;
                    } else if (value === 'ENDSEC') {
                        section = null;
                        inEntity = false;
                    } else if (section === 'ENTITIES') {
                        curType = value;
                        inEntity = true;
                        cur = {};
                    } else if (section === 'TABLES' && value === 'LAYER') {
                        cur = {};
                        curType = '__LAYER__';
                        inEntity = true;
                    } else {
                        inEntity = false;
                    }
                    continue;
                }

                if (section === null && code === 2 && pairs[i - 1]?.value === 'SECTION') {
                    section = value;
                    continue;
                }

                if (!inEntity) continue;

                switch (code) {
                    case 8:   cur.layer = value; break;
                    case 62:  cur.color = parseInt(value, 10); break;
                    case 10:  cur.x1 = parseFloat(value); break;
                    case 20:  cur.y1 = parseFloat(value); break;
                    case 11:  cur.x2 = parseFloat(value); break;
                    case 21:  cur.y2 = parseFloat(value); break;
                    case 40:
                        if (curType === 'CIRCLE' || curType === 'ARC') cur.radius = parseFloat(value);
                        else if (curType === 'TEXT' || curType === 'MTEXT') cur.height = parseFloat(value);
                        else if (curType === 'ELLIPSE') cur.rx = parseFloat(value);
                        break;
                    case 41: if (curType === 'ELLIPSE') cur.ry = parseFloat(value); break;
                    case 50:
                        if (curType === 'ARC') cur.startAngle = parseFloat(value);
                        else if (curType === 'ELLIPSE') cur.rotation = parseFloat(value);
                        break;
                    case 51: if (curType === 'ARC') cur.endAngle = parseFloat(value); break;
                    case 1:
                        if (curType === 'TEXT' || curType === 'MTEXT') cur.value = value;
                        break;
                    case 2:
                        if (curType === 'INSERT') cur.blockName = value;
                        else if (curType === '__LAYER__') cur.layerName = value;
                        break;
                    case 70:
                        if (curType === 'LWPOLYLINE' || curType === 'POLYLINE') {
                            cur.closed = (parseInt(value, 10) & 1) !== 0;
                        }
                        break;
                    default: break;
                }

                if (curType === 'LWPOLYLINE' && code === 10) {
                    const x = parseFloat(value);
                    const nextY = pairs[i + 1];
                    if (nextY?.code === 20) {
                        const y = parseFloat(nextY.value);
                        cur.points = (cur.points as [number, number][] ?? []);
                        (cur.points as [number, number][]).push([x, y]);
                        i++;
                    }
                }

                if (curType === '__LAYER__' && cur.layerName) {
                    const name = cur.layerName as string;
                    const col  = cur.color as number ?? 7;
                    layers.set(name, { color: col, name });
                }
            }
            flush();

            if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 0; maxY = 0; }

            return { entities, layers, bounds: { minX, minY, maxX, maxY } };
        },

        async load(url: string): Promise<DXFEntityList>
        {
            const r = await fetch(url);
            if (!r.ok) throw new Error(`DXFLoader: HTTP ${r.status}`);
            return DXFLoader.parse(await r.text());
        },
    };

const ACI_COLORS: Record<number, string> = {
        1: '#ff0000', 2: '#ffff00', 3: '#00ff00', 4: '#00ffff',
        5: '#0000ff', 6: '#ff00ff', 7: '#000000', 8: '#414141',
        9: '#808080', 30: '#ff7f00', 250: '#333333', 251: '#505050',
        252: '#696969', 253: '#828282', 254: '#bebebe', 256: 'byLayer',
    };

function _escapeXml(s: string): string
    {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

function dxfToSVG(dxf: DXFEntityList, opts: DxfToSvgOptions = {}): string
    {
        const width       = opts.width ?? 1200;
        const height      = opts.height ?? 900;
        const padding     = opts.padding ?? 50;
        const strokeWidth = opts.strokeWidth ?? 1;
        const strokeColor = opts.strokeColor ?? '#0d1117';
        const background  = opts.background ?? '#ffffff';
        const layersFilter = opts.layers ? new Set(opts.layers) : null;
        const flipY       = opts.flipY !== false;

        const srcW = (dxf.bounds.maxX - dxf.bounds.minX) || 1;
        const srcH = (dxf.bounds.maxY - dxf.bounds.minY) || 1;
        const innerW = width  - padding * 2;
        const innerH = height - padding * 2;
        const scale = Math.min(innerW / srcW, innerH / srcH);
        const offsetX = padding + (innerW - srcW * scale) / 2 - dxf.bounds.minX * scale;
        const offsetY = padding + (innerH - srcH * scale) / 2 - dxf.bounds.minY * scale;

        const tx = (x: number) => x * scale + offsetX;
        const ty = (y: number) => flipY ? (height - (y * scale + offsetY)) : (y * scale + offsetY);
        const tr = (r: number) => r * scale;

        const colorOf = (e: { layer: string; color?: number }): string => {
            if (e.color !== undefined && e.color !== 256) {
                return ACI_COLORS[e.color] ?? strokeColor;
            }
            const layer = dxf.layers.get(e.layer);
            if (layer && layer.color !== 256) {
                return ACI_COLORS[layer.color] ?? strokeColor;
            }
            return strokeColor;
        };

        const parts: string[] = [];
        parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`);
        if (background) parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${background}"/>`);

        const byLayer: Map<string, DXFEntity[]> = new Map();
        for (const e of dxf.entities) {
            if (layersFilter && !layersFilter.has(e.layer)) continue;
            if (!byLayer.has(e.layer)) byLayer.set(e.layer, []);
            byLayer.get(e.layer)!.push(e);
        }

        for (const [layerName, list] of byLayer) {
            parts.push(`<g data-layer="${_escapeXml(layerName)}">`);
            for (const e of list) {
                const stroke = colorOf(e);
                switch (e.type) {
                    case 'LINE':
                        parts.push(`<line x1="${tx(e.x1)}" y1="${ty(e.y1)}" x2="${tx(e.x2)}" y2="${ty(e.y2)}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
                        break;
                    case 'CIRCLE':
                        parts.push(`<circle cx="${tx(e.cx)}" cy="${ty(e.cy)}" r="${tr(e.r)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
                        break;
                    case 'ARC': {
                        const a0 = e.startAngle * Math.PI / 180;
                        const a1 = e.endAngle   * Math.PI / 180;
                        const x0 = e.cx + Math.cos(a0) * e.r;
                        const y0 = e.cy + Math.sin(a0) * e.r;
                        const x1 = e.cx + Math.cos(a1) * e.r;
                        const y1 = e.cy + Math.sin(a1) * e.r;
                        const sweep = a1 > a0 ? 1 : 0;
                        const large = (Math.abs(a1 - a0) > Math.PI) ? 1 : 0;
                        parts.push(`<path d="M ${tx(x0)} ${ty(y0)} A ${tr(e.r)} ${tr(e.r)} 0 ${large} ${flipY ? 1 - sweep : sweep} ${tx(x1)} ${ty(y1)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
                        break;
                    }
                    case 'POINT':
                        parts.push(`<circle cx="${tx(e.x)}" cy="${ty(e.y)}" r="1" fill="${stroke}"/>`);
                        break;
                    case 'TEXT':
                    case 'MTEXT':
                        parts.push(`<text x="${tx(e.x)}" y="${ty(e.y)}" font-size="${tr(e.height)}" fill="${stroke}">${_escapeXml(e.value)}</text>`);
                        break;
                    case 'POLYLINE':
                    case 'LWPOLYLINE': {
                        const d = e.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${tx(x)} ${ty(y)}`).join(' ') + (e.closed ? ' Z' : '');
                        parts.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
                        break;
                    }
                    case 'ELLIPSE':
                        parts.push(`<ellipse cx="${tx(e.cx)}" cy="${ty(e.cy)}" rx="${tr(e.rx)}" ry="${tr(e.ry)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" transform="rotate(${e.rotation} ${tx(e.cx)} ${ty(e.cy)})"/>`);
                        break;
                    case 'INSERT':
                        parts.push(`<circle cx="${tx(e.x)}" cy="${ty(e.y)}" r="2" fill="${stroke}" data-block="${_escapeXml(e.blockName)}"/>`);
                        break;
                }
            }
            parts.push(`</g>`);
        }

        parts.push(`</svg>`);
        return parts.join('');
    }
return {DXFLoader,dxfToSVG};
}
