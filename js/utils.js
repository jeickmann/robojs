var Rect = function(x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype = {
    isInside: function(x,y) {
        return (
            x >= this.x &&
            x < this.x + this.width &&
            y >= this.y &&
            y < this.y + this.height);
    },
    contains: function(rect) {
        return (this.isInside(rect.x, rect.y) &&
                this.isInside(rect.x + rect.width-1, rect.y + rect.height - 1));
    },
    overlaps: function(rect) {
        //return !(this.x + this.width < rect.x || this.y + this.height < rect.y || this.x > rect.x + rect.width || this.y > rect.y + rect.height);
        return (this.x < rect.x+rect.width && this.x+this.width > rect.x && 
                this.y < rect.y + rect.height && this.y+this.height > rect.y);
    }
}

var Vector = function(x,y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    getAngle: function() {
        return Math.atan2(this.y,this.x) + Math.PI/2;
    },
    getLength: function() {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }/*,
    
    angleTo: function(v2) {
        var crossZ = this.x * v2.y - this.y * v2.x;
        
        return Math.asin(crossZ/(this.getLength() * v2.getLength());
    }*/
}

function degrees2radions(degrees) {
    return degrees *  Math.PI / 180;
}

function radians2degrees(radians) {
    return radians /  Math.PI * 180;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));   
}

//normalize angle to [0,2*PI]
function normalizeAngle(angle) {
    while(angle < 0) {
        angle+= Math.PI * 2;   
    }
    while(angle > 2*Math.PI) {
        angle-= Math.PI * 2;
    }
    
    return angle;
}
        
function vectorFromAngle(angle) {
    
}