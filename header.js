/**
 * @fileoverview Contains event handlers for items in the header menu
 */
import * as LZString from "./libs/lz-string.min.js";
import { setStateFromJSON, stateToJSON } from "./state.js";
/**
 * Downloads A file to the users computer with the given filename and file contents.
 * Taken from https://stackoverflow.com/a/45831280/6342516.
 * @param filename the name of the file to download
 * @param fileContents the contents of the download file
 */
function download(filename, contents) {
    let element = document.createElement('a');
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
export function onDownloadButtonPress() {
    const fileContents = stateToJSON();
    const fileName = new Date().getTime() + ".json";
    download(fileName, fileContents);
}
/**
 * Creates a compressed link to a lazyslate proof using a URL param
 */
export function onGetLinkButtonPress() {
    const fileContents = stateToJSON();
    const compressedFileContents = LZString.compressToEncodedURIComponent(fileContents);
    const URIEncodedCompressedFileContents = compressedFileContents.replaceAll("-", "%2D");
    const lazyslateHost = window.location.href.split("?")[0];
    const url = lazyslateHost + "?proof=" + URIEncodedCompressedFileContents;
    navigator.clipboard.writeText(url);
}
/**
 * Uses a provided lazyslate proof file to build a
 */
export function onProofFileUpload() {
    let file = document.getElementById('proof-file-input').files[0];
    let reader = new FileReader();
    reader.addEventListener("load", () => { setStateFromJSON(reader.result.toString()); }, false);
    reader.readAsText(file);
}
//global export event handlers
window["onDownloadButtonPress"] = onDownloadButtonPress;
window["onGetLinkButtonPress"] = onGetLinkButtonPress;
window["onProofFileUpload"] = onProofFileUpload;
//# sourceMappingURL=header.js.map