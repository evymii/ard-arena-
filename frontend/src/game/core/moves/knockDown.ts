import { Move } from '../move';
import { MoveType } from '../moveTypes';
import { Orientation } from '../orientations';
import type { Fighter } from '../../fighters/fighter';

export class KnockDown extends Move {
  constructor(owner: Fighter) {
    super(owner, MoveType.KNOCK_DOWN, 80);
    this.totalSteps = 10;
  }

  protected _action(): void {
    if (this.currentStep === this.totalSteps - 1) {
      this.stop();
      this.owner.setMove(MoveType.ATTRACTIVE_STAND_UP);
    } else {
      let xDisplacement = 25;
      if (this.owner.getOrientation() === Orientation.LEFT) {
        xDisplacement = -xDisplacement;
      }
      if (this.currentStep + 1 > (this.totalSteps - 1) / 2) {
        this.owner.setY(this.owner.getY() + 10);
        this.owner.setX(this.owner.getX() + xDisplacement);
      } else {
        this.owner.setY(this.owner.getY() + 10);
        this.owner.setX(this.owner.getX() + xDisplacement);
      }
    }
  }

  protected _beforeGo(): void {
    this.owner.lock();
  }

  protected _beforeStop(): void {
    this.owner.unlock();
  }

  moveNextStep(): void {
    this.currentStep += 1;
  }
}

