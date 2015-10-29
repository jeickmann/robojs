importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Robot = RobotBase;

Robot.name = 'Testbot I';

Robot.run = function() {
    //keep it spinning
    this.turnRadarRight(100);
    //this.fire(3);
};

 Robot.onHitWall = function() {
    console.log('OUCH');
    dir *-1;
    this.moveForward(520 * dir);
    this.turnRight(Math.PI);
}
 
Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    //turn gun towards enemy
    var gunTurn = normalizeDiffAngle(direction - this.gunAngle);
    this.turnGunRight(gunTurn);
    if(gunTurn < 0.1) {
        this.fire(3);   
    }
}
 
Robot.startRound = function() {
    console.log('NEW ROUND');
    started = false;
    dir = 1;
}

Robot.ready();