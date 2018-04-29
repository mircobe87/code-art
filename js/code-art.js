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

    function getDistance(point0, point1) {
        return Math.sqrt(Math.pow(point1.x - point0.x, 2) - Math.pow(point1.y - point0.y, 2));
    }

    function getLineByPoints(point0, point1) {
        return {
            m: (point0.y - point1.y) / (point0.x - point1.x),
            q: (point1.y*point0.x - point0.y*point1.x) / (point0.x - point1.x)
        };
    }

    function getIntersectionPoint(line0, line1) {
        return {
            x: (line1.q - line0.q) / (line0.m - line1.m),
            y: (line0.m * line1.q - line1.m * line0.q) / (line0.m - line1.m)
        };
    }

    window.CodeArt = CODE_ART;
})();