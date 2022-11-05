
//Global state, the full list of nodes and the links between them.
let proofNodes = [];
let proofLinks = [];

class ProofNode{
    constructor(name, justification, expression, position){
        //Ensure we never have conflicting node IDs if nodes are deleted
        this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1;
        
        //use the ID as the name if none is provided
        this.name = name == "" ? this.id : name;

        this.justification = justification;
        this.expression = expression;
        
        

        //Until the node is connected to something, its only assumption is its name
        this.assumptions = [this.name];

        this.boundingBox = null; //Set by draw calls
        this.position = position;
    }
}

function createNode(name, justification, expression, position){
    proofNodes.push(new ProofNode(name, justification, expression, position));
}

