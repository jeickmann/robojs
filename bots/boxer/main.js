importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Robot = function() {
    RobotBase.call(this);
    this.name = 'Boxer';
    this.callOnlyOnIdle = true;
}

Robot.prototype = Object.create(RobotBase.prototype);
Robot.prototype.constructor = Robot;


//called at the start of each round
Robot.prototype.startRound = function() {
    this.turnGunRight(Math.PI/2);
};

//called every game tick
Robot.prototype.run = function() {

    this.moveForward(100, function() {
            this.turnRight(Math.PI/2);
        });
};
    

//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
Robot.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    this.fire(3);
};
    
var robot = new Robot();
//declare everything loaded, after all robots have reported in, the first round starts
robot.ready();
