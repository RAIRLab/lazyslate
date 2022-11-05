
//Global state, the full list of nodes and the links between them.
let proofNodes = [];
let proofLinks = [];

class ProofNode{
    constructor(name, justification, expression, position){
        this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1; //Ensure we never have conflicting node IDs if nodes are deleted
        this.name = name == "" ? this.id : name; //use the ID as the name if none is provided
        this.justification = justification;
        this.expression = expression;
        this.assumptions = [this.name]; //Until the node is connected to something, its only assumption is itself

        this.children = [];
        this.parents = [];

        //Only relevant to drawing, ignore
        this.boundingBox = null; //Set by draw calls
        this.position = position;
    }
}

function createNode(name, justification, expression, position){
    proofNodes.push(new ProofNode(name, justification, expression, position));
}


//The hard parts where we have to update things
function createLink(node1, node2){
    proofLinks.append([node1.id, node2.id]);
}

function deleteNode(node){

}

function deleteLink(node1, node2){

}
