
# S-Expressions 

An expression can either be a propositional constant, predicate, or compound expression 

## Propositional constants
Propositional constants represent a true or false statement. In the editor they are represented as a single fully connected alphanumeric string not enclosed by any parenthesis.
Some examples:
```
x
```

```
phi
```

```
psi
```

## Compound Expressions

Logical Negation of an expression A
```
(not A)
```

Logical And between two expressions A, B
```
(and A B)
```

Logical Or between two expressions A, B
```
(or A B)
```

Material Implication between two expressions A, B
```
(if A B)
```

Logical biconditional between two expressions A, B
```
(iff A B)
```

Some example compound expressions:

phi and psi
```
(and phi psi)
```

if phi then A or B
```
(if phi (or A B))
```

