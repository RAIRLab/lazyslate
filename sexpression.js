

//This file assumes settings.js has already been imported


class SExpression{
    constructor(sExpressionString){
        this.string = sExpressionString;
        this.value = null;                  //This is a string representing the logical operation, predicate, or function name
        this.children = [];                 //This is the list of SExpressions that are children of the node

        //Parsing 
        let spacedString = this.string.replaceAll("(", " ( ").replaceAll(")", " ) ").trim();
        let tokens = spacedString.split(/\s+/); //split on spaces
        if(tokens.length == 1 && tokens[0].match(/^[0-9a-zA-Z]+$/)){   //We are a logical constant
            this.value = tokens[0];
        }else if(tokens.length >= 3 && tokens[0] == "(" && tokens[tokens.length - 1] == ")"){  //We are an s-expression
            let parenthesisCounter = 0;
            let childExpressions = [];
            let childExpression = "";
            for(let i = 2; i < tokens.length-1; i++){ //Find internal top level s-expressions to make children
                if(tokens[i] == ")"){
                    parenthesisCounter--;
                    childExpression += " " + tokens[i] + " ";
                    if(parenthesisCounter == 0){
                        childExpressions.push(childExpression);
                        childExpression = "";
                    }
                }else if(tokens[i] == "("){
                    parenthesisCounter++;
                    childExpression += " " + tokens[i] + " ";
                }else if(parenthesisCounter == 0){
                    childExpressions.push(tokens[i])
                }else if(parenthesisCounter >= 1){
                    childExpression += " " + tokens[i] + " ";
                }
            }
            if(parenthesisCounter != 0){ //uh oh you need parens
                this.value = "ERROR";
            }else{
                this.value = tokens[1];
                for(let child of childExpressions){
                    this.children.push(new SExpression(child))
                }
            }
        }else{
            this.value = "ERROR";
        }
    }

    getValue(){
        return this.value;
    }

    getValue(){
        return this.children;
    }

    isValid(){
        let valid = true;
        valid &&= this.value != "ERROR"
        for(let child of this.children){
            valid &&= child.isValid();
        }
        return valid;
    }

    toString(_depth = 0){
        if(this.value == "ERROR"){
            return "ERROR"
        }
        if(this.children.length == 0){
            return this.value;
        }else if(this.children.length == 1 && logicalOperatorNames.includes(this.value)){
            return logicalOperatorSymbols[this.value] + this.children[0].toString(_depth + 1); 
        }else if(this.children.length == 2 && logicalOperatorNames.includes(this.value)){
            let string = this.children[0].toString(_depth + 1) + " " + logicalOperatorSymbols[this.value] + " " + this.children[1].toString(_depth + 1); 
            if(_depth != 0)
                return "(" + string + ")";
            else
                return string;
        }else{ //We're a function or predicate
            let string = this.value + "(";
            for(let child of this.children){
                string += child.toString(_depth + 1) + ",";
            }
            return string.slice(0, -1) + ")";
        }
    }
}