



window.addEventListener('load', function() {
    //Fill the justification box with justifications
    justificationDropdownBox = document.getElementById("justification-input")
    for(rule of inferenceRules){
        justificationDropdownBox.innerHTML += "<option value=" + rule.name + ">" + rule.fullname + "</option>";
    }
})

//Trigged when text is typed into the new-node-box
function formulaInput(){
    inputFormula = document.getElementById("formula-input").value;
    inputSExpression = new SExpression(inputFormula);
    formulaOutput = document.getElementById("formula-output")
    formulaOutput.innerHTML = inputSExpression.toString();
    formulaOutput.style.backgroundColor = inputSExpression.isValid() ? "green" : "red";

}

