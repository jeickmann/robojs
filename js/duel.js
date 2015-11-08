ANIMATIONS = {
    robotExplosion: {
        duration: 1000,
        frames: []
    },
    bulletExplosion: {
        duration: 500,
        frames: []
    }
};

for(var i=1;i<=71;i++) {
    ANIMATIONS.robotExplosion.frames.push(document.getElementById('explosion2-'+i));
}

for(var i=1;i<=6;i++) {
    ANIMATIONS.bulletExplosion.frames.push(document.getElementById('explosion2-'+i));
}

for(var i=6;i>=1;i--) {
    ANIMATIONS.bulletExplosion.frames.push(document.getElementById('explosion2-'+i));
}

var Duel = function(robot1File, robot2File, rounds, speed) {
    this.width = 800;
    this.height = 600;
    this.boundingBox = new Rect(0,0,this.width, this.height);
    this.ticksPerSecond = speed;
    this.rounds = rounds;
    this.MAX_IDLE_TICKS = 600; //is 30 seconds on "normal" speed
    this.currentRound = 0;
    this.tickCount = 0;
    this.message = '';
    this.drawScans = false;
    this.drawDebug = false;
    this.onfinished = null;
    
    this.robots = [
        new RobotHandler(this, robot1File),
        new RobotHandler(this, robot2File)
    ];
    
    this.bullets = [];
    
    this.explosions = [ ];
    
  
    this.running = false;

    this.lastDrawCall = 0;
    var duel = this;
    window.requestAnimationFrame( function(time) {
        duel.draw(time);
    });
};

Duel.prototype.start = function() {
    this.running = true;
    this.robots.forEach(function(robot) {
        robot.loadWorker();
    });
}

Duel.prototype.checkReady = function() {
    var allReady = true;
    this.robots.forEach(function(robot) {
        if(!robot.isReady)
            allReady = false;
    });
                        
    if(allReady) {
        this.startRound();
    }
}

Duel.prototype.startRound = function() {
    this.robots.forEach(function(robot, index) {
        robot.resetRobot(300 + 100*index+1, this.height/2);
    }, this);
    
    this.robots.forEach(function(robot) {
        do {
            var collides = false;
            robot.data.x = getRandom(CONSTANTS.robotWidth, this.width-CONSTANTS.robotWidth); 
            robot.data.y = getRandom(CONSTANTS.robotWidth, this.height-CONSTANTS.robotHeight);
            
            this.robots.forEach(function(robot2) {
                if(robot2 != robot && robot2.data.x != -1) {
                    if(robot.getBoundingBox().contains(robot2.getBoundingBox())) {
                        collides = true;   
                    }
                }
            }, this);
        } while(collides);
                
        robot.angle = getRandom(0, Math.PI*2);
    }, this);
    
    this.explosions = [];
    this.bullets = [];
    this.currentRound++;
    this.tickCount = 0;
    this.message = 'Round ' + this.currentRound;
    var duel = this;
    setTimeout(function() {
        duel.message = '';
    }, 1000);
    this.running = true;
    this.run();
}

Duel.prototype.run = function() {
    if(!this.running) {
        return;
    }
    
    //this.draw();
    
    this.updateBulletsAndTick();
    this.initiateSync();
    
}

Duel.prototype.initiateSync = function() {
    this.robots.forEach(function(robot) {
        robot.synched = false;
    });
    
    this.robots.forEach(function(robot) {
        if(robot.alive)
            robot.requestSync();
    });
};

Duel.prototype.robotSynched = function() {
    var allSynced = true;
    this.robots.forEach(function(robot) {
         if(robot.alive && !robot.synched) {
             allSynced = false;
         }
    });
    
    if(allSynced) {
        duel.updateBotsAndScan();   
    }
}

Duel.prototype.updateBulletsAndTick = function() {
    this.bullets.forEach(function(bullet) {
        bullet.advance();
    });
    
    this.tickCount++;
    this.robots.forEach(function(robot) {
        robot.tick();
    });
}

Duel.prototype.updateBotsAndScan = function() {
    this.robots.forEach(function(robot) {
        robot.collisions = [];
    });
    
    
    this.robots.forEach(function(robot) {
        robot.advanceRobot();
    });
    
    for(var i=0;i<this.robots.length;i++) {
        for(var j=i+1;j<this.robots.length;j++) {
            this.robots[i].checkCollision(this.robots[j]);   
        }
    }
    
    this.robots.forEach(function(robot) {
        robot.scan();
    });
    
    this.testRoundEnd();
    
    var duel = this;
    var tickTime = 1000/this.ticksPerSecond;
    window.setTimeout(function() {
        duel.run();   
    }, tickTime);
}

Duel.prototype.bulletHitWall = function(bullet) {
    this.explosions.push(new Animation(bullet.x, bullet.y, ANIMATIONS.bulletExplosion.frames, ANIMATIONS.bulletExplosion.duration));
    var index = this.bullets.indexOf(bullet);
    this.bullets.splice(index, 1);
    
    if(bullet.robot.alive) {
        bullet.robot.bulletHitWall(bullet);
    }
}

Duel.prototype.bulletHitRobot = function(bullet, robot) {
    this.explosions.push(new Animation(bullet.x, bullet.y, ANIMATIONS.bulletExplosion.frames, ANIMATIONS.bulletExplosion.duration));
    
    if(bullet.robot.alive) {
        bullet.robot.bulletHitRobot(bullet, robot);
    }
    
    robot.hitByBullet(bullet);
    
    var index = this.bullets.indexOf(bullet);
    this.bullets.splice(index, 1);
}

Duel.prototype.robotDie = function(robot) {
    this.explosions.push(new Animation(robot.data.x, robot.data.y, ANIMATIONS.robotExplosion.frames, ANIMATIONS.robotExplosion.duration));
}

Duel.prototype.testRoundEnd = function() {
    var robotsAlive = this.robots.filter(function(robot) {
        return robot.alive; 
    });
    
    var deadRobotsBullets = this.bullets.filter(function(bullet) {
        return !bullet.robot.alive; 
    });
    
    if(robotsAlive.length <= 1 && deadRobotsBullets.length == 0) {
        if(robotsAlive.length > 0) {
            this.message = 'Robot ' + robotsAlive[0].name + " wins!";
            robotsAlive[0].win();
        } else {
            this.message = 'Draw!';
        }
        
        this.running = false;
        var duel = this;
        
        if(this.currentRound < this.rounds) {
            setTimeout(function() {
                duel.startRound();
            }, 1000);
        } else {
            this.message += ' <br>Final Score: ' + this.robots[0].wins + ":" + this.robots[1].wins;

            if(this.onfinished) {
                setTimeout(function() {
                    duel.onfinished(duel.robots[0].wins, duel.robots[1].wins);
                }, 2000);
            }
        }
    }
}

Duel.prototype.draw = function(time) {
    
    
    var deltaMS = (this.lastDrawCall==0)?0:time - this.lastDrawCall;
    this.lastDrawCall = time;
    
    var c = document.getElementById("arena");
    var ctx = c.getContext("2d");
    
    var bgImage = document.getElementById('background');
    
    var x = 0;
    
    while(x < this.width) {
        var y = 0;
        while(y < this.height) {
            ctx.save();
            ctx.translate(x, y);
            ctx.drawImage(
                    bgImage, 
                    0,
                    0);
            y += bgImage.height;
            ctx.restore();
        }
        x += bgImage.width;
    }
    var tankImg = [
            document.getElementById("tank0"),
            document.getElementById("tank1")
        ];
        
    var gunImg = [
            document.getElementById("gun0"),
            document.getElementById("gun1")
        ];
    var radarImg = [
        document.getElementById("radar0"),
        document.getElementById("radar1")
        ];
    
    this.robots.forEach(function(robot, index) {
        if(robot.alive) {
            ctx.save();

            ctx.translate(robot.data.x, robot.data.y);

            ctx.save();
                ctx.rotate(robot.data.angle);
                ctx.drawImage(
                    tankImg[index], 
                    -CONSTANTS.robotWidth/2,
                    -CONSTANTS.robotHeight/2);
            ctx.restore();

            ctx.save();
                ctx.rotate(robot.data.gunAngle);
                ctx.drawImage(
                    gunImg[index], 
                    -CONSTANTS.gunOffsetX,
                    -CONSTANTS.gunOffsetY);
            ctx.restore();

            ctx.save();
                ctx.rotate(robot.data.radarAngle);
                ctx.drawImage(
                    radarImg[index], 
                    -CONSTANTS.radarOffsetX,
                    -CONSTANTS.radarOffsetY);
            ctx.restore();

            var SCAN_LENGTH = 1200;
            if(this.drawScans) {
                ctx.fillStyle= 'rgba(0, 255, 0, 0.3)'
                ctx.beginPath();
                
                ctx.moveTo(0,0);
                ctx.arc(0, 0, SCAN_LENGTH, normalizeAngle(robot.oldRadarAngle - Math.PI/2), normalizeAngle(robot.data.radarAngle - Math.PI/2), (getRotationDir(robot.oldRadarAngle, robot.data.radarAngle)<0));
                //ctx.arc(0, 0, 100, 0, Math.PI/2, true);
               
                ctx.fill();
                
                ctx.strokeStyle = "#00ff00";
                ctx.beginPath();
                ctx.moveTo(0,0);
                var lineTarget = new Vector(0,0);
                lineTarget.project(robot.data.radarAngle, SCAN_LENGTH);
                ctx.lineTo(lineTarget.x, lineTarget.y);
                ctx.stroke();             
            }
            
            
            
            ctx.restore();
        }
    }, this);
    this.explosions.forEach(function(animation) {
        var image = animation.advance(deltaMS);
        if(image != null) {
            ctx.drawImage(
                    image, 
                    animation.x,
                    animation.y);
        } else {
            this.explosions.splice(this.explosions.indexOf(animation),1);
        }
    }, this);
    
    ctx.fillStyle = "#ffffff";
    this.bullets.forEach(function(bullet) {
        var bulletRadius = 1 + (bullet.power);
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI*2);
        ctx.fill();
    });
    
    if(this.drawDebug) {
        this.robots.forEach(function(robot) {
            robot.lastTurnsDrawPrimitives.forEach(function(primitive) {
                switch(primitive.type) {
                    case 'circle':
                        ctx.fillStyle= primitive.color;
                        ctx.beginPath();
                        ctx.arc(primitive.x, primitive.y, primitive.radius, 0, Math.PI*2);
                        ctx.fill();
                        break;
                    case 'line':
                        ctx.strokeStyle = primitive.color;
                        ctx.beginPath();
                        ctx.moveTo(primitive.fromX, primitive.fromY);
                        ctx.lineTo(primitive.toX, primitive.toY);
                        ctx.stroke();
                        break;
                }
            }, this);
        }, this);
    }
            
    
    document.getElementById('message').innerHTML = this.message;
    
    
    document.getElementById('title').innerText = this.robots[0].name + " vs. " + this.robots[1].name;
    
    this.updateRobotStats(this.robots[0], 'r1_');
    this.updateRobotStats(this.robots[1], 'r2_');
    
    var duel = this;
    window.requestAnimationFrame( function(time) {
        duel.draw(time);
    });
}

Duel.prototype.updateRobotStats = function(robot, prefix) {
    document.getElementById(prefix + 'name').textContent = robot.name;
    document.getElementById(prefix + 'power').textContent = Math.round(robot.data.power);
    document.getElementById(prefix + 'wins').textContent = robot.wins;
}

Animation = function(x,y,frames, duration) {
    this.x = x - frames[0].width/2;
    this.y = y - frames[0].height/2;
    this.frames = frames;
    this.msPerFrame = duration / this.frames.length;
    
    this.framePointer = 0;
    this.msLeftInFrame = this.msPerFrame;
}

Animation.prototype = {
    advance : function(deltaMS) {
        this.msLeftInFrame -= deltaMS;
        while(this.msLeftInFrame < 0) {
            this.framePointer++;
            this.msLeftInFrame += this.msPerFrame;
        }
        
        if(this.framePointer < this.frames.length) {
            return this.frames[this.framePointer];
        } else {
            return null;   
        }
    }
}
