# Templates

`Templates.Template` compiles immutable template definitions.

```ts
const html =
    Templates.Template.Html;

const view =
    html`<span>{{ this.Value }}</span>`;
```

`Template.Create` owns caching. `Template.Html` and `Template.Css` are static tagged-template helpers. Consumers use the named `Templates` binding from the Core barrel.
