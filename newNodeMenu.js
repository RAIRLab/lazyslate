

//When the document loads
window.addEventListener('load', function() {
    //Fill the justification box with justifications
    justificationDropdownBox = document.getElementById("justification-input")
    for(rule of inferenceRules){
        justificationDropdownBox.innerHTML += "<option value=" + rule.name + ">" + rule.fullname + "</option>";
    }

    //Disable the button
    let createNodeButton = document.getElementById("create-node-button");
    createNodeButton.disabled = true;

    //disable the canvas blocker
    document.getElementById("canvas-blocker").style.display = "none";
    //This has to be done because otherwise style.display is an empty string despiet the css and it messes with controlls that check this to see if they can activate
    document.getElementById("new-node-menu").style.display = "none";
})

//Trigged when someone double clicks a blank area of the canvas
//Takes in the position that was clicked 
function openNewNodeMenu(position){
    document.getElementById("canvas-blocker").style.display = "inline";
    document.getElementById("new-node-menu").style.display = "inline";
    document.getElementById("create-node-button").style.display = "inline";
    document.getElementById("edit-node-button").style.display = "none";
    document.getElementById("id-input").style.display = "none";
    document.getElementById("name-input").value = "";
    document.getElementById("X-input").value = position.x;
    document.getElementById("Y-input").value = position.y;
}

function openEditNodeMenu(node){
    document.getElementById("canvas-blocker").style.display = "inline";
    document.getElementById("new-node-menu").style.display = "inline";
    document.getElementById("create-node-button").style.display = "none";
    document.getElementById("edit-node-button").style.display = "inline";
    document.getElementById("id-input").style.display = "inline";
    document.getElementById("id-input").value = node.id;
    document.getElementById("name-input").value = node.name;
    document.getElementById("X-input").value = node.position.x;
    document.getElementById("Y-input").value = node.position.y;
    document.getElementById("justification-input").value = node.justification;
    document.getElementById("formula-input").value = node.expression.toExpressionString();
    formulaInput();
}

//Trigged when someone double clicks the close button
function closeNewNodeMenu(){
    document.getElementById("new-node-menu").style.display = "none";
    document.getElementById("canvas-blocker").style.display = "none";
}

//Triggered when the create-node-button is pressed
function onCreateNodeButtonPress(){
    let name = document.getElementById("name-input").value;
    let justification = document.getElementById("justification-input").value;
    let position = {x: parseInt(document.getElementById("X-input").value), y: parseInt(document.getElementById("Y-input").value)};
    let sExpression = new SExpression(document.getElementById("formula-input").value);
    createNode(name, justification, sExpression, position);
    closeNewNodeMenu();
    drawState();
}

function onEditNodeButtonPress(){
    let node = proofNodes.filter(x=>document.getElementById("id-input").value == x.id)[0];
    node.name = document.getElementById("name-input").value;
    node.position.x = parseInt(document.getElementById("X-input").value);
    node.position.y = parseInt(document.getElementById("Y-input").value);
    node.justification = document.getElementById("justification-input").value;
    node.expression = new SExpression(document.getElementById("formula-input").value);
    node.assumptions = new Set();
    closeNewNodeMenu();
    verifyNodes(node);
    drawState();
}

//Trigged when text is typed into the new-node-box
function formulaInput(){
    let inputFormula = document.getElementById("formula-input").value;
    let formulaOutput = document.getElementById("formula-output");
    let createNodeButton = document.getElementById("create-node-button");
    if(inputFormula == ""){
        formulaOutput.innerHTML = "Formula Output";
        formulaOutput.style.backgroundColor = "gainsboro";
        createNodeButton.disabled = true;
    }else{
        let inputSExpression = new SExpression(inputFormula);
        let valid = inputSExpression.isValid();
        formulaOutput.innerHTML = inputSExpression.toString();
        formulaOutput.style.backgroundColor = valid ? "PaleGreen" : "Salmon";
        createNodeButton.disabled = !valid;
    }
}

