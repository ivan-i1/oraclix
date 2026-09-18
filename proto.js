const STANDARD = {
    DICE: 2,
    SIDE: 6,
    SIMULATIONS: 1000
}

var gameSet = function gameSet (gameState, winProb, calculatedProb) {
    return calculatedProb > winProb;
}
var calculateWinProb = function calculateWinProb (exclusiveWinValue, probMethod) {

}
var calculateDieResults = function calculateDieResults(dieNumber, dieSides) {
    // Assume standard dies that start at 1 and move up values 1 by 1
    var results = {
        startingNumber: 0,
        endNumber: 0,
        distributionArray: []
    }
    startingNumber = dieNumber;
    endNumber = dieSides * dieNumber;
    distributionArray
    return results;
}

var rollDie = function rollDie(dieSides) {
    return Math.floor(Math.random() * dieSides);
}
var rollDice = function rollDice(dieNumber, dieSides) {
    var results = [];
    for (var i = 0; i < dieNumber; i++) {
        results.push(rollDie(dieSides));
    }
    return results;
}
var simulateRolls = function simulateRolls(config) {
    var rawResults = [];
    var results = [];
    var currentResult;
    for (var i = 0; i < config.numberOfSimulations; i++) {
        currentResult = rollDice(config.dieNumber, config.dieSides)
        rawResults.push(currentResult);
        results.push(currentResult.reduce((x,y) => x + y));
    }
    return [results, rawResults];
}
var createDistribution = function createDistribution(config) {
    var numberOfResults = config.dieNumber * (config.dieSides - 1);
    var distributionArray = [];
    var percentageDistributionArray = [];
    config.results.sort((a, b) => a - b);
    for (var i = 0; i < numberOfResults; i++) {
        distributionArray.push(config.results.indexOf(i + 1) - config.results.indexOf(i));
    }
    distributionArray.push(config.results.length - config.results.indexOf(numberOfResults));
    for (var i = 0; i < distributionArray.length; i++) {
        percentageDistributionArray.push(distributionArray[i]/config.numberOfSimulations);
    }
    return [distributionArray, percentageDistributionArray];
}

//core methods are exclusive
//values used in core methods are adjusted to array key not dice values
//e.i. for 5d6 value 0 means 5, value 6 means 11
var moreThan = function moreThan(distributionArray, value) {
    return distributionArray.reduce(function(p, c, i) {
        if (i > value) {
            return p + c;
        }
        return p;
    }, 0)
}
var lessThan = function lessThan(distributionArray, value) {
    return distributionArray.reduce(function(p, c, i) {
        if (i < value) {
            return p + c;
        }
        return p;
    }, 0)
}
var between = function between(distributionArray, a, b) {
    var full = lessThan(distributionArray, b);
    var diff = lessThan(distributionArray, a);
    return full - diff;
}

var protoCombat = function protoCombat(dist, atk, def) {
    var needed = def - atk - config.dieNumber;
    needed = needed < 1? 1 : needed; //crit miss misses even if attack is greater than defense
    console.log(def, atk, config.dieNumber, needed);
    return between(dist, needed, dist.length);
}

var config = {
    numberOfSimulations: 200000,
    dieNumber: 2,
    dieSides: 6
}
config.numberOfResults = config.dieNumber * (config.dieSides - 1);
var res = simulateRolls(config)
config.results = res[0];
var distRes = createDistribution(config)
between(distRes[1], 0, 15)
