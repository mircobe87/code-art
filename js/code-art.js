(function(){
    let CODE_ART = {};
    let canvas;

    CODE_ART.init = function(theCanvas) {
        canvas = theCanvas;
    };

    CODE_ART.draw = function(theNumber) {

    };

    CODE_ART.clear = function() {

    };

    function getPointList(centerPoint, radius, pointAmount) {
        let points = [];
        for (let i=0; i<pointAmount; i++) {
            let alpha = (i/pointAmount) * 2 * Math.PI
            points.push({
                x: centerPoint.x + radius*Math.sin(alpha),
                y: centerPoint.y + radius*Math.cos(alpha)
            });
        }
        return points;
    }

    function getPerpendicularLineOnPoint(srcLine, point) {
        let m = -1 / srcLine.m;
        return {
            m: m,
            q: point.y - m*point.x
        };
    }

    window.CodeArt = CODE_ART;
})();