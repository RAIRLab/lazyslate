
//The canvas context for once the window is loaded
let ctx = null;
let canvas = null;

let selectedNode = {id:-1};

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
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseup', onUp);
});

//=============================== Event Handlers ===================================

function onDown(event){
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    let clickedNode = getClickedNode(pos);
    console.log(clickedNode);
    if(clickedNode){
        selectedNode = clickedNode;
        drawState();
    }else{
        worldXOffset += event.movementX;
        worldYOffset += event.movementY;
        console.log(worldXOffset);
        drawState();
    }
}

function onUp(event){
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    let clickedNode = getClickedNode(pos);
    if(clickedNode){
        selectedNode = clickedNode;
        drawState();
    }else{
        drawState();
    }
}

function onDoubleClick(event){
    let posX = event.offsetX + worldXOffset;
    let posY = event.offsetY + worldYOffset;
    let pos = {x: posX, y: posY};
    let clickedNode = getClickedNode(pos);
    if(clickedNode == null){
        openNewNodeMenu(pos);
    }
}

//================================ Helpers =========================================

function getClickedNode(position){
    for(node of proofNodes){
        bb = node.boundingBox;
        if(bb.x0 < position.x && position.x < bb.x1 &&
           bb.y0 < position.y && position.y < bb.y1){
            return node;
        }
    }
    return null;
}


//================================= Drawing ========================================


function drawNode(node){
    const padding = 10;
    ctx.font = "20px Arial";
    const fontHeight = ctx.measureText(node.name).fontBoundingBoxAscent;
    let baseX = node.position.x - worldXOffset;
    
    //Compute the width of our node based on text on the node
    let baseY = node.position.y - worldYOffset;
    let assumptionsString = "{" + node.assumptions.toString() + "}";
    let width = 2*padding + Math.max(
        ctx.measureText(node.expression.toString()).width,
        ctx.measureText(node.name).width,
        ctx.measureText(assumptionsString).width
    );
    
    //Draw the node body and compute our bounding box for future clicks
    ctx.strokeStyle = selectedNode.id == node.id ? "#FF0000" : "#000000";
    ctx.roundRect(baseX, baseY, width, 3*fontHeight + 2*padding, padding);
    node.boundingBox = {
        x0: baseX + worldXOffset,
        y0: baseY + worldYOffset,
        x1: baseX + width + worldXOffset,
        y1: baseY + 3*fontHeight + 2*padding + worldYOffset,
    };
    ctx.stroke();

    //Draw the text on the node
    ctx.fillText(node.name, baseX + 10, baseY + fontHeight + padding);
    ctx.fillText(node.expression.toString(), baseX + padding, baseY + 2*fontHeight + padding);
    ctx.fillText(assumptionsString, baseX + padding, baseY + 3*fontHeight + padding);

    //Draw the hat with the inference rule
    let hatText = inferenceRuleSymbols[node.justification];
    let hatWidth = ctx.measureText(hatText).width + 2*padding;
    ctx.roundRect(baseX + (width - hatWidth)/2, baseY - (2*fontHeight + 2*padding), hatWidth, fontHeight + 2*padding, padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(baseX + width/2, baseY - fontHeight);
    ctx.lineTo(baseX + width/2, baseY);
    ctx.stroke();
    ctx.fillText(hatText, baseX + (width - hatWidth)/2 + padding, baseY - (fontHeight + padding));

}

function drawState(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(node of proofNodes){
        drawNode(node);
    }
    for(link of proofLinks){
        drawLink(link);
    }
}

