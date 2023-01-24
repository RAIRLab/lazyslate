
# Lazyslate

## Info

Lazyslate is an open source graphical proof construction assistant for the creation of Natural Deduction proofs. 
It is influenced by the commercial Hyperslate Proof Assistant which has many more features and additional logics. 

## Features

### Logics

Lazyslate currently only supports propositional calculus. 
For compound expressions it supports negation, conjunction, disjunction, implication, and bi-implication.
The inference rules include introduction and elimination rules for each of the above operators. 
Some of these inference rules may not be in a form familiar to some readers, particularly biconditional
introduction and elimination.

We enumerate all of our inference rules here.
```
Negation Introduction (Reductio ad absurdum):
A |- B
A |- ~B
----------
~A

Negation Elimination (Law of excluded middle):
~A |- B
~A |- ~B
----------
A

Conjunction Introduction (Adjunction):
A
B
----------
A /\ B

Conjunction Elimination (Simplification):
A /\ B          A /\ B
----------  or  ----------
A               B

Disjunction Introduction (Addition):
A               B
----------  or  ----------
A \/ B          A \/ B 

Disjunction Elimination (Case analysis):
A |- C
B |- C
A \/ B
----------
C

Conditional Introduction (Deduction theorem):
A |- B
----------
A -> B

Conditional Elimination (Modus ponens):
A -> B
A
----------
B

Biconditional Introduction:
A |- B
B |- A
----------
A <-> B

Biconditional Elimination:
A <-> B       A <-> B
A             B
---------- or ---------- 
B             A

```

Formula representation and input by the user is done via S-Expressions. 
You can read more about how to read and write S-expressions are represented in our `S-Expressions.md`.

### Proof Sharing

Lazyslate can store proofs as `.json` files by clicking the Download Proof button.
Proofs can be uploaded by clicking the Choose File button and selecting the file.