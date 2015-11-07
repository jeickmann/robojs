var Rect = function(x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype = {
    getCornerVectors: function() {
        var result = [
            new Vector(this.x, this.y),
            new Vector(this.x, this.y+this.height),
            new Vector(this.x+this.width, this.y+this.height),
            new Vector(this.x+this.width, this.y)
        ];
        
        return result;
    },
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
    },
    subtract: function(vector) {
        this.x-=vector.x;
        this.y-=vector.y;
        
        return this;
    },    
    angleTo: function(v2) {
        var tmp = new Vector(v2.x, v2.y);
        tmp.subtract(this);
        return tmp.getAngle();
        
    },
    distanceTo: function(v2) {
        var tmp = new Vector(v2.x, v2.y);
        tmp.subtract(this);
        
        return tmp.getLength();
    }
    ,
    project: function(angle, distance) {
        this.x += Math.sin(angle) * distance;
        this.y += -Math.cos(angle) * distance;
        
        return this;
    }
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

//normalize angle to [0,2*PI]
function normalizeDiffAngle(angle) {
    while(angle < -Math.PI) {
        angle+= Math.PI * 2;
    }
    while(angle > Math.PI) {
        angle-= Math.PI * 2;
    }
    
    return angle;
}

function getRotation(fromAngle, toAngle) {
    return normalizeDiffAngle(toAngle - fromAngle);

}

//returns -1 for counterClockwise, 1 for Clockwise, 0 for no rotation
function getRotationDir(fromAngle, toAngle) {
    return Math.sign(getRotation(fromAngle, toAngle));
}

function isNear(value, value2) {
    return Math.abs(value-value2) < 0.001;
}
        

function getUrlParam(parameterName) {
    var queryString = window.location.search.substring(1);
  var parameterName = parameterName + "=";
  if ( queryString.length > 0 ) {
    begin = queryString.indexOf ( parameterName );
    if ( begin != -1 ) {
      begin += parameterName.length;
      end = queryString.indexOf ( "&" , begin );
        if ( end == -1 ) {
        end = queryString.length
      }
      return unescape ( queryString.substring ( begin, end ) );
    }
  }
  return null;
}

function getRandom(min, max) {
    return Math.random() * (max-min) + min;   
}
