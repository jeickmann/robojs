CONSTANTS = {
    robotAcceleration: 1,
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
    initialPower: 10
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
    alive: true
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
        this.distanceLeft = 0;
        this.rotationLeft = 0;
        this.gunRotationLeft = 0;
        this.radarRotationLeft = 0;
        this.oldRadarAngle = 0;
        this.firingRequested = 0;
        this.velocity = 0;
        this.rotateGunRadians = 0;
        this.rotateRadarRadians = 0;
        this._boundingBox = new Rect(0,0,CONSTANTS.robotWidth, CONSTANTS.robotHeight);
        this.alive = true;
        this.wins = 0;
        this.data = {
            power: CONSTANTS.initialPower,
            gunHeat: 0,
            x: duel.width/2,
            y: duel.height/2,
            angle: 0,
            gunAngle: 0,
            radarAngle: 0
        };
        this.collisions = [];
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
        
        this.thread.postMessage({_cmd:'NEW_ROUND'});
        this.updateClient();
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
            }
            this.firingRequested = 0;
        }
        
        this.oldRadarAngle = this.data.radarAngle;
        //rotation of the radar
        if(this.radarRotationLeft) {
            var radarRotation = Math.min(CONSTANTS.rotateRadarSpeed, Math.abs(this.radarRotationLeft)) *  Math.sign(this.radarRotationLeft);
            this.radarRotationLeft -= radarRotation;
            this.data.radarAngle += radarRotation;            
        }
        
        //rotation of the gun
        if(this.gunRotationLeft) {
            var gunRotation = Math.min(CONSTANTS.rotateGunSpeed, Math.abs(this.gunRotationLeft)) *  Math.sign(this.gunRotationLeft);
            this.gunRotationLeft -= gunRotation;
            this.data.gunAngle += gunRotation;   
            this.data.radarAngle += gunRotation;           
        }

        //rotation of the robot
        if(this.rotationLeft) {
            var rotation = Math.min(degrees2radions(10 - 0.75 * Math.abs(this.velocity)), Math.abs(this.rotationLeft)) *  Math.sign(this.rotationLeft);
            this.rotationLeft -= rotation;
            this.data.angle += rotation;
            this.data.gunAngle += rotation;  
            this.data.radarAngle += rotation;             
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
            if(Math.sign(this.velocity) != Math.sign(this.distanceLeft)) {
                brake = true;
            } else {
                //how far do we move if we brake in the next round (braking applies before movement, so if we actually break now, we move one step less
                var minDistanceTravelled = 0;
                for(var tempV=Math.abs(this.velocity);tempV>0;tempV-=CONSTANTS.robotAcceleration) {
                    minDistanceTravelled += tempV;
                }

                if(Math.abs(this.distanceLeft) < minDistanceTravelled) {
                    brake = true;   
                } else if (Math.abs(this.distanceLeft) >= minDistanceTravelled + this.velocity + CONSTANTS.robotAcceleration) {
                    accelerate = true;
                }
            }
        } else if(this.distanceLeft != 0) {
            accelerate = true;
        }

        var directionalSign = Math.sign(this.velocity);
        if(directionalSign == 0) {
            directionalSign = Math.sign(this.distanceLeft);   
        }
        if(accelerate) {
            this.velocity += CONSTANTS.robotAcceleration * directionalSign;
            //limit to Max Velocity
            this.velocity = clamp(this.velocity, -CONSTANTS.robotMaxSpeed, CONSTANTS.robotMaxSpeed);
        } else if(brake) {
            this.velocity -= CONSTANTS.robotAcceleration * directionalSign;
        }

        //movement
        if(this.velocity != 0) {
            this.doMovement();

            this.distanceLeft -= this.velocity;

            //test if we hit a wall, if so, back up until we are free of the wall, then stop and send message
            if(!this.duel.boundingBox.contains(this.getBoundingBox())) {
                do {
                    this.stepBack();
                } while(!this.duel.boundingBox.contains(this.getBoundingBox()));
                
                this.data.power -= Math.max(Math.abs(this.velocity) * 0.5 - 1, 0);
                this.stopImmediatly();
               
                this.thread.postMessage({_cmd:'HIT_WALL'});
            }
        }
        
        if(this.data.power <= 0) {
            this.die();   
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
                var deltaX = robot.data.x - this.data.x;
                var deltaY = robot.data.y - this.data.y;

                var directionVector = new Vector(deltaX, deltaY);
                var directionAngle = directionVector.getAngle();
                var scanned = false;
                //did we rotate left
                if(this.oldRadarAngle > this.data.radarAngle) {
                    console.log(this.data.radarAngle);
                    scanned = (directionAngle <= this.oldRadarAngle && directionAngle >= this.data.radarAngle);
                } else {
                    scanned = (directionAngle >= this.oldRadarAngle && directionAngle <= this.data.radarAngle);
                }
                
                if(scanned) {
                    console.log(this.name + " scanned " + robot.name );
                }
                
                //console.log("From " + this.name + " to " + robot.name + "(" + deltaX + "," + deltaY + "): " + directionAngle);
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
        
        this.thread.postMessage(message);
    },
    die: function() {
        this.duel.robotDie(this);
        this.alive = false;
        this.thread.postMessage({_cmd:'DIE'});
    },
    win: function() {
        this.wins++;
        this.thread.postMessage({_cmd:'WIN'});
    },
    stopImmediatly: function() {
        this.velocity = 0;
        this.distanceLeft = 0;  
    },
    loadWorker: function() {
        this.thread = new Worker(this.file);
        var robot = this;
        this.thread.addEventListener('message', function(e) {
            robot.messageHandler(e);
        });
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
                console.log(this.name + " reports ready!");
                this.duel.checkReady();
                break;

            case 'MOVE':
                this.distanceLeft = data.distance;
                console.log("Trying to move " + data.distance);
                break;

            case 'TURN':
                this.rotationLeft = data.angle;
                console.log("Trying to rotate " + data.angle);
                break;

            case 'TURN_GUN':
                this.gunRotationLeft = data.angle;
                console.log("Trying to rotate gun " + data.angle);
                break;
                
            case 'TURN_RADAR':
                this.radarRotationLeft = data.angle;
                console.log("Trying to rotate radar " + data.angle);
                break;
                
            case 'FIRE':
                this.firingRequested = data.firingPower;
                break;
        }
    },
    tick: function() {
        if(this.alive) {
            this.thread.postMessage({_cmd:'TICK'});
        }
    },
    updateClient: function() {
        var params =  JSON.parse(JSON.stringify(this.data));
        params._cmd = 'UPDATE';
        this.thread.postMessage(params);
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