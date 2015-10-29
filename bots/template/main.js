importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

Robot = RobotBase;

Robot.name = '---TEMPLATE PLEASE RENAME---';


Robot.run = function() {
    
};

//called at the start of each round
Robot.startRound = function() { },
    
//called every game tick
Robot.run = function() { },
    
//robot hits a wall
Robot.onHitWall = function() { },
    
//robot was hit by a bullet
Robot.onHitByBullet = function(direction, power, velocity) { },
    
//a robot was scanned, robots are only scanned when the radar sweeps over the enemy robot during the tick
Robot.onScannedRobot = function(name, direction, distance, heading, velocity, power) {},
    
//this robot died
Robot.onDeath = function() { },
    
//robot wins
Robot.onWin = function() {},

//declare everything loaded, after all robots have reported in, the first round starts
Robot.ready();

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

*/