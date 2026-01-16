import { _decorator, Component } from 'cc';
import { PauseService } from './PauseService';

const { ccclass } = _decorator;

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

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public isState(state: GameState): boolean {
        return this.currentState === state;
    }

    public isGameplayActive(): boolean {
        return this.currentState === GameState.Running;
    }

    public transitionTo(nextState: GameState): void {
        if (this.currentState === nextState) {
            return;
        }

        const previousState = this.currentState;
        this.currentState = nextState;

        // Пауза управляется только состоянием
        if (nextState === GameState.Running) {
            this.pauseService.resume();
        } else {
            this.pauseService.pause();
        }

        // Локальное событие (если кому-то надо слушать)
        this.node.emit('GameStateChanged', previousState, nextState);
    }
}
