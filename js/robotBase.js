RobotBase = function() {
    this.x=0;           
    this.y=0;
    this.distanceLeft=0;
    this.angle=0;
    this.rotationLeft=0;
    this.gunAngle=0;
    this.gunRotationLeft=0;
    this.radarAngle=0;
    this.radarRotationLeft=0;
    this.arenaWidth=0;
    this.arenaHeight=0;
    this.tickCount=0;
    this.callOnlyOnIdle = false;
    this.followUp = null;
    
    var robot = this;
    
    addEventListener('message', function(e) {
      var data = e.data;
      robot.receiveMessage(data);
    });
}

RobotBase.prototype = {
    startRound: function() { },
    run: function() { },
    draw: function() { },
    onHitWall: function() { },
    onHitByBullet: function(direction, power, velocity) { },
    onBulletHitRobot: function(x, y, enemyPower, enemyName) {},
    onBulletHitWall: function(x, y) {},
    onScannedRobot: function(name, direction, distance, heading, velocity, power) {},
    onDeath: function() { },
    onWin: function() { },
    
    turnRight: function(radians, onFinished) {
        this.sendMessage('TURN', {angle: radians});
        this.rotationLeft = radians;
        this.queueFollowUp(onFinished);
    },
    
    turnLeft: function(radians, onFinished) {
        this.sendMessage('TURN', {angle: -radians});
        this.rotationLeft = -radians;
        this.queueFollowUp(onFinished);
    },
    
    turnGunRight: function(radians, onFinished) {
        this.sendMessage('TURN_GUN', {angle: radians});
        this.gunRotationLeft = radians;
        this.queueFollowUp(onFinished);
    },
    
    turnGunLeft: function(radians, onFinished) {
        this.sendMessage('TURN_GUN', {angle: -radians});
        this.gunRotationLeft = -radians;
        this.queueFollowUp(onFinished);
    },
    
    turnRadarRight: function(radians, onFinished) {
        this.sendMessage('TURN_RADAR', {angle: radians});
        this.radarRotationLeft = radians;
        this.queueFollowUp(onFinished);
    },
    
    turnRadarLeft: function(radians, onFinished) {
        this.sendMessage('TURN_RADAR', {angle: -radians});
        this.radarRotationLeft = -radians;
        this.queueFollowUp(onFinished);
    },
    
    moveForward: function(distance, onFinished) {
        this.sendMessage('MOVE', {distance: distance});
        this.distanceLeft = distance;
        this.queueFollowUp(onFinished);
    },
    
    moveBack: function(distance, onFinished) {
        this.sendMessage('MOVE', {distance: -distance});
        this.distanceLeft = -distance;
        this.queueFollowUp(onFinished);
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
    checkCallRun: function() {
        if(this.distanceLeft == 0 && 
                  this.rotationLeft == 0 &&
                  this.gunRotationLeft == 0 &&
                  this.radarRotationLeft == 0) {
            if(this.followUp) {
                var func = this.followUp;
                this.followUp = null;
                func.call(this);
            }
        }
        if(!this.callOnlyOnIdle) {
            this.run();
        } else if(this.distanceLeft == 0 && 
                  this.rotationLeft == 0 &&
                  this.gunRotationLeft == 0 &&
                  this.radarRotationLeft == 0) {
            this.run();
        }
    },
    queueFollowUp: function(onFinished) {
        if(onFinished) {
            this.followUp = onFinished;
        }
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
            this.radarRotationLeft = msg.updateInfo.radarRotationLeft;
        }
        switch(msg._cmd) {            
            case 'TICK':
                this.checkCallRun();
                this.draw();
                this.tickCount++;
                break;
                
            case 'HIT_WALL':
                this.onHitWall();
                break;
                
            case 'BULLET_HIT':
                this.onHitByBullet(msg.direction, msg.power, msg.velocity);
                break;
                
            case 'BULLET_HIT_ROBOT':
                this.onBulletHitRobot(msg.x, msg.y, msg.enemyPower, msg.enemyName);
                break;
                
            case 'BULLET_HIT_WALL':
                this.onBulletHitWall(msg.x, msg.y);
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
