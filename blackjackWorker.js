self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  let numPlayers = e.data.numPlayers;
  let numRounds = e.data.numRounds;
  let numDecks = e.data.numDecks;
  start(numPlayers, numRounds, numDecks);

}, false);






function start(numPlayers, numRounds, numDecks){
    //let t0 = performance.now();

    let res = playRounds(numPlayers,numRounds,getShoe([],numDecks));

    //let t1 = performance.now();

    let totWins = res[0];
    let totLoss = res[1];

    let msg = {};
    msg.totWins = res[0];
    msg.totLoss = res[1];

    msg.finished = 1;
    //msg.runtime = (t1 - t0);

    self.postMessage(msg);


}


const playRounds = (numPlayers, numRounds, ndeck) => {
    let tscores = [0,0];
    let roundsPlayed = 0;
    let t0 = performance.now();
    while(roundsPlayed < numRounds){

        let rscores = scorePlayers(play(deal(shuffle(ndeck), addPlayers([createDealer()],numPlayers))));

        tscores = sumArrays(tscores,rscores);
        if(roundsPlayed > 1 && Math.round(roundsPlayed % (numRounds / 100)) === 0){
            let percentage = (tscores[0]/(tscores[0]+tscores[1])) * 100;
            let msg = {};
            msg.tscores = tscores;

            msg.percentage = percentage;
            let t3 = performance.now();
            msg.runtime = (t3 - t0) / 1000;
            self.postMessage(msg);
        }
        roundsPlayed++;
    }
    return tscores;
}


const sumArrays = (a1,a2) => {
    return a1.map(function (num, ind) {
        return num + a2[ind];
    });
}

const getShoe = (iFullDeck, numDecks) => {
    fullDeck = clone(iFullDeck);
    if(numDecks > 0){
        getShoe(fullDeck.concat(getOneDeck()), numDecks - 1);
    }
    return fullDeck;
}

const playerPoints = (player) => {
    return (1 + getDoubleDownPoint(player) + getBlackjackPoint(player));
}

const getDoubleDownPoint = (player) => {
    return (player.doubledDown === true) ? 1 : 0;
}

const getBlackjackPoint = (player) => {
    return (player.blackjack === true) ? 0.5 : 0;
}

const scorePlayer = (player, dealerPoints) => {
    return [
        (playerWon(player, dealerPoints) ? playerPoints(player) : 0),
        (playerLost(player, dealerPoints) ? playerPoints(player) : 0)
    ]
}

const playerWon = (player, dealerPoints) => {
    if(player.points > dealerPoints || player.blackjack === true){
        return true;
    }
    return false;
}

const playerLost = (player, dealerPoints) => {
    if(player.points < dealerPoints || player.points === 0){
        return true;
    }
    return false;
}

const scorePlayers = (players) => {
    let dealerPoints = players[0].points;
    let scores = [0,0];
    for(let i = 1; i < players.length; i++){
        scores = sumArrays(scores,scorePlayer(players[i],dealerPoints));
    }
    return scores;
}

const dealerBlackjack = (players) => {
    return players.map(function(player){
        if(player.type == "player" && player.points != 21){
            player.points = 0;
            return player;
        }else{
            return player;
        }
    });
}

const play = (game) => {
    let deck = game[0];
    let players = game[1];
    let dealer = players[0];
    let nPlayers = [];

    if(dealer.points == 21){
        nPlayers = dealerBlackjack(players);
    }else{
        let spDeckPly = splitPlayers([deck, players]);
        deck = spDeckPly[0];
        nPlayers = spDeckPly[1];

        nPlayers = nPlayers.map(function(player, ind, plyrs){
            if(player.points == 21){
                player.blackjack = true;
                return player;
            }
            if(player.points == 22){
                player.acesToUse--;
                player.points = 12;
            }
            let hitResults = hit(deck, players, player);
            deck = hitResults[0];
            let newPlayer = hitResults[1];
            return newPlayer;
        });
    }
    return nPlayers;
}


const splitPlayers = (deckPlayers) => {
    let deck = deckPlayers[0];
    let players = deckPlayers[1];
    let newPlayers = [];
    players.map(function(player){
        if(player.canSplit){
            let stratCode = strategize(player, players[0].upcard);
            if(stratCode == 2){
                player.canSplit = false;
                let sPlayer = createPlayer();
                let splitPoints = player.points / 2;
                sPlayer.points = splitPoints;
                player.points = splitPoints;

                let dp = adjustPlayer(1,giveCard(deck, sPlayer));
                deck = dp[0];
                sPlayer = dp[1];

                dp = adjustPlayer(1,giveCard(deck, player));
                deck = dp[0];
                player = dp[1];

                newPlayers.push(sPlayer);
            }
        }
        newPlayers.push(player);
    });
    return [deck, newPlayers];
}


const adjustPlayer = (round,dp) => {
    let deck = dp[0];
    let nPlayer = dp[1];
    let card = dp[2];
    if(round == 1 && nPlayer.type == 'dealer'){
        nPlayer.upcard = card;
    }
    if(round == 1 && nPlayer.type == "player" && card === nPlayer.points / 2){
        nPlayer.canSplit = true;
    }
    return [deck,nPlayer];
}


const deal = (ideck, players) => {
    let i = 0;
    let deck = clone(ideck);
    while(i < 2){
        players = players.map(function(player){
            let dp = adjustPlayer(i,giveCard(deck, player));
            deck = dp[0];
            return dp[1];
        });
        i++;
    }
    return [deck, players];
}

const addPlayers = (players, numPlayers) => {
    if(numPlayers > 0){
      players.push(createPlayer());
      addPlayers(players, numPlayers - 1)
    }
    return players;
}

const createDealer = () => {
    return {type:'dealer',points:0,acesToUse:0,upcard:0};
}

const createPlayer = () => {
    return {type:'player',points:0,acesToUse:0,doubledDown:false,canSplit:false};
}


const shuffle = (arr) => {
    let curInd = arr.length, tempVal, randInd;
    while (0 !== curInd) {
        randInd = Math.floor(Math.random() * curInd);
        curInd -= 1;
        tempVal = arr[curInd];
        arr[curInd] = arr[randInd];
        arr[randInd] = tempVal;
    }
    return arr;
}


const giveCard = (deck, player) => {
  let card = deck.pop();

  card = Math.min(10, card);
  if(card === 1){ card = 11; }

  player.points += card;
  if(card == 11){ player.acesToUse++; }
  player = playAces(player);
  return [deck,player,card];
}

const hit = (deck, players, player) => {
    let stratCode = strategize(player, players[0].upcard);
    let dp = [];
    if(player.type == "player" && stratCode == 3){
        player.doubledDown = true;
        dp = giveCard(deck, player);
        deck = dp[0];
        player = dp[1];

    }else{
        while(player.points < 21 && shouldHit(players, player)){
            dp = giveCard(deck, player);
            deck = dp[0];
            player = dp[1];
        }
    }
    if(player.points > 21){
        player.points = 0;
    }
    return [deck, player];
}


const shouldHit = (players, player) => {
    if(player.type === 'dealer'){
        return player.points < 17 ? true : false;
    }
    let stratCode = strategize(player, players[0].upcard);
    if(stratCode === 0 || stratCode === 3){
        return true;
    }
    return false;
}


const strategize = (player, upcard) => {
    let points = player.points - 1;
    if(player.acesToUse > 0){
        points = points - 10;
    }
    if(upcard == 11){ upcard = 1; }

    if(player.canSplit){
        return getPairStrat(points, upcard-1);
    }else if(player.acesToUse > 0){
        return getSoftStrat(points, upcard-1);
    }else{
        return getHardStrat(points, upcard-1);
    }
}


const playAces = (player) => {
    if(player.points > 21){
        if(player.acesToUse > 0){
            player.points -= 10;
            player.acesToUse--;
        }
    }
    return player;
}


const clargs = (args) => {
    for(let i = 0; i < args.length; i++){
        args[i] = clone(args[i]);
    }
    return args;
}


const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}


const getOneDeck = () => {
    return [
        1,2,3,4,5,6,7,8,9,10,11,12,13,
        1,2,3,4,5,6,7,8,9,10,11,12,13,
        1,2,3,4,5,6,7,8,9,10,11,12,13,
        1,2,3,4,5,6,7,8,9,10,11,12,13
    ];
}

const getSoftStrat = (points, upcard) => {
    let softStrat = [
        [9,9,9,9,9,9,9,9,9,9],
        [0,0,0,0,0,3,0,0,0,0],
        [0,0,0,0,3,3,0,0,0,0],
        [0,0,0,0,3,3,0,0,0,0],
        [0,0,0,3,3,3,0,0,0,0],
        [0,0,0,3,3,3,0,0,0,0],
        [0,0,3,3,3,3,0,0,0,0],
        [0,1,3,3,3,3,1,1,0,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [0,0,0,0,0,0,0,0,0,0]
    ];
    return softStrat[points][upcard];
}


const getHardStrat = (points, upcard) => {
    let hardStrat = [
        [9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,3,3,3,3,0,0,0,0],
        [0,3,3,3,3,3,3,3,3,0],
        [0,3,3,3,3,3,3,3,3,3],
        [0,0,0,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];
    return hardStrat[points][upcard];
}


const getPairStrat = (points, upcard) => {
    let pairStrat = [
        [9,9,9,9,9,9,9,9,9,9],
        [2,2,2,2,2,2,2,2,2,2],
        [9,9,9,9,9,9,9,9,9,9],
        [0,2,2,2,2,2,2,0,0,0],
        [9,9,9,9,9,9,9,9,9,9],
        [0,2,2,2,2,2,2,0,0,0],
        [9,9,9,9,9,9,9,9,9,9],
        [0,0,0,0,2,2,2,0,0,0],
        [9,9,9,9,9,9,9,9,9,9],
        [0,3,3,3,3,3,3,3,3,0],
        [9,9,9,9,9,9,9,9,9,9],
        [0,2,2,2,2,2,0,0,0,0],
        [9,9,9,9,9,9,9,9,9,9],
        [0,2,2,2,2,2,2,0,0,0],
        [9,9,9,9,9,9,9,9,9,9],
        [2,2,2,2,2,2,2,2,2,2],
        [9,9,9,9,9,9,9,9,9,9],
        [1,2,2,2,2,2,1,2,2,1],
        [9,9,9,9,9,9,9,9,9,9],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];
    return pairStrat[points][upcard];
}
