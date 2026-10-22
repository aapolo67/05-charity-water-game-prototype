# H2O Space Cascade

This is a beginner-friendly, DOM-based game prototype inspired by the provided
charity: water wireframes. The player shoots ice to collect water, avoids
incoming ice, and delivers enough water to Earth.

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
- `waterNeeded` controls how much water is required to win.
- `pointsPerIce` and `pointsPerDelivery` control scoring.
- `damagePerHit` controls the damage from incoming ice.

### Change text and layout

Open `index.html` to edit headings, instructions, button labels, and the
charity: water link. The comments divide the file into title screen, game
screen, and end screen sections so each component is easy to find.
