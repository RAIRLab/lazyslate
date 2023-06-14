
/**
 * @fileoverview This file specifies an SExpression class for creating and manipulating SExpression formulae.
 */

import {logicalOperatorNames, logicalOperatorSymbols} from "../settings"

//This file assumes settings.js has already been imported
 
/** A logical formula tree represented as an SExpression, see https://en.wikipedia.org/wiki/S-expression */
export class SExpression{
    string : string;              //The string representation of the SExpression
    value : string;               //This is a string representing the logical operation, predicate, or function name
    children: Array<SExpression>; //This is the list of SExpressions that are children of the node

    /**
     * Constructs an SExpression tree from an SExpression string. On failiure to parse
     * will still return an SExpression tree with the value ERROR where any synatx errors were found.
     * @param sExpressionString the string to parse
     */
    constructor(sExpressionString : string){
        this.string = sExpressionString;
        this.value = null;                
        this.children = []; 

        //Parsing 
        let spacedString : string = this.string.replaceAll("(", " ( ").replaceAll(")", " ) ").trim();
        let tokens : Array<string> = spacedString.split(/\s+/); //split on spaces
        if(tokens.length == 1 && tokens[0].match(/^[0-9a-zA-Z]+$/)){   //We are a logical constant
            this.value = tokens[0];
        }else if(tokens.length >= 3 && tokens[0] == "(" && tokens[tokens.length - 1] == ")"){  //We are an s-expression
            let parenthesisCounter : number = 0;
            let childExpressions : Array<string> = [];
            let childExpression : string = "";
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

    /** Gets the value of the SExpression */
    getValue() : string{
        return this.value;
    }

    /** Gets the children of the SExpression */
    getChildren() : Array<SExpression>{
        return this.children;
    }

    /**
     * Recursively checks if the SExpression tree was correctly constructed with no errors
     * @returns true iff constructed with no errors.
     */
    isValid() : boolean{
        let valid : boolean = true;
        valid &&= this.value != "ERROR"
        for(let child of this.children){
            valid &&= child.isValid();
        }
        return valid;
    }

    /**
     * Converts the SExpression to a unicode logical formula string. NOT an SExpression string.
     * @param _depth How deep in the SExpression tree we are
     * @returns A unicode string of the logical formula represented by the SExpression
     */
    toString(_depth : number = 0) : string{
        if(this.value == "ERROR"){
            return "ERROR"
        }
        if(this.children.length == 0){
            return this.value;
        }else if(this.children.length == 1 && logicalOperatorNames.includes(this.value) && this.value == "not"){ //Eventually we should specify unary operators in settings
            return logicalOperatorSymbols.get(this.value) + this.children[0].toString(_depth + 1); 
        }else if(this.children.length == 2 && logicalOperatorNames.includes(this.value)){
            let string = this.children[0].toString(_depth + 1) + " " + logicalOperatorSymbols.get(this.value) + " " + this.children[1].toString(_depth + 1); 
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

    /**
     * Converts the SExpression tree to an SExpression string, should be equal to this.string without extra whitespace.
     * @returns An SExpression string represented by this SExpression.
     */
    toExpressionString() : string{
        if(this.children.length == 0){
            return this.value;
        }else{
            let string = "("+ this.value + " ";
            for(let child of this.children){
                string += child.toExpressionString() + " ";
            }
            return string.slice(0, -1) + ")";
        }
    }

    /**
     * Recursively checks if two SExpressions are equivelent 
     * @param other The SExpression to compare against
     * @returns If the two SExpressions match
     */
    equals(other : SExpression) : boolean {
        let values_match = this.value == other.value;
        if (!values_match) {
            return false;
        }

        let children_length_match = this.children.length == other.children.length;
        if (!children_length_match) {
            return false;
        }

        for (let i = 0; i < this.children.length; i++) {
            if (!this.children[i].equals(other.children[i])) {
                return false;
            }
        }

        return true;
    } 

    /**
     * Recursively decends the parse tree and returns a list of bound vars and the quantifiers they bind to
     * @param quantifierStack A stack of nested quantifiers, in the event of name clashes, will bind to the 
     *                        more deeply nested one.
     * @param term A boolean indicating weather the current SExpression is on the term level, false if formula level
     * @returns A list of pairs conatining [quantifier SExpression Object, bound Var SExpression Object]
     */
    private varsRecursive(quantifierStack : Array<SExpression>, termLevel : boolean) : Array<[SExpression, SExpression]>{
        //Base case: We are a 0 arity constant on the term level
        if(this.children.length == 0 && termLevel){
            //Search the quantifier stack backwards and bind to the nearest one 
            for(let i = quantifierStack.length-1; i >= 0; i--){
                let quantifier : SExpression = quantifierStack[i];
                let quantifedVar : string = quantifier.children[0].value;
                if(this.value == quantifedVar){
                    return new Array([quantifier, this]);
                }
            }
            return new Array();
        }
        //Recursive case 1: We are a quantifier
        if(this.children.length == 2 && (this.value == "forall" || this.value == "exists")){
            quantifierStack.push(this);
            let rv = this.children[1].varsRecursive(quantifierStack, false);
            quantifierStack.pop();
            return rv;
        }
        //Recursive case 2: We are 
        let boundVars : Array<[SExpression, SExpression]> = new Array();
        for(let child of this.children){
            //The child is only a term iff we are not a logical operator.
            let isTermLevel : boolean = logicalOperatorNames.includes(this.value);
            let newBoundVars = child.varsRecursive(quantifierStack, isTermLevel);
            //Union in the new bound vars
            boundVars.concat(newBoundVars)
        }
        return boundVars;
    }

    /**
     * @returns A list of all sub-expression objects that are bound variables
     */
    vars() : Array<SExpression>{
        let boundVarsAndQuants : Array<[SExpression, SExpression]> = this.varsRecursive([], false);
        let boundVars : Array<SExpression> = boundVarsAndQuants.map(v=>v[1]);
        return boundVars;
    }


    private recursiveLeafTerms(termLevel : boolean) : Array<SExpression>{
        //Base case, term level 0 arity
        if(this.children.length == 0 && termLevel){
            return new Array(this);
        }
        //Recursive case, children
        let leafTerms : Array<SExpression> = new Array();
        for(let child of this.children){
            //The child is only a term iff we are not a logical operator.
            //Note that this also prevents quantifier's first children from being consitered leafs 
            let isTermLevel : boolean = logicalOperatorNames.includes(this.value);
            leafTerms.concat(child.recursiveLeafTerms(isTermLevel));
        }
        return leafTerms;
    }

    /**
     * @returns the set of object constant SExpressions in this SExpression
     */
    constants() : Array<SExpression>{
        
    }
}
