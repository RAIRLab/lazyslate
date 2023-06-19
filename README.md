
# Lazyslate

## Info

Lazyslate is an open source graphical proof construction assistant for the creation of Natural Deduction proofs. 
It is influenced by the commercial Hyperslate Proof Assistant which has many more features and additional logics. 

## Building

#### Dependancies

Depends on node and npm as development dependencies.

#### Building

```
npm install     #install all the requisite packages
npm run build   #build the project with webpack
```

## Features

### Logics

Lazyslate currently only supports propositional calculus. 
For compound expressions it supports negation, conjunction, disjunction, implication, and bi-implication.
The inference rules include introduction and elimination rules for each of the above operators. 
Some of these inference rules may not be in a form familiar to some readers, particularly biconditional
introduction and elimination.

We enumerate all of our inference rules here.
For an example of all of a proof space with
proofs containing examples of all the infrence rules
see [This Proof](https://james-oswald.github.io/lazyslate?proof=N4Igdg9gJgpgziAXAbVASykgDAGnAQwFsZs8YAPABwCd440IwkQBBEPAKwFc4AXNAGZoAxvn6Nm+OHC7F2IShHrimiUOSQBGACwB2bXgCeWgGzaAvuZzpMiTXjBESiEJvkUadBqpAAKCNQABCyBAEIAlPLcfIIiYt7MAQCS8orKCWogGnbaJrggxogAzEUATJbWIBhIpQ5ONWRUtNIZfpC8wZGcPPxCoirM7Sl4aWgDmdmlRQYFSNoAHCYVNkhFdXIuRe5NXhIuAIpRPbH9rYIAoqlKYxnqNWVGq6W6y1W2M44bINrbni17bQgHX2XRA0V6cXGICkMjkI2u4zuiAAnPZZsVSlhXtVEABWdbOEC437NegA3yCYKBEFHGJ9eIAmGyEjw9J7JGlTGPHJFbG2EwEpACkAeUmtNjdOmQ1pMuEKBG3LJaLBowo6cpWFaIXSCly6Em7HwSsHHelQ9qXVk3dlKvGo7m4zl8pDzXUgeYG-4+XztTq0iGnRnSZlXNmqJG5WrozS4+bOlG65GNP5knyHSUBhk+C6h63h2245Gu9HTXHxzT5T7OCvJsXk300jMnLOSYNy0aI216VWrbQWTVvLRoqvMTRuWuG5gUgSBH1AzrU0Hg5tQ2Us+VhpBIwv5NWx8tRkcuTSlT2pqf4MBQKkRf0rmVX4YbvNb23IrAzQplJYDnGaNYEBs-4Tl6zDGsuZoym264doq2TzLiOrRiYmjlh89Q5CB54uKEd6QUGsIwQqNrZEWwp7si5b4oBhIxmerS+Je14hLeTb4T4a65p22RjvMxZqiYZa-rYmjCkeolYeKeHSoyV6Ws+3FDkU5FPHGwlaEhR6uPqkkArhbEyRxclcXBWilCYKkYi86l2MW4nFqKk4uP4QQsUupqGa2hEmSRGlYEmJbaFiNmaAFWmhfRAIAMLSYG2YCPJsG+bZJhRl+RRqZUOJcjRzCYpFPgxQZcXMDmVqKYgmLPNy0zBVltilMOGEgI1BVTpSIRRe5UolS4nHlaZKWWTGmVapybqcm1zmUqEgRdbFLZ9dBPn5pMWAlNyMb9vV9y6lMuk+PpJo9Yt0LLQNyWNboaVaLiQk7ZV6EbKUMyOaBLjgR5vVnd5F2rRp43RoW8alNRR6gwdzBFcdmZQgEiXEf9tkLA6ykg2JzXmVNrALau50KYNL1FEhAm8jZ1W5S4zzYy5N7dbDrTJCtr6TNopQBelP4PaUdmYx6kPTTOIS0259P3gCghPklSMvVgu5ILiRR1WNYUYezAs48Vp39QTl2CfxfnxkrbpK9jR0QZ5LhlbrMu6MBJZOjZRRNV8zs0x1YRi+xXkhn9LM1Lo8yfqYlFO4eGEPCKOzvX4ghC57uNnAIAhS4j-vFKJHNzLoyuDsUAFHhtUcplJWt479Nvp+zyLDTnRtPc40wa+bX3a-j0vpyUiGbRZRtgxH1Fvdhsfx6xMPixx7dpxMqwVsHdh20bGMbMpzeJxLCXMzPxTrZZZRkw9xMmzpxd1t6M1+mXUEVx32-71ndgmKNecZbqr+n05mvj97Vub37d-swAl+UGRtVau2RO7ZOdN16TxvtPJEylFibWBjZIKuo0Efxjp9E65dfaVzvriFCPdc44m0C7QkZCzYwJ9u2eBtoMrGyBs-Uh4cvhs2xtghmG8-74IQboCyNVGrxm0AXDCIi15X24QjTcd8ULzzKBqAAungAANmgMAABrBAKBkC4E0Mo5A+IigGIFMYnAyA1ilAMQYKx5iay6AMUmBxdj7DIgMa6Nxdi1gngMToHAPi7H4lEr4oJzjkCNX8Z48JtRMQGJepEuJlisC+NdKDXxSY0nmK5Jk8JApnhxJ1DzOJSYlYGOdjgUp5iNrKTKUYkwZSdQZTKQYJpVTTG2Isa6MoZSkxs2sfYPp5i0EiJ6TgEZijzBAA)

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

#### Downloading As JSON files
Lazyslate can save proofs as `.json` files by clicking the "Download Proof" button.
Proofs can be uploaded by clicking the Choose File button and selecting the file.

#### Link Sharing
Alternatively to downloading, links to proofs can be generated via the "Copy Link To Proof" button.
This will generate an lz compressed version of the JSON proof as a URI parameter that will be 
decompressed and loaded when the link is clicked.
