
/* =========================================
   1. GAME SETTINGS
   Edit these numbers to change your game.
========================================= */

const SETTINGS = {
  startingTime: 60,       // Length of the game in seconds
  startingHealth: 100,    // Ship's starting health
  waterPerIce: 10,        // Water gained per shot
  waterNeeded: 50,        // Water needed to launch
  pointsPerIce: 10,       // Points for shooting ice
  pointsPerDelivery: 100, // Points for delivering water
  damagePerHit: 20        // Health lost per hit
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
   These IDs must match your HTML.
========================================= */

const $ = (id) => document.getElementById(id);


/* =========================================
   4. UPDATE THE SCREEN
   Call this after changing game values.
========================================= */

function updateUI() {
  $("score").textContent = score;
  $("time").textContent = timeLeft;
  $("health").textContent = health;
  $("water").textContent = water;

  // Update the health bar.
  $("health-fill").style.width = health + "%";

  // Update the water bar.
  const waterPercent = (water / SETTINGS.waterNeeded) * 100;
  $("water-fill").style.width = waterPercent + "%";

  // The player can only launch with enough water.
  $("launch-button").disabled =
    !gameRunning || water < SETTINGS.waterNeeded;
}


// Display feedback to the player.
function showMessage(message) {
  $("message").textContent = message;
}


/* =========================================
   5. START AND RESET THE GAME
========================================= */

function startGame() {
  // Stop any previous countdown.
  clearInterval(timerId);

  // Reset every game value.
  score = 0;
  timeLeft = SETTINGS.startingTime;
  health = SETTINGS.startingHealth;
  water = 0;
  gameRunning = true;

  // Show the gameplay screen.
  $("title-screen").classList.add("hidden");
  $("end-screen").classList.add("hidden");
  $("play-screen").classList.remove("hidden");

  showMessage("Mission started! Collect water for Earth.");
  updateUI();

  // Countdown: runs once every second.
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
   6. SHOOT ICE
========================================= */

function shootIce() {
  if (!gameRunning) return;

  // Collect water without exceeding the target amount.
  water = Math.min(
    SETTINGS.waterNeeded,
    water + SETTINGS.waterPerIce
  );

  // Award points.
  score += SETTINGS.pointsPerIce;

  showMessage("Ice destroyed! Water collected.");
  updateUI();
}


/* =========================================
   7. DELIVER WATER TO EARTH
========================================= */

function launchWater() {
  if (!gameRunning) return;

  // Prevent launching without enough water.
  if (water < SETTINGS.waterNeeded) {
    showMessage("Collect more water before launching!");
    return;
  }

  // Award delivery points.
  score += SETTINGS.pointsPerDelivery;
  water = 0;

  updateUI();

  // One successful delivery wins this version.
  endGame(true, "Clean water delivered to Earth!");
}


/* =========================================
   8. TAKE DAMAGE FROM INCOMING ICE
========================================= */

function takeDamage() {
  if (!gameRunning) return;

  // Health cannot go below zero.
  health = Math.max(
    0,
    health - SETTINGS.damagePerHit
  );

  showMessage("Ice impact! Protect your ship!");
  updateUI();

  if (health <= 0) {
    endGame(false, "Your ship ran out of health.");
  }
}


/* =========================================
   9. END THE GAME
========================================= */

function endGame(won, message) {
  // Prevent multiple endings.
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(timerId);

  // Hide gameplay and show the ending screen.
  $("play-screen").classList.add("hidden");
  $("end-screen").classList.remove("hidden");

  // Change the ending message.
  $("end-title").textContent =
    won ? "Mission Complete!" : "Mission Failed!";

  $("end-message").textContent = message;

  showMessage("Final score: " + score);
  updateUI();
}


/* =========================================
   10. CONNECT BUTTONS TO ACTIONS
========================================= */

$("start-button").addEventListener("click", startGame);
$("restart-button").addEventListener("click", startGame);
$("play-again-button").addEventListener("click", startGame);

$("shoot-button").addEventListener("click", shootIce);
$("launch-button").addEventListener("click", launchWater);
$("danger-button").addEventListener("click", takeDamage);


/* =========================================
   11. INITIAL SCREEN UPDATE
========================================= */

updateUI();
