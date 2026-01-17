import { _decorator, Component, input, Input, EventTouch } from 'cc';
import { GameStateController, GameState } from './GameStateController';

const { ccclass, property } = _decorator;

export type TapCallback = () => void;

@ccclass('InputTapRouter')
export class InputTapRouter extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    private onTapStartGameCallbacks: TapCallback[] = [];
    private onTapJumpCallbacks: TapCallback[] = [];

    onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public registerTapStartGame(callback: TapCallback): void {
        if (this.onTapStartGameCallbacks.indexOf(callback) === -1) {
            this.onTapStartGameCallbacks.push(callback);
        }
    }

    public unregisterTapStartGame(callback: TapCallback): void {
        const index = this.onTapStartGameCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onTapStartGameCallbacks.splice(index, 1);
        }
    }

    public registerTapJump(callback: TapCallback): void {
        if (this.onTapJumpCallbacks.indexOf(callback) === -1) {
            this.onTapJumpCallbacks.push(callback);
        }
    }

    public unregisterTapJump(callback: TapCallback): void {
        const index = this.onTapJumpCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onTapJumpCallbacks.splice(index, 1);
        }
    }

    private onTouchStart(_event: EventTouch): void {
        const controller = this.gameStateController;
        if (!controller) return;

        const state = controller.getCurrentState();

        if (state === GameState.Waiting) {
            for (const cb of this.onTapStartGameCallbacks) cb();
            return;
        }

        // В Tutorial вообще ничего не делаем — его тап обрабатывает TutorialOverlay.
        if (state === GameState.Tutorial) {
            return;
        }

        if (state === GameState.Running) {
            for (const cb of this.onTapJumpCallbacks) cb();
            return;
        }
    }
}
