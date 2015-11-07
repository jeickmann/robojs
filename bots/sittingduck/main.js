importScripts('../../js/robotBase.js');
importScripts('../../js/utils.js');

SittingDuck = function() {
    RobotBase.call(this);
    this.name = 'Sitting Duck';
}

SittingDuck.prototype = Object.create(RobotBase.prototype);
SittingDuck.prototype.constructor = SittingDuck;


robot = new SittingDuck();
robot.ready();
