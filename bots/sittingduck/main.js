importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

var started = false;

SittingDuck = function() {
    RobotBase.call(this);
    this.name = 'Sitting Duck';
}

SittingDuck.prototype = Object.create(RobotBase.prototype);
SittingDuck.prototype.constructor = SittingDuck;

SittingDuck.prototype.run = function() {
    
};
 
SittingDuck.prototype.startRound = function() {
    started = false;
}

SittingDuck.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    
}

robot = new SittingDuck();
robot.ready();