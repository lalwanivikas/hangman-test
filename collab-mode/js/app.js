// DOM selectors
var canvas = document.querySelector('.sf');
var ctx = canvas.getContext('2d');
var scoreContainer = document.querySelector('.current-score');
var guessWordDiv = document.querySelector('.guess');
var letterRow;
var keyboardKeys = document.querySelectorAll('.key-row span');
var themeContainer = document.querySelector('.theme');
var timerContainer = document.querySelector('.time-remaining');
var contributionContainer = document.querySelector('.contribution');

// game variables
var canvasWidth;
var canvasHeight;
var wordList =  ["delhi", "mumbai", "new york", "london", "buenos aires", "tokyo", "berlin", "los angeles", "moscow", "hong kong", "rome", "prague", "dublin","amitabh bacchan", "shah rukh khan", "amir khan", "salman khan", "bobby deol", "akshay kumar","pink", "red", "purple", "green", "white", "black","tea", "coffee", "beer", "wine", "margarita", "water", "lemon tea"];
var themes = {
  "world city": ["delhi", "mumbai", "new york", "london", "buenos aires", "tokyo", "berlin", "los angeles", "moscow", "hong kong", "rome", "prague", "dublin"],
  "bollywood superstar": ["amitabh bacchan", "shah rukh khan", "amir khan", "salman khan", "bobby deol", "akshay kumar"],
  "color": ["pink", "red", "purple", "green", "white", "black"],
  "beverage": ["tea", "coffee", "beer", "wine", "margarita", "water", "lemon tea"]};
var id;
var keysArray = []; for (var i = 0; i < keyboardKeys.length; i++) {keysArray.push(keyboardKeys[i].innerHTML);}
var timeRemaining = 11;
var timer = null;
var emptyState = {
  isAOnline: false,
  isBOnline: false,
  master: 'playerA',
  currentWord: '',
  score: 0,
  chancesLeft: 6,
  lettersGuessed: '',
  playerA: {
    id: 'playerA',
    role: 'master'
  },
  playerB: {
    id: 'playerB',
    role: 'slave'
  }
};
var gameState = {
  isAOnline: false,
  isBOnline: false,
  master: 'playerA',
  currentWord: '',
  score: 0,
  chancesLeft: 6,
  lettersGuessed: '',
  playerA: {
    id: 'playerA',
    role: 'master'
  },
  playerB: {
    id: 'playerB',
    role: 'slave'
  }
};

/*
 *  Setting up canvas for drawing hangman stick figure
 *  - height and width of drawing area
 *  - stand for stick figure
 *  ==== modifies canvasWidth and canvasHeight ==== */
function setCanvas() {
  canvasWidth = Math.floor(window.innerWidth * .4);
  canvasHeight = Math.floor(window.innerHeight * .4);

  canvas.width = canvasWidth
  canvas.height = canvasHeight;
  // console.log(canvasWidth + " x " + canvasHeight);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#6D4C41";
  ctx.beginPath();
  ctx.moveTo(10, canvasHeight - 10);
  ctx.lineTo(canvasWidth - 10, canvasHeight - 10);
  ctx.moveTo(20, canvasHeight - 10);
  ctx.lineTo(20, 10);
  ctx.lineTo(canvasWidth / 2, 10);
  ctx.lineTo(canvasWidth / 2, 20);
  ctx.stroke();
}
setCanvas();

/*
 *  methods for drawing stick-figure
 *  ==== does not modify anything ==== */
var stickFigure = {
  drawHead: function() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#607D8B";
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, 20 + canvasHeight / 10, canvasHeight / 10, 0, 2 * Math.PI);
    ctx.stroke();
  },

  drawStomach: function() {
    ctx.moveTo(canvasWidth / 2, 20 + canvasHeight / 5);
    ctx.lineTo(canvasWidth / 2, 20 + canvasHeight * .55);
    ctx.stroke();
  },

  drawLeftHand: function() {
    ctx.moveTo(canvasWidth / 2, 20 + canvasHeight / 5);
    ctx.lineTo(canvasWidth / 4, 20 + canvasHeight / 3);
    ctx.stroke();
  },

  drawRightHand: function() {
    ctx.moveTo(canvasWidth / 2, 20 + canvasHeight / 5);
    ctx.lineTo(canvasWidth * 3/4, 20 + canvasHeight / 3);
    ctx.stroke();
  },

  drawLeftLeg: function() {
    ctx.moveTo(canvasWidth / 2, 20 + canvasHeight * .55);
    ctx.lineTo(canvasWidth / 4, 20 + canvasHeight * .7);
    ctx.stroke();
  },

  drawRightLeg: function() {
    ctx.moveTo(canvasWidth / 2, 20 + canvasHeight * .55);
    ctx.lineTo(canvasWidth * 3/4, 20 + canvasHeight * .7);
    ctx.stroke();
  }
}


function generateRandomWord() {
  return wordList[Math.floor(Math.random() * wordList.length)];
}

// returns theme based on current word
function getTheme() {
  for (var theme in themes) {
    if (themes[theme].indexOf(gameState.currentWord) > -1) {
      return theme;
    }
  }
}

/*
 *  takes a word as input and generates blank spans
 *  ==== does not modify anything ====
*/
function setBlanks() {

  // word = "hasta la vista"
  var words = gameState.currentWord.split(" "); // words = ["hasta", "la", "vista"]

  guessWordDiv.innerHTML = "";
  for (var i = 0; i < words.length; i++) {
    var rowDiv = document.createElement('div');
    rowDiv.className = "letter-row";
    for (var j = 0; j < words[i].length; j++) {
      var letterSpan = document.createElement('span');
      rowDiv.appendChild(letterSpan);
    }
    guessWordDiv.appendChild(rowDiv);
  }

  letterRow = document.querySelectorAll('.letter-row span');
}

function updateKeyboardAndGuess() {

  var _currentWord = gameState.currentWord;
  var _lettersGuessed = gameState.lettersGuessed;

  // _currentWord = "hola hey"
  // _lettersGuessed = "abcde"

  // updating keyboard
  for (var i = 0; i < keysArray.length; i++) {
    keyboardKeys[i].className = "";
    for (var j = 0; j < _lettersGuessed.length; j++) {
      if(keysArray[i] ===  _lettersGuessed[j] && _currentWord.indexOf(_lettersGuessed[j]) > -1) {
        keyboardKeys[i].className = "correct";
      } else if (keysArray[i] ===  _lettersGuessed[j] && _currentWord.indexOf(_lettersGuessed[j]) === -1) {
        keyboardKeys[i].className = "incorrect";
      }
    }
  }

  gameState.chancesLeft = 6;
  for (var i = 0; i < keyboardKeys.length; i++) {
    if (keyboardKeys[i].className === "incorrect") {
      gameState.chancesLeft--;
    }
  }

  // updating blanks
  setBlanks();
  var joinedWord = _currentWord.split(" ").join("");
  for(var k = 0; k < joinedWord.length; k++) {
    if (_lettersGuessed.indexOf(joinedWord[k]) !== -1) {
      letterRow[k].innerHTML = joinedWord[k];
    }
  }

}

function reverseRole() {
  // console.log('reversing!');

  var currentMaster = gameState.master;
  gameState.master = (gameState.master === 'playerA') ? 'playerB' : 'playerA';

  var otherPlayer = (id === 'playerA') ? 'playerB' : 'playerA';
  gameState[id].role = 'slave';
  gameState[otherPlayer].role = 'master';

  clearInterval(timer);
  timer = null;
  timeRemaining = 11;
  upSync();
}

function handleKeyboardInput(e) {
  if(gameState.lettersGuessed.indexOf(e.target.innerHTML) === -1) {
    gameState.lettersGuessed += e.target.innerHTML;
  }
  clearInterval(timer);
  updateKeyboardAndGuess();
  checkGameState();
  reverseRole();
}


function checkGameState() {

  console.log('checking game state!');

  if (gameState.chancesLeft === 0) {
    gameOver();
  }

  // correct word complete => reset game and update score
  var inputWord = "";
  letterRow = document.querySelectorAll('.letter-row span');
  for (var i = 0; i < letterRow.length; i++) {
    inputWord += letterRow[i].innerHTML;
  }

  console.log(inputWord);
  console.log(gameState.currentWord);

  if (gameState.currentWord.split(" ").join("") === inputWord) {
    // updateUI(score++, 6, gameState.currentWord, "");
    // upSyncGameState(gameState.score, 6, generateRandomWord(), "");
    // gameState = emptyState;
    gameState.lettersGuessed = "";
    gameState.score++;
    gameState.currentWord = generateRandomWord();
    upSync();
    return;
  }

}


function updateStickFigure() {

  // incorrect guess => draw body part of stick figure
  setCanvas();
  switch(gameState.chancesLeft) {
    case 5:
      stickFigure.drawHead();
      // console.log(_chancesLeft);
      break;
    case 4:
      stickFigure.drawHead();
      stickFigure.drawStomach();
      // console.log(_chancesLeft);
      break;
    case 3:
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      // console.log(_chancesLeft);
      break;
    case 2:
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      // console.log(_chancesLeft);
      break;
    case 1:
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      stickFigure.drawLeftLeg();
      // console.log(_chancesLeft);
      break;
    case 0:
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      stickFigure.drawLeftLeg();
      stickFigure.drawRightLeg();
      // console.log(_chancesLeft);
      gameOver();
      break;
  }

  return;
}

function gameOver() {
  clearInterval(timer);
  alert("Game Over. Your score was " + gameState.score + ". Click OK to play again.");
  gameState = emptyState;
  gameState.currentWord = generateRandomWord();
  upSync();
}

function setTimer() {
  timeRemaining--;
  timerContainer.innerHTML = "Your turn: " + timeRemaining + "s";
  if (timeRemaining === 0) {
    clearInterval(timer);
    reverseRole();
    // console.log("time up!")
  }
}

function updateMasterUI() {
  if (gameState[id].role === "master") {
    // console.log("updating master");
    for (var i = 0; i < keyboardKeys.length; i++) {
      keyboardKeys[i].addEventListener("click", handleKeyboardInput);
    }

    if (timer === null) {
      timer = setInterval(setTimer, 1000);
    }
    contributionContainer.innerHTML = "60";
  }
}

function updateSlaveUI() {
  if (gameState[id].role === "slave") {
    // console.log("updating slave");
    for (var i = 0; i < keyboardKeys.length; i++) {
      keyboardKeys[i].removeEventListener("click", handleKeyboardInput);
    }
    clearInterval(timer);
    timerContainer.innerHTML = "Other player's turn.";
    contributionContainer.innerHTML = "50";
  }
}

// updates UI based on role
function updateUI() {

  scoreContainer.innerHTML = gameState.score;
  themeContainer.innerHTML = getTheme();
  updateStickFigure();
  updateKeyboardAndGuess();

  if (gameState[id].role === "master") {
    // console.log("updating master");
    updateMasterUI();
  } else if (gameState[id].role === "slave") {
    // console.log("updating slave");
    updateSlaveUI();
  }

}

// syncs gameState with firebase realtime db
function upSync() {firebase.database().ref().set(gameState);}

firebase.database().ref().on('value', function(snapshot) {
  if (snapshot.val() !== null) {
    gameState = snapshot.val();
    updateUI();
  }
});

function init() {
  firebase.database().ref().once('value').then(function(snapshot) {
    if (snapshot.val() === null) {
      gameState = emptyState;
      gameState.isAOnline = true;
      gameState.currentWord = generateRandomWord();
      id = "playerA";
      alert("It is your turn to guess a letter.");
    } else {
      gameState = snapshot.val();
      // both players offline
      if (!gameState.isAOnline && !gameState.isBOnline) {
        gameState = emptyState;
        gameState.isAOnline = true;
        gameState.currentWord = generateRandomWord();
        id = "playerA";
        alert("It is your turn to guess a letter.");
      } else if (!gameState.isAOnline && gameState.isBOnline) {
        // player-a offline and player-b online
        gameState.isAOnline = true;
        gameState.currentWord = generateRandomWord();
        id = "playerA";
        alert("It is your turn to guess a letter.");
      } else if(gameState.isAOnline && !gameState.isBOnline) {
        // player-a online and player-b offline
        gameState.isBOnline = true;
        currentWord = gameState.currentWord;
        id = "playerB";
        alert("Currently other player is guessing. Please wait for your turn.");
      } else {
        alert("Game in progress. Please try later.");
        document.write("game in progress. please try later");
        return;
      }
    }
    // console.log(gameState[id]["role"]);
    // updateUI();
    upSync();
  });
}

window.onload = init;