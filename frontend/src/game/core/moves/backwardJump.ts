import { Move } from '../move';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class BackwardJump extends Move {
  protected ownerHeight: number;

  constructor(owner: Fighter) {
    super(owner, MoveType.BACKWARD_JUMP, 80);
    this.totalSteps = 8;
    this.ownerHeight = owner.getVisibleHeight();
  }

  protected _beforeStop(): void {
    this.owner.unlock();
    this.owner.setHeight(this.ownerHeight);
  }

  protected _beforeGo(): void {
    this.owner.lock();
    this.owner.setHeight(this.ownerHeight / 2);
  }

  moveNextStep(): void {
    this.currentStep += 1;
    if (this.currentStep >= this.totalSteps) {
      this.stop();
      this.owner.setMove(MoveType.STAND);
    }
  }

  protected _action(): void {
    if (this.currentStep > (this.totalSteps - 1) / 2) {
      this.owner.setY(this.owner.getY() + 26);
      this.owner.setX(this.owner.getX() - 23);
    } else {
      this.owner.setY(this.owner.getY() - 26);
      this.owner.setX(this.owner.getX() - 23);
    }
  }
}

