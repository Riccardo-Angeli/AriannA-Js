# Addon File Anatomy

Addons follow Core ownership discipline, while addon-specific contracts may remain inside the addon namespace.

```ts
export namespace Three
{
    export namespace Types
    {
        export type Precision =
            'lowp' |
            'mediump' |
            'highp';
    }

    export namespace Interfaces
    {
        export interface Options
        {
            Precision? : Types.Precision;
        }
    }

    export class Vector
    {
    }
}

export default Three;
```

Imported constructors re-exported as runtime constants do not automatically become types. Use the original imported type name or declare an explicit type alias.
