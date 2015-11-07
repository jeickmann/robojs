importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Robot = function() {
    RobotBase.call(this);
    this.name = 'Walls';
}

Robot.prototype = Object.create(RobotBase.prototype);
Robot.prototype.constructor = Robot;


STATE_MOVING_EAST = 0;
STATE_MOVING_SOUTH = 1;
STATE_MOVING_WEST = 2;
STATE_MOVING_NORTH = 3;

WALL_DISTANCE = 50;

//called at the start of each round
Robot.prototype.startRound = function() {
    this.state = STATE_MOVING_NORTH;
    this.enemyDetected = -100;
    this.turnGunRight(Math.PI/2);
};

//called every game tick
Robot.prototype.run = function() { 
    if(Math.abs(this.rotationLeft) < 0.01) {
        switch(this.state) {
            case STATE_MOVING_NORTH:
                if(this.y > WALL_DISTANCE) {
                    this.moveForward(100);   
                } else {
                    this.moveForward(0);
                    this.state = STATE_MOVING_EAST;
                    this.turnRight(Math.PI/2);
                }  
                break;

            case STATE_MOVING_EAST:
                if(this.x < this.arenaWidth - WALL_DISTANCE) {
                    this.moveForward(100);   
                } else {
                    this.moveForward(0);
                    
                    this.state = STATE_MOVING_SOUTH;
                    this.turnRight(Math.PI/2);
                }
                break;
            
                
            case STATE_MOVING_SOUTH:
                if(this.y < this.arenaHeight - WALL_DISTANCE) {
                    this.moveForward(100);   
                } else {
                    this.moveForward(0);
                    this.state = STATE_MOVING_WEST;
                    this.turnRight(Math.PI/2);
                }
                break;
                
            case STATE_MOVING_WEST:
                if(this.x > WALL_DISTANCE) {
                    this.moveForward(100);   
                } else {
                    this.moveForward(0);
                    this.state = STATE_MOVING_NORTH;
                    this.turnRight(Math.PI/2);
                }
                break;
        }
    }
};
    

//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
Robot.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    this.fire(3);
};
    
var robot = new Robot();
//declare everything loaded, after all robots have reported in, the first round starts
robot.ready();
