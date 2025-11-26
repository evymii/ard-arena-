import { start } from "./game/game";
import { ArenaType } from "./game/core/arenaTypes";

const app = document.getElementById("app");
if (!app) {
  throw new Error("App element not found");
}

const gamePromise = start({
  arena: {
    container: app,
    arena: ArenaType.TOWER,
    width: 1200,
    height: 800,
  },
  fighters: [{ name: "subzero" }, { name: "kano" }],
  gameType: "basic",
  callbacks: {
    attack: (fighter, opponent, damage) => {
      console.log(
        `${fighter.getName()} attacked ${opponent.getName()} for ${damage} damage`
      );
    },
    "game-end": (fighter) => {
      console.log(`Game ended! ${fighter.getName()} lost`);
    },
  },
});

gamePromise.ready(() => {
  console.log("Game initialized and ready!");
});
