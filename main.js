
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const canvasParent = document.querySelector('.canvas-parent');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset'); // Reset button
const restartButton = document.getElementById('restart');
const summaryDiv = document.getElementById('summary');
const averageDisplay = document.getElementById('average');
const scoreTableBody = document.getElementById('scoreTableBody');


canvas.height = canvasParent.clientHeight;
canvas.width = canvasParent.clientWidth;


context.textAlign = "center";
context.textBaseline = "middle";
context.fillText('Click in this area', canvas.width / 2, canvas.height / 2);


let attempt = 0;
const maxAttempts = 5;
let reactionTimes = [];
let timeout1, timeout2, reactionStartTime;
let gameInProgress = false;  
let canClick = false; 


function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function resetCanvas() {
    canvas.style.background = "rgb(237,255,172)";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText('Click in this area', canvas.width / 2, canvas.height / 2);
}

function updateTable() {
    scoreTableBody.innerHTML = reactionTimes
        .map((time, index) => `<tr><td>${index + 1}</td><td>${time} ms</td></tr>`)
        .join('');
}

function calculateAverage() {
    const validTimes = reactionTimes.filter(time => typeof time === 'number'); // Exclude "Missed"
    const total = validTimes.reduce((sum, time) => sum + time, 0);
    return (validTimes.length > 0 ? total / validTimes.length : 0).toFixed(2);
}

function endGame() {
    clearTimeout(timeout1);
    clearTimeout(timeout2);
    resetCanvas();

    if (attempt >= maxAttempts || !gameInProgress) {
        canvasParent.style.display = "none";
        summaryDiv.style.display = "block";
        averageDisplay.textContent = calculateAverage();
        startButton.innerHTML = "Start"; 
        startButton.style.backgroundColor = "rgb(2, 106, 42)";
        resetButton.style.display = "none"; 
        gameInProgress = false; 
    }
}


function removeClickListener(onCanvasClick) {
    canvas.removeEventListener('click', onCanvasClick);
}


function setGreenLightTimeout(delay) {
    timeout1 = setTimeout(() => {
        canvas.style.background = "rgb(78,197,78)"; 
        reactionStartTime = Date.now();
        canClick = true; 

    
        const onCanvasClick = () => {
            if (!canClick || !gameInProgress) return;

            const reactionEndTime = Date.now();
            const reactionTime = reactionEndTime - reactionStartTime;
            reactionTimes.push(reactionTime); 
            updateTable(); 

          
            removeClickListener(onCanvasClick);

            attempt++;
            canClick = false; 
            endGame(); 
            if (attempt < maxAttempts) {
                startGame(); 
            }
        };

  
        canvas.addEventListener('click', onCanvasClick);
    }, delay);
}

function setTimeoutLimit(delay) {
    timeout2 = setTimeout(() => {
        if (!gameInProgress) return; 

        reactionTimes.push("Missed"); 
        updateTable();
        attempt++;
        endGame();
        if (attempt < maxAttempts) {
            startGame(); 
        }
    }, delay);
}

function startGame() {
    if (attempt >= maxAttempts) {
        endGame(); 
        return;
    }

    resetCanvas();
    canvas.style.background = "rgb(206,63,63)"; 
    canClick = false; 

    const greenLightDelay = getRandomTime(1, 8);
    const reactionTimeout = greenLightDelay + 5000; 

    setGreenLightTimeout(greenLightDelay);
    setTimeoutLimit(reactionTimeout);

   
    resetButton.style.display = "inline-block";
}


startButton.addEventListener('click', () => {
    if (!gameInProgress) { 
        attempt = 0;
        reactionTimes = [];
        updateTable();
        canvasParent.style.display = "block";
        summaryDiv.style.display = "none";
        startButton.innerHTML = "Stop"; 
        startButton.style.backgroundColor = "rgb(252, 184, 18)";
        gameInProgress = true;
        startGame();
    } else { 
        endGame();  
        startButton.innerHTML = "Start"; 
        startButton.style.backgroundColor = "rgb(2, 106, 42)";
    }
});


resetButton.addEventListener('click', () => {

    attempt = 0;
    reactionTimes = [];
    updateTable();
    canvasParent.style.display = "block";
    summaryDiv.style.display = "none";
    resetCanvas();
    resetButton.style.display = "none";
    startButton.innerHTML = "Start";  
    startButton.style.backgroundColor = "rgb(2, 106, 42)";
    gameInProgress = false;
});

restartButton.addEventListener('click', () => {
    attempt = 0;
    reactionTimes = [];
    updateTable();
    canvasParent.style.display = "block";
    summaryDiv.style.display = "none";
    resetCanvas();
});
