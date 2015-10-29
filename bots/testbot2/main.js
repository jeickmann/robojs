importScripts('../../js/robotBase.js');

var started = false;

Robot = RobotBase;

Robot.name = 'Bot2 (unten)';

Robot.run = function() {
    if(!started) {
        started = true;
        //this.moveForward(200);
        this.turnRadarLeft(Math.PI*1.4);
    }
};
 
Robot.startRound = function() {
    started = false;
}

Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    console.log("We " + this.name + " scanned " + name + " at " + (direction*180/Math.PI));
}

Robot.ready();