importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Robot = RobotBase;

Robot.name = 'Walls';


Robot.run = function() {
    
};

STATE_MOVING_EAST = 0;
STATE_MOVING_SOUTH = 1;
STATE_MOVING_WEST = 2;
STATE_MOVING_NORTH = 3;

WALL_DISTANCE = 100;

//called at the start of each round
Robot.startRound = function() {
    this.state = STATE_MOVING_NORTH;
    this.enemyDetected = -100;
},

//called every game tick
Robot.run = function() { 
    if(this.tickCount - this.enemyDetected > 10) {
        this.turnRadarLeft(1000);
    } else {
        var radarTurn = normalizeDiffAngle(this.enemyDirection - this.radarAngle);
        this.turnRadarRight(radarTurn);
        
        var gunTurn = normalizeDiffAngle(this.enemyDirection - this.gunAngle);
        this.turnGunRight(gunTurn);
        if(gunTurn < 0.1) {
            this.fire(3);   
        }
    }
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
},
    
//robot hits a wall
Robot.onHitWall = function() { 
},
    
//robot was hit by a bullet
Robot.onHitByBullet = function(direction, power, velocity) { },
    
//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {
    this.enemyDetected = this.tickCount;
    this.enemyDirection = direction;
},
    
//this robot died
Robot.onDeath = function() { },
    
//robot wins
Robot.onWin = function() {},

//declare everything loaded, after all robots have reported in, the first round starts
Robot.ready();