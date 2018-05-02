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
        if (line0.verticalValue != null && line1.verticalValue != null) {
            return null;
        } else if (line0.m == 0 && line1.m == 0) {
            return null;
        } else if (line0.verticalValue != null) {
            return new Point(
                line0.verticalValue,
                line1.m * line0.verticalValue + line1.q
            );
        } else if (line1.verticalValue != null) {
            return new Point(
                line1.verticalValue,
                line0.m * line1.verticalValue + line0.q
            );
        }
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
        this.verticalValue = null;

        this.toString = function() {
            return "y = " + this.m + "x + " + this.q;
        };

        this.perpendicularLineAt = function(point) {
            let line;
            if (this.isVertical()) {
                return new Line(0, point.y);
            } else if (this.isHorizontal()) {
                let line = new Line(Infinity, Infinity);
                line.makeVertical(point.x);
                return line;
            } else {
                let line = _getPerpendicularLineOnPoint(this, point);
                return new Line(line.m, line.q);
            }
        };

        this.isVertical = function() {
            return this.verticalValue != null;
        };

        this.isHorizontal = function() {
            return this.m == 0;
        };

        this.makeVertical = function(value) {
            this.m = Infinity;
            this.q = Infinity;
            this.verticalValue = value;
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
            let origin = new Point(0, 0);
            let ctx = this._canvas.getContext('2d');
            let movePoint = this._getPointMover(theNumber);

            ctx.beginPath();
            let i=0;
            for(let p of this._pointList) {
                ctx.moveTo(p.x+5, p.y);
                ctx.arc(p.x, p.y, 5, 0, 2*Math.PI, true);
                ctx.fillText(i, p.x+7, p.y);
                i++;
            }

            // TODO
            ctx.moveTo(this._radius, 0);
            ctx.arc(0, 0, this._radius, 0, 2*Math.PI, true);

            let lastDigit = null;
            for (let digit of theNumber) {
                if (/[0-9]/g.test(digit)) {
                    if (lastDigit != null && lastDigit != digit) {
                        let p0 = this._pointList[parseInt(lastDigit)];
                        let p1 = this._pointList[parseInt(digit)];

                        if (Math.abs(parseInt(lastDigit) - parseInt(digit)) == 5) {
                            ctx.lineTo(p1.x, p1.y);
                        } else {
                            r0 = _getLineByPoints(
                                origin,
                                p0
                            );
                            r1 = _getLineByPoints(
                                origin,
                                p1
                            );
                            let p = _getIntersectionPoint(
                                r0.perpendicularLineAt(p0),
                                r1.perpendicularLineAt(p1)
                            );
                            let arcRadius = p.distanceTo(p0);
                            ctx.arcTo(origin.x, origin.y, p1.x, p1.y, arcRadius);
                        }
                        this._pointList[parseInt(lastDigit)] = movePoint(lastDigit);
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

        /*
         * Restituisce una funzione usara per spostare avanti sulla circonferenza
         * il pinto da cui partire per tracciare il prossimo arco.
         */
        this._getPointMover = function(theNumber) {
            let counters = {};
            for (let digit of theNumber) {
                if (/[0-9]/g.test(digit)) {
                    counters[digit] = counters[digit] == undefined ? 1 : counters[digit] + 1;
                }
            }
            let max = 0;
            Object.keys(counters).forEach(function(d){
                max = counters[d] > max ? counters[d] : max;
            });

            let step = 2 * Math.PI / (10 * (max*1)); // definisce l'ampiezza dello spostamento

            return function(pointIndex) {
                let srcPoint = this._pointList[parseInt(pointIndex)];
                return new Point(
                    Math.cos(step)*srcPoint.x - Math.sin(step)*srcPoint.y,
                    Math.sin(step)*srcPoint.x + Math.cos(step)*srcPoint.y,
                );
            }.bind(this);
        }
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