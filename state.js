
//Global state, the full list of nodes and the links between them.
let proofNodes = [];
let proofLinks = [];

class ProofNode{
    constructor(name, justification, expression, position){
        this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1; //Ensure we never have conflicting node IDs if nodes are deleted
        this.name = name == "" ? this.id : name; //use the ID as the name if none is provided
        this.justification = justification;
        this.expression = expression;
        this.assumptions = new Set(); //Until the node is connected to something, its only assumption is itself

        this.children = [];
        this.parents = [];

        //Only relevant to drawing, ignore
        this.boundingBox = null; //Set by draw calls
        this.topAnchor = null;
        this.botAnchor = null;
        this.position = position;
    }
}

function createNode(name, justification, expression, position){
    proofNodes.push(new ProofNode(name, justification, expression, position));
}


//The hard parts where we have to update things
function createLink(fromNode, toNode){
    proofLinks.push([fromNode, toNode]);
    fromNode.children.push(toNode);
    toNode.parents.push(fromNode);
}

function deleteNode(node){
    for(parent of node.parents){
        parent.children = parent.children.filter(n=>node.id != n.id);
    }
    for(child of node.children){
        child.parents = child.parents.filter(n=>node.id != n.id);
    }
    proofLinks = proofLinks.filter(n=> !(n[0].id == node.id || n[1].id == node.id));
    proofNodes = proofNodes.filter(n=> n.id != node.id);
}

function deleteLink(fromNode, toNode){
    fromNode.children = fromNode.children.filter(n=>toNode.id != n.id);
    toNode.parents = toNode.parents.filter(n=>fromNode.id != n.id);
    proofLinks = proofLinks.filter(n=> !(n[0].id == fromNode.id && n[1].id == toNode.id));
}

function lookupNode(name) {
    for (const node of proofNodes) {
        if (name == node.name) {
            return node;
        }
    }
    return null;
}
