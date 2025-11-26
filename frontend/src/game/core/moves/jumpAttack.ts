import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class JumpAttack extends Attack {
  protected offset: { x: number; y: number };
  protected totalPics: number = 2;
  protected counter: number = 0;

  constructor(owner: Fighter, type: MoveType, damage: number, isForward: boolean) {
    super(owner, type, 3, damage, 80);
    this.offset = {
      x: -23,
      y: 26
    };
    if (isForward) {
      this.offset = {
        x: 23,
        y: 26
      };
    }
    this.totalPics = 2;
    this.counter = 0;
  }

  moveNextStep(): void {
    this.currentStep += 1;
    this.counter += 1;
    if (this.totalPics <= this.currentStep) {
      this.currentStep = this.totalPics;
    }
    if (this.counter >= this.totalSteps) {
      if (this.owner.getMove().type !== MoveType.WIN) {
        this.stop();
        this.owner.setMove(MoveType.STAND);
        this.owner.setY(CONFIG.PLAYER_TOP);
      }
    }
  }

  protected _action(): void {
    if (!this.hitPassed && this.currentStep === this.totalPics) {
      this.owner.attack(this.getDamage());
      this.hitPassed = true;
    }
    this.owner.setY(this.owner.getY() + this.offset.y);
    this.owner.setX(this.owner.getX() + this.offset.x);
  }

  protected _beforeGo(): void {
    this.hitPassed = false;
    this.counter = 0;
    this.owner.lock();
  }
}

export class JumpKick extends JumpAttack {
  constructor(owner: Fighter, isForward: boolean) {
    const type = isForward ? MoveType.FORWARD_JUMP_KICK : MoveType.BACKWARD_JUMP_KICK;
    super(owner, type, 10, isForward);
  }
}

export class JumpPunch extends JumpAttack {
  constructor(owner: Fighter, isForward: boolean) {
    const type = isForward ? MoveType.FORWARD_JUMP_PUNCH : MoveType.BACKWARD_JUMP_PUNCH;
    super(owner, type, 9, isForward);
  }
}
