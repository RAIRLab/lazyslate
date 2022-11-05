
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
        this.verified = false;
        this.boundingBox = null; //Set by draw calls
        this.topAnchor = null;
        this.botAnchor = null;
        this.position = position;
    }
}

function verifyNode(node){
    return false;
}

function verifyNodes(node, visited=[]){
    node.verified = verifyNode(node);
    visited.push(node.id);
    for(let child of node.children){
        if(!visited.includes(child.id)){
            verifyNodes(child, visited);
        }
    }
}

function createNode(name, justification, expression, position){
    let newNode = new ProofNode(name, justification, expression, position);
    proofNodes.push(newNode);
    verifyNodes(newNode);
}

//The hard parts where we have to update things
function createLink(fromNode, toNode){
    proofLinks.push([fromNode, toNode]);
    fromNode.children.push(toNode);
    toNode.parents.push(fromNode);
    verifyNodes(toNode);

}

function deleteNode(node){
    let oldChildren = node.children;
    for(parent of node.parents){
        parent.children = parent.children.filter(n=>node.id != n.id);
    }
    for(child of node.children){
        child.parents = child.parents.filter(n=>node.id != n.id);
    }
    proofLinks = proofLinks.filter(n=> !(n[0].id == node.id || n[1].id == node.id));
    proofNodes = proofNodes.filter(n=> n.id != node.id);
    for(child of oldChildren){
        verifyNodes(child);
    }
}

function deleteLink(fromNode, toNode){
    fromNode.children = fromNode.children.filter(n=>toNode.id != n.id);
    toNode.parents = toNode.parents.filter(n=>fromNode.id != n.id);
    proofLinks = proofLinks.filter(n=> !(n[0].id == fromNode.id && n[1].id == toNode.id));
    verifyNodes(toNode);
}

function lookupNode(name) {
    for (const node of proofNodes) {
        if (name == node.name) {
            return node;
        }
    }
    return null;
}
