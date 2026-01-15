import { GameState } from './GameState';
import { GameEvents } from '../Events/GameEvents';

export class GameStateMachine {
    private currentState: GameState = GameState.Boot;

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public transitionTo(newState: GameState): void {
        if (this.currentState === newState) {
            return;
        }

        const previousState = this.currentState;
        this.currentState = newState;

        GameEvents.instance.emit(GameEvents.GameStateChanged, previousState, newState);
    }

    public isState(state: GameState): boolean {
        return this.currentState === state;
    }

    public isGameplayActive(): boolean {
        return this.currentState === GameState.Running;
    }

    public isPaused(): boolean {
        return this.currentState === GameState.Tutorial || 
               this.currentState === GameState.Victory || 
               this.currentState === GameState.Defeat;
    }
}

