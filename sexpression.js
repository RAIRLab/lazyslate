/**
 * @fileoverview This file specifies an SExpression class for creating and manipulating SExpression formulae.
 */
import { logicalOperatorNames, logicalOperatorSymbols } from "./settings.js";
//This file assumes settings.js has already been imported
/** A logical formula tree represented as an SExpression, see https://en.wikipedia.org/wiki/S-expression */
export class SExpression {
    /**
     * Constructs an SExpression tree from an SExpression string. On failiure to parse
     * will still return an SExpression tree with the value ERROR where any synatx errors were found.
     * @param sExpressionString the string to parse
     */
    constructor(sExpressionString) {
        this.string = sExpressionString;
        this.value = null;
        this.children = [];
        //Parsing 
        let spacedString = this.string.replaceAll("(", " ( ").replaceAll(")", " ) ").trim();
        let tokens = spacedString.split(/\s+/); //split on spaces
        if (tokens.length == 1 && tokens[0].match(/^[0-9a-zA-Z]+$/)) { //We are a logical constant
            this.value = tokens[0];
        }
        else if (tokens.length >= 3 && tokens[0] == "(" && tokens[tokens.length - 1] == ")") { //We are an s-expression
            let parenthesisCounter = 0;
            let childExpressions = [];
            let childExpression = "";
            for (let i = 2; i < tokens.length - 1; i++) { //Find internal top level s-expressions to make children
                if (tokens[i] == ")") {
                    parenthesisCounter--;
                    childExpression += " " + tokens[i] + " ";
                    if (parenthesisCounter == 0) {
                        childExpressions.push(childExpression);
                        childExpression = "";
                    }
                }
                else if (tokens[i] == "(") {
                    parenthesisCounter++;
                    childExpression += " " + tokens[i] + " ";
                }
                else if (parenthesisCounter == 0) {
                    childExpressions.push(tokens[i]);
                }
                else if (parenthesisCounter >= 1) {
                    childExpression += " " + tokens[i] + " ";
                }
            }
            if (parenthesisCounter != 0) { //uh oh you need parens
                this.value = "ERROR";
            }
            else {
                this.value = tokens[1];
                for (let child of childExpressions) {
                    this.children.push(new SExpression(child));
                }
            }
        }
        else {
            this.value = "ERROR";
        }
    }
    /** Gets the value of the SExpression */
    getValue() {
        return this.value;
    }
    /** Gets the children of the SExpression */
    getChildren() {
        return this.children;
    }
    /**
     * Recursively checks if the SExpression tree was correctly constructed with no errors
     * @returns true iff constructed with no errors.
     */
    isValid() {
        let valid = true;
        valid &&= this.value != "ERROR";
        for (let child of this.children) {
            valid &&= child.isValid();
        }
        return valid;
    }
    /**
     * Converts the SExpression to a unicode logical formula string. NOT an SExpression string.
     * @param _depth How deep in the SExpression tree we are
     * @returns A unicode string of the logical formula represented by the SExpression
     */
    toString(_depth = 0) {
        if (this.value == "ERROR") {
            return "ERROR";
        }
        if (this.children.length == 0) {
            return this.value;
        }
        else if (this.children.length == 1 && logicalOperatorNames.includes(this.value) && this.value == "not") { //Eventually we should specify unary operators in settings
            return logicalOperatorSymbols.get(this.value) + this.children[0].toString(_depth + 1);
        }
        else if (this.children.length == 2 && logicalOperatorNames.includes(this.value)) {
            let string = this.children[0].toString(_depth + 1) + " " + logicalOperatorSymbols.get(this.value) + " " + this.children[1].toString(_depth + 1);
            if (_depth != 0)
                return "(" + string + ")";
            else
                return string;
        }
        else { //We're a function or predicate
            let string = this.value + "(";
            for (let child of this.children) {
                string += child.toString(_depth + 1) + ",";
            }
            return string.slice(0, -1) + ")";
        }
    }
    /**
     * Converts the SExpression tree to an SExpression string, should be equal to this.string without extra whitespace.
     * @returns An SExpression string represented by this SExpression.
     */
    toExpressionString() {
        if (this.children.length == 0) {
            return this.value;
        }
        else {
            let string = "(" + this.value + " ";
            for (let child of this.children) {
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
    equals(other) {
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
}
//# sourceMappingURL=sexpression.js.map