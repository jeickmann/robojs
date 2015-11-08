CONSTANTS = {
    robotAcceleration: 1,
    robotDecceleration: 2,
    robotMaxSpeed: 8,
    rotateSpeed: 1,
    rotateGunSpeed: 20/180*Math.PI,
    rotateRadarSpeed: 45/180*Math.PI,
    robotWidth: 36,
    robotHeight: 36,
    gunOffsetX: 10,
    gunOffsetY: 25,
    gunLength: 28,
    radarOffsetX: 11,
    radarOffsetY: 8,
    gunCoolingRate: 0.1,
    maxFiringPower: 3,
    initialPower: 100,
    IDLE_POWER_LOSS: 0.5
};

ROBOT_DEFAULTS = {
    distanceLeft: 0,
    rotationLeft: 0,
    gunRotationLeft: 0,
    radarRotationLeft: 0,
    firingRequested: 0,
    velocity: 0,
    rotateGunRadians: 0,
    rotateRadarRadians: 0,
    lastActionOnTick: 0,
    alive: true,
    idleTimeoutReached: false
}

ROBOT_DATA_DEFAULTS = {
    power: CONSTANTS.initialPower,
    gunHeat: 3,
    x: 0,
    y: 0,
    angle: 0,
    gunAngle: 0,
    radarAngle: 0
}

RobotHandler = function(duel, robotFile) {
        this.file = robotFile;
        this.name = 'unknown';
        this.isReady = false;
        this.duel = duel;
        this.oldRadarAngle = 0;
        this.firingRequested = 0;
        this.velocity = 0;
        this.rotateGunRadians = 0;
        this.rotateRadarRadians = 0;
        this._boundingBox = new Rect(0,0,CONSTANTS.robotWidth, CONSTANTS.robotHeight);
        this.alive = true;
        this.idleTimeoutReached = false;
        this.wins = 0;
        this.lastActionOnTick = 0;
        this.data = {
            power: CONSTANTS.initialPower,
            gunHeat: 0,
            x: -1,
            y: -1,
            angle: 0,
            gunAngle: 0,
            radarAngle: 0,
            distanceLeft: 0,
            rotationLeft: 0,
            gunRotationLeft: 0,
            radarRotationLeft: 0
        };
        this.collisions = [];
        this.adjustGunForRobotTurn = false;
        this.adjustRadarForGunTurn = false;
    
        this.drawPrimitives = [];
        this.lastTurnsDrawPrimitives = [];
};

RobotHandler.prototype = {
    resetRobot: function(x,y) {
        for(var key in ROBOT_DEFAULTS) {
            var value = ROBOT_DEFAULTS[key];   
        
            this[key] = value;
        }
        
        for(var key in ROBOT_DATA_DEFAULTS) {
            var value = ROBOT_DATA_DEFAULTS[key];   
        
            this.data[key] = value;
        }
        
        this.data.x = x;
        this.data.y = y;
        
        this.sendMessageToBot({_cmd:'NEW_ROUND'});
    },
    advanceRobot: function() {
        if(!this.alive) {
            return;
        }
        /*if(this.data.rotateRadians != 0) {

        }*/

        //firing and GunHeat reduction
        this.data.gunHeat -= CONSTANTS.gunCoolingRate;
        if(this.data.gunHeat < 0) {
            this.data.gunHeat = 0;
        }
        if(this.firingRequested > 0) {
            if(this.data.gunHeat == 0) {
                var bulletPower = clamp(this.firingRequested, 0.1, CONSTANTS.maxFiringPower);
        
                this.duel.bullets.push(new Bullet(this, bulletPower));
                this.data.gunHeat += 1 + bulletPower / 5;
                this.data.power -= this.firingRequested;
            }
            this.firingRequested = 0;
        }
        
        this.oldRadarAngle = this.data.radarAngle;
        
        //rotation of the robot
        if(this.data.rotationLeft) {
            var rotation = Math.min(degrees2radions(10 - 0.75 * Math.abs(this.velocity)), Math.abs(this.data.rotationLeft)) *  Math.sign(this.data.rotationLeft);
            this.data.rotationLeft -= rotation;
            this.data.angle += rotation;
            this.data.gunAngle += rotation;
            
            this.data.radarAngle += rotation;
            
            if(this.adjustGunForRobotTurn) {
                this.data.gunRotationLeft -= rotation;
                this.data.radarRotationLeft -= rotation;
            }
            
            this.idleTimeoutReached = false;
        }
        
        
        
        //rotation of the gun
        if(this.data.gunRotationLeft) {
            var gunRotation = Math.min(CONSTANTS.rotateGunSpeed, Math.abs(this.data.gunRotationLeft)) *  Math.sign(this.data.gunRotationLeft);
            this.data.gunRotationLeft -= gunRotation;
            this.data.gunAngle += gunRotation;   
            this.data.radarAngle += gunRotation; 
            if(this.adjustRadarForGunTurn) {
                this.data.radarRotationLeft -= gunRotation;
            }
            
            this.idleTimeoutReached = false;
        }

        //rotation of the radar
        if(this.data.radarRotationLeft) {
            var radarRotation = Math.min(CONSTANTS.rotateRadarSpeed, Math.abs(this.data.radarRotationLeft)) *  Math.sign(this.data.radarRotationLeft);
            this.data.radarRotationLeft -= radarRotation;
            this.data.radarAngle += radarRotation;    
            
            this.idleTimeoutReached = false;
        }
        
        this.data.angle = normalizeAngle(this.data.angle);
        this.data.gunAngle = normalizeAngle(this.data.gunAngle);
        this.data.radarAngle = normalizeAngle(this.data.radarAngle);
        
        //acceleration
        //TODO: Braking works with 2px/turn, needs to be implemented
        var brake = false;
        var accelerate = false;
        //no need if we are not moving
        if(this.velocity != 0) {
            //we always brake if we have different signs for velocity and distanceLeft
            if(Math.sign(this.velocity) != Math.sign(this.data.distanceLeft)) {
                brake = true;
            } else {
                //how far do we move if we brake in the next round (braking applies before movement, so if we actually break now, we move one step less
                var minDistanceTravelled = 0;
                for(var tempV=Math.abs(this.velocity);tempV>0;tempV-=CONSTANTS.robotDecceleration) {
                    minDistanceTravelled += tempV;
                }

                if(Math.abs(this.data.distanceLeft) < minDistanceTravelled) {
                    brake = true;   
                } else if (Math.abs(this.data.distanceLeft) >= minDistanceTravelled + this.velocity + CONSTANTS.robotAcceleration) {
                    accelerate = true;
                }
            }
        } else if(this.data.distanceLeft != 0) {
            accelerate = true;
        }

        var directionalSign = Math.sign(this.velocity);
        if(directionalSign == 0) {
            directionalSign = Math.sign(this.data.distanceLeft);   
        }
        if(accelerate) {
            this.velocity += CONSTANTS.robotAcceleration * directionalSign;
            //limit to Max Velocity
            this.velocity = clamp(this.velocity, -CONSTANTS.robotMaxSpeed, CONSTANTS.robotMaxSpeed);
        } else if(brake) {
            this.velocity -= CONSTANTS.robotDecceleration * directionalSign;
        }

        //movement
        if(this.velocity != 0) {
            this.doMovement();
            
            this.idleTimeoutReached = false;
            
            var oldSign = Math.sign(this.data.distanceLeft);
            this.data.distanceLeft -= this.velocity;
            if(oldSign != Math.sign(this.data.distanceLeft)) {
                this.data.distanceLeft = 0;
            }

            //test if we hit a wall, if so, back up until we are free of the wall, then stop and send message
            if(!this.duel.boundingBox.contains(this.getBoundingBox())) {
                do {
                    this.stepBack();
                } while(!this.duel.boundingBox.contains(this.getBoundingBox()));
                
                this.data.power -= Math.max(Math.abs(this.velocity) * 0.5 - 1, 0);
                this.stopImmediatly();
               
                this.sendMessageToBot({_cmd:'HIT_WALL'});
            }
        }
        
        if(this.idleTimeoutReached) {
            this.data.power -= CONSTANTS.IDLE_POWER_LOSS;
        }
        
        if(this.data.power <= 0) {
            this.die();   
        }
        
        if(this.lastActionOnTick < this.duel.tickCount - this.duel.MAX_IDLE_TICKS) {
            this.idleTimeoutReached = true;
        }
    },
    checkCollision: function(robot) {
        if(this.getBoundingBox().overlaps(robot.getBoundingBox())) {
            //we collided, let's do some damage;
            this.data.power -= 0.6;
            robot.data.power -= 0.6;
            
            //let's check who caused it and has to stop now
            //would moving us back, clear the collision?
            this.undoMovement();
            //no, there's still a collision, so they were part of the cause
            var theyCause = this.getBoundingBox().overlaps(robot.getBoundingBox());
            
            //undo the experiment for us (in effect, repeating the movement)
            this.doMovement();
            
            //move them back, did it clear?
            robot.undoMovement();
            //no, there's still a collision, so we were part of the cause
            var weCause = this.getBoundingBox().overlaps(robot.getBoundingBox());
            
            //undo the experiment for them
            robot.doMovement();
            
            if(!weCause && !theyCause) {
                weCause = theyCause = true;   
            }
            
            //step them both back until we have no more collision
            do {
                if(weCause)
                    this.stepBack();
                if(theyCause)
                    robot.stepBack();
            } while(this.getBoundingBox().overlaps(robot.getBoundingBox()));
            
            if(weCause) {
                this.stopImmediatly();
            }
            if(theyCause) {
                robot.stopImmediatly();
            }
        }
    },
    scan: function() {
        this.duel.robots.forEach(function(robot) {
            if(robot != this) {
                //turning left -> diffAngle < 0, turning right -> diffAngle > 0
                var radarRotation = getRotationDir(this.oldRadarAngle, this.data.radarAngle);
                
                var targetVectors = robot.getBoundingBox().getCornerVectors();
                var myPosition = new Vector(this.data.x, this.data.y);
                
                var cornerToTheFront = false;
                var cornerToTheBack = false;
                var cornerInside = false;
                var inFront = false;
               
                targetVectors.forEach(function(vector) {
                    vector.subtract(myPosition);
                    var directionAngle = vector.getAngle();
                    var cornerRotationNow = getRotationDir(this.data.radarAngle, directionAngle);
                    var cornerRotationFormer = getRotationDir(this.oldRadarAngle, directionAngle);
                    
                    //Test if the robot is at least "in front of the radar"
                    if(Math.abs(getRotation(this.data.radarAngle, directionAngle)) < Math.PI/2) {
                        inFront = true;
                    }
                    
                    if(radarRotation < 0) {//we are turning left
                        if(cornerRotationNow < 0) {
                            cornerToTheFront = true;
                        } else if(cornerRotationFormer > 0) {
                            cornerToTheBack = true;
                        } else {
                            cornerInside = true;   
                        }
                    } else {
                        if(cornerRotationNow > 0) {
                            cornerToTheFront = true;
                        } else if(cornerRotationFormer < 0) {
                            cornerToTheBack = true;
                        } else {
                            cornerInside = true;   
                        }
                    }
                }, this);
                
                //either corners to front and back or no corners outside of "cone"
                if(inFront && (cornerInside || cornerToTheFront == cornerToTheBack)) {
                    //we scanned
                    this.scannedRobot(robot);
                }                
            }
        }, this);
        
    },
    undoMovement: function() {
        this.data.x -= Math.sin(this.data.angle) * this.velocity;
        this.data.y -= -Math.cos(this.data.angle) * this.velocity;
    },
    doMovement: function() {
        this.data.x += Math.sin(this.data.angle) * this.velocity;
        this.data.y += -Math.cos(this.data.angle) * this.velocity;
    },
    stepBack: function() {
        this.data.x -= Math.sin(this.data.angle) * Math.sign(this.velocity);
        this.data.y -= -Math.cos(this.data.angle) * Math.sign(this.velocity);
    },
    getBoundingBox: function() {
        this._boundingBox.x = this.data.x - CONSTANTS.robotWidth/2;
        this._boundingBox.y = this.data.y - CONSTANTS.robotHeight/2;

        return this._boundingBox;
    },
    getPosition: function() {
        return new Vector(this.data.x, this.data.y);   
    },
    hitByBullet: function(bullet) {
        var damage = 4 * bullet.power;
        if(bullet.power > 1) {
            damage += 2 * (bullet.power - 1);
        }
        this.data.power -= damage;
        
        var message = {
            _cmd: 'BULLET_HIT',
            direction: bullet.direction,
            power: bullet.power,
            velocity: bullet.velocity
        }
        
        this.sendMessageToBot(message);
    },
    bulletHitRobot: function(bullet, robot) {
        this.data.power += 3 * bullet.power;
        var message = {
            _cmd: 'BULLET_HIT_ROBOT',
            x: bullet.x,
            y: bullet.y,
            enemyPower: robot.data.power,
            enemyName: robot.name
        }
        this.sendMessageToBot(message);
    },
    bulletHitWall: function(bullet, robot) {
        var message = {
            _cmd: 'BULLET_HIT_WALL',
            x: bullet.x,
            y: bullet.y
        }
        this.sendMessageToBot(message);
    },
    scannedRobot: function(robot) {
        var message = {
            _cmd: 'SCANNED_ROBOT',
            direction: this.getPosition().angleTo(robot.getPosition()),
            distance: this.getPosition().distanceTo(robot.getPosition()),
            power: robot.data.power,
            heading: robot.data.angle,
            name: robot.name,
            velocity: robot.velocity
        }
        this.sendMessageToBot(message);
    },
    die: function() {
        this.duel.robotDie(this);
        this.alive = false;
        this.sendMessageToBot({_cmd:'DIE'});
    },
    win: function() {
        this.wins++;
        this.sendMessageToBot({_cmd:'WIN'});
    },
    stopImmediatly: function() {
        this.velocity = 0;
        this.data.distanceLeft = 0;  
    },
    loadWorker: function() {
        this.thread = new Worker(this.file);
        var robot = this;
        this.thread.addEventListener('message', function(e) {
            robot.messageHandler(e);
        });
        
        this.sendMessageToBot({
            _cmd:'ARENA_INFO',
            width: this.duel.width,
            height: this.duel.height
        });
    },
    recordAction: function() {
        this.lastActionOnTick = this.duel.tickCount;  
    },
    messageHandler: function(e) {
        if(!this.alive) {
            return;   
        }
        var data = e.data;

        switch(data._cmd) {
            case 'READY':
                this.name = data.name;
                this.isReady = true;
                //console.log(this.name + " reports ready!");
                this.duel.checkReady();
                break;

            case 'MOVE':
                this.data.distanceLeft = data.distance;
                this.recordAction();
                //console.log(robot"Trying to move " + data.distance);
                break;

            case 'TURN':
                this.data.rotationLeft = data.angle;
                this.recordAction();
                //console.log("Trying to rotate " + data.angle);
                break;

            case 'TURN_GUN':
                this.data.gunRotationLeft = data.angle;
                this.recordAction();
                //console.log("Trying to rotate gun " + data.angle);
                break;
                
            case 'TURN_RADAR':
                this.data.radarRotationLeft = data.angle;
                this.recordAction();
                //console.log("Trying to rotate radar " + data.angle);
                break;
                
            case 'FIRE':
                this.firingRequested = data.firingPower;
                break;
                
            case 'ACK_SYNC':
                this.synched = true;
                this.lastTurnsDrawPrimitives = this.drawPrimitives;
                this.drawPrimitives = [];
                this.duel.robotSynched();
                break;
            
            case 'ADJUST_GUN_FOR_ROBOT_TURN':
                this.adjustGunForRobotTurn = data.adjust;
                break;
                
            case 'ADJUST_RADAR_FOR_GUN_TURN':
                this.adjustRadarForGunTurn = data.adjust;
                break;
                
            case 'DRAW_CIRCLE':
                this.drawPrimitives.push({type:'circle', x:data.x,y:data.y,radius:data.radius,color:data.color});
                break;
                
            case 'DRAW_LINE':
                this.drawPrimitives.push({type:'line', fromX:data.fromX,fromY:data.fromY,toX:data.toX, toY:data.toY,color:data.color});
                break;
        }
    },
    tick: function() {
        if(this.alive) {
            this.sendMessageToBot({_cmd:'TICK'});
        }
    },
    
    requestSync: function() {
          this.sendMessageToBot({_cmd:'SYNC'});
    },
    sendMessageToBot(message) {
        message.updateInfo = JSON.parse(JSON.stringify(this.data));
        this.thread.postMessage(message);
    }
}


Bullet = function(robot, power) {
    this.robot = robot;
    this.x = robot.data.x;
    this.y = robot.data.y;
    this.direction = robot.data.gunAngle;
    this.power = power;
    
    this.x += Math.sin(this.direction) * CONSTANTS.gunLength;
    this.y += -Math.cos(this.direction) * CONSTANTS.gunLength;
    
    this.velocity = 20 - 3 * this.power;
}

Bullet.prototype = {
    advance: function() {
        this.x += Math.sin(this.direction) * this.velocity;
        this.y += -Math.cos(this.direction) * this.velocity;
        
        if(!this.robot.duel.boundingBox.isInside(this.x, this.y)) {
           this.robot.duel.bulletHitWall(this);
        }
        
        this.robot.duel.robots.forEach(function(robot) {
            if(robot != this.robot && robot.alive) {
                if(robot.getBoundingBox().isInside(this.x, this.y)) {
                    this.robot.duel.bulletHitRobot(this, robot);
                }
            }
        }, this);
    }
}