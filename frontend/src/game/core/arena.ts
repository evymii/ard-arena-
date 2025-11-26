import { ArenaType, type ArenaType as ArenaTypeValue } from "./arenaTypes";
import { Orientation } from "./orientations";
import { MoveType } from "./moveTypes";
import { CONFIG } from "./config";
import type { Fighter } from "../fighters/fighter";
import type { BaseController } from "./controller";

export interface ArenaOptions {
  fighters: Fighter[];
  arena: ArenaTypeValue;
  width?: number;
  height?: number;
  container: HTMLElement;
  game: BaseController;
}

export class Arena {
  public width: number;
  public height: number;
  public arena: ArenaTypeValue;
  public fighters: Fighter[];
  private container: HTMLElement;
  private game: BaseController;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private texture?: HTMLImageElement;
  private timeRemaining: number = 60;
  private timerInterval?: number;

  constructor(options: ArenaOptions) {
    this.width = options.width || CONFIG.ARENA_WIDTH;
    this.height = options.height || CONFIG.ARENA_HEIGHT;
    this.arena = options.arena || ArenaType.TOWER;
    this.fighters = options.fighters;
    this.container = options.container;
    this.game = options.game;
  }

  init(): void {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    canvas.style.display = "block";
    canvas.style.maxWidth = "none";
    canvas.style.maxHeight = "none";
    canvas.style.minWidth = `${this.width}px`;
    canvas.style.minHeight = `${this.height}px`;
    this.container.appendChild(canvas);
    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: false,
    });
    if (!context) {
      throw new Error("Could not get 2d context");
    }

    // Enable image smoothing for better quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    this.context = context;
    this.canvas = canvas;
    this.startTimer();
    this.refresh();
  }

  startTimer(): void {
    this.timeRemaining = 60;
    this.timerInterval = window.setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.stopTimer();
        this.handleTimeUp();
      }
      this.refresh();
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  private handleTimeUp(): void {
    if (this.fighters.length < 2) return;

    const fighter1 = this.fighters[0];
    const fighter2 = this.fighters[1];
    const health1 = fighter1.getLife();
    const health2 = fighter2.getLife();

    // Fighter with more health (less damage) wins
    let winner: Fighter;
    let loser: Fighter;

    if (health1 > health2) {
      winner = fighter1;
      loser = fighter2;
    } else if (health2 > health1) {
      winner = fighter2;
      loser = fighter1;
    } else {
      // Tie - both fighters stop
      fighter1.getMove().stop();
      fighter2.getMove().stop();
      return;
    }

    // Stop both fighters
    fighter1.getMove().stop();
    fighter2.getMove().stop();

    // Winner does win animation, loser does fall
    winner.setMove(MoveType.WIN);
    loser.setMove(MoveType.FALL);

    // Trigger game end callback
    const callback = (this.game as any).callbacks?.["game-end"];
    if (typeof callback === "function") {
      callback.call(null, loser);
    }
  }

  destroy(): void {
    this.stopTimer();
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = undefined;
    this.context = undefined;
    this.container = undefined as any;
    this.game = undefined as any;
    this.fighters = undefined as any;
    this.arena = undefined as any;
  }

  private drawArena(): void {
    if (!this.context) return;
    if (this.texture) {
      // Draw the texture scaled to fill the entire canvas
      this.context.drawImage(
        this.texture,
        0,
        0,
        this.texture.width,
        this.texture.height,
        0,
        0,
        this.width,
        this.height
      );
    } else {
      const img = document.createElement("img");
      img.src = `${CONFIG.IMAGES}${CONFIG.ARENAS}${this.arena}/arena.png`;
      img.onload = () => {
        this.texture = img;
        if (this.context) {
          // Draw the image scaled to fill the entire canvas
          this.context.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            this.width,
            this.height
          );
        }
      };
    }
  }

  refresh(): void {
    if (!this.context) return;
    this.drawArena();
    // Draw static health bar UI at the top
    this.drawStaticHealthBars();
    // Draw fighters (scaled up)
    const scaleFactor = 3.0; // 200% bigger (3x size)
    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      const state = f.getState();
      if (state) {
        const scaledWidth = state.width * scaleFactor;
        const scaledHeight = state.height * scaleFactor;
        // Adjust Y position to keep bottom aligned (move up by the height difference)
        const yOffset = state.height * (scaleFactor - 1);
        this.context.drawImage(
          state,
          f.getX(),
          f.getY() - yOffset,
          scaledWidth,
          scaledHeight
        );
      }
    }
  }

  private drawStaticHealthBars(): void {
    if (!this.context || this.fighters.length < 2) return;

    const padding = 20;
    const barHeight = 24;
    const barWidth = 400;

    // Background removed - no dark overlay

    const fighter1 = this.fighters[0];
    const fighter2 = this.fighters[1];

    // Align health bars and timer vertically
    const barY = 56; // Vertical position for health bars and timer

    // Left player (fighter1) - Player 1
    const leftX = padding;
    this.drawPlayerHealthBar(
      fighter1,
      leftX,
      barY,
      barWidth,
      barHeight,
      true,
      1
    );

    // Right player (fighter2) - Player 2
    const rightX = this.width - padding - barWidth;
    this.drawPlayerHealthBar(
      fighter2,
      rightX,
      barY,
      barWidth,
      barHeight,
      false,
      2
    );

    // Draw timer in the center, aligned with health bars
    this.drawTimer(barY);
  }

  private drawTimer(barY: number): void {
    if (!this.context) return;

    const centerX = Math.round(this.width / 2);
    const timerY = barY; // Align with health bars
    const time = Math.max(0, this.timeRemaining);

    // Draw timer background circle
    this.context.fillStyle = "rgba(50, 50, 50, 0.5)";
    this.context.beginPath();
    this.context.arc(centerX, timerY, 36, 0, Math.PI * 2);
    this.context.fill();

    // Draw timer border
    this.context.strokeStyle = this.timeRemaining <= 10 ? "#FF0000" : "#EEEEEE";
    this.context.lineWidth = 6;
    this.context.stroke();

    // Draw timer text
    this.context.fillStyle = this.timeRemaining <= 10 ? "#FF0000" : "#EEEEEE";
    this.context.font = "bold 32px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(time.toString(), centerX, timerY);
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    if (!this.context) return;
    this.context.beginPath();
    this.context.moveTo(x + radius, y);
    this.context.lineTo(x + width - radius, y);
    this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.context.lineTo(x + width, y + height - radius);
    this.context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.context.lineTo(x + radius, y + height);
    this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.context.lineTo(x, y + radius);
    this.context.quadraticCurveTo(x, y, x + radius, y);
    this.context.closePath();
  }

  private drawPlayerHealthBar(
    fighter: Fighter,
    x: number,
    y: number,
    barWidth: number,
    barHeight: number,
    isLeft: boolean,
    playerNumber: number
  ): void {
    if (!this.context) return;

    const maxLife = 100;
    const currentLife = fighter.getLife();
    const lifePercentage = currentLife / maxLife;
    const fighterName = `Player ${playerNumber}`;

    // Health bar position
    const barX = Math.round(x);
    const barY = Math.round(y);

    // Draw fighter name above health bar
    this.context.fillStyle = "#EEEEEE"; // Light gray
    this.context.font = "bold 22px Arial";
    this.context.textAlign = isLeft ? "left" : "right";
    this.context.textBaseline = "top";
    const nameX = isLeft ? barX : barX + barWidth;
    const nameY = barY - 32; // Position name above the bar
    this.context.fillText(fighterName, nameX, nameY);

    const borderRadius = 12;

    // Draw empty health bar (dark red, rounded)
    this.context.fillStyle = "#8B0000";
    this.drawRoundedRect(barX, barY, barWidth, barHeight, borderRadius);
    this.context.fill();

    // Draw current health (rounded)
    const healthWidth = barWidth * lifePercentage;
    if (healthWidth > 0) {
      // Color gradient: green (100%) -> yellow (50%) -> red (0%)
      if (lifePercentage > 0.5) {
        // Green to yellow
        const greenIntensity = Math.floor(255 * ((lifePercentage - 0.5) * 2));
        this.context.fillStyle = `rgb(${255 - greenIntensity}, 255, 0)`;
      } else {
        // Yellow to red
        const redIntensity = Math.floor(255 * (1 - lifePercentage * 2));
        this.context.fillStyle = `rgb(255, ${redIntensity}, 0)`;
      }
      // For partial health, clip to rounded rectangle
      this.context.save();
      this.drawRoundedRect(barX, barY, healthWidth, barHeight, borderRadius);
      this.context.clip();
      this.context.fillRect(barX, barY, healthWidth, barHeight);
      this.context.restore();
    }
  }

  moveFighter(
    fighter: Fighter,
    pos: { x: number; y: number }
  ): { x: number; y: number } {
    const opponent = this.game.getOpponent(fighter);
    const op = { x: opponent.getX(), y: opponent.getY() };
    const isOver = pos.y + fighter.getVisibleHeight() <= op.y;

    if (pos.x <= 0) {
      pos.x = 0;
    }
    if (pos.x >= this.width - fighter.getVisibleWidth()) {
      pos.x = this.width - fighter.getVisibleWidth();
    }

    if (!isOver) {
      if (fighter.getOrientation() === Orientation.LEFT) {
        if (pos.x + fighter.getVisibleWidth() > op.x) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      } else {
        if (pos.x < op.x + opponent.getVisibleWidth()) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      }
    }

    this.setFightersOrientation(fighter, opponent);
    return pos;
  }

  private synchronizeFighters(
    pos: { x: number; y: number },
    fighter: Fighter,
    opponent: Fighter
  ): { x: number; y: number } {
    const moveType = fighter.getMove().type;
    if (
      moveType === MoveType.FORWARD_JUMP ||
      moveType === MoveType.BACKWARD_JUMP
    ) {
      pos.x = fighter.getX();
      return pos;
    }
    let diff: number;
    if (fighter.getOrientation() === Orientation.LEFT) {
      diff = Math.min(
        this.width -
          (opponent.getX() +
            opponent.getVisibleWidth() +
            fighter.getVisibleWidth()),
        pos.x - fighter.getX()
      );
      pos.x = fighter.getX() + diff;
      if (diff > 0) {
        opponent.setX(opponent.getX() + diff);
      }
    } else {
      diff = Math.min(opponent.getX(), fighter.getX() - pos.x);
      if (diff > 0) {
        pos.x = fighter.getX() - diff;
        opponent.setX(opponent.getX() - diff);
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      } else {
        pos.x = fighter.getX();
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      }
    }
    return pos;
  }

  private setFightersOrientation(f1: Fighter, f2: Fighter): void {
    if (f1.getX() < f2.getX()) {
      f1.setOrientation(Orientation.LEFT);
      f2.setOrientation(Orientation.RIGHT);
    } else {
      f1.setOrientation(Orientation.RIGHT);
      f2.setOrientation(Orientation.LEFT);
    }
  }
}
