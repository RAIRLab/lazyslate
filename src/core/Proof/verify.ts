/**
 * @fileoverview Functions that verify Proof Nodes of different types
 */

import { ProofNode } from "./proofNode";
import { lookupNode, proofNodes } from "./state";
import { SExpression } from "./sexpression";

export function verifyState():void{

}

export function verifyNode(node : ProofNode) : boolean{
    switch(node.justification) {
        case "assume":
            return verifyAssume(node);
        case "notI":
            return verifyNotIntro(node);
        case "notE":
            return verifyNotElim(node);
        case "andI":
            return verifyAndIntro(node);
        case "andE":
            return verifyAndElim(node);
        case "orI":
            return verifyOrIntro(node);
        case "orE":
            return verifyOrElim(node);
        case "ifI":
            return verifyIfIntro(node);
        case "ifE":
            return verifyIfElim(node);
        case "iffI":
            return verifyIffIntro(node);
        case "iffE":
            return verifyIffElim(node);
        case "existsI":
            return verifyExistsIntro(node);
        default:
            return false;
    }
}

// =============
// Assume Rule
// =============

function verifyAssume(node : ProofNode) : boolean {
    // Only need to update assumptions
    node.assumptions = new Set();
    node.assumptions.add(node.name);

    return true;
}

// ============
// AND Rules
// ===============

// Returns whether a given sExpression
// is AND rooted
function is_and_expression(expr : SExpression) : boolean {
    return expr.value == "and" && expr.children.length == 2
}

// Takes a node and verifies whether
// the formula is valid given the
// AND Intro rule.
// Also updates assumptions
function verifyAndIntro(node : ProofNode) : boolean {

    if (!is_and_expression(node.expression)) {
        return false;
    }

    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Ensure the subformulas match the parent
    // nodes
    for (const parent of node.parents) {
        // If the parent expression is not in the conjuncts, return false
        if (!node.expression.children[0].equals(parent.expression) &&
         !node.expression.children[1].equals(parent.expression)) {
            return false;
        }
    }

    // Update the assumptions of the node
    node.assumptions = new Set();
    for (const parent of node.parents) {
        for (const name of parent.assumptions) {
            node.assumptions.add(name);
        }
    }

    return true;
}

function verifyAndElim(node : ProofNode) : boolean {
    // Make sure we have only one parent node
    if (node.parents.length != 1) {
        return false;
    }

    let parent : ProofNode = node.parents[0];
    if (!is_and_expression(parent.expression)) {
        return false;
    }

    // Make sure expression is in one of the conjuncts of the parent expression
    let formula_match : boolean = false;
    for (const conjunct of parent.expression.children) {
        if (conjunct.equals(node.expression)) {
            formula_match = true;
        }
    }

    if (!formula_match) {
        return false;
    }

    // Update assumptions
    node.assumptions = new Set();
    for (const name of parent.assumptions) {
        node.assumptions.add(name);
    }

    return true;
}

// ============
// IF Rules
// ============

// Returns whether a given sExpression
// is IF rooted
function is_if_expression(expr : SExpression) : boolean {
    return expr.value == "if" && expr.children.length == 2
}

function verifyIfIntro(node : ProofNode) : boolean {
    if (!is_if_expression(node.expression)) {
        return false;
    }

    // Make sure we only have one parent node
    if (node.parents.length != 1) {
        return false;
    }

    // Make sure parent is the consequence
    let parent : ProofNode = node.parents[0];
    if (!node.expression.children[1].equals(parent.expression)) {
        return false;
    }

    // Make sure the antecedant is in the assumptions of the parent
    let antecedant_matched : boolean = false;
    let antecedant_name : string = null;
    for (const name of parent.assumptions) {
        let assumption_node : ProofNode = lookupNode(name);
        if (assumption_node.expression.equals(node.expression.children[0])) {
            antecedant_matched = true;
            antecedant_name = name;
        }
    }

    if (!antecedant_matched) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set()
    for (const name of parent.assumptions) {
        // Don't add antecedant assumption
        if (name != antecedant_name) {
            node.assumptions.add(name);
        }
    }

    return true;
}

function verifyIfElim(node : ProofNode) : boolean {
    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Check that the current node matches the consequent
    // of the if vertex
    if (is_if_expression(node.parents[0].expression) && !node.expression.equals(node.parents[0].expression.children[1])) {
        return false;
    }  else if  (is_if_expression(node.parents[1].expression) && !node.expression.equals(node.parents[1].expression.children[1])) {
        return false;
    }

    // Second parent is the antecedant of the first
    let match1 : boolean = is_if_expression(node.parents[0].expression) &&
        node.parents[1].expression.equals(node.parents[0].expression.children[0]);

    // First parent is the antecedant of the second
    let match2 : boolean = is_if_expression(node.parents[1].expression) &&
        node.parents[0].expression.equals(node.parents[1].expression.children[0])



    if (match1 == false && match2 == false) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set();
    for (const parent of node.parents) {
        for (const name of parent.assumptions) {
            node.assumptions.add(name);
        }
    }

    return true;
}

// =============
// IFF Rules
// =============
function is_iff_expression(expr : SExpression) : boolean {
    return expr.value == "iff" &&
    expr.children.length == 2
}

function verifyIffIntro(node : ProofNode) : boolean {
    if (!is_iff_expression(node.expression)) {
        return false;
    }

    // Make sure we onl have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Match left and right side of Iff to a parent
    let leftParent : ProofNode = null;
    let rightParent : ProofNode = null;
    if (node.parents[0].expression.equals(node.expression.children[0])) {
        leftParent = node.parents[0];
        if (!node.parents[1].expression.equals(node.expression.children[1])) {
            return false;
        }
        rightParent = node.parents[1];
    } else {
        if (!node.parents[0].expression.equals(node.expression.children[1])) {
            return false;
        }
        rightParent = node.parents[0];

        if (!node.parents[1].expression.equals(node.expression.children[0])) {
            return false;
        }
        leftParent = node.parents[1];
    }

    // Check Forward Direction
    // Make sure antecedant is in the assumption of the parent
    let lantecedant_matched : boolean = false;
    let lantecedant_name : string = null;
    for (const name of leftParent.assumptions) {
        let assumption_node : ProofNode = lookupNode(name);
        if (assumption_node.expression.equals(node.expression.children[1])) {
            lantecedant_matched = true;
            lantecedant_name = name;
        }
    }

    if (!lantecedant_matched) {
        return false;
    }

    // Check Backward Direction
    // Make sure antecedant is in the assumption of the parent
    let rantecedant_matched : boolean = false;
    let rantecedant_name : string = null;
    for (const name of rightParent.assumptions) {
        let assumption_node : ProofNode = lookupNode(name);
        if (assumption_node.expression.equals(node.expression.children[0])) {
            rantecedant_matched = true;
            rantecedant_name = name;
        }
    }

    if (!rantecedant_matched) {
        return false;
    }


    // Update Assumptions
    node.assumptions = new Set();
    for (const name of leftParent.assumptions) {
        if (name != lantecedant_name) {
            node.assumptions.add(name);
        }
    }
    for (const name of rightParent.assumptions) {
        if (name != rantecedant_name) {
            node.assumptions.add(name);
        }
    }

    return true;
}

function verifyIffElim(node : ProofNode) : boolean {

    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Find which parent matches the current node
    let parentMatchInd : 0 | 1 | null = null;
    if (
        is_iff_expression(node.parents[0].expression) &&
        (node.parents[0].expression.children[0].equals(node.expression) ||
        node.parents[0].expression.children[1].equals(node.expression))
    ){
        parentMatchInd = 0;
    } else if (
        is_iff_expression(node.parents[1].expression) &&
        (node.parents[1].expression.children[0].equals(node.expression) ||
        node.parents[1].expression.children[1].equals(node.expression))
    ){
        parentMatchInd = 1;
    } else {
        return false;
    }

    if (parentMatchInd == 1) {
        // First parent is either the antecedant
        // or consequent of the second parent.
        let syntax_check1 : boolean = is_iff_expression(node.parents[1].expression) &&
        (
            node.parents[0].expression.equals(node.parents[1].expression.children[0]) ||
            node.parents[0].expression.equals(node.parents[1].expression.children[1])
        );
        if (!syntax_check1) {
            return false;
        }
    } else {
        // Second parent is either the antecedant
        // or consequent of the first parent
        let syntax_check1 : boolean = is_iff_expression(node.parents[0].expression) &&
        (
            node.parents[1].expression.equals(node.parents[0].expression.children[0]) ||
            node.parents[1].expression.equals(node.parents[0].expression.children[1])
        );
        if (!syntax_check1) {
            return false;
        }
    }

    // Update assumptions
    node.assumptions = new Set();
    for (const parent of node.parents) {
        for (const name of parent.assumptions) {
            node.assumptions.add(name);
        }
    }

    return true;
}

// ===============
// OR Rules
// ===============
function is_or_expression(expr : SExpression) : boolean {
    return expr.value == "or" &&
    expr.children.length == 2
}

function verifyOrIntro(node : ProofNode) : boolean {
    if (!is_or_expression(node.expression)) {
        return false;
    }

    // Make sure we only have one parent node
    if (node.parents.length != 1) {
        return false;
    }

    let match0 : boolean = node.expression.children[0].equals(node.parents[0].expression);
    let match1 : boolean = node.expression.children[1].equals(node.parents[0].expression);

    if (!match0 && !match1) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set();
    for (const name of node.parents[0].assumptions) {
        node.assumptions.add(name);
    }

    return true;
}

function verifyOrElim(node : ProofNode) : boolean {
    // Make sure we have three parent nodes
    if (node.parents.length != 3) {
        return false;
    }

    let orParentInd : number = null;
    let parentInd2 : number = null;
    let parentInd3 : number = null;

    for (let i : number = 0; i < node.parents.length; i++) {
        let parent : ProofNode = node.parents[i];
        if (parent.expression.equals(node.expression)) {
            if (parentInd2 == null) {
                parentInd2 = i;
            } else {
                parentInd3 = i;
            }
        } else if (is_or_expression(parent.expression)) {
            orParentInd = i;
        }
    }

    // Syntax Check: Two of the parents must match
    // the current formula, and the other must be
    // OR rooted.
    if (orParentInd === null || parentInd2 === null || parentInd3 === null) {
        return false;
    }

    let orParent : ProofNode = node.parents[orParentInd];
    let conjunctl_idx : number = null;
    let conjunctl_assumption_name : string = null;
    let conjunctr_idx : number = null;
    let conjunctr_assumption_name : string = null;

    for (const idx of [parentInd2, parentInd3]) {
        for (const name of node.parents[idx].assumptions) {
            let assumption_node : ProofNode = lookupNode(name);
            if (conjunctl_idx === null  && assumption_node.expression.equals(orParent.expression.children[0])) {
                conjunctl_idx = idx;
                conjunctl_assumption_name = name;
                break;
            }
            if (conjunctr_idx === null && assumption_node.expression.equals(orParent.expression.children[1])) {
                conjunctr_idx = idx;
                conjunctr_assumption_name = name;
                break;
            }
        }
    }

    if (conjunctl_idx === null || conjunctr_idx === null) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set();
    for (const name of node.parents[orParentInd].assumptions) {
        node.assumptions.add(name);
    }
    for (const name of node.parents[conjunctl_idx].assumptions) {
        if (name != conjunctl_assumption_name) {
            node.assumptions.add(name);
        }
    }
    for (const name of node.parents[conjunctr_idx].assumptions) {
        if (name != conjunctr_assumption_name) {
            node.assumptions.add(name);
        }
    }

    return true;
}

// ===============
// Not Rules
// ================
function is_not_expression(expr : SExpression) : boolean {
    return expr.value == "not" &&
    expr.children.length == 1
}

function verifyNotIntro(node : ProofNode) : boolean {

    if (!is_not_expression(node.expression)) {
        return false;
    }

    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    let syntax_result : boolean =
        // Check to see if first parent is negation of the second
        (is_not_expression(node.parents[0].expression) && node.parents[0].expression.children[0].equals(node.parents[1].expression)) ||
        // Check to see if second parent is the negation of the first
        (is_not_expression(node.parents[1].expression) && node.parents[1].expression.children[0].equals(node.parents[0].expression))

    if (!syntax_result) {
        return false;
    }

    // Make sure current formula is a negation of an assumption
    let assumption_name : string = null;
    let assumption_name_parent_ind : number = null;
    for (let idx : number = 0; idx < 2; idx++) {
        for (const name of node.parents[idx].assumptions) {
            let assumption_node : ProofNode = lookupNode(name);
            if (assumption_node.expression.equals(node.expression.children[0])) {
                assumption_name = name;
                assumption_name_parent_ind = idx;
                break;
            }
        }

        // If found in first parent, then don't check second
        if (assumption_name !== null) {
            break;
        }
    }

    if (assumption_name === null) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set();
    for (let i : number = 0; i < 2; i++) {
        for (const name of node.parents[i].assumptions) {
            if (i != assumption_name_parent_ind || name != assumption_name) {
                node.assumptions.add(name);
            }
        }
    }
    return true;
}

function verifyNotElim(node : ProofNode) : boolean {
    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    let syntax_result : boolean =
        // Check to see if first parent is negation of the second
        (is_not_expression(node.parents[0].expression) && node.parents[0].expression.children[0].equals(node.parents[1].expression)) ||
        // Check to see if second parent is the negation of the first
        (is_not_expression(node.parents[1].expression) && node.parents[1].expression.children[0].equals(node.parents[0].expression))

    if (!syntax_result) {
        return false;
    }

    // Make sure current formula is a negation of an assumption
    let assumption_name : string = null;
    let assumption_name_parent_ind : number = null;
    for (let idx : number = 0; idx < 2; idx++) {
        for (const name of node.parents[idx].assumptions) {
            let assumption_node : ProofNode = lookupNode(name);
            if (is_not_expression(assumption_node.expression) &&
            new SExpression("(not " + node.expression.toExpressionString() + ")").equals(assumption_node.expression)) {
                assumption_name = name;
                assumption_name_parent_ind = idx;
                break;
            }
        }

        // If found in first parent, then don't check second
        if (assumption_name !== null) {
            break;
        }
    }

    if (assumption_name === null) {
        return false;
    }

    // Update Assumptions
    node.assumptions = new Set();
    for (let i : number = 0; i < 2; i++) {
        for (const name of node.parents[i].assumptions) {
            if (i != assumption_name_parent_ind || name != assumption_name) {
                node.assumptions.add(name);
            }
        }
    }
    return true;
}

function is_exists_expression(expression : SExpression) : boolean{
    if(expression.value != "exists" || expression.children.length != 2)
        return false;
    if(expression.children[0].children.length != 0) //First child must be a constant
        return false;
    return true;
}

function verifyExistsIntro(node : ProofNode) : boolean{
    if(!is_exists_expression(node.expression))
        return false;

    if(node.parents.length != 1)
        return false;

    //Ensure the introduced variable symbol does not appear "free" (we have no free vars) as the name of a constant
    //in the parent formula.
    const parent_node = node.parents[0];
    const quantifiedVarSymbol : string = node.expression.children[0].value;
    const parentConstantSymbols : Array<string> = parent_node.expression.constants().map(x=>x.value);
    if(parentConstantSymbols.includes(quantifiedVarSymbol)){
        console.error("The variable \"" + quantifiedVarSymbol + "\" appears free in the parent formula " + 
        parent_node.expression.toString());
        return false;
    }
        

    //Ensure the syntax of the child tree matches under substitution
    const varList : Array<SExpression> = node.expression.varsOfQuantifier();
    if(varList.length != 0){ //We only care about checking if vars have been replaced if they exist
        const var0position : Array<number> = node.expression.children[1].subFormulaPosition(varList[0]);
        //Find the position of where a var was placed in the subformula
        const replacedVarExpr : SExpression = parent_node.expression.subformulaAtPosition(var0position);
        if(replacedVarExpr == null){
            console.log("Formulae structure do not match: " + node.expression.children[1].toString() + " and " +
                        parent_node.expression.toString())
            return false;
        }
        const replacedVarSymbol : string = replacedVarExpr.value;

        console.log(replacedVarSymbol);
        //Copy the child formula of the quantifier and,
        //replace all instances of the replaced variable with the replacedVarSymbol
        //It should match the parent formula
        let quantifiedExpr : SExpression = node.expression.copy();
        for(let v of quantifiedExpr.vars()){
            if(v.value == quantifiedVarSymbol){
                v.value = replacedVarSymbol;
            }
        }
        const quantifiedExprArg = quantifiedExpr.children[1] 
        if(!quantifiedExprArg.equals(parent_node.expression)){
            console.error("Failed to verify: " + node.expression.toString() + " due to arg formula mismatch between " +
            quantifiedExprArg.toString() + " and " + parent_node.expression);
            return false;
        }
    }

    //Assumption updating
    node.assumptions = new Set(parent_node.assumptions)
    return true;
}

function is_forall_expression(expression : SExpression) : boolean{
    if(expression.value != "forall" || expression.children.length != 2)
        return false;
    if(expression.children[0].children.length != 0) //First child must be a constant
        return false;
    return true;
}