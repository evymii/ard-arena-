import { Move } from '../move';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Endure extends Move {
  constructor(owner: Fighter) {
    super(owner, MoveType.ENDURE);
    this.totalSteps = 3;
  }

  protected _action(): void {
    if (this.currentStep === this.totalSteps - 1) {
      this.stop();
      this.owner.setMove(MoveType.STAND);
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
