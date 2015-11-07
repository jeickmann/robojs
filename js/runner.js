bots = defaultBots;

bots.forEach(function(bot) {
    if(!bot.score) {
        bot.score = 0;
    }
});

function drawHighscores() {
    bots.sort(function(bot1, bot2) {
        return Math.sign(bot2.score - bot1.score);
    });

    var html = '';
    bots.forEach(function(bot) {
        html += '<li id="bot_'+bot.file+'">'+bot.score + ' - ' + bot.name;
    });

    document.getElementById('highscores').innerHTML = html;
}

bot1 = null;
bot2 = null;

var cancelTimeout = null;

function initBattle() {
    bot1 = bots[0];
    var bot2Index = Math.floor(Math.random()*(bots.length-1)) + 1;
    bot2 = bots[bot2Index];

    var battleUrl = 'index.html?speed=40&rounds=5bot1='+bot1.file + '&bot2='+bot2.file;

    document.getElementById('arena').src = battleUrl;

    document.getElementById('bot_' + bot1.file).setAttribute('class', 'active');
    document.getElementById('bot_' + bot2.file).setAttribute('class', 'active');

    if(cancelTimeout) {
        clearTimeout(cancelTimeout);
    }
    cancelTimeout = setTimeout(function() {
        battleFinished(0,0);
    }, 120000);
}

function battleFinished(bot1score, bot2score) {
    console.log(bot1score);
    if(bot1score > bot2score) {
        bot1.score++;
    } else if(bot2score > bot1score) {
        bot2.score++;
    }
    drawHighscores();
    initBattle();
}

drawHighscores();
initBattle();

