document.addEventListener("DOMContentLoaded", function(event){
    //TODO: init application
    console.log("DOMContentLoaded :: fired");

    let drawingArea = CodeArt.init("#drawingArea");
    // drawingArea.draw("3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067");
    // drawingArea.draw("1.414213562373095048801688724209698078569671875376948073176679737990732478462107038850387534327641573");
    drawingArea.draw("2,718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011573834187930702154089149934884167509244761460668082264800168477411853742345442437107539077744992069");
    // drawingArea.draw("012345678902468036925814704825937050");
    // drawingArea.draw("05162738495061728394");
    // drawingArea.draw("05162738495061728394");
})