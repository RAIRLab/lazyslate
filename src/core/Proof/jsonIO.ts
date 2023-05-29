
import { ProofNode } from "./proofNode";
import { SExpression } from "./sexpression";
import { proofNodes, proofLinks, verifyNodes } from "./state";

// JSON glboal state IO ------------------------------------------------------------------------------------------------

/**
 * Converts the global state to a JSON string
 * @returns A JSON string of the proof state
 */
export function stateToJSON() : string{
    let proofNodesJSON = []
    for(const node of proofNodes){
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

/**
 * Takes a json string of the proof state, parses it, and uses it to set the global proof state
 * @param jsonString A json string representing the proof state, in the format returned by @see stateToJSON
 */
export function setStateFromJSON(jsonString : string) : void{
    proofNodes.length = 0; //clear the state
    proofLinks.length = 0; //clear the state
    const jsonObject : any = JSON.parse(jsonString);

    //construct our nodes
    const nodes = jsonObject["nodes"];
    let idToNode : Map<number, ProofNode> = new Map; //Extreamly helpful for links later
    for(const node of nodes){
        let newProofNode : ProofNode = new ProofNode();
        newProofNode.id = node["id"];
        newProofNode.name = node["name"];
        newProofNode.justification = node["justification"];
        newProofNode.expression = new SExpression(node["expression"]);
        newProofNode.position = node["position"];
        proofNodes.push(newProofNode);
        idToNode[newProofNode.id] = newProofNode;
    }

    //Construct our links
    const links : any = jsonObject["links"];
    for(const link of links){
        proofLinks.push([idToNode[link[0]], idToNode[link[1]]]);
        idToNode[link[0]].children.push(idToNode[link[1]]);
        idToNode[link[1]].parents.push(idToNode[link[0]]);
    }

    //Verify everything we have imported from the top down
    for(const node of proofNodes){
        if(node.parents.length == 0){
            verifyNodes(node);
        }
    }
}