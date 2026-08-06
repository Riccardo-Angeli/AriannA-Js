# Core File Anatomy

A Core file follows this order:

1. complete module header;
2. runtime imports;
3. blank line;
4. `import type` Schema imports;
5. one exported owning namespace;
6. Schema aliases;
7. public classes;
8. private implementation;
9. canonical `Services.Service` registration;
10. one default export after the namespace.

```ts
import { Services } from './Service.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

export namespace Workers
{
    export type Options =
        SchemaInterfaces.Workers.Options;

    export class Worker
    {
    }

    const Service =
        new Services.Service<ServiceContract>
        (
            'worker',
            {
            }
        );
}

export default Workers.Worker;
```

Core types live in `schema/Types.ts`. Core interfaces live in `schema/Interfaces.ts`. A Core module aliases them locally; it does not recreate local `Types` or `Interfaces` namespaces.

Do not create a duplicate `Runtime` class merely to implement `ServiceContract`. The existing class or service object implements the contract, while `Services.Service` owns registration and singleton semantics.
