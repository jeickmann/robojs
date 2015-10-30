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
console.log(bot1File);
duel = new Duel(bot1File, bot2File, rounds, speed);
duel.start();