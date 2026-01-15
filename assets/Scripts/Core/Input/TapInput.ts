import { _decorator, Component, input, Input, EventTouch } from 'cc';
import { GameStateMachine } from '../StateMachine/GameStateMachine';
import { GameState } from '../StateMachine/GameState';

const { ccclass } = _decorator;

export type TapCallback = () => void;

@ccclass('TapInput')
export class TapInput extends Component {
    private tapCallbacks: TapCallback[] = [];
    private stateMachine: GameStateMachine | null = null;

    public initialize(stateMachine: GameStateMachine): void {
        this.stateMachine = stateMachine;
    }

    public onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public registerCallback(callback: TapCallback): void {
        if (this.tapCallbacks.indexOf(callback) === -1) {
            this.tapCallbacks.push(callback);
        }
    }

    public unregisterCallback(callback: TapCallback): void {
        const index = this.tapCallbacks.indexOf(callback);
        if (index !== -1) {
            this.tapCallbacks.splice(index, 1);
        }
    }

    private onTouchStart(_event: EventTouch): void {
        if (!this.stateMachine) {
            return;
        }

        if (this.stateMachine.isState(GameState.Boot)) {
            return;
        }

        for (const callback of this.tapCallbacks) {
            callback();
        }
    }
}

