
/**
 * @fileoverview This file contains definitions for the global proof state of the editor
 * and methods for importing, exporting, and manipulating the global proof state
 */

import { drawState } from "./proofCanvas.js";
import { SExpression } from "./sexpression.js";
import { verifyNode } from "./verify.js";

// Global state ========================================================================================================
//the full list of nodes and the links between them.
export let proofNodes : Array<ProofNode> = [];
export let proofLinks : Array<[ProofNode,ProofNode]> = [];


// Representations =====================================================================================================

/**
 * A position on the 2d lazyslate canvas
 */
export class Position{
    x : number; 
    y : number;
}

/**
 * A 2d bounding box describing a rectangle on the lazyslate canvas
 */
export class BoundingBox{
    x0 : number; 
    y0 : number;
    x1 : number;
    y1 : number
}

/** 
 * A ProofNode represents both a hypernode in a natural deduction proof graph 
 * and its GUI representation in the lazyslate editor.
 * ```                      
 *                       topAnchor (for incoming lines)   
 *                       V
 *                /-------------\
 *                |justification|
 *                \-------------/
 *                       |
 *  position -> /----------------\
 *              | name (or id)   |
 *              | formula        |    <-- bounding box (the lower box)
 *              | {assumptions}  |
 *              \----------------/
 *                       ^
 *                      botAnchor (for outgoing lines)
 * ```
 */
export class ProofNode{

    //Proof graph representation
    id : number;
    justification : string | null;
    expression : SExpression;
    assumptions : Set<string>;
    children : Array<ProofNode>;
    parents : Array<ProofNode>;
    
    //Verifier properties
    verified : boolean;

    //GUI properties
    name : string;
    boundingBox : BoundingBox | null; 
    topAnchor : Position | null;
    botAnchor : Position | null;
    position : Position | null;

    /** 
     * @param name The name of the node as it appears on the GUI nodes and in GUI node assumptions
     * @param justification The justification used to derive this node from its parents
     * @param expression The formula this node represents
     * @param position The world positition of this node relitive to (0,0) world cordinates
     */
    constructor(name? : string , justification? : string, expression? : SExpression, position? : Position){
        if(arguments.length == 0){
            this._default_constructor()
        }else if(arguments.length == 4){
            //Ensure we never have conflicting node IDs if nodes are deleted
            this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1; 
            //use the ID as the name if none is provided
            this.name = name == "" ? this.id.toString() : name; 
            this.justification = justification;
            this.expression = expression;
            this.assumptions = new Set(); 
            this.children = [];
            this.parents = [];

            //these GUI properties will be set by the renderer
            this.verified = false;
            this.boundingBox = null;
            this.topAnchor = null;
            this.botAnchor = null;
            this.position = position;
        }else{
            console.error("Invalid parameters to proof node constructor");
        }
    }

    /**
     * Sets all properties to default values
     */
    _default_constructor(){
        this.id = null;
        this.name = null;
        this.justification = null;
        this.expression = null;
        this.assumptions = new Set();
        this.children = [];
        this.parents = [];
        this.verified = false;
        this.boundingBox = null;
        this.topAnchor = null;
        this.botAnchor = null;
        this.position = null;
    }
}

// Global state manipulators ===========================================================================================

/**
 * recursively verifies a node and all its children. This is applied after an update to the base node
 * is made either via a new link, or an edit.
 * @param node The base node we want to verify
 * @param visited A list of node ID's that have already been verified.
 */
export function verifyNodes(node : ProofNode, visited : Array<number> = []) : void{
    node.verified = verifyNode(node);
    visited.push(node.id);
    for(let child of node.children){
        if(!visited.includes(child.id)){
            verifyNodes(child, visited);
        }
    }
}

/**
 * Creates and verifies a new node, for parameters see @see ProofNode.constructor 
 */
export function createNode(name : string, justification : string, expression : SExpression, position : Position) : void{
    let newNode = new ProofNode(name, justification, expression, position);
    proofNodes.push(newNode);
    verifyNodes(newNode);
}

/**
 * Create a link between nodes and reverify the node that recives the link
 * @param fromNode the node from which the new link is being connected
 * @param toNode the node to which the new link is being connected
 */
export function createLink(fromNode : ProofNode, toNode : ProofNode) : void{
    proofLinks.push([fromNode, toNode]);
    fromNode.children.push(toNode);
    toNode.parents.push(fromNode);
    verifyNodes(toNode);

}

/**
 * Deletes a node and reverifies all nodes dependednt on the deleted node
 * @param node the node to be deleted
 */
export function deleteNode(node : ProofNode) : void{
    let oldChildren : Array<ProofNode> = node.children;
    for(const parent of node.parents){
        parent.children = parent.children.filter(n=>node.id != n.id);
    }
    for(const child of node.children){
        child.parents = child.parents.filter(n=>node.id != n.id);
    }
    //Remove all links that included the deleted node
    proofLinks = proofLinks.filter(n=> !(n[0].id == node.id || n[1].id == node.id));
    proofNodes = proofNodes.filter(n=> n.id != node.id);
    //Update the verification status of all nodes that depended on the deleted node
    for(const child of oldChildren){
        verifyNodes(child);
    }
}

/**
 * Delete a link between two nodes and reverify the node dependent on the link.
 * @param fromNode the start node of the link to delete
 * @param toNode the end node of the link to delete
 */
export function deleteLink(fromNode : ProofNode, toNode : ProofNode) : void{
    fromNode.children = fromNode.children.filter(n=>toNode.id != n.id);
    toNode.parents = toNode.parents.filter(n=>fromNode.id != n.id);
    proofLinks = proofLinks.filter(n=> !(n[0].id == fromNode.id && n[1].id == toNode.id));
    verifyNodes(toNode);
}

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
    proofNodes = [];
    proofLinks = [];
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

    drawState();
}

// Global State accessors ==============================================================================================

/**
 * Looks up a proof node based on its name. In the event of multiple nodes with the same name,
 * returns the first match found.
 * @param name The name of the proof node to find
 * @returns The first proof node found with the given name, or null if not found
 */
export function lookupNode(name : string) : ProofNode {
    for (const node of proofNodes) {
        if (name == node.name) {
            return node;
        }
    }
    return null;
}