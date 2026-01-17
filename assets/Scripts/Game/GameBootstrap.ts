import { _decorator, Component } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';
import { InputTapRouter, TapCallback } from '../Core/InputTapRouter';
import { PlayerController } from '../Game/Player/PlayerController';
import { TutorialOverlay } from '../Game/UI/TutorialOverlay';
import { GameEvents } from '../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: InputTapRouter })
    public inputTapRouter: InputTapRouter | null = null;

    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    @property({ type: TutorialOverlay })
    public tutorialOverlay: TutorialOverlay | null = null;

    private onTapStartGame: TapCallback | null = null;
    private onTapJump: TapCallback | null = null;
    private jumpEnabled = false;

    onEnable(): void {
        if (!this.gameStateController || !this.inputTapRouter || !this.playerController) {
            console.error('[GameBootstrap] missing refs');
            return;
        }

        this.inputTapRouter.gameStateController = this.gameStateController;
        this.playerController.gameStateController = this.gameStateController;

        this.gameStateController.transitionTo(GameState.Waiting);

        this.onTapStartGame = this.handleTapStartGame.bind(this);
        this.inputTapRouter.registerTapStartGame(this.onTapStartGame);

        GameEvents.instance.on(GameEvents.TutorialDismissed, this.enableJumpAfterTutorial, this);

        console.log('[GameBootstrap] enabled');
    }

    onDisable(): void {
        if (this.inputTapRouter && this.onTapStartGame) {
            this.inputTapRouter.unregisterTapStartGame(this.onTapStartGame);
        }
        if (this.inputTapRouter && this.onTapJump) {
            this.inputTapRouter.unregisterTapJump(this.onTapJump);
        }

        GameEvents.instance.off(GameEvents.TutorialDismissed, this.enableJumpAfterTutorial, this);

        this.onTapStartGame = null;
        this.onTapJump = null;
        this.jumpEnabled = false;
    }

    private handleTapStartGame(): void {
        if (!this.gameStateController) return;
        if (this.gameStateController.getCurrentState() !== GameState.Waiting) return;

        console.log('[GameBootstrap] start tap');

        this.gameStateController.transitionTo(GameState.Running);
        this.tutorialOverlay?.hideStart();

        GameEvents.instance.emit(GameEvents.GameStarted);
    }

    private enableJumpAfterTutorial(): void {
        if (this.jumpEnabled) return;
        this.jumpEnabled = true;

        console.log('[GameBootstrap] jump enabled');

        if (!this.inputTapRouter || !this.playerController) return;

        this.onTapJump = this.playerController.tryJump.bind(this.playerController);
        this.inputTapRouter.registerTapJump(this.onTapJump);
    }
}
