/**
 * Gradient configuration for test-home-v2.astro
 *
 * COLOR REFERENCES
 * ─────────────────────────────────────────────────────────────────
 * Ocean palette (dark → light):
 *   "o10" = ocean-950   oklch(17.50% 0.124 276.0)  near-black purple-blue
 *   "o9"  = ocean-900   oklch(23.50% 0.092 266.2)
 *   "o8"  = ocean-800   oklch(27.50% 0.119 256.3)
 *   "o7"  = ocean-700   oklch(38.00% 0.135 246.4)
 *   "o6"  = ocean-600   oklch(49.00% 0.168 236.4)
 *   "o5"  = ocean-500   oklch(57.00% 0.179 226.3)
 *   "o4"  = ocean-400   oklch(69.00% 0.168 216.2)
 *   "o3"  = ocean-300   oklch(80.50% 0.124 206.4)
 *   "o2"  = ocean-200   oklch(90.00% 0.092 196.6)
 *   "o1"  = ocean-100   oklch(91.00% 0.060 186.8)
 *   "o0"  = ocean-50    oklch(97.50% 0.040 177.0)  near-white teal
 *
 * Accent colors:
 *   "a0"  = accent-0    oklch(47.00% 0.220  18.0)  red     #d51e44
 *   "a1"  = accent-1    oklch(78.00% 0.175  68.0)  amber   #feb43a
 *   "a2"  = accent-2    oklch(84.00% 0.200 132.0)  lime    #93e35f
 *   "a3"  = accent-3    oklch(79.00% 0.140 172.0)  teal    #3dd5a9
 *   "a4"  = accent-4    oklch(43.00% 0.220 303.0)  purple  #8345b6
 *   "a5"  = accent-5    oklch(47.00% 0.260 333.0)  magenta #b11e85
 *
 * SHADER PARAMS
 * ─────────────────────────────────────────────────────────────────
 *   speed        — animation speed (0 = static, 1 = fast). ~0.3 is slow/atmospheric.
 *   distortion   — how much the color blobs warp and bend (0–1).
 *   swirl        — rotational swirl at the center (0–1).
 *   grainOverlay — coarse grain/noise overlay intensity (0–1).
 *   grainMixer   — blends grain into the color positions (0–1, usually 0).
 *
 * POSITION / FRAMING
 * ─────────────────────────────────────────────────────────────────
 *   offsetX      — shift gradient horizontally (-1 left … 0 center … 1 right).
 *   offsetY      — shift gradient vertically   (-1 up   … 0 center … 1 down).
 *   originX      — rotation/scale pivot X (0 left … 0.5 center … 1 right).
 *   originY      — rotation/scale pivot Y (0 top  … 0.5 center … 1 bottom).
 *   rotation     — rotate the whole gradient in degrees (0–360).
 *   scale        — zoom in (>1) or out (<1) on the gradient pattern.
 *
 * TIME OF DAY
 * ─────────────────────────────────────────────────────────────────
 * The timeOfDay array overrides background defaults by local hour.
 * Each entry: { from, to, colors, ...optional param overrides }
 * "from" is inclusive, "to" is exclusive. Spans midnight if from > to.
 */

export const gradientConfig = {

  // Fallback / base gradient — used if no timeOfDay period matches.
  background: {
    colors: ["o10", "o9", "o8", "o7", "o6", "o4", "a4"],
    speed:        0.3,
    distortion:   0.5,
    swirl:        0.8,
    grainOverlay: 0.1,
    grainMixer:   0,
    offsetX:      0,
    offsetY:      0,
    originX:      0.5,
    originY:      0.5,
    rotation:     0,
    scale:        0.7,
  },

  // Time-of-day periods — override background defaults by local hour.
  timeOfDay: [
    // Night (10pm – 7am): deep ocean, purple undertone
    {
      from: 22, to: 7,
      colors: ["o10", "o9", "o8", "o7", "a4"],
      speed: 0.15, swirl: 0.6, distortion: 0.4,
    },
    // Day (7am – 8pm): lighter ocean blues, still cool
    {
      from: 7, to: 20,
      colors: ["o9", "o7", "o6", "o4", "o3", "a4"],
      speed: 0.3, swirl: 0.8, distortion: 0.5,
    },
    // Evening (8pm – 10pm): deepening back toward night
    {
      from: 20, to: 22,
      colors: ["o10", "o9", "o8", "o6", "a4"],
      speed: 0.2, swirl: 0.7, distortion: 0.45,
    },
  ],

};
