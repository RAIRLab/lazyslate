

// Downloads A file 
// https://stackoverflow.com/a/45831280/6342516
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function onDownloadButtonPress(){
    const fileContents = stateToJSON();
    const fileName = new Date().getTime()+".json";
    download(fileName, fileContents);
}

function onGetLinkButtonPress(){
    const fileContents = stateToJSON();
    const compressedFileContents = LZString.compressToEncodedURIComponent(fileContents);
    const URIEncodedCompressedFileContents = compressedFileContents.replaceAll("-", "%2D");
    const lazyslateHost = window.location.href.split("?")[0];
    const url = lazyslateHost + "?proof=" + URIEncodedCompressedFileContents;
    navigator.clipboard.writeText(url);
}

function onProofFileUpload(){
    let file = document.getElementById('proof-file-input').files[0];
    let reader = new FileReader();
    reader.addEventListener("load", ()=>{setStateFromJSON(reader.result)}, false);
    reader.readAsText(file);
}

