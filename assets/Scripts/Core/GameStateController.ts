import { _decorator, Component } from 'cc';
import { PauseService } from './PauseService';

const { ccclass, property } = _decorator;

/**
 * Контроллер состояний игры
 * Управляет переходами между состояниями: Waiting -> Running -> Tutorial/Victory/Defeat
 */
export enum GameState {
    Waiting = 'Waiting',
    Running = 'Running',
    Tutorial = 'Tutorial',
    Victory = 'Victory',
    Defeat = 'Defeat',
}

@ccclass('GameStateController')
export class GameStateController extends Component {
    private currentState: GameState = GameState.Waiting;
    private pauseService: PauseService = PauseService.instance;

    public onLoad(): void {
        this.transitionTo(GameState.Waiting);
    }

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public transitionTo(newState: GameState): void {
        if (this.currentState === newState) {
            return;
        }

        const previousState = this.currentState;
        this.currentState = newState;

        if (newState === GameState.Running) {
            this.pauseService.resume();
        } else {
            this.pauseService.pause();
        }
    }

    public isState(state: GameState): boolean {
        return this.currentState === state;
    }

    public isGameplayActive(): boolean {
        return this.currentState === GameState.Running;
    }
}

