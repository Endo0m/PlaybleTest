import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Отображение счета - показывает текущий счет в виде текста
 * 
 * Где добавить: на ноде ScoreUI (нода с Label компонентом)
 * 
 * @property fields в Inspector:
 * - scoreLabel: Label - компонент Label для отображения счета
 */
@ccclass('ScoreView')
export class ScoreView extends Component {
    @property({ type: Label })
    public scoreLabel: Label | null = null;

    private currentScore: number = 0;

    public onLoad(): void {
        if (!this.scoreLabel) {
            this.scoreLabel = this.node.getComponent(Label);
        }
        this.updateDisplay();
        this.node.on('PickupCollected', this.onPickupCollected, this);
    }

    public onDestroy(): void {
        this.node.off('PickupCollected', this.onPickupCollected, this);
    }

    private onPickupCollected(scoreAmount: number): void {
        this.addScore(scoreAmount);
    }

    public addScore(amount: number): void {
        this.currentScore += amount;
        this.updateDisplay();
    }

    public getScore(): number {
        return this.currentScore;
    }

    private updateDisplay(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = this.currentScore.toString();
        }
    }
}

