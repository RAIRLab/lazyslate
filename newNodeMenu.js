/**
 * @fileoverview Contains code for setup and handlers of events relating to the new node menu and edit node menu
 */
import { createNode, verifyNodes, proofNodes } from "./state.js";
import { inferenceRules } from "./settings.js";
import { SExpression } from "./sexpression.js";
import { drawState } from "./proofCanvas.js";
// Initial setup of the menus ==========================================================================================
//When the document loads
window.addEventListener('load', function () {
    //Fill the justification box with justifications
    let justificationDropdownBox = document.getElementById("justification-input");
    for (const rule of inferenceRules) {
        justificationDropdownBox.innerHTML += "<option value=" + rule.name + ">" + rule.fullname + "</option>";
    }
    //Disable the button
    let createNodeButton = document.getElementById("create-node-button");
    createNodeButton.disabled = true;
    //disable the canvas blocker
    document.getElementById("canvas-blocker").style.display = "none";
    //This has to be done because otherwise style.display is an empty string despite the css
    // and it messes with controls that check this to see if they can activate
    document.getElementById("new-node-menu").style.display = "none";
    //global export event handelers
    //window["openNewNodeMenu"] = openNewNodeMenu;
    //window["openEditNodeMenu"] = openEditNodeMenu;
    window["closeNewNodeMenu"] = closeNewNodeMenu;
    window["onCreateNodeButtonPress"] = onCreateNodeButtonPress;
    window["onEditNodeButtonPress"] = onEditNodeButtonPress;
    window["onCreateNodeButtonPress"] = onCreateNodeButtonPress;
    window["onCreateNodeButtonPress"] = onCreateNodeButtonPress;
    window["formulaInput"] = formulaInput;
    //window["getInputElementById"] = getInputElementById;
});
// Helpers =============================================================================================================
/**
 * Gets an HTML input element by ID in a typescript safe way
 * @param id the id string of the element
 * @returns the HTMLInputElement with the given id or null if does not exist
 */
function getInputElementById(id) {
    let elm = document.getElementById(id);
    if (elm != null && elm instanceof HTMLInputElement) {
        return elm;
    }
    else {
        return null;
    }
}
// Handelers ===========================================================================================================
/**
 * Trigged when someone double clicks a blank area of the canvas
 * @param position Takes in the position that was clicked to create the new node at
 */
export function openNewNodeMenu(position) {
    document.getElementById("canvas-blocker").style.display = "inline";
    document.getElementById("new-node-menu").style.display = "inline";
    document.getElementById("create-node-button").style.display = "inline";
    document.getElementById("edit-node-button").style.display = "none";
    document.getElementById("id-input").style.display = "none";
    getInputElementById("name-input").value = "";
    getInputElementById("X-input").value = position.x.toString();
    getInputElementById("Y-input").value = position.y.toString();
}
/**
 * Trigged when someone double clicks a node that already exists
 * @param node Takes in the proof node that was clicked that will be edited
 */
export function openEditNodeMenu(node) {
    document.getElementById("canvas-blocker").style.display = "inline";
    document.getElementById("new-node-menu").style.display = "inline";
    document.getElementById("create-node-button").style.display = "none";
    document.getElementById("edit-node-button").style.display = "inline";
    document.getElementById("id-input").style.display = "inline";
    getInputElementById("id-input").value = node.id.toString();
    getInputElementById("name-input").value = node.name;
    getInputElementById("X-input").value = node.position.x.toString();
    getInputElementById("Y-input").value = node.position.y.toString();
    getInputElementById("justification-input").value = node.justification;
    getInputElementById("formula-input").value = node.expression.toExpressionString();
    formulaInput();
}
/**
 * Trigged when someone double clicks the close button
 */
export function closeNewNodeMenu() {
    document.getElementById("new-node-menu").style.display = "none";
    document.getElementById("canvas-blocker").style.display = "none";
}
/**
 * Triggered when the create-node-button is pressed in the create node menu
 */
export function onCreateNodeButtonPress() {
    let name = getInputElementById("name-input").value;
    let justification = document.getElementById("justification-input").value;
    let position = {
        x: parseInt(getInputElementById("X-input").value),
        y: parseInt(getInputElementById("Y-input").value)
    };
    let sExpression = new SExpression(document.getElementById("formula-input").value);
    createNode(name, justification, sExpression, position);
    closeNewNodeMenu();
    drawState();
}
/**
 * Triggered when the edit node button is pressed in the edit node menu
 */
export function onEditNodeButtonPress() {
    let node = proofNodes.filter(x => getInputElementById("id-input").value == x.id.toString())[0];
    node.name = getInputElementById("name-input").value;
    node.position.x = parseInt(getInputElementById("X-input").value);
    node.position.y = parseInt(getInputElementById("Y-input").value);
    node.justification = document.getElementById("justification-input").value;
    node.expression = new SExpression(document.getElementById("formula-input").value);
    node.assumptions = new Set();
    closeNewNodeMenu();
    verifyNodes(node);
    drawState();
}
/**
 * Trigged when text is typed into the new-node-box or the edit node menu is opened
 */
export function formulaInput() {
    let inputFormula = document.getElementById("formula-input").value;
    let formulaOutput = document.getElementById("formula-output");
    let createNodeButton = document.getElementById("create-node-button");
    if (inputFormula == "") {
        formulaOutput.innerHTML = "Formula Output";
        formulaOutput.style.backgroundColor = "gainsboro";
        createNodeButton.disabled = true;
    }
    else {
        let inputSExpression = new SExpression(inputFormula);
        let valid = inputSExpression.isValid();
        formulaOutput.innerHTML = inputSExpression.toString();
        formulaOutput.style.backgroundColor = valid ? "PaleGreen" : "Salmon";
        createNodeButton.disabled = !valid;
    }
}
//# sourceMappingURL=newNodeMenu.js.map