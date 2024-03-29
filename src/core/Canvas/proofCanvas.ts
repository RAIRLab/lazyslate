/**
 * @fileoverview This file contains global state for the proof canvas and rendering code of the global proof state
 */

import {inferenceRuleSymbols} from "../settings";
import {openEditNodeMenu, openNewNodeMenu} from "../Widgets/newNodeMenu";
import {SExpression} from "../Proof/sexpression";
import {ProofNode, BoundingBox, Position} from "../Proof/proofNode";
import {proofNodes, proofLinks, createLink, deleteLink, deleteNode, createNode} from "../Proof/state";

// Global Canvas State =================================================================================================

//The canvas context for once the window is loaded
let ctx : CanvasRenderingContext2D = null;
let canvas : HTMLCanvasElement = null;

let mousedown : boolean = false;  //if the mouse button is down or up
let selectedNode : ProofNode = null;
let selectedNodes : Array<ProofNode> = [];

//The pixel offset coordinates of our window into the proof graph world (How many pixels we have dragged the window)
let worldXOffset : number = 0, worldYOffset : number = 0;

// Global Canvas Initilization =========================================================================================

//When the document loads initlize the canvas and load proof if provided by URL
window.addEventListener('load', function() {
    canvas = <HTMLCanvasElement>document.getElementById("proof-canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");

    //Setup our event listeners for different interactions with the canvas
    canvas.addEventListener('dblclick', onDoubleClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);      //Canvas does not have a keydown
    window.addEventListener('resize', onResize);
});

//Some browsers do not supprt the roundRect method for canvas drawing. 
//If they don't support it, we define our own custom version
if (CanvasRenderingContext2D.prototype.roundRect == null) {
    CanvasRenderingContext2D.prototype.roundRect = 
    function (x : number, y : number, w : number, h : number, r : number){
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        // this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y,   x+w, y+h, r);
        this.arcTo(x+w, y+h, x,   y+h, r);
        this.arcTo(x,   y+h, x,   y,   r);
        this.arcTo(x,   y,   x+w, y,   r);
        // this.closePath();
        return this;
    }
}


// Helpers =============================================================================================================


/**
 * Takes a world position and returns the clicked node, or null if no node is at that position
 * @param position Takes an XY position on the screen and returns the node the click was inside, if any
 * @returns The node at click position, position. Null if no node was at that position.
 */
function getClickedNode(position : Position) : ProofNode | null{
    //Checks the bounding boxes of all the nodes computed in draw
    for(const node of proofNodes){
        const bb : BoundingBox = node.boundingBox; 
        if(bb.x0 < position.x && position.x < bb.x1 &&
           bb.y0 < position.y && position.y < bb.y1){
            return node;
        }
    }
    return null;
}


// Event Handlers ======================================================================================================

/**
 * On mouse down we perform the following:
 * 1) Set the flag that we are clicking down.
 * 2) If no node is currently selected and we click a node, set that node as the selected node
 * 3) If a node is currently selected, the control key is pressed, and a diffrent node we are not linked to is clicked,
 *    then we form a link from the selected node to the clicked node. Updates the verification status of dependent nodes
 * 4) If a node is currently selected, the control key is pressed, and a diffrent node we are linked to is clicked,
 *    then we delete the link from the selected node to the clicked node. Updates the verification status of dependent nodes
 * 5) Redraws the canvas with new state
 */
function onMouseDown(event : MouseEvent) : void{
    mousedown = true;
    let posX : number = event.offsetX + worldXOffset;
    let posY : number = event.offsetY + worldYOffset;
    let pos : Position = {x: posX, y: posY};
    if(event.ctrlKey && selectedNode != null){
        let fromNode : ProofNode = selectedNode;
        let toNode : ProofNode | null = getClickedNode(pos);
        if(fromNode.id != toNode.id){
            if(fromNode.children.filter(x=>x.id == toNode.id).length > 0) //If we are already connected, delete the link
                deleteLink(fromNode, toNode);
            else                                               //If we are not connected create a link between the nodes
                createLink(fromNode, toNode);
        }
    }else{
        selectedNode = getClickedNode(pos);
    }
    drawState();
}

/**
 * On mouse up we perform the following:
 * 1) Set the flag that we are no longer clicking down.
 * 2) set the selected node to the node the mouse was let go of on, set it to null otherwise
 * 3) Redraw the canvas with new state
 */
function onMouseUp(event : MouseEvent) : void{
    mousedown = false;
    let posX : number = event.offsetX + worldXOffset;
    let posY : number = event.offsetY + worldYOffset;
    let pos : Position = {x: posX, y: posY};
    selectedNode = getClickedNode(pos);
    drawState();
}

/**
 * On mouse move we perform the following:
 * 1) If the mouse is down and a node is selected, move the selected node with the mouse and redraw
 * 2) If the mouse is down and no node is selected, move the camera (global offset) with the mouse and redraw
 */
function onMouseMove(event : MouseEvent) : void{
    //Sometimes if the mouse leaves the canvas, the onMouseUp event never fires and it could get stuck in drag mode 
    //To fix that we check to make sure a mouse button is being pressed when the mouse reenteres.
    if(event.buttons == 0){ 
        mousedown = false;
    }
    if(mousedown){
        if(selectedNode){   //If we start dragging over a node, move the node with the mouse
            selectedNode.position.x += event.movementX;
            selectedNode.position.y += event.movementY;
        }else{              //If we start dragging over empty space, move the world offset for drawing
            worldXOffset -= event.movementX;
            worldYOffset -= event.movementY;
        }
        drawState();
    }
}

/**
 * On Key down perfomrs the following depending on the key combo and state
 * 1) If a node is selected and backspace or delete is pressed, the node is deleted and we redraw
 * 2) If a node is selected and the d key is pressed, the node is duplicated.
 */
function onKeyDown(event : KeyboardEvent) : void{
    if(document.getElementById("new-node-menu").style.display == "none"){ //Only process if the menu is hidden
        if(selectedNode != null && (event.key === "Backspace" || event.key === "Delete")){ //Delete node
            deleteNode(selectedNode);
            selectedNode = null;
            drawState();
        }
        else if(selectedNode != null && event.key === "d"){ //Duplicate Node
            //use a new ID if not named by user
            let newName : string = selectedNode.name == selectedNode.id.toString() ? "" : selectedNode.name;
            //create the node at a small offet 
            let newPosition : Position = {x: selectedNode.position.x + 100, y: selectedNode.position.y + 100}; 
            let newExpression : SExpression = new SExpression(selectedNode.expression.toExpressionString());
            createNode(newName, selectedNode.justification, newExpression, newPosition);
            selectedNode = null;
            drawState();
        }
    }
}

/**
 * If the user double clicks a node, we open the edit menu, otherwise if they double click emptyness,
 * we make a new node there and open the new node menu.
 */
function onDoubleClick(event : MouseEvent) : void{
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    let clickedNode = getClickedNode(pos);
    if(clickedNode == null){   
        openNewNodeMenu(pos);
    }else{
        openEditNodeMenu(clickedNode);
    }
}

/**
 * Resize the canvas if the window resizes and redraw
 */
function onResize(event : UIEvent) : void{
    canvas = <HTMLCanvasElement>document.getElementById("proof-canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    drawState();
}

// Drawing =============================================================================================================

/**
 * Takes a node and draws it on the canvas with respect to global state
 * @param node the node to draw
 */
function drawNode(node : ProofNode) : void{
    drawNodeClassic(node);
}

function drawNodeHyper(node : ProofNode) : void{
    const padding = 10;
    const minipadding = 2;
    const textLines = 2;
    ctx.font = "20px Arial";
    const fontMetrics = ctx.measureText(node.name);
    let fontHeight = fontMetrics.fontBoundingBoxAscent;
    if (fontHeight == undefined) {
        fontHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent + 4;
    }
    const baseX = node.position.x - worldXOffset;
    const baseY = node.position.y - worldYOffset;
    
    //Compute the width of our node based on text on the node
    const assumptionsString = "from {" + Array.from(node.assumptions).toString() + "}";
    const width = 2*padding + Math.max(
        ctx.measureText(node.expression.toString()).width + ctx.measureText(node.name).width + padding,
        ctx.measureText(assumptionsString).width
    );
    
    //Draw the node body and compute our bounding box for future clicks
    ctx.strokeStyle = selectedNode != null && selectedNode.id == node.id ? "Indigo" : "Black";
    ctx.fillStyle = selectedNode != null && selectedNode.id == node.id ? "Lavender" : "white";
    ctx.beginPath();
    //ctx.rect(baseX, baseY, width, 3*fontHeight + 2*padding);
    ctx.roundRect(baseX, baseY, width, 2*fontHeight + 2*padding, padding);
    node.boundingBox = {
        x0: baseX + worldXOffset,
        y0: baseY + worldYOffset,
        x1: baseX + width + worldXOffset,
        y1: baseY + textLines*fontHeight + 2*padding + worldYOffset + 2*minipadding,
    };
    ctx.fill();
    ctx.stroke();

    //Draw the bar
    ctx.beginPath();
    ctx.moveTo(baseX + width/2, baseY - fontHeight);
    ctx.lineTo(baseX + width/2, baseY);
    ctx.stroke();
    
    //Draw the hat
    ctx.beginPath();
    const hatText = inferenceRuleSymbols.get(node.justification);
    const hatWidth = ctx.measureText(hatText).width + 2*padding;
    ctx.strokeStyle = node.verified ? "lime" : "red";
    //ctx.rect(baseX + (width - hatWidth)/2, baseY - (2*fontHeight + 2*padding), hatWidth, fontHeight + 2*padding, padding);
    ctx.lineWidth = 2;
    ctx.rect(baseX + (width - hatWidth)/2, baseY - (2*fontHeight + 2*padding), hatWidth, fontHeight + 2*padding);
    ctx.fill();
    ctx.stroke();

    node.topAnchor = {x: baseX + width/2 + worldXOffset, y: baseY - (2*fontHeight + 2*padding) + worldYOffset}
    node.botAnchor = {x: baseX + width/2 + worldXOffset, y: baseY + textLines*fontHeight + 2*padding + worldYOffset + 2*minipadding}

    //Draw the name box
    ctx.beginPath()
    ctx.fillStyle="Purple"
    ctx.rect(baseX+padding-minipadding, baseY + padding, ctx.measureText(node.name).width + 2*minipadding, fontHeight+2*minipadding);
    ctx.fill();
    
    //Draw the text on the node
    ctx.fillStyle = "white"
    ctx.fillText(node.name, baseX + padding, baseY + fontHeight + padding);
    ctx.fillStyle = selectedNode != null && selectedNode.id == node.id ? "Indigo" : "Black";
    ctx.fillText(node.expression.toString(), baseX + padding + ctx.measureText(node.name).width + padding, baseY + fontHeight + padding);
    ctx.fillText(assumptionsString, baseX + padding, baseY + textLines*fontHeight + padding + 2*minipadding);
    ctx.fillText(hatText, baseX + (width - hatWidth)/2 + padding, baseY - (fontHeight + padding));

}

function drawNodeClassic(node : ProofNode) : void{
    const padding = 10;
    ctx.font = "20px Arial";
    const fontMetrics = ctx.measureText(node.name);
    let fontHeight = fontMetrics.fontBoundingBoxAscent;
    if (fontHeight == undefined) {
        fontHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent + 4;
    }
    const baseX = node.position.x - worldXOffset;
    const baseY = node.position.y - worldYOffset;
    
    //Compute the width of our node based on text on the node
    const assumptionsString = "{" + Array.from(node.assumptions).toString() + "}";
    const width = 2*padding + Math.max(
        ctx.measureText(node.expression.toString()).width,
        ctx.measureText(node.name).width,
        ctx.measureText(assumptionsString).width
    );
    
    //Draw the node body and compute our bounding box for future clicks
    ctx.strokeStyle = selectedNode != null && selectedNode.id == node.id ? "Indigo" : "Black";
    ctx.fillStyle = selectedNode != null && selectedNode.id == node.id ? "Lavender" : "white";
    ctx.beginPath();
    //ctx.rect(baseX, baseY, width, 3*fontHeight + 2*padding);
    ctx.roundRect(baseX, baseY, width, 3*fontHeight + 2*padding, padding);
    node.boundingBox = {
        x0: baseX + worldXOffset,
        y0: baseY + worldYOffset,
        x1: baseX + width + worldXOffset,
        y1: baseY + 3*fontHeight + 2*padding + worldYOffset,
    };
    ctx.fill();
    ctx.stroke();

    //Draw the bar
    ctx.beginPath();
    ctx.moveTo(baseX + width/2, baseY - fontHeight);
    ctx.lineTo(baseX + width/2, baseY);
    ctx.stroke();
    
    //Draw the hat
    ctx.beginPath();
    const hatText = inferenceRuleSymbols.get(node.justification);
    const hatWidth = ctx.measureText(hatText).width + 2*padding;
    ctx.strokeStyle = node.verified ? "green" : "red";
    //ctx.rect(baseX + (width - hatWidth)/2, baseY - (2*fontHeight + 2*padding), hatWidth, fontHeight + 2*padding, padding);
    ctx.roundRect(baseX + (width - hatWidth)/2, baseY - (2*fontHeight + 2*padding), hatWidth, fontHeight + 2*padding, padding);
    ctx.fill();
    ctx.stroke();

    node.topAnchor = {x: baseX + width/2 + worldXOffset, y: baseY - (2*fontHeight + 2*padding) + worldYOffset}
    node.botAnchor = {x: baseX + width/2 + worldXOffset, y: baseY + 3*fontHeight + 2*padding + worldYOffset}

    //Draw the text on the node
    ctx.fillStyle = selectedNode != null && selectedNode.id == node.id ? "Indigo" : "Black";
    ctx.fillText(node.name, baseX + 10, baseY + fontHeight + padding);
    ctx.fillText(node.expression.toString(), baseX + padding, baseY + 2*fontHeight + padding);
    ctx.fillText(assumptionsString, baseX + padding, baseY + 3*fontHeight + padding);
    ctx.fillText(hatText, baseX + (width - hatWidth)/2 + padding, baseY - (fontHeight + padding));
}

function drawLinkClassic(fromNode : ProofNode, toNode : ProofNode){
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(fromNode.botAnchor.x - worldXOffset, fromNode.botAnchor.y - worldYOffset);
    ctx.lineTo(toNode.topAnchor.x - worldXOffset, toNode.topAnchor.y - worldYOffset);
    ctx.stroke();
}

/**
 * Stolen from https://stackoverflow.com/a/38238458/6342516
 */
function drawPolygon(centerX : number, centerY : number, sideCount : number, size : number,
                     strokeWidth : number, strokeColor : string, fillColor : string, 
                     radians : number){
    ctx.translate(centerX,centerY);
    ctx.rotate(radians);
    ctx.beginPath();
    ctx.moveTo (size * Math.cos(0), size * Math.sin(0));          
    for (var i = 1; i <= sideCount;i += 1) {
        ctx.lineTo (size * Math.cos(i * 2 * Math.PI / sideCount), size * Math.sin(i * 2 * Math.PI / sideCount));
    }
    ctx.closePath();
    ctx.fillStyle=fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.fill();
    ctx.rotate(-radians);
    ctx.translate(-centerX,-centerY);    
}

function drawLinkHyper(fromNode : ProofNode, toNode : ProofNode) : void{
    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";
    let startx : number = fromNode.botAnchor.x - worldXOffset;
    let starty : number = fromNode.botAnchor.y - worldYOffset;
    let endx : number = toNode.topAnchor.x - worldXOffset
    let endy : number = toNode.topAnchor.y - worldYOffset
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(endx, endy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(startx, starty, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endx, endy, 3, 0, 2 * Math.PI);
    ctx.fill();
    let midx : number = Math.floor((endx + startx) / 2);
    let midy : number = Math.floor((endy + starty) / 2);
    let slope : number = (endy - starty)/(endx - startx);
    let angle : number = Math.atan(slope) + (startx > endx ? Math.PI : 0);
    drawPolygon(midx, midy, 3, 10, 0, "gray", "gray", angle); 
}

/**
 * Takes a link and draws a line connecting the two linked nodes with respect to global state
 * @param fromNode the node the link to draw starts at
 * @param toNode the node the link to draw ends at
 */
function drawLink(fromNode : ProofNode, toNode : ProofNode) : void{
    drawLinkClassic(fromNode, toNode);
}

/**
 * Draws the global proof state with respect to the global canvas state 
 */
export function drawState() : void{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(const node of proofNodes){
        drawNode(node);
    }
    for(const link of proofLinks){
        drawLink(link[0], link[1]);
    }
}

