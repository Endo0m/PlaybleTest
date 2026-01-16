import { _decorator, Component, input, Input, EventKeyboard, KeyCode } from 'cc';
import { PlayerDamageReceiver } from '../Game/Player/PlayerDamageReceiver';
import { GameEvents } from './Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('DebugController')
export class DebugController extends Component {
    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    @property
    public enabledInBuild: boolean = false;

    onEnable(): void {
        if (!this.enabledInBuild) {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }

    onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.KEY_H) {
            this.playerDamageReceiver?.takeDamage(1);
        }

        if (event.keyCode === KeyCode.KEY_S) {
            GameEvents.instance.emit(GameEvents.PickupCollected, 10);
        }
    }
}
