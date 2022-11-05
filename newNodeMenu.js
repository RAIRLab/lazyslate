

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
})

//Trigged when someone double clicks a blank area of the canvas
//Takes in the position that was clicked 
function openNewNodeMenu(position){
    document.getElementById("canvas-blocker").style.display = "inline";
    document.getElementById("new-node-menu").style.display = "inline";
    document.getElementById("X-input").value = position.x;
    document.getElementById("Y-input").value = position.y;
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
    let position = {x: document.getElementById("X-input").value, y:document.getElementById("Y-input").value};
    let sExpression = new SExpression(document.getElementById("formula-input").value);
    createNode(name, justification, sExpression, position);
    closeNewNodeMenu();
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

