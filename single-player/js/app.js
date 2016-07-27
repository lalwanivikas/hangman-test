/*
**  Global variables
*/
var canvas = document.querySelector('.sf');
var ctx = canvas.getContext('2d');
var canvasWidth;
var canvasHeight;
var wordList = ["hello", "hey", "hi", "hola", "hasta la vista", "good day"];
var currentWord;
var joinedWord;
var score = 0;
var scoreContainer = document.querySelector('.current-score');
var guess = [];
var guessWordDiv = document.querySelector('.guess');
var letterRow;
var keyboardKeys = document.querySelectorAll('.key-row span');
var chancesLeft = 6;
var timeoutId;


/*
**  Setting up canvas for drawing hangman stick figure
**  - height and width
**  - stand for stick figure
*/
var setCanvas = function() {

  canvasWidth = Math.floor(window.innerWidth * .4);
  canvasHeight = Math.floor(window.innerHeight * .4);

  canvas.width = canvasWidth
  canvas.height = canvasHeight;
  console.log(canvasWidth + " x " + canvasHeight);

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


var setBlanks = function() {

  currentWord = wordList[Math.floor(Math.random() * 6)];
  joinedWord = currentWord.split(" ").join("");

  // currentWord = "hasta la vista"
  var words = currentWord.split(" "); // words = ["hasta", "la", "vista"]

  for (var i = 0; i < words.length; i++) {
    var rowDiv = document.createElement('div');
    rowDiv.className = "letter-row";
    for (var j = 0; j < words[i].length; j++) {
      var letterSpan = document.createElement('span');
      // letterSpan.innerHTML = words[i][j];
      rowDiv.appendChild(letterSpan);
    }
    guessWordDiv.appendChild(rowDiv);
  }

  letterRow = document.querySelectorAll('.letter-row span');

}


var charMatch = function(char) {
  return joinedWord.indexOf(char) === -1 ? false : true;
}


for (var i = 0; i < keyboardKeys.length; i++) {
  keyboardKeys[i].addEventListener("click", function(e) {
    var clickedLetter = e.target.innerHTML;
    if(charMatch(clickedLetter)){

      this.className = "correct";

      for(var i=0; i<joinedWord.length;i++) {
        if (joinedWord[i] === clickedLetter) {
          letterRow[i].innerHTML = clickedLetter;
        }
      }

      updateGameState();

    } else {
      this.className = "incorrect";
      chancesLeft--;
      updateGameState();
    }
  })
}


/*
** State - Next Move
**  -  over => start new game
**  -  incorrect guess => draw body part of stick figure
**  -  correct word complete => reset game and update score
**
*/
var updateGameState = function() {

  // correct word complete => reset game and update score
  var inputWord = "";
  for (var i = 0; i < letterRow.length; i++) {
    inputWord += letterRow[i].innerHTML;
  }
  if (joinedWord === inputWord) {
    generateNextWord();
    return;
  }

  // incorrect guess => draw body part of stick figure
  switch(chancesLeft) {
    case 5:
      stickFigure.drawHead();
      return;
    case 4:
      stickFigure.drawStomach();
      return;
    case 3:
      stickFigure.drawLeftHand();
      return;
    case 2:
      stickFigure.drawRightHand();
      return;
    case 1:
      stickFigure.drawLeftLeg();
      return;
    case 0:
      stickFigure.drawRightLeg();
      timeoutId = setTimeout(gameOver, 500);
      return;
  }
}


var gameOver = function() {
  clearTimeout(timeoutId);
  alert("Game Over. Your score was " + score + ". Click OK to play again.");
  resetGame();
  init();
}


var resetGame = function() {

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  chancesLeft = 6;

  // removing classes from keyboard keys
  for (var i = 0; i < keyboardKeys.length; i++) {
    keyboardKeys[i].className = "";
  }

  // clearing guess div for the next word, which will come via init.
  guessWordDiv.innerHTML = "";

}


var generateNextWord = function() {
  score++;
  scoreContainer.innerHTML = score;
  resetGame();
  setCanvas();
  setBlanks();
}


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


var init = function() {
  score = 0;
  scoreContainer.innerHTML = score;
  setCanvas();
  setBlanks();
}

window.onload = init;