importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

var started = false;

Robot = RobotBase;

Robot.name = 'SpinBot';

Robot.run = function() {
    this.turnRight(10);
    this.moveForward(25);
};
 
Robot.startRound = function() {
    started = false;
}

Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    this.fire(3);
}

Robot.ready();