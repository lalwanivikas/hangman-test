/*
 *  Global variables
*/
var canvas = document.querySelector('.sf');
var ctx = canvas.getContext('2d');
var canvasWidth;
var canvasHeight;
var wordList = ["hello", "hey", "hi", "hola", "hasta la vista", "good day"];
var currentWord;
var score = 0;
var scoreContainer = document.querySelector('.current-score');
var lettersGuessed = "";
var guessWordDiv = document.querySelector('.guess');
var letterRow;
var keyboardKeys = document.querySelectorAll('.key-row span');
var chancesLeft = 6;
var timeoutId;
var keysArray = [];

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
  return wordList[Math.floor(Math.random() * 6)];
}


/*
 *  takes a word as input and generates blank spans
 *  ==== does not modify anything ====
*/
var setBlanks = function(word) {

  // currentWord = "hasta la vista"
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

  setBlanks(_currentWord);

  for (var i = 0; i < keysArray.length; i++) {
    keyboardKeys[i].className = "";
  }


  for (var i = 0; i < _lettersGuessed.length; i++) {
    var keyPosition = keysArray.indexOf(_lettersGuessed[i]);
    if (_currentWord.indexOf(_lettersGuessed[i]) > -1) {
      keyboardKeys[keyPosition].className = "correct";
      var joinedWord = _currentWord.split(" ").join("");
      for(var j=0; j<joinedWord.length; j++) {
        if (joinedWord[j] === _lettersGuessed[i]) {
          letterRow[j].innerHTML = _lettersGuessed[i];
        }
      }
    } else {
        if (chancesLeft > 0) {
          keyboardKeys[keyPosition].className = "incorrect";
          chancesLeft--;
        }
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


var updateStickFigure = function(_chancesLeft) {

  // correct word complete => reset game and update score
  var inputWord = "";
  letterRow = document.querySelectorAll('.letter-row span');
  for (var i = 0; i < letterRow.length; i++) {
    inputWord += letterRow[i].innerHTML;
  }
  if (currentWord.split(" ").join("") === inputWord) {
    upSyncGameState(score++, 6, generateRandomWord(), "");
    return;
  }

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
  upSyncGameState(0, 6, generateRandomWord(), "");
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
  updateUI(score, chancesLeft, currentWord, lettersGuessed);

}


firebase.database().ref().on('value', function(snapshot) {
  updateValues(snapshot);
});

// var init = function() {
//   firebase.database().ref().once('value').then(function(snapshot) {
//     updateValues(snapshot);
//   });
// }

// window.onload = init;