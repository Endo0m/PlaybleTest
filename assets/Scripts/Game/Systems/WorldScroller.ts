import { _decorator, Component } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { GameState } from '../../Core/StateMachine/GameState';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('WorldScroller')
export class WorldScroller extends Component {
    @property
    public speedPixelsPerSecond: number = 420;

    private stateMachine: GameStateMachine | null = null;
    private isRunning: boolean = false;

    public initialize(stateMachine: GameStateMachine): void {
        this.stateMachine = stateMachine;
        GameEvents.instance.on(GameEvents.GameStarted, this.startRun, this);
        GameEvents.instance.on(GameEvents.GamePaused, this.stopRun, this);
        GameEvents.instance.on(GameEvents.GameResumed, this.startRun, this);
    }

    public onDestroy(): void {
        GameEvents.instance.off(GameEvents.GameStarted, this.startRun, this);
        GameEvents.instance.off(GameEvents.GamePaused, this.stopRun, this);
        GameEvents.instance.off(GameEvents.GameResumed, this.startRun, this);
    }

    public update(deltaTime: number): void {
        if (!this.isRunning || !this.stateMachine || !this.stateMachine.isGameplayActive()) {
            return;
        }

        const position = this.node.position;
        this.node.setPosition(position.x - this.speedPixelsPerSecond * deltaTime, position.y, position.z);
    }

    private startRun(): void {
        this.isRunning = true;
    }

    private stopRun(): void {
        this.isRunning = false;
    }
}

