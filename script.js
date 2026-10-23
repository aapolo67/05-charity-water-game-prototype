
/* =========================================
   1. GAME SETTINGS
   Change these values to customize gameplay.
========================================= */

const SETTINGS = {
  startingTime: 60,
  startingHealth: 100,

  asteroidSpawnTime: 6000,
  stillAsteroidSpawnTime: 3000,
  maxAsteroids: 14,
  asteroidSpeed: 0.0125,
  warningDistance: 0.01,
  stillAsteroidSpeed: 0.01,
  asteroidMovementInterval: 50,

  waterPerIce: 10,
  waterNeeded: 50,

  pointsPerIce: 10,
  pointsPerDelivery: 100,
  targetScore: 400,

  targetCountries: [
    { name: "Ethiopia", x: 56, y: 54 },
    { name: "Haiti", x: 27, y: 51 },
    { name: "Yemen", x: 60, y: 48 },
    { name: "Madagascar", x: 61, y: 70 }
  ],

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
let asteroidSpawnId = null;
let stillAsteroidSpawnId = null;
let asteroidMovementId = null;
let asteroidAnimationId = null;
let lastAsteroidAnimationTime = 0;
let asteroids = [];
let nextAsteroidId = 1;
let previewShowing = false;
let warningActive = false;
let currentTarget = null;
let targetSelected = false;


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
  asteroidField: document.getElementById("asteroid-field"),
  incomingStatusBar: document.getElementById("incoming-status-bar"),
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
  confetti: document.getElementById("confetti"),
  startButton: document.getElementById("start-button"),
  settingsButton: document.getElementById("settings-button"),
  settingsMenu: document.getElementById("settings-menu"),
  settingsRestartButton: document.getElementById("settings-restart-button"),
  settingsTitleButton: document.getElementById("settings-title-button"),
  playAgainButton: document.getElementById("play-again-button"),
  endTitleButton: document.getElementById("end-title-button"),
  icePreviewButton: document.getElementById("ice-preview-button"),
  targetDot: document.getElementById("target-dot"),
  target: document.getElementById("target")
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
  elements.healthFill.style.height = `${health}%`;

  // Update the water bar.
  const waterPercent =
    (water / SETTINGS.waterNeeded) * 100;

  elements.waterFill.style.height = `${waterPercent}%`;

  renderAsteroids();

  // Enable launching only after water and a country target are ready.
  elements.launchButton.disabled =
    !gameRunning ||
    water < SETTINGS.waterNeeded ||
    !targetSelected;
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
  clearAsteroidTimers();
  timerId = null;

  // Reset every game value.
  score = 0;
  timeLeft = SETTINGS.startingTime;
  health = SETTINGS.startingHealth;
  water = 0;
  asteroids = [];
  nextAsteroidId = 1;
  previewShowing = false;

  gameRunning = true;

  // Hide the title screen and show gameplay.
  elements.titleScreen.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");

  elements.playScreen.classList.remove("hidden");
  elements.endScreen.classList.add("hidden");
  clearConfetti();
  elements.actionRail.classList.remove("hidden");
  elements.settingsMenu.classList.add("hidden");
  elements.asteroidField.classList.add("hidden");
  elements.launchButton.classList.remove("hidden");
  elements.playScreen.classList.remove("preview-mode");
  elements.icePreviewButton.setAttribute("aria-pressed", "false");
  const previewHint = elements.icePreviewButton.querySelector("small");

  if (previewHint) {
    previewHint.innerHTML = "Click to view<br>asteroid field";
  }
  elements.incomingStatusBar.classList.remove("warning-active");
  warningActive = false;
  currentTarget = null;
  targetSelected = false;
  assignNewTarget();

  showMessage("Mission started! Collect enough water.");

  for (let index = 0; index < 8; index++) {
    spawnAsteroid(false);
  }

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

  asteroidSpawnId = setInterval(spawnAsteroid, SETTINGS.asteroidSpawnTime);
  stillAsteroidSpawnId = setInterval(function () {
    spawnAsteroid(false);
  }, SETTINGS.stillAsteroidSpawnTime);
  lastAsteroidAnimationTime = performance.now();
  asteroidAnimationId = requestAnimationFrame(animateAsteroids);
}


// Stop asteroid timers when a mission is over or abandoned.
function clearAsteroidTimers() {
  clearInterval(asteroidSpawnId);
  clearInterval(stillAsteroidSpawnId);
  clearInterval(asteroidMovementId);
  cancelAnimationFrame(asteroidAnimationId);
  asteroidSpawnId = null;
  stillAsteroidSpawnId = null;
  asteroidMovementId = null;
  asteroidAnimationId = null;
}


// Add one asteroid to the field.
function spawnAsteroid(isMoving = true) {
  if (!gameRunning || asteroids.length >= SETTINGS.maxAsteroids) return;

  const startingX = 15 + (nextAsteroidId % 5) * 18;
  const startingY = 18 + (nextAsteroidId % 4) * 20;

  asteroids.push({
    id: nextAsteroidId,
    distance: isMoving ? 0 : 0.35,
    isMoving: isMoving,
    xPosition: startingX,
    yPosition: startingY,
    startingX: startingX,
    startingY: startingY,
    xDirection: nextAsteroidId % 2 === 0 ? 1 : -1,
    yDirection: nextAsteroidId % 3 === 0 ? 1 : -1
  });
  nextAsteroidId++;

  renderAsteroids();
}


// Move asteroids closer and handle warnings or impacts.
function moveAsteroids() {
  if (!gameRunning) return;

  const warningAsteroid = asteroids.find(function (asteroid) {
    return asteroid.isMoving &&
      asteroid.distance >= SETTINGS.warningDistance;
  });

  if (warningAsteroid) {
    elements.incomingStatusBar.classList.add("warning-active");
    if (!warningActive) {
      showMessage("Warning! An asteroid is getting close.");
      warningActive = true;
    }
  } else {
    elements.incomingStatusBar.classList.remove("warning-active");
    warningActive = false;
  }

  const impactAsteroid = asteroids.find(function (asteroid) {
    return asteroid.distance >= 1;
  });

  if (impactAsteroid) {
    asteroids = asteroids.filter(function (asteroid) {
      return asteroid.id !== impactAsteroid.id;
    });
    takeDamage();
    renderAsteroids();
    return;
  }

}


function animateAsteroids(timestamp) {
  if (!gameRunning) return;

  const elapsedTime = Math.min(timestamp - lastAsteroidAnimationTime, 100);
  const movementScale = elapsedTime / SETTINGS.asteroidMovementInterval;

  asteroids.forEach(function (asteroid) {
    if (asteroid.isMoving) {
      asteroid.distance += SETTINGS.asteroidSpeed * movementScale;
    } else {
      asteroid.xPosition +=
        SETTINGS.stillAsteroidSpeed * asteroid.xDirection * movementScale;
      asteroid.yPosition +=
        SETTINGS.stillAsteroidSpeed * asteroid.yDirection * movementScale;

      if (asteroid.xPosition <= 10 || asteroid.xPosition >= 90) {
        asteroid.xDirection *= -1;
      }

      if (asteroid.yPosition <= 10 || asteroid.yPosition >= 90) {
        asteroid.yDirection *= -1;
      }
    }
  });

  lastAsteroidAnimationTime = timestamp;
  updateAsteroidPositions();
  moveAsteroids();
  asteroidAnimationId = requestAnimationFrame(animateAsteroids);
}


// Draw each asteroid as a simple DOM element.
function renderAsteroids() {
  if (!elements.asteroidField) return;

  elements.asteroidField.innerHTML = "";
  const fieldWidth = elements.asteroidField.clientWidth;
  const fieldHeight = elements.asteroidField.clientHeight;

  asteroids.forEach(function (asteroid) {
    const asteroidElement = document.createElement("button");
    asteroidElement.className = "asteroid";
    asteroidElement.textContent = "✦";
    asteroidElement.type = "button";
    asteroidElement.dataset.asteroidId = asteroid.id;
    asteroidElement.setAttribute("aria-label", "Harvest asteroid");
    asteroid.element = asteroidElement;
    asteroidElement.style.left = `${asteroid.xPosition}%`;
    asteroidElement.style.top = `${asteroid.yPosition}%`;
    asteroidElement.style.transform =
      getAsteroidTransform(asteroid, fieldWidth, fieldHeight);
    asteroidElement.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      harvestAsteroid(asteroid.id);
      event.currentTarget.remove();
    });
    elements.asteroidField.appendChild(asteroidElement);
  });
}


// Update moving asteroid positions without replacing their buttons.
function updateAsteroidPositions() {
  const fieldWidth = elements.asteroidField.clientWidth;
  const fieldHeight = elements.asteroidField.clientHeight;

  asteroids.forEach(function (asteroid) {
    if (asteroid.element) {
      asteroid.element.style.transform =
        getAsteroidTransform(asteroid, fieldWidth, fieldHeight);
    }
  });
}


function getAsteroidTransform(asteroid, fieldWidth, fieldHeight) {
  const xOffset =
    ((asteroid.xPosition - asteroid.startingX) / 100) * fieldWidth;
  const yOffset =
    ((asteroid.yPosition - asteroid.startingY) / 100) * fieldHeight;
  const scale = 0.5 + asteroid.distance * 1.5;

  return `translate(-50%, -50%) translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale})`;
}


// Show or hide the current asteroid field preview.
function toggleAsteroidPreview() {
  previewShowing = !previewShowing;
  elements.playScreen.classList.toggle("preview-mode", previewShowing);
  elements.asteroidField.classList.toggle("hidden", !previewShowing);
  elements.launchButton.classList.toggle("hidden", previewShowing);
  elements.icePreviewButton.setAttribute("aria-pressed", `${previewShowing}`);
  const previewHint = elements.icePreviewButton.querySelector("small");

  if (previewHint) {
    previewHint.innerHTML = previewShowing
      ? "Click again<br>to return"
      : "Click to view<br>asteroid field";
  }
  renderAsteroids();
}


// Remove a clicked asteroid and add its water to the supply.
function harvestAsteroid(asteroidId) {
  if (!gameRunning) return;

  const asteroid = asteroids.find(function (item) {
    return item.id === asteroidId;
  });

  if (!asteroid) return;

  asteroids = asteroids.filter(function (item) {
    return item.id !== asteroidId;
  });
  renderAsteroids();

  if (water < SETTINGS.waterNeeded) {
    water = Math.min(SETTINGS.waterNeeded, water + SETTINGS.waterPerIce);
  }

  score += SETTINGS.pointsPerIce;

  showMessage(
    water >= SETTINGS.waterNeeded
      ? "Water tank full! Launch your delivery!"
      : "Asteroid harvested! Water collected."
  );
  updateUI();
}


function assignNewTarget() {
  const availableTargets = SETTINGS.targetCountries.filter(function (country) {
    return !currentTarget || country.name !== currentTarget.name;
  });
  const targetIndex = Math.floor(Math.random() * availableTargets.length);

  currentTarget = availableTargets[targetIndex];
  targetSelected = false;
  elements.target.textContent = `TARGET: ${currentTarget.name.toUpperCase()}`;
  elements.targetDot.style.left = `${currentTarget.x}%`;
  elements.targetDot.style.top = `${currentTarget.y}%`;
  elements.targetDot.classList.remove("selected");
  updateUI();
}


function selectTarget(event) {
  event.stopPropagation();
  targetSelected = true;
  elements.targetDot.classList.add("selected");
  showMessage(`${currentTarget.name} selected. Launch when your tank is full.`);
  updateUI();
}


// Show or hide the mission settings choices.
function toggleSettings() {
  elements.settingsMenu.classList.toggle("hidden");
}


// Return to the title screen and stop the active mission.
function returnToTitle() {
  gameRunning = false;
  clearInterval(timerId);
  clearAsteroidTimers();
  timerId = null;
  clearConfetti();
  elements.endScreen.classList.remove("win-screen");

  elements.settingsMenu.classList.add("hidden");
  elements.gameLayout.classList.add("hidden");
  elements.titleScreen.classList.remove("hidden");
}


/* =========================================
   6. DELIVER WATER TO EARTH
========================================= */

function launchWater() {
  if (!gameRunning) return;

  if (!targetSelected) {
    showMessage("Select the red target on Earth first!");
    return;
  }

  // The player needs enough water to launch.
  if (water < SETTINGS.waterNeeded) {
    showMessage("Collect more water before launching!");
    return;
  }

  // Award delivery points.
  score += SETTINGS.pointsPerDelivery;

  // Empty the tank so the player can collect water for another delivery.
  water = 0;
  updateUI();

  if (score >= SETTINGS.targetScore) {
    endGame(true, "You reached the score needed to deliver clean water to countries in need!");
    return;
  }

  assignNewTarget();
  showMessage(`Delivery complete! New target: ${currentTarget.name}.`);
}


/* =========================================
   7. TAKE DAMAGE FROM INCOMING ICE
========================================= */

function takeDamage() {
  if (!gameRunning) return;

  // Reduce health without going below zero.
  health = Math.max(
    0,
    health - SETTINGS.damagePerHit
  );
  score = Math.max(0, score - SETTINGS.pointsPerIce);

  if (health <= 0) {
    updateUI();
    endGame(false, "Your ship ran out of health.");
    return;
  }

  showMessage("Ice impact! Protect your ship!");
  updateUI();
}


/* =========================================
   8. WIN OR LOSE
========================================= */

function endGame(won, message) {
  // Prevent the game from ending multiple times.
  if (!gameRunning) return;

  gameRunning = false;

  // Stop the countdown.
  clearInterval(timerId);
  clearAsteroidTimers();
  timerId = null;

  // Keep the HUD visible but replace gameplay with the ending.
  elements.gameLayout.classList.remove("hidden");
  elements.playScreen.classList.add("hidden");
  elements.endScreen.classList.remove("hidden");
  elements.actionRail.classList.add("hidden");
  elements.incomingStatusBar.classList.remove("warning-active");

  // Display the appropriate ending.
  elements.endTitle.textContent = won
    ? "MISSION COMPLETE!"
    : "MISSION FAILED!";
  elements.endScreen.classList.toggle("win-screen", won);

  elements.endMessage.textContent = message;
  elements.finalScore.textContent = score;
  if (won) {
    createConfetti();
  } else {
    clearConfetti();
  }

  showMessage(
    won
      ? "Great work! You helped deliver clean water."
      : "Mission over. You can try again!"
  );

  updateUI();
}


function createConfetti() {
  clearConfetti();

  const colors = ["#ffcf36", "#4ba3e3", "#e76f51", "#4caf50", "#ffffff"];

  for (let index = 0; index < 36; index++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    elements.confetti.appendChild(piece);
  }
}


function clearConfetti() {
  elements.confetti.innerHTML = "";
}


/* =========================================
   9. CONNECT BUTTONS TO FUNCTIONS
========================================= */

// Title screen.
elements.startButton.addEventListener("click", startGame);

// Settings and replay.
elements.settingsButton.addEventListener("click", toggleSettings);
elements.settingsRestartButton.addEventListener("click", startGame);
elements.settingsTitleButton.addEventListener("click", returnToTitle);
elements.playAgainButton.addEventListener("click", startGame);
elements.endTitleButton.addEventListener("click", returnToTitle);

// Gameplay actions.
elements.launchButton.addEventListener("click", launchWater);
elements.icePreviewButton.addEventListener("click", toggleAsteroidPreview);
elements.targetDot.addEventListener("click", selectTarget);


/* =========================================
   10. INITIALIZE THE GAME
========================================= */

// The title screen is visible by default.
// The game layout remains hidden until Start is clicked.
updateUI();
