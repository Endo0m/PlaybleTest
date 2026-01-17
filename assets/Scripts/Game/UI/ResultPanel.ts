import { _decorator, Component, Label, Sprite, Color, tween } from 'cc';

const { ccclass, property } = _decorator;

export enum ResultType {
    Victory = 'Victory',
    Defeat = 'Defeat',
}

@ccclass('ResultPanel')
export class ResultPanel extends Component {
    @property({ type: Label })
    public titleLabel: Label | null = null;

    @property({ type: Label })
    public subtitleLabel: Label | null = null;

    @property({ type: Label })
    public amountLabel: Label | null = null;

    @property({ type: Sprite })
    public actionButtonSprite: Sprite | null = null;

    @property({ type: Color })
    public victoryButtonColor: Color = new Color(255, 200, 0);

    @property({ type: Color })
    public defeatButtonColor: Color = new Color(255, 80, 80);

    @property
    public victoryTitle: string = 'Congratulations!';

    @property
    public victorySubtitle: string = 'Choose your reward!';

    @property
    public defeatTitle: string = "You didn’t make it!";

    @property
    public defeatSubtitle: string = 'Try again on the app!';

    @property
    public moneyCountDuration: number = 0.4;

    public show(result: ResultType, finalAmount: number): void {
        this.node.active = true;

        if (result === ResultType.Victory) {
            this.applyVictory();
        } else {
            this.applyDefeat();
        }

        this.animateMoney(finalAmount);
    }

    private applyVictory(): void {
        if (this.titleLabel) this.titleLabel.string = this.victoryTitle;
        if (this.subtitleLabel) this.subtitleLabel.string = this.victorySubtitle;
        if (this.actionButtonSprite) {
            this.actionButtonSprite.color = this.victoryButtonColor;
        }
    }

    private applyDefeat(): void {
        if (this.titleLabel) this.titleLabel.string = this.defeatTitle;
        if (this.subtitleLabel) this.subtitleLabel.string = this.defeatSubtitle;
        if (this.actionButtonSprite) {
            this.actionButtonSprite.color = this.defeatButtonColor;
        }
    }

    private animateMoney(targetAmount: number): void {
        if (!this.amountLabel) return;

        let value = 0;
        this.amountLabel.string = '$0';

        tween({ v: 0 })
            .to(this.moneyCountDuration, { v: targetAmount }, {
                onUpdate: (obj) => {
                    const rounded = Math.floor(obj.v);
                    this.amountLabel!.string = `$${rounded}`;
                }
            })
            .start();
    }
}
