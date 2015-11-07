importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

var started = false;

Spinbot = function() {
    RobotBase.call(this);
    this.name = 'SpinBot';
}

Spinbot.prototype = Object.create(RobotBase.prototype);
Spinbot.prototype.constructor = Spinbot;

Spinbot.prototype.run = function() {
    this.turnRight(10);
    this.moveForward(25);
};
 
Spinbot.prototype.startRound = function() {
    started = false;
}

Spinbot.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    this.fire(3);
}

robot = new Spinbot();
robot.ready();