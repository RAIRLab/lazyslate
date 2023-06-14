
//Initilize modules

import "./core/Proof/state"
import "./core/Widgets/header"
import "./core/Widgets/newNodeMenu"
import "./core/Canvas/proofCanvas"
import "./core/Proof/sexpression"
import "./core/Proof/verify"

import "./style.css"

import { decompressFromEncodedURIComponent } from "./libs/lz-string"
import { setStateFromJSON } from "./core/Proof/jsonIO"
import { drawState } from "./core/Canvas/proofCanvas"
import { proofLinks, proofNodes } from "./core/Proof/state"

//When the document loads initlize the canvas and load proof if provided by URL
window.addEventListener('load', function() {
    //Expose global state to console
    this.window["proofNodes"] = proofNodes;
    this.window["proofLinks"] = proofLinks;
    //Load the proof encoded in the URL if it exists
    const queryString : string = window.location.search;
    const urlParams : URLSearchParams = new URLSearchParams(queryString);
    if(urlParams.has("proof")){
        const uriEncodedCompressedProof : string = urlParams.get("proof");
        const compressedProof : string = uriEncodedCompressedProof.replaceAll("%2D", "-");
        const jsonProofString : string = decompressFromEncodedURIComponent(compressedProof);
        setStateFromJSON(jsonProofString);
        drawState();
    }
});