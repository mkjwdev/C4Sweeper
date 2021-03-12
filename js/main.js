
'use strict';


let theBoard;
let gameModeIsClicked = false;

const easy = document.getElementById('easy');
const normal = document.getElementById('normal');
const hard = document.getElementById('hard');
const gameBoard = document.getElementById('board');

var musGameplayLoop = new buzz.sound('sounds/MUS_GameplayLoop.wav', {loop:true});
musGameplayLoop.setVolume(90);

var sfxBigExplosion = new buzz.sound('sounds/SFX_BigExplosion.wav');
sfxBigExplosion.setVolume(90);

var sfxClick = new buzz.sound('sounds/SFX_Click2_Proc2.wav');
sfxClick.setVolume(50);

var sfxFlag = new buzz.sound('sounds/SFX_Flag.wav');
sfxFlag.setVolume(70);

var voC4Sweeper = new buzz.sound('sounds/VO_C4Sweeper.wav');
voC4Sweeper.setVolume(100);

var sfxWin = new buzz.sound('sounds/SFX_Win.wav');
sfxWin.setVolume(90);


class Board
{
	constructor(theSize, theMines, theMode)
	{
		this.size = theSize;
		this.mode = theMode;
		this.board = this.createBoard(theSize);
		this.numberOfMines = theMines;
		this.flags = theMines;
		this.mineCoordinates = generateRandomCoordinates(theMines, theSize, theSize);
		this.addMines(this.mineCoordinates);
		this.addNumbers();
	}
	
	createBoard(size)
	{
		let a = new Array(size);
		
		for (let i = 0; i < a.length; i++) a[i] = new Array(size);
		
		return a;
	}
	
	render()
	{
		gameBoard.style['width'] = `${this.size}px`;
		
		for (let i = 0; i < this.board.length; i++)
		{
			let row = document.createElement('div');
			
			for (let j = 0; j < this.board[i].length; j++)
			{
				let square = document.createElement('div');
				
				square.setAttribute('coordinate', i + '-' + j);
				square.style['width'] = '30px';
				square.style['height'] = '30px';
				square.classList.add('square');
				square.classList.add('changeBackground');
				square.classList.add('center');
				square.addEventListener('click', leftClick);
				square.addEventListener('contextmenu', rightClick);
				row.appendChild(square);
			}
			
			gameBoard.appendChild(row);
		}
	}
	
	addMines(coordinates)
	{
		for (let i = 0; i < coordinates.length; i++)
		{
			let coordinate1 = coordinates[i][0];
			let coordinate2 = coordinates[i][1];
			
			this.board[coordinate1][coordinate2] = "M";
		}
	}
	
	addNumbers()
	{
		for (let i = 0; i < this.board.length; i++)
		{
			for (let j = 0; j < this.board[i].length; j++)
			{
				let boardLength = this.board[i].length;
				
				if (this.board[i][j] === 'M') continue;
				
				let adjacentSquare = getAdjacentSquareCoordinates ([i, j], this.board[i].length);
				let countMines = adjacentSquare.reduce((count,square) =>
				{
					if (this.board[square[0]][square[1]] === 'M') return count + 1;
					else return count;
				}, 0);
				
				this.board[i][j] = countMines;
			}
		}
	}
};


const gameMode = (e = window.event) =>
{
	if (gameModeIsClicked) return;
	
	gameModeIsClicked = true;
	
	let gameModes = e.target.innerHTML;
	
	gameBoard.innerHTML = '';
	
	switch (gameModes)
	{
		case 'easy':
			theBoard = new Board(10, 10);
			theBoard.render();
			break;
			
		case 'normal':
			theBoard = new Board(15, 35);
			theBoard.render();
			break;
			
		case 'hard':
			theBoard = new Board(20, 60);
			theBoard.render();
			break;
			
		default:
			theBoard = new Board(0, 0);
			theBoard.render();
			break;
	}
	
	if (gameModes == 'easy')
	{
		let display = document.querySelector('#time');
		let timerClock = 40;
		startTimer(timerClock, display);
	}
	
	if (gameModes == 'normal')
	{
		let display = document.querySelector('#time');
		let timerClock = 80;
		startTimer(timerClock, display);
	}
	
	if (gameModes == 'hard')
	{
		let display = document.querySelector('#time');
		let timerClock = 120;
		startTimer(timerClock, display);
	}
	
	musGameplayLoop.play();
};

const updateGameBoard = (coordinates) =>
{

    coordinates.forEach(coordinate =>
    {
        let value = theBoard.board[coordinate[0]][coordinate[1]];
        let coordinateString = coordinate[0] + '-' + coordinate[1];
        let square = document.querySelectorAll(`[coordinate="${coordinateString}"]`)[0];

        square.removeEventListener('click', leftClick);
        square.removeEventListener('contextmenu', rightClick);
        square.classList.remove('changeBackground');

        if (value>0) square.innerHTML=value;
        else square.innerHTML=''; 
    })
};

const aggregated = (array1, array2) =>
{
    for (let i = 0; i < array1.length; i++)
    {
        if (array1[i][0] === array2[0] && array1[i][1] === array2[1]) return true;  
    }
	
    return false;
};

const uncoverSquares = (square) =>
{
    let stack = [];
    let coordinates = [];
	
    stack.push(square.getAttribute('coordinate').split('-').map(element => Number(element)));
	
    while (stack.length > 0)
    {
        let coordinate = stack.pop();
		
        coordinates.push(coordinate);
		
        if (theBoard.board[coordinate[0]][coordinate[1]] > 0) continue;
        
        let adjacentSquares = getAdjacentSquareCoordinates(coordinate, theBoard.board[coordinate[0]].length);
        adjacentSquares.forEach(element =>
        {
            if (theBoard.board[element[0]][element[1]] === "M") return;
            
            if (aggregated(coordinates, element)) return;
            
            if (aggregated(stack, element)) return;
            
            stack.push(element);
        })
    }
	
    updateGameBoard(coordinates);
};

const generateRandomCoordinates = (numberOfCoordinates, width, height) =>
{
    let coordinateArray = [];
	
    while (coordinateArray.length < numberOfCoordinates)
    {
        let coordinate1 = Math.floor((Math.random() * height));
        let coordinate2 = Math.floor((Math.random() * width));
		
        if (aggregated(coordinateArray, [coordinate1, coordinate2])) continue;
        
        coordinateArray.push([coordinate1, coordinate2]);
    }
	
    return coordinateArray;
};

const adjacentSquareCoordinates = [ [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1] ];

const getAdjacentSquareCoordinates = (coordinate, length) =>
{
    let array = [];
	
    adjacentSquareCoordinates.forEach(element =>
    {
        let first = coordinate[0] + element[0];
        let second = coordinate[1] + element[1];
		
        if (first < 0 || second < 0 || first > (length - 1) || second > (length - 1)) return;
        
        array.push([first, second]);
    })
	
    return array;
};

const gameOver = (gameStatus) =>
{
    let squares = document.getElementsByClassName('square');
	
    for (let i = 0; i < squares.length; i++)
    {
        squares[i].removeEventListener('click', leftClick);
        squares[i].removeEventListener('contextmenu', rightClick);
    }
	
    if (gameStatus === "winner")
    {
        if (alert("YOU HAVE WON! THE PAGE WILL REFRESH SHORTLY!"));
        else(setTimeout(function () {window.location.reload();}, 3000));
        sfxWin.play();
    }
    else
    {
        if (alert("YOU HAVE LOST! THE PAGE WILL REFRESH SHORTLY!"));
        else(setTimeout(function () {window.location.reload();}, 3000));
        sfxBigExplosion.play();
    }
	
    showMines();
    clearInterval(startTimer);
    gameModeIsClicked = true;
};

const checkWinner = () =>
{
    let winner = theBoard.mineCoordinates.every(coordinate =>
    {
        let coordinateString = coordinate[0] + '-' + coordinate[1];
        let square = document.querySelectorAll(`[coordinate="${coordinateString}"]`)[0];
		
        return square.classList.contains('flag');
    })
	
    if (winner) gameOver("winner");
};

const showMines = () =>
{
    theBoard.mineCoordinates.forEach(coordinate =>
    {
        let coordinateString = coordinate[0] + '-' + coordinate[1];
        let square = document.querySelectorAll(`[coordinate="${coordinateString}"]`)[0];
		
        square.classList.remove('flag');
        square.classList.add('c4');
    })
};

function leftClick(e = window.event)
{
    e.preventDefault();
	
    let square = e.target;
	
    if (square.classList.contains('flag'))
    {
        square.classList.remove('flag');
        theBoard.flags += 1;
    }
	
    let coordinate = square.getAttribute('coordinate').split('-');
    let boardSquare = theBoard.board[coordinate[0]][coordinate[1]];
	
    if (boardSquare === 'M')
    {
        gameOver("loser");
        return;
    }
	
    uncoverSquares(square);
    sfxClick.play();
};

function rightClick(e = window.event)
{
    e.preventDefault();
	
    let square = e.target;
	
    if (square.classList.contains('flag'))
    {
        square.classList.toggle('flag');
        theBoard.flags += 1;
    }
    else
    {
        if (theBoard.flags === 0) return;
        
        square.classList.toggle('flag');
        theBoard.flags -= 1;
    }
	
    checkWinner();
    sfxFlag.play();
};

function startTimer(duration, display)
{
    let timer = duration,seconds;
    let clock = setInterval(function ()
    {
        seconds = parseInt(timer,10);
		
        if (seconds<10) seconds = "0" + seconds;
        else seconds = seconds;
        
        display.textContent = seconds;

        if (--timer < 0)
        {
            timer = 0;
            clearInterval(clock);
            if (alert("YOU HAVE LOST! THE PAGE WILL REFRESH SHORTLY!"));
            else(setTimeout(function () {window.location.reload();}, 3000));
            showMines();
            gameModeIsClicked = true;
            sfxBigExplosion.play();
        }
    }, 1000);
};


document.addEventListener('DOMContentLoaded', function ()
{
    voC4Sweeper.play();
    alert("THIS IS THE C4SWEEPER! CLICK ON ANY GAME MODE TO PLAY!");
    easy.addEventListener('click', gameMode);
    normal.addEventListener('click', gameMode);
    hard.addEventListener('click', gameMode);
    theBoard = new Board(0, 0);
    theBoard.render();
});

