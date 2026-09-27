import { transistor, gates, core } from "./micro.js";
import { die, board } from "./chip.js";
import { laptop } from "./laptop.js";
import { datacenter } from "./infra.js";
import { city, planet } from "./world.js";

/* Innermost first. Each layer sits in a socket of the next. */
export function buildLayers() {
  return [
    transistor(),
    gates(),
    core(),
    die(),
    board({ valence: "Valence", minisql: "Mini SQL", chromium: "Mini Chromium", moodmate: "MoodMate", educred: "EducredChain" }),
    laptop(),
    datacenter(),
    city(),
    planet(),
  ];
}
