importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

MyRobot = function() {
    RobotBase.call(this);
    this.name = '---TEMPLATE PLEASE RENAME---';
}

MyRobot.prototype.prototype = Object.create(RobotBase.prototype);
MyRobot.prototype.prototype.constructor = MyRobot;

MyRobot.prototype.run = function() {
    
};

//called at the start of each round
MyRobot.prototype.startRound = function() { },
    
//called every game tick
MyRobot.prototype.run = function() { },
    
//robot hits a wall
MyRobot.prototype.onHitWall = function() { },
    
//robot was hit by a bullet
MyRobot.prototype.onHitByBullet = function(direction, power, velocity) { };
    
//we hit an enemy robot with one of our bullets
MyRobot.prototype.onBulletHitRobot = function(x, y, enemyPower, enemyName) {};

//one of our bullets missed and hit a wall
MyRobot.prototype.onBulletHitWall = function(x, y) {};
        
//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
MyRobot.prototype.onScannedRobot = function(name, direction, distance, heading, velocity, power) {},
    
//this robot died
MyRobot.prototype.onDeath = function() { },
    
//robot wins
MyRobot.prototype.onWin = function() {},

//create an instance and declare everything loaded, after all robots have reported in, the first round starts
robot = new MyRobot();
robot.ready();

/*
POSSIBLE ACTIONS:
Can be called from run() and all event handlers.
Calls to those actions just initiate the action, the action itself is then carried out in the subsequent ticks.
Please note that subsequent calls concerning the same "dimension" cancel all previous calls
Exxample: first calling moveForward(100) and calling moveBackward(100) afterwards before the forward move is 
completed will immediatly begin declerating the robot and begin the backwards motion.
Physics (speeds, etc.) should be the same as the original robocode (http://robowiki.net/wiki/Robocode/Game_Physics)

Note: All angles are in radians (90 degrees = Math.PI/2, 180 degrees = Math.PI, 360 degrees = 2*Math.PI) 
conversions can be made using the utility functions degrees2radions(degrees) and radians2degrees(radians)

Turn the Robot right or left

this.turnRight(radians);
this.turnLeft(radians);

Turn the gun on top of the robot right and left, please note that when the robot is turned, the gun also turns with the robot
The gun can turn at 20 degrees/tick

this.turnGunRight(radians),
this.turnGunLeft(radians),

Turn the radar on top of the gun, same here: gun movement also changes the direction the radar is facing
The radar can turn at 45 degrees/tick

this.turnRadarRight(radians);
this.turnRadarLeft(radians);

if you want the system to automatically correct for movement of the radar resulting from movement of the gun (the radar is mounted on the gun) or to correct for movement of the gun from movement of the robot call

this.setAdjustGunForRobotTurn(true);
this.setAdjustRadarForGunTurn(true);
respectivly

Move the robot forward or backward
Max. acceleration is 1px/turn/turn
Max. deceleration is 1px/turn/turn (will soon be changed to 2px/turn/turn

this.moveForward(distance);
this.moveBack(distance);

Fire a bullet. firingPower can be between 0.1 and 3. 
You can only fire if the gun has cooled down. Each firing heats up the gun (more firingPower = more heat)
Higher firing power results in slower bullet speeds and more damage
firingPower is reduced from your own power. If the bullet hits, you gain power
For starters, use firingPower of 2 or 3

this.fire(firingPower);


USEFUL INFOs:
//current position, at the start of the round, the robot is placed in a random position
this.x, this.y

//current heading
this.angle

//current direction the gun is pointing
this.gunAngle

//current direction the radar is pointing
this.radarAngle

//the size of the arena
this.arenaWidth, this.arenaHeight

Also have a look at utils.js for a set of utility functions for geometric calculations


DEBUG-DRAWINGS:
(have to be enabled with drawDebug=1 in the URL)
this.drawCircle(x,y,radius,color); //color is a css style info, e.g. #ff0000
this.drawLine((fromX, fromY, toX, toY, color);
*/