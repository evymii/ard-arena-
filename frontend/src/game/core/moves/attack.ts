import { Move } from "../move";
import { MoveType } from "../moveTypes";
import type { Fighter } from "../../fighters/fighter";

export abstract class Attack extends Move {
  protected damage: number;
  protected moveBack: boolean = false;
  protected hitPassed: boolean = false;
  protected returnStand: MoveType;
  protected returnStandStep: number;
  protected dontReturn: boolean = false;
  protected bottom?: number;

  constructor(
    owner: Fighter,
    type: MoveType,
    steps: number,
    damage: number,
    duration?: number,
    returnStand?: MoveType,
    returnStandStep?: number
  ) {
    super(owner, type, duration || 40);
    this.damage = damage;
    this.totalSteps = steps;
    this.returnStand = returnStand || MoveType.STAND;
    this.returnStandStep = returnStandStep || 0;
  }

  moveNextStep(): void {
    if (!this.moveBack) {
      this.currentStep += 1;
    }
    if (this.moveBack) {
      this.currentStep -= 1;
      if (this.currentStep <= 0) {
        this.stop();
        this.owner.setMove(this.returnStand, this.returnStandStep);
      }
    }
    if (this.currentStep >= this.totalSteps) {
      if (this.dontReturn) {
        this.stop();
        this.owner.setMove(this.returnStand);
      } else {
        this.moveBack = true;
        this.currentStep -= 1;
      }
    }
  }

  protected _action(): void {
    this.keepDistance();
    if (
      !this.hitPassed &&
      this.currentStep === Math.round(this.totalSteps / 2)
    ) {
      this.owner.attack(this.getDamage());
      this.hitPassed = true;
    }
  }

  getDamage(): number {
    return this.damage;
  }

  protected _beforeStop(): void {
    this.owner.unlock();
  }

  protected _beforeGo(): void {
    this.moveBack = false;
    this.hitPassed = false;
    this.owner.lock();
    this.bottom = this.owner.getBottom();
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
