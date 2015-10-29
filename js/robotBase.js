addEventListener('message', function(e) {
  var data = e.data;
  Robot.receiveMessage(data);
  
});

RobotBase = {
    x:0,
    y:0,
    angle:0,
    gunAngle:0,
    radarAngle:0,
    arenaWidth: 0,
    arenaHeight: 0,
    
    startRound: function() { },
    run: function() { },
    onHitWall: function() { },
    onHitByBullet: function(direction, power, velocity) { },
    onScannedRobot: function(name, direction, distance, heading, velocity, power) {},
    onDeath: function() { },
    onWin: function() {},
    
    turnRight: function(radians) {
        this.sendMessage('TURN', {angle: radians});
    },
    
    turnLeft: function(radians) {
        this.sendMessage('TURN', {angle: -radians});
    },
    
    turnGunRight: function(radians) {
        this.sendMessage('TURN_GUN', {angle: radians});
    },
    
    turnGunLeft: function(radians) {
        this.sendMessage('TURN_GUN', {angle: -radians});
    },
    
    turnRadarRight: function(radians) {
        this.sendMessage('TURN_RADAR', {angle: radians});
    },
    
    turnRadarLeft: function(radians) {
        this.sendMessage('TURN_RADAR', {angle: -radians});
    },
    
    moveForward: function(distance) {
        this.sendMessage('MOVE', {distance: distance});
    },
    
    moveBack: function(distance) {
        this.sendMessage('MOVE', {distance: -distance});
    },
    
    fire: function(firingPower) {
        this.sendMessage('FIRE', {firingPower: firingPower});
    },
    
    ready: function() {
        this.sendMessage('READY', {name: this.name});
    },
    
    receiveMessage: function(msg) {
        switch(msg._cmd) {
            case 'UPDATE':
                this.power = msg.power;
                this.x = msg.x;
                this.y = msg.y;
                this.angle = msg.angle;
                this.gunAngle = msg.gunAngle;
                this.radarAngle = msg.radarAngle;
                break;
            
            case 'TICK':
                this.run();
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
                this.startRound();
                break;
        }
    },
    
    sendMessage: function(cmd, params) {
        params._cmd = cmd;
        
        postMessage(params);
    }
}

