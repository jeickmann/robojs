var bot1 = getUrlParam('bot1');
var bot2 = getUrlParam('bot2');
var rounds = getUrlParam('rounds')
if(!bot1) {
    bot1 = 'testbot';
}   
if(!bot2) {
    bot2 = 'testbot2';
}

if(!rounds) {
    rounds = 2;   
}

rounds = parseInt(rounds);
    
duel = new Duel('bots/'+bot1+'/main.js', 'bots/'+bot2+'/main.js', rounds);
duel.start();