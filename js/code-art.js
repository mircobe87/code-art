(function(){

    function _getPointList(centerPoint, radius, pointAmount) {
        let points = [];
        for (let i=0; i<pointAmount; i++) {
            let alpha = (i/pointAmount) * 2 * Math.PI
            points.push(new Point(
                centerPoint.x + radius*Math.sin(alpha),
                centerPoint.y + radius*Math.cos(alpha)
            ));
        }
        return points;
    }

    function _getPerpendicularLineOnPoint(srcLine, point) {
        let m = -1 / srcLine.m;
        return new Line(m, point.y - m*point.x);
    }

    function _getDistance(point0, point1) {
        return Math.sqrt(Math.pow(point1.x - point0.x, 2) + Math.pow(point1.y - point0.y, 2));
    }

    function _getLineByPoints(point0, point1) {
        return new Line(
            (point0.y - point1.y) / (point0.x - point1.x),
            (point1.y*point0.x - point0.y*point1.x) / (point0.x - point1.x)
        );
    }

    function _getIntersectionPoint(line0, line1) {
        return new Point(
            (line1.q - line0.q) / (line0.m - line1.m),
            (line0.m * line1.q - line1.m * line0.q) / (line0.m - line1.m)
        );
    }

    function Point(x,y) {
        this.x = x;
        this.y = y;

        this.toString = function() {
            return "(" + this.x + ", " + this.y + ")";
        };

        this.distanceTo = function(point) {
            return _getDistance(this, point);
        };
    }

    function Line(m, q) {
        this.m = m;
        this.q = q;

        this.toString = function() {
            return "y = " + this.m + "x + " + this.q;
        };

        this.perpendicularLineAt = function(point) {
            let line = _getPerpendicularLineOnPoint(this, point);
            return new Line(line.m, line.q);
        };
    }

    function Art(canvas) {
        this.canvas = canvas;
        this.draw = function(theNumber) {
            // TODO
        };
        this.clear = function() {
            // TODO
        };
    }

    var CODE_ART = {
        Art: Art,
        Geometry: {
            Art: Art,
            Point: Point,
            Line: Line,
            getPerpendicularLineOnPoint: _getPerpendicularLineOnPoint,
            getDistance: _getDistance,
            getLineByPoints: _getLineByPoints,
            getIntersectionPoint: _getIntersectionPoint
        },
        init: function(canvas) {
            return new Art(canvas);
        }
    };

    window.CodeArt = CODE_ART;
})();