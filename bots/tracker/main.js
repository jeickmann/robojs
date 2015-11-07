importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Tracker = function() {
    RobotBase.call(this);
    this.name = 'Tracker';
}

Tracker.prototype = Object.create(RobotBase.prototype);
Tracker.prototype.constructor = Tracker;

Tracker.prototype.run = function() {
    
};

SCANNING = 1;
TURNING = 2;
MOVING = 3;

FIRE_DISTANCE = 150;

//called at the start of each round
Tracker.prototype.startRound = function() {
    this.state = SCANNING;
};
    
//called every game tick
Tracker.prototype.run = function() { 
    switch(this.state) {
        case SCANNING:
            this.turnGunRight(100);
            break;
        case TURNING:
            if(Math.abs(this.rotationLeft) < 0.1) {
               this.moveForward(this.movementNeeded);
                this.state = MOVING;
            }
            break;
        case MOVING:
            if(Math.abs(this.distanceLeft) < 2) {
                this.state = SCANNING;
            }
            break;
    }
};
        
//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
Tracker.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    if(this.state == SCANNING) {
        if(distance < FIRE_DISTANCE) {
            this.turnGunRight(0);
            this.moveForward(0);
            this.fire(3);
            this.state = SCANNING;
        } else {
            var turnAngle = getRotation(this.angle, direction);
            this.turnRight(turnAngle);
            var gunTurnAngle = normalizeDiffAngle(getRotation(this.gunAngle, direction) - turnAngle);
            this.turnGunRight(gunTurnAngle);
            this.movementNeeded = Math.max(0, distance - FIRE_DISTANCE + 10);
            this.state = TURNING;
        }
    }
};

robot = new Tracker();
//declare everything loaded, after all robots have reported in, the first round starts
robot.ready();
