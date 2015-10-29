importScripts('../../js/robotBase.js');

var started = false;
var dir = 1;

Robot = RobotBase;

Robot.name = 'Mein Testbot';

Robot.run = function() {
    if(!started) {
        started = true;
        //this.moveForward(520);
        //this.turnRight(Math.PI);
        //this.turnGunLeft(Math.PI/2);
        
        
    } 
    
    //this.fire(3);
};

 Robot.onHitWall = function() {
    console.log('OUCH');
    dir *-1;
    this.moveForward(520 * dir);
    this.turnRight(Math.PI);
}
 
Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    console.log("We " + this.name + " scanned " + name + " at " + (direction*180/Math.PI));
}
 
Robot.startRound = function() {
    console.log('NEW ROUND');
    started = false;
    dir = 1;
}

Robot.ready();