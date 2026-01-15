import { _decorator, Component, input, Input, EventKeyboard } from 'cc';
import { PlayerDamageReceiver } from '../Game/PlayerDamageReceiver';
import { ScoreView } from '../UI/ScoreView';

const { ccclass, property } = _decorator;

/**
 * Отладочный контроллер - для тестирования урона и счета
 
 */
@ccclass('DebugController')
export class DebugController extends Component {
    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    @property({ type: ScoreView })
    public scoreView: ScoreView | null = null;

    @property
    public debugEnabled: boolean = true;

    public onLoad(): void {
        if (this.debugEnabled) {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }

    public onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    public onEnable(): void {
        if (this.debugEnabled) {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }

    public onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard): void {
        if (!this.debugEnabled) {
            return;
        }

        if (event.keyCode === 69){
            this.testDamage();
        } else if (event.keyCode === 82) {
            this.testScore();
        }
    }

    private testDamage(): void {
        if (this.playerDamageReceiver) {
            this.playerDamageReceiver.takeDamage(1);
            console.log('Debug: Damage applied. Current health:', this.playerDamageReceiver.getCurrentHealth());
        } else {
            console.warn('Debug: PlayerDamageReceiver not assigned');
        }
    }

    private testScore(): void {
        if (this.scoreView) {
            this.scoreView.addScore(10);
            console.log('Debug: Score added. Current score:', this.scoreView.getScore());
        } else {
            console.warn('Debug: ScoreView not assigned');
        }
    }
}

