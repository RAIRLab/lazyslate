
//Global state, the full list of nodes and the links between them.
let proofNodes = [];
let proofLinks = [];

class ProofNode{

    constructor(name, justification, expression, position){
        if(arguments.length == 0){
            this._default_constructor()
        }else{
            this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1; //Ensure we never have conflicting node IDs if nodes are deleted
            this.name = name == "" ? this.id : name; //use the ID as the name if none is provided
            this.justification = justification;
            this.expression = expression;
            this.assumptions = new Set(); 

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

    _default_constructor(){
        this.id = null;
        this.name = null;
        this.justification = null;
        this.expression = null;
        this.assumptions = new Set();
        this.children = [];
        this.parents = [];
        this.verified = false;
        this.boundingBox = null; //Set by draw calls
        this.topAnchor = null;
        this.botAnchor = null;
        this.position = null;
    }
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

function stateToJSON(){
    let proofNodesJSON = []
    for(node of proofNodes){
        proofNodesJSON.push({
            "id": node.id,
            "name" : node.name,
            "expression": node.expression.toExpressionString(),
            "justification": node.justification,
            "position": node.position,
        });
    }
    let proofLinksJSON = proofLinks.map(x => [x[0].id, x[1].id]);
    return JSON.stringify({
        "nodes":proofNodesJSON,
        "links":proofLinksJSON
    });
}

function setStateFromJSON(jsonString){
    proofNodes = [];
    proofLinks = [];
    jsonObject = JSON.parse(jsonString);

    //construct our nodes
    nodes = jsonObject["nodes"];
    idToNode = {} //Extreamly helpful for links later
    for(node of nodes){
        let newProofNode = new ProofNode();
        newProofNode.id = node["id"];
        newProofNode.name = node["name"];
        newProofNode.justification = node["justification"];
        newProofNode.expression = new SExpression(node["expression"]);
        newProofNode.position = node["position"];
        proofNodes.push(newProofNode);
        idToNode[newProofNode.id] = newProofNode;
    }

    //Construct our links
    links = jsonObject["links"];
    for(link of links){
        proofLinks.push([idToNode[link[0]], idToNode[link[1]]]);
        idToNode[link[0]].children.push(idToNode[link[1]]);
        idToNode[link[1]].parents.push(idToNode[link[0]]);
    }

    //Verify everything we have imported from the top down
    for(node of proofNodes){
        if(node.parents.length == 0){
            verifyNodes(node);
        }
    }

    drawState();
}