# Comments and JSDoc

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

Public API and architectural private members use structured JSDoc.

```ts
/** @name        EscapeHtml
 *  @public
 *  @static
 *  @param       {string} value Untrusted text or attribute content.
 *  @returns     {string} HTML-safe text.
 *  @description Escape characters with special meaning in HTML text and quoted attributes.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
```

Comments explain contracts, ownership, lifecycle, disposal, units, defaults and invariants. They do not narrate obsolete migrations or repeat syntax already visible in code.
