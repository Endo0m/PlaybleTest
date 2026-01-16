import { _decorator, Component, Label } from 'cc';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('ScoreView')
export class ScoreView extends Component {
    @property({ type: Label })
    public scoreLabel: Label | null = null;

    private currentScore = 0;

    onEnable(): void {
        if (!this.scoreLabel) {
            this.scoreLabel = this.node.getComponent(Label);
        }

        GameEvents.instance.on(GameEvents.PickupCollected, this.onPickupCollected, this);
        this.updateDisplay();
    }

    onDisable(): void {
        GameEvents.instance.off(GameEvents.PickupCollected, this.onPickupCollected, this);
    }

    public resetScore(): void {
        this.currentScore = 0;
        this.updateDisplay();
    }

    public getScore(): number {
        return this.currentScore;
    }

    private onPickupCollected(scoreAmount: number): void {
        if (typeof scoreAmount !== 'number' || !Number.isFinite(scoreAmount)) {
            return;
        }

        this.currentScore += scoreAmount;
        this.updateDisplay();
    }

   private updateDisplay(): void {
    if (this.scoreLabel) {
        this.scoreLabel.string = `$${this.currentScore}`;
    }
}

}
