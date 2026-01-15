import { _decorator, Component, director } from 'cc';
import { GameStateMachine } from '../StateMachine/GameStateMachine';
import { GameState } from '../StateMachine/GameState';

const { ccclass } = _decorator;

@ccclass('GameTime')
export class GameTime extends Component {
    private stateMachine: GameStateMachine | null = null;
    private normalTimeScale: number = 1.0;

    public initialize(stateMachine: GameStateMachine): void {
        this.stateMachine = stateMachine;
        this.normalTimeScale = director.getTimeScale();
    }

    public update(): void {
        if (!this.stateMachine) {
            return;
        }

        if (this.stateMachine.isGameplayActive()) {
            director.setTimeScale(this.normalTimeScale);
        } else {
            director.setTimeScale(0);
        }
    }
}

