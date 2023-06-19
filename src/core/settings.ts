
/**
 * @fileoverview This file contains global settings and constants used by lazyslate
 */

/** Maps logical operator strings to their respective unicode logic symbol */
export const logicalOperatorSymbols : Map<string, string> = new Map(Object.entries({
    "not" : "\u00AC",
    "and" : "\u2227",
    "or" : "\u2228",
    "if" : "\u27F6",
    "iff" : "\u27F7",
    "forall" : "\u2200",
    "exists" : "\u2203",
}));

/** The list of all supported logical operator names */
export const logicalOperatorNames : Array<string> = Array.from(logicalOperatorSymbols.keys());

/** 
 * A list of all the infrence rules supported, their short names an their full names.
 * Short names are expected to be the name of something in logicalOperatorNames followed
 * by an I or E for introduction or elimination.
 */
export const inferenceRules : Array<{name:string,fullname:string}> = [
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
    {name: "forallI", fullname: "Universal Introduction (Universal Generalization)", },
    {name: "forallE", fullname: "Universal Elimination (Universal Instantiation)", },
    {name: "existsI", fullname: "Existential Introduction (Existential Generalization)", },
    {name: "existsE", fullname: "Existential Elimination (Existential Instantiation)", },
];

//Create unicode inference rule symbols for the link labels
export const inferenceRuleSymbols : Map<string, string> = new Map(Object.entries({"assume":"Assume"}));
for(let i = 1; i < inferenceRules.length; i++){
    let name = inferenceRules[i].name;
    inferenceRuleSymbols.set(name, logicalOperatorSymbols.get(name.slice(0, -1))+name.slice(-1));
}

//Global export of settings
window["logicalOperatorSymbols"] = logicalOperatorSymbols;
window["logicalOperatorNames"] = logicalOperatorNames;
window["inferenceRules"] = inferenceRules;
window["inferenceRuleSymbols"] = inferenceRuleSymbols;