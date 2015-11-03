addEventListener('message', function(e) {
  var data = e.data;
  Robot.receiveMessage(data);
  
});

RobotBase = {
    x:0,
    y:0,
    distanceLeft:0,
    angle:0,
    rotationLeft:0,
    gunAngle:0,
    gunRotationLeft:0,
    radarAngle:0,
    radarRotationLeft:0,
    arenaWidth: 0,
    arenaHeight: 0,
    tickCount: 0,
    
    startRound: function() { },
    run: function() { },
    onHitWall: function() { },
    onHitByBullet: function(direction, power, velocity) { },
    onScannedRobot: function(name, direction, distance, heading, velocity, power) {},
    onDeath: function() { },
    onWin: function() {},
    
    turnRight: function(radians) {
        this.sendMessage('TURN', {angle: radians});
        this.rotationLeft = radians;
    },
    
    turnLeft: function(radians) {
        this.sendMessage('TURN', {angle: -radians});
        this.rotationLeft = -radians;
    },
    
    turnGunRight: function(radians) {
        this.sendMessage('TURN_GUN', {angle: radians});
        this.gunRotationLeft = radians;
    },
    
    turnGunLeft: function(radians) {
        this.sendMessage('TURN_GUN', {angle: -radians});
        this.gunRotationLeft = -radians;
    },
    
    turnRadarRight: function(radians) {
        this.sendMessage('TURN_RADAR', {angle: radians});
        this.radarRotationLeft = radians;
    },
    
    turnRadarLeft: function(radians) {
        this.sendMessage('TURN_RADAR', {angle: -radians});
        this.radarRotationLeft = -radians;
    },
    
    moveForward: function(distance) {
        this.sendMessage('MOVE', {distance: distance});
        this.distanceLeft = distance;
    },
    
    moveBack: function(distance) {
        this.sendMessage('MOVE', {distance: -distance});
        this.distanceLeft = -distance;
    },
    
    fire: function(firingPower) {
        this.sendMessage('FIRE', {firingPower: firingPower});
    },
    
    setAdjustGunForRobotTurn: function(adjust) {
        this.sendMessage('ADJUST_GUN_FOR_ROBOT_TURN', {adjust: adjust});
    },
    
    setAdjustRadarForGunTurn: function(adjust) {
        this.sendMessage('ADJUST_RADAR_FOR_GUN_TURN', {adjust: adjust});
    },
    
    drawCircle: function(x,y,radius,color) {
        this.sendMessage('DRAW_CIRCLE', {x:x,y:y,radius:radius,color:color});
    },
    
    drawLine: function(fromX, fromY, toX, toY, color) {
        this.sendMessage('DRAW_LINE', {fromX:fromX,fromY:fromY,toX:toX, toY:toY,color:color});
    },
    
    ready: function() {
        this.sendMessage('READY', {name: this.name});
    },
    
    receiveMessage: function(msg) {
        if(msg.updateInfo != null) {
            this.power = msg.updateInfo.power;
            this.x = msg.updateInfo.x;
            this.y = msg.updateInfo.y;
            this.angle = msg.updateInfo.angle;
            this.gunAngle = msg.updateInfo.gunAngle;
            this.radarAngle = msg.updateInfo.radarAngle;
            this.distanceLeft = msg.updateInfo.distanceLeft;
            this.rotationLeft = msg.updateInfo.rotationLeft;
            this.gunRotationLeft = msg.updateInfo.gunRotationLeft;
            this.radarRotationLeft = msg.updateInforadarRotationLeft;
        }
        switch(msg._cmd) {            
            case 'TICK':
                this.run();
                this.tickCount++;
                break;
                
            case 'HIT_WALL':
                this.onHitWall();
                break;
                
            case 'BULLET_HIT':
                this.onHitByBullet(msg.direction, msg.power, msg.velocity);
                break;
                
            case 'SCANNED_ROBOT':
                this.onScannedRobot(msg.name, msg.direction, msg.distance, msg.heading, msg.velocity, msg.power);
                break;
                
            case 'DIE':
                this.onDeath();
                break;
                
            case 'WIN':
                this.onWin();
                break;
                
            case 'ARENA_INFO':
                this.arenaWidth = msg.width;
                this.arenaHeight = msg.height;
                break;
                
            case 'NEW_ROUND':
                this.tickCount = 0;
                this.startRound();
                break;
                
            case 'SYNC':
                this.sendMessage('ACK_SYNC', {});
                break;
        }
    },
    
    sendMessage: function(cmd, params) {
        params._cmd = cmd;
        
        postMessage(params);
    }
}

