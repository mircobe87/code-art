document.addEventListener("DOMContentLoaded", function(event){
    //TODO: init application
    console.log("DOMContentLoaded :: fired");

    let drawingArea = CodeArt.init("#drawingArea");
    drawingArea.draw();
})