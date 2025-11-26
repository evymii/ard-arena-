import { Move } from './move';
import { MoveType } from './moveTypes';
import type { Fighter } from '../fighters/fighter';

export class CycleMove extends Move {
  constructor(owner: Fighter, type: MoveType, steps: number, duration?: number) {
    super(owner, type, duration);
    this.totalSteps = steps;
  }

  moveNextStep(): void {
    this.currentStep += 1;
    this.currentStep = this.currentStep % this.totalSteps;
  }
}

