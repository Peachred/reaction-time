// Canvas and Context Setup
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const canvasParent = document.querySelector('.canvas-parent');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset'); // Reset button
const restartButton = document.getElementById('restart');
const summaryDiv = document.getElementById('summary');
const averageDisplay = document.getElementById('average');
const scoreTableBody = document.getElementById('scoreTableBody');

// Dynamic canvas sizing
canvas.height = canvasParent.clientHeight;
canvas.width = canvasParent.clientWidth;

// Display initial message
context.textAlign = "center";
context.textBaseline = "middle";
context.fillText('Click in this area', canvas.width / 2, canvas.height / 2);

// Variables for Game Logic
let attempt = 0;
const maxAttempts = 5;
let reactionTimes = [];
let timeout1, timeout2, reactionStartTime;
let gameInProgress = false;  // Track if game is in progress
let canClick = false; // Flag to control whether the user can click

// Utility Functions
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
        startButton.innerHTML = "Start";  // Reset the button text to "Start"
        startButton.style.backgroundColor = "rgb(2, 106, 42)";
        resetButton.style.display = "none"; // Hide Reset button
        gameInProgress = false; // Game is no longer in progress
    }
}

// Utility function to remove event listener
function removeClickListener(onCanvasClick) {
    canvas.removeEventListener('click', onCanvasClick);
}

// Set the green light timeout and event listener for the canvas click
function setGreenLightTimeout(delay) {
    timeout1 = setTimeout(() => {
        canvas.style.background = "rgb(78,197,78)"; // Green light
        reactionStartTime = Date.now();
        canClick = true; // Allow clicks when the light turns green

        // Function to handle the canvas click
        const onCanvasClick = () => {
            if (!canClick || !gameInProgress) return; // Ignore clicks if not allowed

            const reactionEndTime = Date.now();
            const reactionTime = reactionEndTime - reactionStartTime;
            reactionTimes.push(reactionTime); // Record the reaction time
            updateTable(); // Update the table with the new time

            // Remove the click listener to prevent multiple recordings
            removeClickListener(onCanvasClick);

            attempt++; // Increment the attempt count
            canClick = false; // Disable further clicks until the next green light
            endGame(); // End the game after one click
            if (attempt < maxAttempts) {
                startGame(); // Start the next round if we have more attempts
            }
        };

        // Add the event listener for the click
        canvas.addEventListener('click', onCanvasClick);
    }, delay);
}

function setTimeoutLimit(delay) {
    timeout2 = setTimeout(() => {
        if (!gameInProgress) return; // Do nothing if the game is not in progress

        reactionTimes.push("Missed"); // If no click happens, record a miss
        updateTable();
        attempt++;
        endGame();
        if (attempt < maxAttempts) {
            startGame(); // Continue with the next round
        }
    }, delay);
}

function startGame() {
    if (attempt >= maxAttempts) {
        endGame(); // Stop the game if we have reached max attempts
        return;
    }

    resetCanvas();
    canvas.style.background = "rgb(206,63,63)"; // Red light
    canClick = false; // Disable clicking during the red light

    const greenLightDelay = getRandomTime(1, 8); // Random delay in milliseconds
    const reactionTimeout = greenLightDelay + 5000; // Total timeout period

    setGreenLightTimeout(greenLightDelay);
    setTimeoutLimit(reactionTimeout);

    // Show Reset button when game is in progress
    resetButton.style.display = "inline-block";
}

// Event Listeners
startButton.addEventListener('click', () => {
    if (!gameInProgress) { // If the game isn't in progress, start the game
        attempt = 0;
        reactionTimes = [];
        updateTable();
        canvasParent.style.display = "block";
        summaryDiv.style.display = "none";
        startButton.innerHTML = "Stop";  // Change button text to "Stop"
        startButton.style.backgroundColor = "rgb(252, 184, 18)";
        gameInProgress = true; // Start the game
        startGame();
    } else { // If the game is in progress, stop the game
        endGame();  // End the game and reset
        startButton.innerHTML = "Start";  // Change button text back to "Start"
        startButton.style.backgroundColor = "rgb(2, 106, 42)";
    }
});

// Reset button functionality
resetButton.addEventListener('click', () => {
    // Reset everything to initial state
    attempt = 0;
    reactionTimes = [];
    updateTable();
    canvasParent.style.display = "block";
    summaryDiv.style.display = "none";
    resetCanvas();
    resetButton.style.display = "none"; // Hide reset button
    startButton.innerHTML = "Start";  // Reset Start button
    startButton.style.backgroundColor = "rgb(2, 106, 42)";
    gameInProgress = false; // Game is no longer in progress
});

restartButton.addEventListener('click', () => {
    attempt = 0;
    reactionTimes = [];
    updateTable();
    canvasParent.style.display = "block";
    summaryDiv.style.display = "none";
    resetCanvas();
});
