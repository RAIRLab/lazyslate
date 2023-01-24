
//The canvas context for once the window is loaded
let ctx = null;
let canvas = null;

let mousedown = false;  //if the mouse button is down or up
let selectedNode = null;
let selectedNodes = [];

//The offset coordinates of our window into the proof graph world (How much we have dragged the window)
let worldXOffset = 0, worldYOffset = 0;

//When the document loads
window.addEventListener('load', function() {
    canvas = document.getElementById("proof-canvas");
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

    //Load the proof encoded in the URL if it exists
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has("proof")){
        const uriEncodedCompressedProof = urlParams.get("proof");
        const compressedProof = uriEncodedCompressedProof.replaceAll("%2D", "-");
        const jsonProof = LZString.decompressFromEncodedURIComponent(compressedProof);
        setStateFromJSON(jsonProof);
    }
});


//================================ Helpers =========================================


//Takes a world position and returns the clicked node, or null if no node is at that position
function getClickedNode(position){
    //Checks the bounding boxes of all the nodes computed in draw
    for(node of proofNodes){
        bb = node.boundingBox; 
        if(bb.x0 < position.x && position.x < bb.x1 &&
           bb.y0 < position.y && position.y < bb.y1){
            return node;
        }
    }
    return null;
}


//=============================== Event Handlers ===================================

function onMouseDown(event){
    mousedown = true;
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    if(event.ctrlKey && selectedNode != null){
        let fromNode = selectedNode;
        let toNode = getClickedNode(pos);
        if(fromNode.id != toNode.id){
            if(fromNode.children.filter(x=>x.id == toNode.id).length > 0) //If we are already connected, delete the link
                deleteLink(fromNode, toNode);
            else                                                        //If we are not connected create a link between the nodes
                createLink(fromNode, toNode);
        }
    }else{
        selectedNode = getClickedNode(pos);
    }
    drawState();
}

function onMouseUp(event){
    mousedown = false;
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    selectedNode = getClickedNode(pos);
    drawState();
}


function onMouseMove(event){
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

function onKeyDown(event){
    if(document.getElementById("new-node-menu").style.display == "none"){ //Only process if the menu is hidden
        if(selectedNode != null && event.key === "Backspace" || event.key === "Delete"){ //Delete node
            deleteNode(selectedNode);
            selectedNode = null;
            drawState();
        }
        else if(selectedNode != null && event.key === "d"){ //Duplicate Node
            let newName = selectedNode.name == selectedNode.id ? "" : selectedNode.name; //use a new ID if not named by user
            let newPosition = {x: selectedNode.position.x + 100, y: selectedNode.position.y + 100}; //create the node at a small offet 
            let newExpression = new SExpression(selectedNode.expression.toExpressionString());
            createNode(newName, selectedNode.justification, newExpression, newPosition);
            selectedNode = null;
            drawState();
        }
    }
}

function onDoubleClick(event){
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    let clickedNode = getClickedNode(pos);
    if(clickedNode == null){    //If the user double clicks a node, we open the edit menu, otherwise if they double click emptyness, we make a new node there
        openNewNodeMenu(pos);
    }else{
        openEditNodeMenu(clickedNode);
    }
}

function onResize(event){
    canvas = document.getElementById("proof-canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    drawState();
}

//================================= Drawing ========================================


function drawNode(node){
    const padding = 10;
    ctx.font = "20px Arial";
    const fontHeight = ctx.measureText(node.name).fontBoundingBoxAscent;

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
    const hatText = inferenceRuleSymbols[node.justification];
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

function drawLink(fromNode, toNode){
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(fromNode.botAnchor.x - worldXOffset, fromNode.botAnchor.y - worldYOffset);
    ctx.lineTo(toNode.topAnchor.x - worldXOffset, toNode.topAnchor.y - worldYOffset);
    ctx.stroke();
}

function drawState(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(node of proofNodes){
        drawNode(node);
    }
    for(link of proofLinks){
        drawLink(link[0], link[1]);
    }
}

