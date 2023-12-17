
//Initialize modules

import "./core/Proof/state"
import "./core/Widgets/header"
import "./core/Widgets/newNodeMenu"
import "./core/Canvas/proofCanvas"
import "./core/Proof/sexpression"
import "./core/Proof/verify"

import { decompressFromEncodedURIComponent } from "lz-string"
import { setStateFromJSON } from "./core/Proof/jsonIO"
import { drawState } from "./core/Canvas/proofCanvas"

//When the document loads initialize the canvas and load proof if provided by URL
window.addEventListener('load', function() {
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