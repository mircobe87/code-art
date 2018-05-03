(function(){

    let PADDING = 17;
    let LABEL_OFFSET = 8;
    let RING_OFFSET = 8;
    let RING_SIZE = 12;
    let LINE_SIZE = 1.33;

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

    function _normDeg(n) {
        return (n%360 + 360)%360;
    }

    function _red(h) {
        let deg = _normDeg(h);
        if (0 <= deg && deg < 60) {
            return 255;
        } else if (60 <= deg && deg < 120) {
            return -255/60*deg + 510;
        } else if (120 <= deg && deg < 240) {
            return 0;
        } else if (240 <= deg && deg < 300) {
            return  255/60*deg - 1020;
        } else {
            return 255;
        }
    }

    function _green(h) {
        let deg = _normDeg(h);
        if (0 <= deg && deg < 60) {
            return 255/60*deg;
        } else if (60 <= deg && deg < 180) {
            return 255;
        } else if (180 <= deg && deg < 240) {
            return -255/60*deg + 1020;
        } else {
            return 0;
        }
    }

    function _blue(h) {
        let deg = _normDeg(h);
        if (0 <= deg && deg < 120) {
            return 0;
        } else if (120 <= deg && deg < 180) {
            return 255/60*deg - 510;
        } else if (180 <= deg && deg < 300) {
            return 255;
        } else {
            return -255/60*deg + 255*6;
        }
    }

    function _rgbString(h) {
        return "rgb(" + _red(h) + "," + _green(h) + "," + _blue(h) + ")";
    }

    function _colorLuminance(h) {
        return 0.299*_red(h) + 0.587*_green(h) + 0.114*_blue(h);
    }

    function _getColorList(pointList) {
        let colorList = [];
        for (let i=0; i<360; i = i+360/pointList.length) {
            colorList.push(_rgbString(i));
        }
        return colorList;
    }

    function _getLabelColorList(pointList) {
        let colors = [];
        for (let i=0; i<360; i = i+360/pointList.length) {
            colors.push(_colorLuminance(i) >= 128 ? "black" : "white");
        }
        return colors;
    }

    function _drawBackground(canvas, radius) {
        let ctx = canvas.getContext("2d");
        ctx.save();
        ctx.transform(1, 0, 0, -1, canvas.clientWidth/2, canvas.clientHeight/2);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, 0, radius + RING_SIZE, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.restore();
    }

    function _drawCircle(canvas, radius, pointList, colorList) {
        let ctx = canvas.getContext("2d");
        ctx.save();

        ctx.transform(1, 0, 0, -1, canvas.clientWidth/2, canvas.clientHeight/2);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.arc(0, 0, radius, 0, 2*Math.PI, true);
        ctx.closePath();
        ctx.stroke();

        ctx.lineWidth = RING_SIZE;
        ctx.moveTo(radius + RING_OFFSET, 0);
        for (let i=0; i<pointList.length; i++) {
            ctx.beginPath();
            ctx.strokeStyle = colorList[i];
            ctx.arc(0, 0, radius + RING_OFFSET, i*2*Math.PI/pointList.length, (i+1)*2*Math.PI/pointList.length, false);
            ctx.stroke();
        }

        ctx.restore();
    }

    function _drawLabels(canvas, labelPositionList, labelColorList) {
        let xOffset = canvas.clientWidth/2;
        let yOffset = canvas.clientHeight/2;
        let ctx = canvas.getContext("2d");
        for(let label=0; label<labelPositionList.length; label++) {
            ctx.save();
            ctx.fillStyle = labelColorList[label];
            ctx.font = '13px monospace';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.translate(xOffset + labelPositionList[label].x, yOffset - labelPositionList[label].y);
            ctx.fillText(label, 0, 0);
            ctx.restore();
        }
    }

    function _drawArc(canvas, pointList, origin, radius, lastDigit, digit, colorList) {
        let ctx = canvas.getContext("2d");
        let p0 = pointList[parseInt(lastDigit)];
        let p1 = pointList[parseInt(digit)];

        ctx.save();
        ctx.transform(1, 0, 0, -1, ctx.canvas.clientWidth/2, ctx.canvas.clientHeight/2);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);

        let lineargradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        lineargradient.addColorStop(0, colorList[parseInt(lastDigit)]);
        lineargradient.addColorStop(1, colorList[parseInt(digit)]);
        ctx.strokeStyle = lineargradient;
        ctx.lineWidth = LINE_SIZE;

        if ( p0.distanceTo(p1).toFixed(5) == (2*radius).toFixed(5) ) {
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

        ctx.stroke();
        ctx.restore();
    }

    function _getLabelPositionList(centerPoint, radius, pointAmount) {
        let labelPositionList = [];
        for (let i=0; i<pointAmount; i++) {
            let alpha = (2 * Math.PI/pointAmount) * (1/2 + i);
            labelPositionList.push(new Point(
                centerPoint.x + (radius + LABEL_OFFSET)*Math.cos(alpha),
                centerPoint.y + (radius + LABEL_OFFSET)*Math.sin(alpha)
            ));
        }
        return labelPositionList;
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
            this._radius = Math.min(ctx.canvas.clientWidth, ctx.canvas.clientHeight)/2 - PADDING;
            this._pointList = _getPointList(new Point(0, 0), this._radius, 10);
            this._colorList = _getColorList(this._pointList);
            this._labelPositionList = _getLabelPositionList(new Point(0, 0), this._radius, 10);
            this._labelColorList = _getLabelColorList(this._pointList);
        }

        this.draw = function(theNumber) {
            let origin = new Point(0, 0);
            let ctx = this._canvas.getContext('2d');
            let movePoint = this._getPointMover(theNumber);

            _drawBackground(this._canvas, this._radius);

            let lastDigit = null;
            for (let digit of theNumber) {
                if (/[0-9]/g.test(digit)) {
                    if (lastDigit != null && lastDigit != digit) {
                        _drawArc(this._canvas, this._pointList, origin, this._radius, lastDigit, digit, this._colorList);
                        this._pointList[parseInt(lastDigit)] = movePoint(lastDigit);
                    }
                    lastDigit = digit;
                }
            }

            _drawCircle(this._canvas, this._radius, this._pointList, this._colorList);
            _drawLabels(this._canvas, this._labelPositionList, this._labelColorList);
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