(function(){

    function _getPointList(centerPoint, radius, pointAmount) {
        let points = [];
        for (let i=0; i<pointAmount; i++) {
            let alpha = (i/pointAmount) * 2 * Math.PI
            points.push(new Point(
                centerPoint.x + radius*Math.cos(alpha),
                centerPoint.y + radius*Math.sin(alpha)
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
        this._canvas = (function(c){
            let domNode = null;
            if (typeof c === 'string') {
                domNode = document.querySelector(c) || document.getElementById(c);
            } else if (c instanceof Element || c instanceof Node) {
                domNode = c.tagName.toLowerCase() === 'canvas' ? c : null;
            }

            if (domNode === null) {
                throw "Invalid element"
            } else {
                return domNode;
            }
        })(canvas);

        if (this._canvas != null) {
            let ctx = this._canvas.getContext('2d');
            this._radius = Math.min(ctx.canvas.clientWidth, ctx.canvas.clientHeight)/2;
            this._pointList = _getPointList(new Point(0, 0), this._radius, 10);
            ctx.transform(1, 0, 0, -1, ctx.canvas.clientWidth/2, ctx.canvas.clientHeight/2);
            ctx.save();
        }

        this.draw = function(theNumber) {
            // TODO
            let ctx = this._canvas.getContext('2d');
            ctx.arc(0, 0, this._radius, 0, 2*Math.PI, true);
            let lastDigit = null;
            for (let digit of theNumber) {
                if (/[0-9]/g.test(digit)) {
                    if (lastDigit != null && lastDigit != digit) {
                        let p0 = this._pointList[parseInt(lastDigit)];
                        r0 = _getLineByPoints(
                            new Point(0,0),
                            p0
                        );

                        let p1 = this._pointList[parseInt(digit)];
                        r1 = _getLineByPoints(
                            new Point(0,0),
                            p1
                        );
                        
                        let p = _getIntersectionPoint(
                            r0.perpendicularLineAt(p0),
                            r1.perpendicularLineAt(p1)
                        );
                        let arcRadius = p.distanceTo(new Point(0,0));
                        try {
                            ctx.arc(p0.x, p0.y, p1.x, p1.y, arcRadius);
                        } catch (err) {
                            console.log(err.message, arcRadius);
                        }
                    } else {
                        let firstPoint = this._pointList[parseInt(digit)];
                        ctx.moveTo(firstPoint.x, firstPoint.y);
                    }
                    lastDigit = digit;
                }
            }
            ctx.stroke();
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