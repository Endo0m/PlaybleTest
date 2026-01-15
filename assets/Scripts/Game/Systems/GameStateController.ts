import { _decorator, Component } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { GameState } from '../../Core/StateMachine/GameState';
import { GameEvents } from '../../Core/Events/GameEvents';
import { TapInput } from '../../Core/Input/TapInput';

const { ccclass, property } = _decorator;

@ccclass('GameStateController')
export class GameStateController extends Component {
    @property({ type: TapInput })
    public tapInput: TapInput | null = null;

    private stateMachine: GameStateMachine = new GameStateMachine();
    private tutorialShown: boolean = false;

    public onLoad(): void {
        this.stateMachine.transitionTo(GameState.Ready);
        
        if (this.tapInput) {
            this.tapInput.initialize(this.stateMachine);
            this.tapInput.registerCallback(this.onTap.bind(this));
        }

        GameEvents.instance.on(GameEvents.TutorialTriggered, this.onTutorialTriggered, this);
        GameEvents.instance.on(GameEvents.PlayerDied, this.onPlayerDied, this);
        GameEvents.instance.on(GameEvents.PlayerVictory, this.onPlayerVictory, this);
    }

    public onDestroy(): void {
        if (this.tapInput) {
            this.tapInput.unregisterCallback(this.onTap.bind(this));
        }

        GameEvents.instance.off(GameEvents.TutorialTriggered, this.onTutorialTriggered, this);
        GameEvents.instance.off(GameEvents.PlayerDied, this.onPlayerDied, this);
        GameEvents.instance.off(GameEvents.PlayerVictory, this.onPlayerVictory, this);
    }

    public getStateMachine(): GameStateMachine {
        return this.stateMachine;
    }

    private onTap(): void {
        if (this.stateMachine.isState(GameState.Ready)) {
            this.startGame();
        } else if (this.stateMachine.isState(GameState.Tutorial)) {
            this.dismissTutorial();
        }
    }

    private startGame(): void {
        this.stateMachine.transitionTo(GameState.Running);
        GameEvents.instance.emit(GameEvents.GameStarted);
    }

    private onTutorialTriggered(): void {
        if (!this.tutorialShown) {
            this.tutorialShown = true;
            this.stateMachine.transitionTo(GameState.Tutorial);
            GameEvents.instance.emit(GameEvents.GamePaused);
        }
    }

    private dismissTutorial(): void {
        this.stateMachine.transitionTo(GameState.Running);
        GameEvents.instance.emit(GameEvents.TutorialDismissed);
        GameEvents.instance.emit(GameEvents.GameResumed);
    }

    private onPlayerDied(): void {
        this.stateMachine.transitionTo(GameState.Defeat);
        GameEvents.instance.emit(GameEvents.GamePaused);
    }

    private onPlayerVictory(): void {
        this.stateMachine.transitionTo(GameState.Victory);
        GameEvents.instance.emit(GameEvents.GamePaused);
    }
}

