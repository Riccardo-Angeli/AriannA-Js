# Normative Overview

A source file is the implementation of one namespace-owned capability, not a bag of declarations.

Every declaration must answer:

1. Who owns it?
2. Is it runtime or type-only?
3. Is it public or private?
4. Is it class-wide or instance-specific?
5. Is it part of a service contract?
6. Does it need to be exported?

A declaration without a clear owner must be moved or removed.
