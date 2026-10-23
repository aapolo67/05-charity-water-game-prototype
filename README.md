# H2O Space Cascade

This is a beginner-friendly, DOM-based game prototype inspired by the provided
charity: water wireframes. Asteroids appear during a mission. The player opens
the asteroid field preview, clicks asteroids to collect water, avoids nearby
moving asteroids, and delivers enough water to Earth.

## Run the game

Open `index.html` in a browser. No build tools or JavaScript libraries are
required.

## Customize the game

### Change colors and visual styles

Open `styles.css` and edit the variables at the top of the file in the
`EDITABLE THEME` section. For example:

```css
--color-space: #101827;
--color-accent: #ffcf36;
--color-water: #4ba3e3;
```

Every main color is connected to one of these variables, including the
background, buttons, panels, text, progress bars, borders, and links. The
section also includes editable settings for the font, corner rounding, and
maximum content width.

### Change gameplay

Open `script.js` and edit the values in the `SETTINGS` object:

- `startingTime` controls the length of a mission.
- `startingHealth` controls the ship's starting health.
- `waterPerIce` controls how much water one successful shot collects.
- `waterNeeded` controls how much water is required for each delivery.
- `pointsPerIce` and `pointsPerDelivery` control scoring.
- Reaching the target score of 400 points does not end the mission. After the
  target has been reached, dropping below 400 points or reaching zero health
  ends the mission with the failure screen. The player can continue playing
  after passing 400 points. When the timer reaches zero, a score of at least
  400 points shows the celebratory win screen; otherwise, the failure screen
  appears.
- `damagePerHit` controls the damage from incoming ice.
- `asteroidSpawnTime` controls how often an asteroid appears.
- `stillAsteroidSpawnTime` controls how often a stationary asteroid appears.
- `maxAsteroids` limits the total asteroids visible at one time.
- `asteroidSpeed` controls how quickly an asteroid reaches the ship.
- `warningDistance` controls when the incoming asteroid warning appears.

### Change text and layout

Open `index.html` to edit headings, instructions, button labels, and the
charity: water link. The comments divide the file into title screen, game
screen, and end screen sections so each component is easy to find.
