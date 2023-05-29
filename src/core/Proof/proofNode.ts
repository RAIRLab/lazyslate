
import { proofNodes } from "./state";
import { SExpression } from "./sexpression";

/**
 * A position on the 2d lazyslate canvas
 */
export class Position{
    x : number; 
    y : number;
}

/**
 * A 2d bounding box describing a rectangle on the lazyslate canvas
 */
export class BoundingBox{
    x0 : number; 
    y0 : number;
    x1 : number;
    y1 : number
}

/** 
 * A ProofNode represents both a hypernode in a natural deduction proof graph 
 * and its GUI representation in the lazyslate editor.
 * ```                      
 *                       topAnchor (for incoming lines)   
 *                       V
 *                /-------------\
 *                |justification|
 *                \-------------/
 *                       |
 *  position -> /----------------\
 *              | name (or id)   |
 *              | formula        |    <-- bounding box (the lower box)
 *              | {assumptions}  |
 *              \----------------/
 *                       ^
 *                      botAnchor (for outgoing lines)
 * ```
 */
export class ProofNode{

    //Proof graph representation
    id : number;
    justification : string;
    expression : SExpression;
    assumptions : Set<string>;
    children : Array<ProofNode>;
    parents : Array<ProofNode>;
    
    //Verifier properties
    verified : boolean;

    //GUI properties
    name : string;
    boundingBox : BoundingBox | null; 
    topAnchor : Position | null;
    botAnchor : Position | null;
    position : Position | null;

    /** 
     * @param name The name of the node as it appears on the GUI nodes and in GUI node assumptions
     * @param justification The justification used to derive this node from its parents
     * @param expression The formula this node represents
     * @param position The world positition of this node relitive to (0,0) world cordinates
     */
    constructor(name? : string , justification? : string, expression? : SExpression, position? : Position){
        if(arguments.length == 0){
            this._default_constructor()
        }else if(arguments.length == 4){
            //Ensure we never have conflicting node IDs if nodes are deleted
            this.id = proofNodes.length == 0 ? 0 : proofNodes[proofNodes.length - 1].id + 1; 
            //use the ID as the name if none is provided
            this.name = name == "" ? this.id.toString() : name; 
            this.justification = justification;
            this.expression = expression;
            this.assumptions = new Set(); 
            this.children = [];
            this.parents = [];

            //these GUI properties will be set by the renderer
            this.verified = false;
            this.boundingBox = null;
            this.topAnchor = null;
            this.botAnchor = null;
            this.position = position;
        }else{
            console.error("Invalid parameters to proof node constructor");
        }
    }

    /**
     * Sets all properties to default values
     */
    _default_constructor(){
        this.id = null;
        this.name = null;
        this.justification = null;
        this.expression = null;
        this.assumptions = new Set();
        this.children = [];
        this.parents = [];
        this.verified = false;
        this.boundingBox = null;
        this.topAnchor = null;
        this.botAnchor = null;
        this.position = null;
    }
}