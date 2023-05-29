
/**
 * @fileoverview This file contains definitions for the global proof state of the editor
 * and methods for importing, exporting, and manipulating the global proof state
 */

import { SExpression } from "./sexpression";
import { verifyNode } from "./verify";
import { ProofNode, Position } from "./proofNode";

// Global state ========================================================================================================

//the full list of nodes and the links between them.
export let proofNodes : Array<ProofNode> = [];
export let proofLinks : Array<[ProofNode,ProofNode]> = [];

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