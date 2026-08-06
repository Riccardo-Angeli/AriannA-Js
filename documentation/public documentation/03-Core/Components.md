# Components

`Components.Component` is a class and `Component.Callable` is its callable public proxy.

Supported forms:

```ts
Component(element);
Component('#selector');

@Component('arianna-example', {}, { Attributes: ['value'] })
class Example extends HTMLElement
{
}
```

The decorator installs the AriannA prototype surface, defines namespace metadata and returns a constructor proxy. The Core barrel exports the callable surface as the named binding `Component`.
