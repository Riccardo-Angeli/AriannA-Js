# Namespace-First Architecture

AriannA organizes implementation by capability.

```ts
export namespace SSR
{
    export class Island
    {
    }

    export class Renderer
    {
    }

    const Service =
        new Services.Service<ServiceContract>(...);
}

export default SSR;
```

Namespaces provide discoverability, classes own behavior, Schema owns Core contracts and Services provide controlled integration. This prevents free-function drift, duplicate registries, accidental globals, type/runtime collisions and compatibility bridges.
