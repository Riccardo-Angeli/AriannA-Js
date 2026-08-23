# Templates — Architecture 2.0

> **Version:** 2.0

Template plans structure, bindings, sinks, lists, events, scopes, and mount lifecycle. It is not a DOM engine. Compiled Template output should become a compact execution plan and commit through Real primitives. Generic runtime operation decoding should be removed from hot paths whenever the compiler already knows the operation.
