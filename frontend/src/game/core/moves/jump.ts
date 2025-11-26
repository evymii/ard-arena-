import { Move } from '../move';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Jump extends Move {
  protected moveBack: boolean = false;

  constructor(owner: Fighter) {
    super(owner, MoveType.JUMP, 60);
    this.totalSteps = 6;
    this.moveBack = false;
  }

  moveNextStep(): void {
    if (!this.moveBack) {
      this.currentStep += 1;
    }
    if (this.moveBack) {
      this.currentStep -= 1;
      if (this.currentStep <= 0) {
        this.stop();
        this.owner.setMove(MoveType.STAND);
      }
    }
    if (this.currentStep >= this.totalSteps) {
      this.moveBack = true;
      this.currentStep -= 1;
    }
  }

  protected _action(): void {
    if (!this.moveBack) {
      if (this.currentStep === 0) {
        this.owner.setY(this.owner.getY() + 20);
      } else {
        this.owner.setY(this.owner.getY() - 20);
      }
    } else {
      if (this.currentStep === this.totalSteps - 1) {
        this.owner.setY(this.owner.getY() - 20);
      } else {
        this.owner.setY(this.owner.getY() + 25);
      }
    }
  }

  protected _beforeStop(): void {
    this.owner.unlock();
  }

  protected _beforeGo(): void {
    this.moveBack = false;
    this.owner.lock();
  }
}

