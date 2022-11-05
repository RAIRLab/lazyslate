

logicalOperatorSymbols = {
    "not" : "\u00AC",
    "and" : "\u2227",
    "or" : "\u2228",
    "if" : "\u21D2",
    "iff" : "\u21D4",
    "forall" : "\u2200",
    "exists" : "\u2203",
};

logicalOperatorNames = Object.keys(logicalOperatorSymbols);

inferenceRules = [
    {name: "assume", fullname: "Assumption"},
    {name: "notI", fullname: "Negation Introduction (Reductio ad absurdum)", },
    {name: "notE", fullname: "Negation Elimination (Law of excluded middle)", },
    {name: "andI", fullname: "Conjunction Introduction (Adjunction)",},
    {name: "andE", fullname: "Conjunction Elimination (Simplification)",},
    {name: "orI", fullname: "Disjunction Introduction (Addition)", },
    {name: "orE", fullname: "Disjunction Elimination (Case analysis)", },
    {name: "ifI", fullname: "Conditional Introduction (Deduction theorem)", },
    {name: "ifE", fullname: "Conditional Elimination (Modus ponens)", },
    {name: "iffI", fullname: "Biconditional Introduction", },
    {name: "iffE", fullname: "Biconditional Elimination", },
    {name: "forallI", fullname: "Universal Introduction", },
    {name: "forallE", fullname: "Universal Elimination", },
    {name: "existsI", fullname: "Existential Introduction", },
    {name: "existsE", fullname: "Existential Elimination", },
];

//Create unicode inference rule symbols for the link labels
inferenceRuleSymbols = {"assume":"Assume"};
for(let i = 1; i < inferenceRules.length; i++){
    let name = inferenceRules[i].name;
    inferenceRuleSymbols[name] = logicalOperatorSymbols[name.slice(0, -1)]+name.slice(-1);
}
