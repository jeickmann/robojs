importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

SittingDuck = function() {
    RobotBase.call(this);
    this.name = 'Sitting Duck';
}

SittingDuck.prototype = Object.create(RobotBase.prototype);
SittingDuck.prototype.constructor = SittingDuck;

SittingDuck.prototype.run = function() {
    if(this.tickCount > 200) {
        this.moveForward(100);
    }
}

robot = new SittingDuck();
robot.ready();
