import { _decorator, Component, input, Input, EventTouch } from 'cc';
import { GameStateController, GameState } from './GameStateController';

const { ccclass, property } = _decorator;

/**
 * Центральный роутер для обработки тапов
 * Маршрутизирует тапы в зависимости от текущего состояния игры
 * @property fields в Inspector:
 * - gameStateController: GameStateController - контроллер состояний игры
 * - onTapStartGame: функция вызывается при тапе в состоянии Waiting (начало игры)
 * - onTapJump: функция вызывается при тапе в состоянии Running (прыжок)
 * - onTapTutorial: функция вызывается при тапе в состоянии Tutorial (закрыть туториал)
 */
export type TapCallback = () => void;

@ccclass('InputTapRouter')
export class InputTapRouter extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    private onTapStartGameCallbacks: TapCallback[] = [];
    private onTapJumpCallbacks: TapCallback[] = [];
    private onTapTutorialCallbacks: TapCallback[] = [];

    public onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public registerTapStartGame(callback: TapCallback): void {
        if (this.onTapStartGameCallbacks.indexOf(callback) === -1) {
            this.onTapStartGameCallbacks.push(callback);
        }
    }

    public registerTapJump(callback: TapCallback): void {
        if (this.onTapJumpCallbacks.indexOf(callback) === -1) {
            this.onTapJumpCallbacks.push(callback);
        }
    }

    public registerTapTutorial(callback: TapCallback): void {
        if (this.onTapTutorialCallbacks.indexOf(callback) === -1) {
            this.onTapTutorialCallbacks.push(callback);
        }
    }

    private onTouchStart(_event: EventTouch): void {
        if (!this.gameStateController) {
            return;
        }

        const state = this.gameStateController.getCurrentState();

        if (state === GameState.Waiting) {
            for (const callback of this.onTapStartGameCallbacks) {
                callback();
            }
        } else if (state === GameState.Running) {
            for (const callback of this.onTapJumpCallbacks) {
                callback();
            }
        } else if (state === GameState.Tutorial) {
            for (const callback of this.onTapTutorialCallbacks) {
                callback();
            }
        }
    }
}

