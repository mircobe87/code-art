document.addEventListener("DOMContentLoaded", function(event){
    //TODO: init application
    console.log("DOMContentLoaded :: fired");

    let drawingArea = CodeArt.init("#drawingArea");
    //drawingArea.draw("3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067");
    drawingArea.draw("1.414213562373095048801688724209698078569671875376948073176679737990732478462107038850387534327641573");
})