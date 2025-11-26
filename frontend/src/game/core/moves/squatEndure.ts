import { Move } from '../move';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class SquatEndure extends Move {
  protected bottom?: number;

  constructor(owner: Fighter) {
    super(owner, MoveType.SQUAT_ENDURE);
    this.totalSteps = 3;
  }

  protected _action(): void {
    if (this.currentStep === this.totalSteps - 1) {
      this.stop();
      this.owner.setMove(MoveType.SQUAT);
    }
    this.keepDistance();
  }

  protected _beforeGo(): void {
    this.owner.lock();
    if (this.bottom === undefined) {
      this.bottom = this.owner.getBottom();
    }
  }

  protected _beforeStop(): void {
    this.owner.unlock();
  }

  moveNextStep(): void {
    this.currentStep += 1;
  }

  keepDistance(): void {
    if (this.bottom === undefined) return;
    const currentBottom = this.owner.getBottom();
    if (currentBottom > this.bottom) {
      this.owner.setY(this.owner.getY() + currentBottom - this.bottom);
    }
    if (currentBottom < this.bottom) {
      this.owner.setY(this.owner.getY() - (this.bottom - currentBottom));
    }
  }
}

