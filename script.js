
/* =========================================
   1. GAME SETTINGS
   Change these values to customize gameplay.
========================================= */

const SETTINGS = {
  startingTime: 60,
  startingHealth: 100,

  waterPerIce: 10,
  waterNeeded: 50,

  pointsPerIce: 10,
  pointsPerDelivery: 100,

  damagePerHit: 20
};


/* =========================================
   2. GAME STATE
   These values change while playing.
========================================= */

let score = 0;
let timeLeft = SETTINGS.startingTime;
let health = SETTINGS.startingHealth;
let water = 0;

let gameRunning = false;
let timerId = null;


/* =========================================
   3. FIND HTML ELEMENTS
   The IDs must match index.html.
========================================= */

const elements = {
  titleScreen: document.getElementById("title-screen"),
  gameLayout: document.getElementById("game-layout"),
  playScreen: document.getElementById("play-screen"),
  endScreen: document.getElementById("end-screen"),
  actionRail: document.getElementById("action-rail"),
  score: document.getElementById("score"),
  time: document.getElementById("time"),
  health: document.getElementById("health"),
  water: document.getElementById("water"),
  waterTarget: document.getElementById("water-target"),
  healthFill: document.getElementById("health-fill"),
  waterFill: document.getElementById("water-fill"),
  launchButton: document.getElementById("launch-button"),
  message: document.getElementById("message"),
  endTitle: document.getElementById("end-title"),
  endMessage: document.getElementById("end-message"),
  finalScore: document.getElementById("final-score"),
  startButton: document.getElementById("start-button"),
  restartButton: document.getElementById("restart-button"),
  playAgainButton: document.getElementById("play-again-button"),
  shootButton: document.getElementById("shoot-button"),
  dangerButton: document.getElementById("danger-button")
};


/* =========================================
   4. UPDATE THE DISPLAY
   Call this after changing game values.
========================================= */

function updateUI() {
  elements.score.textContent = score;
  elements.time.textContent = timeLeft;
  elements.health.textContent = health;
  elements.water.textContent = water;
  elements.waterTarget.textContent = SETTINGS.waterNeeded;

  // Update the health bar.
  elements.healthFill.style.width = `${health}%`;

  // Update the water bar.
  const waterPercent =
    (water / SETTINGS.waterNeeded) * 100;

  elements.waterFill.style.width = `${waterPercent}%`;

  // Enable launching only when enough water is collected.
  elements.launchButton.disabled =
    !gameRunning || water < SETTINGS.waterNeeded;
}


// Display a message to the player.
function showMessage(message) {
  elements.message.textContent = message;
}


/* =========================================
   5. START OR RESTART THE GAME
========================================= */

function startGame() {
  // Stop an old timer before starting a new one.
  clearInterval(timerId);
  timerId = null;

  // Reset every game value.
  score = 0;
  timeLeft = SETTINGS.startingTime;
  health = SETTINGS.startingHealth;
  water = 0;

  gameRunning = true;

  // Hide the title screen and show gameplay.
  elements.titleScreen.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");

  elements.playScreen.classList.remove("hidden");
  elements.endScreen.classList.add("hidden");
  elements.actionRail.classList.remove("hidden");

  showMessage("Mission started! Collect enough water.");

  updateUI();

  // Start the countdown.
  timerId = setInterval(function () {
    if (!gameRunning) return;

    timeLeft--;

    updateUI();

    if (timeLeft <= 0) {
      endGame(false, "Time ran out! Try again.");
    }
  }, 1000);
}


/* =========================================
   6. SHOOT ICE AND COLLECT WATER
========================================= */

function shootIce() {
  // Ignore clicks if the game is not active.
  if (!gameRunning) return;

  // Check whether the water tank is already full.
  if (water >= SETTINGS.waterNeeded) {
    showMessage("Water tank full! Deliver water to Earth.");
    return;
  }

  // Add water without exceeding the target.
  water = Math.min(
    SETTINGS.waterNeeded,
    water + SETTINGS.waterPerIce
  );

  // Award points for breaking ice.
  score += SETTINGS.pointsPerIce;

  if (water >= SETTINGS.waterNeeded) {
    showMessage("Water tank full! Launch your delivery!");
  } else {
    showMessage("Ice destroyed! Water collected.");
  }

  updateUI();
}


/* =========================================
   7. DELIVER WATER TO EARTH
========================================= */

function launchWater() {
  if (!gameRunning) return;

  // The player needs enough water to launch.
  if (water < SETTINGS.waterNeeded) {
    showMessage("Collect more water before launching!");
    return;
  }

  // Award delivery points.
  score += SETTINGS.pointsPerDelivery;

  // End the game with a successful delivery.
  endGame(true, "You successfully delivered clean water to Earth!");
}


/* =========================================
   8. TAKE DAMAGE FROM INCOMING ICE
========================================= */

function takeDamage() {
  if (!gameRunning) return;

  // Reduce health without going below zero.
  health = Math.max(
    0,
    health - SETTINGS.damagePerHit
  );

  if (health <= 0) {
    updateUI();
    endGame(false, "Your ship ran out of health.");
    return;
  }

  showMessage("Ice impact! Protect your ship!");
  updateUI();
}


/* =========================================
   9. WIN OR LOSE
========================================= */

function endGame(won, message) {
  // Prevent the game from ending multiple times.
  if (!gameRunning) return;

  gameRunning = false;

  // Stop the countdown.
  clearInterval(timerId);
  timerId = null;

  // Keep the HUD visible but replace gameplay with the ending.
  elements.gameLayout.classList.remove("hidden");
  elements.playScreen.classList.add("hidden");
  elements.endScreen.classList.remove("hidden");
  elements.actionRail.classList.add("hidden");

  // Display the appropriate ending.
  elements.endTitle.textContent = won
    ? "MISSION COMPLETE!"
    : "MISSION FAILED!";

  elements.endMessage.textContent = message;
  elements.finalScore.textContent = score;

  showMessage(
    won
      ? "Great work! You helped deliver clean water."
      : "Mission over. You can try again!"
  );

  updateUI();
}


/* =========================================
   10. CONNECT BUTTONS TO FUNCTIONS
========================================= */

// Title screen.
elements.startButton.addEventListener("click", startGame);

// Restart and replay.
elements.restartButton.addEventListener("click", startGame);
elements.playAgainButton.addEventListener("click", startGame);

// Gameplay actions.
elements.shootButton.addEventListener("click", shootIce);
elements.launchButton.addEventListener("click", launchWater);
elements.dangerButton.addEventListener("click", takeDamage);


/* =========================================
   11. INITIALIZE THE GAME
========================================= */

// The title screen is visible by default.
// The game layout remains hidden until Start is clicked.
updateUI();
