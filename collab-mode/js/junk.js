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


/*
 *  takes a character as input and returns true if that character is part of currentWord
 *  ==== does not modify anything ====
*/
var charMatch = function(char) {
  return currentWord.indexOf(char) === -1 ? false : true;
}


/*
 *  event listener for keyboard displayed on screen
*/
var keysArray = [];
for (var i = 0; i < keyboardKeys.length; i++) {
  keysArray.push(keyboardKeys[i].innerHTML);
  keyboardKeys[i].addEventListener("click", function(e) {
    updateKeyboardAndGuess(e.target.innerHTML);
  });
}

/*
 *  takes a letter as input and modifies keyboard and guess blanks
*/
var updateKeyboardAndGuess = function(letter) {

  if (lettersGuessed.indexOf(letter) === -1) {
    lettersGuessed += letter;
  }

  var keyPosition = keysArray.indexOf(letter);
  console.log(keyboardKeys[keyPosition].className);

  if (keyboardKeys[keyPosition].className.indexOf("correct") === -1) {
    // console.log(keyboardKeys[keyPosition].className);
    if(charMatch(letter)){
      keyboardKeys[keyPosition].className = "correct";
      var joinedWord = currentWord.split(" ").join("");
      for(var i=0; i<joinedWord.length; i++) {
        if (joinedWord[i] === letter) {
          console.log(letterRow[i]);
          letterRow[i].innerHTML = letter;
        }
      }
    } else if (chancesLeft > 0) {
      keyboardKeys[keyPosition].className = "incorrect";
      chancesLeft--;
    }
    updateGameState(score, chancesLeft, currentWord, lettersGuessed);
  }
  console.log(chancesLeft);
  updateUI();
}


/*
 *  updates the UI
 *  - State => Next Move
 *  - over => start new game
 *  - incorrect guess => draw body part of stick figure
 *  - correct word complete => reset game and update score
*/
var updateUI = function() {

  // correct word complete => reset game and update score
  var inputWord = "";
  for (var i = 0; i < letterRow.length; i++) {
    inputWord += letterRow[i].innerHTML;
  }
  if (currentWord.split(" ").join("") === inputWord) {
    generateNextWord();
    return;
  }

  // incorrect guess => draw body part of stick figure
  switch(chancesLeft) {
    case 5:
      setCanvas();
      stickFigure.drawHead();
      // console.log(chancesLeft);
      break;
    case 4:
      setCanvas();
      stickFigure.drawHead();
      stickFigure.drawStomach();
      // console.log(chancesLeft);
      break;
    case 3:
      setCanvas();
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      // console.log(chancesLeft);
      break;
    case 2:
      setCanvas();
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      // console.log(chancesLeft);
      break;
    case 1:
      setCanvas();
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      stickFigure.drawLeftLeg();
      // console.log(chancesLeft);
      break;
    case 0:
      setCanvas();
      stickFigure.drawHead();
      stickFigure.drawStomach();
      stickFigure.drawLeftHand();
      stickFigure.drawRightHand();
      stickFigure.drawLeftLeg();
      stickFigure.drawRightLeg();
      // console.log(chancesLeft);
      gameOver();
      break;
  }

  return;
}


var gameOver = function() {
  clearTimeout(timeoutId);
  alert("Game Over. Your score was " + score + ". Click OK to play again.");
  resetGame();
  score = 0;
  init();
}


var resetGame = function() {

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  chancesLeft = 6;
  currentWord = generateRandomWord();
  lettersGuessed = "";

  // removing classes from keyboard keys
  for (var i = 0; i < keyboardKeys.length; i++) {
    keyboardKeys[i].className = "";
  }

  // clearing guess div for the next word, which will come via init.
  guessWordDiv.innerHTML = "";
  setBlanks(currentWord);

  updateGameState(score, chancesLeft, currentWord, lettersGuessed);

}

/*
 *  sets up canvas for next word if the user guesses the right word
*/
var generateNextWord = function() {
  score++;
  scoreContainer.innerHTML = score;
  resetGame();
  setCanvas();
  setBlanks(currentWord);
  // updateUI();
}


/*
 *  syncs game state with Firebase realtime db
 *  ==== does not modify anything ====
*/
var updateGameState = function (score, chancesLeft, currentWord, lettersGuessed) {
  firebase.database().ref().set({
    score: score,
    chancesLeft: chancesLeft,
    currentWord: currentWord,
    lettersGuessed: lettersGuessed
  });
}


/*
 *  listens for changes to Firebase realtime db
*/
firebase.database().ref().on('value', function(snapshot) {

  if(snapshot.val() === null) {
    score = 0;
    chancesLeft = 6;
    currentWord = generateRandomWord();
    lettersGuessed = "";
  } else {
    score = snapshot.val().score;
    chancesLeft = snapshot.val().chancesLeft;
    currentWord = snapshot.val().currentWord;
    lettersGuessed = snapshot.val().lettersGuessed;
  }

  // console.log(score + " - " + chancesLeft + " - " + currentWord + " - " + lettersGuessed);

  scoreContainer.innerHTML = score;
  setCanvas();

  if (lettersGuessed === "") {
    // removing classes from keyboard keys
    for (var i = 0; i < keyboardKeys.length; i++) {
      keyboardKeys[i].className = "";
    }
    // clearing guess div for the next word, which will come via init.
    guessWordDiv.innerHTML = "";
    setBlanks(currentWord);
  } else {
    for (var i = 0; i < lettersGuessed.length; i++) {
      updateKeyboardAndGuess(lettersGuessed[i]);
    }
  }

});

/*
 *  initialises the game depending on current db state
*/
var init = function() {

  setCanvas();

  firebase.database().ref().once('value').then(function(snapshot) {
    if(snapshot.val() === null) {
      score = 0;
      chancesLeft = 6;
      currentWord = generateRandomWord();
      lettersGuessed = "";
    } else {
      score = snapshot.val().score;
      chancesLeft = snapshot.val().chancesLeft;
      currentWord = snapshot.val().currentWord;
      lettersGuessed = snapshot.val().lettersGuessed;
    }

    setBlanks(currentWord);
    updateGameState(score, chancesLeft, currentWord, lettersGuessed);
    // console.log(score + " - " + chancesLeft + " - " + currentWord + " - " + lettersGuessed);

    // setBlanks(currentWord);

    // scoreContainer.innerHTML = score;
    // for (var i = 0; i < lettersGuessed.length; i++) {
    //   updateKeyboardAndGuess(lettersGuessed[i]);
    // }

  });

}

window.onload = init;