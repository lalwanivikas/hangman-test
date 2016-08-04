/*
 *  Global variables
*/
var canvas = document.querySelector('.sf');
var ctx = canvas.getContext('2d');
var canvasWidth;
var canvasHeight;
var wordList =  ["delhi", "mumbai", "new york", "london", "buenos aires", "tokyo", "berlin", "los angeles", "moscow", "hong kong", "rome", "prague", "dublin","amitabh bacchan", "shah rukh khan", "amir khan", "salman khan", "bobby deol", "akshay kumar","pink", "red", "purple", "green", "white", "black","tea", "coffee", "beer", "wine", "margarita", "water", "lemon tea"];
var currentWord;
var score = 0;
var scoreContainer = document.querySelector('.current-score');
var lettersGuessed = "";
var guessWordDiv = document.querySelector('.guess');
var letterRow;
var keyboardKeys = document.querySelectorAll('.key-row span');
var keysArray = [];
var chancesLeft = 6;
var timeoutId;
var themeContainer = document.querySelector('.theme');

var themes = {
  "world city": ["delhi", "mumbai", "new york", "london", "buenos aires", "tokyo", "berlin", "los angeles", "moscow", "hong kong", "rome", "prague", "dublin"],
  "bollywood superstar": ["amitabh bacchan", "shah rukh khan", "amir khan", "salman khan", "bobby deol", "akshay kumar"],
  "color": ["pink", "red", "purple", "green", "white", "black"],
  "beverage": ["tea", "coffee", "beer", "wine", "margarita", "water", "lemon tea"]
};

/*
 *  Setting up canvas for drawing hangman stick figure
 *  - height and width of drawing area
 *  - stand for stick figure
 *  ==== modifies canvasWidth and canvasHeight ====
*/
var setCanvas = function() {
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
 *  ==== does not modify anything ====
*/
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

/*
 *  returns a random word from wordList
 *  ==== does not modify anything ====
*/
var generateRandomWord = function() {
  return wordList[Math.floor(Math.random() * wordList.length)];
}


/*
 *  takes a word as input and generates blank spans
 *  ==== does not modify anything ====
*/
var setBlanks = function(word) {

  // word = "hasta la vista"
  var words = word.split(" "); // words = ["hasta", "la", "vista"]

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

var updateKeyboardAndGuess = function(_currentWord, _lettersGuessed) {

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

  chancesLeft = 6;
  for (var i = 0; i < keyboardKeys.length; i++) {
    if (keyboardKeys[i].className === "incorrect") {
      chancesLeft--;
    }
  }

  // updating blanks
  setBlanks(_currentWord);
  var joinedWord = _currentWord.split(" ").join("");
  for(var k = 0; k < joinedWord.length; k++) {
    if (_lettersGuessed.indexOf(joinedWord[k]) !== -1) {
      letterRow[k].innerHTML = joinedWord[k];
    }
  }

}

for (var i = 0; i < keyboardKeys.length; i++) {
  keysArray.push(keyboardKeys[i].innerHTML);
  keyboardKeys[i].addEventListener("click", function(e) {
    if(lettersGuessed.indexOf(e.target.innerHTML) === -1) {
      lettersGuessed += e.target.innerHTML;
    }
    updateKeyboardAndGuess(currentWord, lettersGuessed);
    upSyncGameState(score, chancesLeft, currentWord, lettersGuessed);
  });
}

var checkGameState = function() {

  if (chancesLeft === 0) {
    gameOver();
  }

  // correct word complete => reset game and update score
  var inputWord = "";
  letterRow = document.querySelectorAll('.letter-row span');
  for (var i = 0; i < letterRow.length; i++) {
    inputWord += letterRow[i].innerHTML;
  }
  if (currentWord.split(" ").join("") === inputWord) {
    updateUI(score++, 6, currentWord, "");
    upSyncGameState(score, 6, generateRandomWord(), "");
    return;
  }
}


var updateStickFigure = function(_chancesLeft) {

  // incorrect guess => draw body part of stick figure
  setCanvas();
  switch(_chancesLeft) {
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

var gameOver = function() {
  clearTimeout(timeoutId);
  alert("Game Over. Your score was " + score + ". Click OK to play again.");
  currentWord = generateRandomWord();
  updateUI(0, 6, currentWord, "");
  upSyncGameState(0, 6, currentWord, "");
}


var updateUI = function(_score, _chancesLeft, _currentWord, _lettersGuessed) {
  scoreContainer.innerHTML = _score;
  updateStickFigure(_chancesLeft);
  updateKeyboardAndGuess(_currentWord, _lettersGuessed);
}


/*
 *  syncs game state with Firebase realtime db
 *  ==== does not modify anything ====
*/
var upSyncGameState = function (_score, _chancesLeft, _currentWord, _lettersGuessed) {
  firebase.database().ref().set({
    score: _score,
    chancesLeft: _chancesLeft,
    currentWord: _currentWord,
    lettersGuessed: _lettersGuessed
  });
}


var updateValues = function(snapshot) {

  if(snapshot.val() === null) {
    score = 0;
    chancesLeft = 6;
    currentWord = generateRandomWord();
    lettersGuessed = "";
    upSyncGameState(score, chancesLeft, currentWord, lettersGuessed);
  } else {
    score = snapshot.val().score;
    chancesLeft = snapshot.val().chancesLeft;
    currentWord = snapshot.val().currentWord;
    lettersGuessed = snapshot.val().lettersGuessed;
  }

  console.log(score + " - " + chancesLeft + " - " + currentWord + " - " + lettersGuessed);
  checkGameState();
  updateUI(score, chancesLeft, currentWord, lettersGuessed);

  for (var theme in themes) {
    if (themes[theme].indexOf(currentWord) > -1) {
      themeContainer.innerHTML = theme
    }
  }

}


firebase.database().ref().on('value', function(snapshot) {
  updateValues(snapshot);
});