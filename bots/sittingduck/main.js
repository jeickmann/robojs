importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

var started = false;

Robot = RobotBase;

Robot.name = 'Sitting Duck';

Robot.run = function() {
    
};
 
Robot.startRound = function() {
    started = false;
}

Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    
}

Robot.ready();