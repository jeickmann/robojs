console.log()
var bot1 = getUrlParam('bot1');
var bot2 = getUrlParam('bot2');
var rounds = getUrlParam('rounds');
var speed = getUrlParam('speed')
if(!bot1) {
    bot1 = 'testbot';
}   
if(!bot2) {
    bot2 = 'testbot2';
}

if(!rounds) {
    rounds = 10;   
}

if(!speed) {
    speed = 20;   
}

rounds = parseInt(rounds);
var bot1File = (bot1.startsWith('/')?'':'bots/') + bot1 + '/main.js';
var bot2File = (bot2.startsWith('/')?'':'bots/') + bot2 + '/main.js';

duel = new Duel(bot1File, bot2File, rounds, speed);
duel.drawScans = getUrlParam('drawScans') != null;
duel.drawDebug = getUrlParam('drawDebug') != null;
duel.onfinished = function(bot1score, bot2score) {
    if(window != window.top) {
        top.battleFinished(bot1score, bot2score);
    }
};
duel.start();
