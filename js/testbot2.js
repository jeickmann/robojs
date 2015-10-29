importScripts('robotBase.js');

var started = false;

Robot = RobotBase;

Robot.name = 'Bot2 (unten)';

Robot.run = function() {
    if(!started) {
        started = true;
        //this.moveForward(200);
    }
};
 
Robot.startRound = function() {
    console.log('NEW ROUND');
    started = false;
}

Robot.ready();