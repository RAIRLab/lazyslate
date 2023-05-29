
/**
 * @fileoverview Contains event handlers for items in the header menu
 */

import { compressToEncodedURIComponent } from "../../libs/lz-string";
import { setStateFromJSON, stateToJSON } from "../Proof/jsonIO";
import { drawState } from "../Canvas/proofCanvas";

/**
 * Downloads A file to the users computer with the given filename and file contents.
 * Taken from https://stackoverflow.com/a/45831280/6342516.
 * @param filename the name of the file to download
 * @param fileContents the contents of the download file
 */
function download(filename : string, contents : string) : void {
    let element : HTMLAnchorElement = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Downloads the current proof as a .json lazyslate proof file
 */
export function onDownloadButtonPress() : void{
    const fileContents : string = stateToJSON();
    const fileName : string = new Date().getTime()+".json";
    download(fileName, fileContents);
}

/**
 * Creates a compressed link to a lazyslate proof using a URL param
 */
export function onGetLinkButtonPress() : void{
    const fileContents = stateToJSON();
    const compressedFileContents = compressToEncodedURIComponent(fileContents);
    const URIEncodedCompressedFileContents = compressedFileContents.replaceAll("-", "%2D");
    const lazyslateHost = window.location.href.split("?")[0];
    const url = lazyslateHost + "?proof=" + URIEncodedCompressedFileContents;
    navigator.clipboard.writeText(url);
}

/**
 * Uses a provided lazyslate proof file to build a proof graph
 */
export function onProofFileUpload() : void{
    let file : File = (<HTMLInputElement>document.getElementById('proof-file-input')).files[0];
    let reader : FileReader = new FileReader();
    reader.addEventListener("load", ()=>{setStateFromJSON(reader.result.toString()); drawState();}, false);
    reader.readAsText(file);
}

//global export event handlers
window["onDownloadButtonPress"] = onDownloadButtonPress;
window["onGetLinkButtonPress"] = onGetLinkButtonPress;
window["onProofFileUpload"] = onProofFileUpload;
