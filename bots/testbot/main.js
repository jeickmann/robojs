importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Testbot = function() {
    RobotBase.call(this);
    this.name = 'Testbot I';
}

Testbot.prototype = Object.create(RobotBase.prototype);
Testbot.prototype.constructor = Testbot;

Testbot.prototype.run = function() {
    //keep it spinning
    
        this.turnRadarRight(1000);   
    
    //this.fire(3);
};

 Testbot.prototype.onHitWall = function() {
    console.log('OUCH');
    dir *-1;
    this.moveForward(520 * dir);
    this.turnRight(Math.PI);
}
 
Testbot.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    /*
    this.enemyDetected = true;
    //turn radar fully towards enemy
    var radarTurn = normalizeDiffAngle(direction - this.radarAngle);
    this.turnRadarRight(radarTurn);
    */
    //turn gun towards enemy
    var gunTurn = normalizeDiffAngle(direction - this.gunAngle);
    this.turnGunRight(gunTurn);
    if(gunTurn < 0.1) {
        this.fire(3);   
    }
}
 
Testbot.prototype.startRound = function() {
    console.log('NEW ROUND');
    started = false;
    dir = 1;
    this.enemyDetected = false;
}

var robot = new Testbot();
//declare everything loaded, after all robots have reported in, the first round starts
robot.ready();