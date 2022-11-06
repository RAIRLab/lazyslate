/*
    Functions that verify Proof Nodes
*/

function verifyNode(node) {
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
        default:
            return false;
    }
}

// =============
// Assume Rule
// =============

function verifyAssume(node) {
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
function is_and_expression(expr) {
    return expr.value == "and" &&
    expr.children.length == 2
}

// Takes a node and verifies whether
// the formula is valid given the
// AND Intro rule.
// Also updates assumptions
function verifyAndIntro(node) {

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

function verifyAndElim(node) {
    // Make sure we have only one parent node
    if (node.parents.length != 1) {
        return false;
    }

    let parent = node.parents[0];
    if (!is_and_expression(parent.expression)) {
        return false;
    }

    // Make sure expression is in one of the conjuncts of the parent expression
    let formula_match = false;
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
function is_if_expression(expr) {
    return expr.value == "if" &&
    expr.children.length == 2
}

function verifyIfIntro(node) {
    if (!is_if_expression(node.expression)) {
        return false;
    }

    // Make sure we only have one parent node
    if (node.parents.length != 1) {
        return false;
    }

    // Make sure parent is the consequence
    if (!this.children[1].expression.equals(parent.expression)) {
        return false;
    }

    // Make sure the antecedant is in the assumptions of the parent
    let antecedant_matched = false;
    let antecedant_name = null;
    for (const name of parent.assumptions) {
        assumption_node = lookupNode(name);
        if (assumption_node.expression.equals(node.expression.children[1])) {
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
            node.add(name);

        }
    }

    return true;
}

function verifyIfElim(node) {
    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Second parent is the antecedant of the first
    let match1 = is_if_expression(node.parents[0]) &&
        node.parents[1].expression.equals(node.parent[0].expression.children[0]);

    // First parent is the antecedant of the second
    let match2 = is_if_expression(node.parents[1]) &&
        node.parents[0].expression.equals(node.parents[1].expression.children[0])

    if (!match1 && !match2) {
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
function is_iff_expression(expr) {
    return expr.value == "iff" &&
    expr.children.length == 2
}

function verifyIffIntro(node) {
    if (!is_iff_expression(node.expression)) {
        return false;
    }

    // Make sure we onl have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Match left and right side of Iff to a parent
    let leftParent = null;
    let rightParent = null;
    if (node.parents[0].equals(node.expression.children[0])) {
        leftParent = node.parents[0];
        if (!node.parents[1].equals(node.expression.children[1])) {
            return false;
        }
        rightParent = node.parents[1];
    } else {
        if (!node.parents[0].equals(node.expression.children[1])) {
            return false;
        }
        rightParent = node.parents[0];

        if (!node.parents[1].equals(node.expression.children[0])) {
            return false;
        }
        leftParent = node.parents[1];
    }

    // Check Forward Direction
    // Make sure antecedant is in the assumption of the parent
    let lantecedant_matched = false;
    let lantecedant_name = null;
    for (const name of leftParent.assumptions) {
        assumption_node = lookupNode(name);
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
    let rantecedant_matched = false;
    let rantecedant_name = null;
    for (const name of rightParent.assumptions) {
        assumption_node = lookupNode(name);
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

function verifyIffElim(node) {

    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    // Find which parent matches the current node
    let parentMatchInd = null;
    if (node.parents[0].expression.equal(node.expression)) {
        parentMatchInd = 0;
    } else if (node.parents[1].expression.equal(node.expression)) {
        parentMatchInd = 1;
    } else {
        return false;
    }

    if (parentMatchInd == 0) {
        // First parent is either the antecedant
        // or consequent of the second parent.
        let syntax_check1 = is_iff_expression(node.parents[1]) &&
        (
            node.parents[0].expression.equal(node.parents[1].expression.children[0]) ||
            node.parents[0].expression.equal(node.parents[1].expression.children[1])
        );
        if (!syntax_check1) {
            return false;
        }
    } else {
        // Second parent is either the antecedant
        // or consequent of the first parent
        let syntax_check1 = is_iff_expression(node.parents[0]) &&
        (
            node.parents[1].expression.equal(node.parents[0].expression.children[0]) ||
            node.parents[1].expression.equal(node.parents[0].expression.children[1])
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
function is_or_expression(expr) {
    return expr.value == "or" &&
    expr.children.length == 2
}

function verifyOrIntro(node) {
    if (!is_or_expression(node.expression)) {
        return false;
    }

    // Make sure we only have one parent node
    if (node.parents.length != 1) {
        return false;
    }

    let match0 = node.expression.children[0].equals(node.parents[0].expression);
    let match1 = node.expression.children[1].equals(node.parents[0].expression);

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

function verifyOrElim(node) {
    // Make sure we have three parent nodes
    if (node.parents.length != 3) {
        return false;
    }

    let orParentInd = null;
    let parentInd2 = null;
    let parentInd3 = null;

    for (let i = 0; i < node.parents.length; i++) {
        let parent = node.parents[i];
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

    // Check Assumptions
    let leftConjunctParentInd = null;

    let orParent = node.parents[orParentInd];
    let conjunctl_idx = null;
    let conjunctl_assumption_name = null;
    let conjunctr_idx = null;
    let conjunctr_assumption_name = null;

    for (const idx of [parentInd2, parentInd3]) {
        for (const name of node.parents[idx].assumptions) {
            assumption_node = lookupNode(name);
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

    if (conjunctl_idx === null && conjunctr_idx === null) {
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
function is_not_expression(expr) {
    return expr.value == "not" &&
    expr.children.length == 1
}

function verifyNotIntro(node) {

    if (!is_not_expression(node.expression)) {
        return false;
    }

    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    let syntax_result =
        // Check to see if first parent is negation of the second
        (is_not_expression(node.parents[0].expression) && node.parents[0].expression.children[0].equals(node.parents[1].expression)) ||
        // Check to see if second parent is the negation of the first
        (is_not_expression(node.parents[1].expression) && node.parents[1].expression.children[0].equals(node.parents[0].expression))

    if (!syntax_result) {
        return false;
    }

    // Make sure current formula is a negation of an assumption
    let assumption_name = null;
    let assumption_name_parent_ind = null;
    for (let idx = 0; idx < 2; idx++) {
        for (const name of node.parents[idx].assumptions) {
            let assumption_node = lookupNode(name);
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
    for (let i = 0; i < 2; i++) {
        for (const name of node.parents[i].assumptions) {
            if (i != assumption_name_parent_ind || name != assumption_name) {
                node.assumptions.add(name);
            }
        }
    }
    return true;
}

function verifyNotElim(node) {
    // Make sure we have two parent nodes
    if (node.parents.length != 2) {
        return false;
    }

    let syntax_result =
        // Check to see if first parent is negation of the second
        (is_not_expression(node.parents[0].expression) && node.parents[0].expression.children[0].equals(node.parents[1].expression)) ||
        // Check to see if second parent is the negation of the first
        (is_not_expression(node.parents[1].expression) && node.parents[1].expression.children[0].equals(node.parents[0].expression))

    if (!syntax_result) {
        return false;
    }

    // Make sure current formula is a negation of an assumption
    let assumption_name = null;
    let assumption_name_parent_ind = null;
    for (let idx = 0; idx < 2; idx++) {
        for (const name of node.parents[idx].assumptions) {
            let assumption_node = lookupNode(name);
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
    for (let i = 0; i < 2; i++) {
        for (const name of node.parents[i].assumptions) {
            if (i != assumption_name_parent_ind || name != assumption_name) {
                node.assumptions.add(name);
            }
        }
    }
    return true;
}