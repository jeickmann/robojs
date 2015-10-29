importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

var started = false;

Robot = RobotBase;

Robot.name = 'Testbot II';

Robot.run = function() {
    this.moveForward(200);
    this.turnRight(10);
};
 
Robot.startRound = function() {
    started = false;
}

Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    
}

Robot.ready();