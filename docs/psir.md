
# PSIR — Prismatic Substrate IR

PSIR beskriver system som **entiteter**, **krafter** (constraints), **fält** (datadomäner), **invarianta regler** och **mätare**.

## Mini‑grammatik
```
system <Name> {
  @entity <Name>(prop:type[, ...])
  @force  <Name>(on:<Entity>[, constraint...])
  @field  <Domain>.<name>:<type>
  @invariant <expr>
  @meter <name>(arg[, ...])-><unit>
}
# Kommentarer med # eller //
# typer: string|number|boolean|uuid|int|float|enum[OPT|...]
```

## Exempel
```
system Checkout {
  @entity User(id:uuid, role:enum[ADMIN|USER])
  @entity Order(id:uuid, total:float)
  @force  RateLimit(on:User, qps<=10)
  @invariant Order.total >= 0
  @meter parse_ms(sys)->ms
}
```

## Artefakter
- **FeatureSpec**: Lista av features (entities/forces/fields).  
- **ModuleSpec**: Minimoduler per feature‑grupp.  
- **APISpec**: CRUD för entiteter (+ hooks för krafter).  
- **UIFlow**: Navigationsnoder genererade från entiteter/operationer.
