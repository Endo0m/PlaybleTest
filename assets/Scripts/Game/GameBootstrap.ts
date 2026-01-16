import { _decorator, Component } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';
import { InputTapRouter, TapCallback } from '../Core/InputTapRouter';
import { PlayerController } from './Player/PlayerController';
import { PlayerDamageReceiver } from './Player/PlayerDamageReceiver';
import { WorldScroller } from './Systems/WorldScroller';
import { TutorialOverlay } from '../Game/UI/TutorialOverlay';
const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: InputTapRouter })
    public inputTapRouter: InputTapRouter | null = null;

    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    @property({ type: WorldScroller })
    public worldScroller: WorldScroller | null = null;
    @property({ type: TutorialOverlay }) public tutorialOverlay: TutorialOverlay | null = null;
    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    private onTapStartGame: TapCallback | null = null;
    private onTapJump: TapCallback | null = null;
    private onTapTutorial: TapCallback | null = null;

    onLoad(): void {
        if (!this.gameStateController) {
            console.error('GameBootstrap: gameStateController is required');
            return;
        }
        if (!this.inputTapRouter) {
            console.error('GameBootstrap: inputTapRouter is required');
            return;
        }
        if (!this.playerController) {
            console.error('GameBootstrap: playerController is required');
            return;
        }

        // Проставляем зависимости
        this.inputTapRouter.gameStateController = this.gameStateController;
        this.playerController.gameStateController = this.gameStateController;

        if (this.worldScroller) {
            this.worldScroller.gameStateController = this.gameStateController;
        }

        // Начальное состояние
        this.gameStateController.transitionTo(GameState.Waiting);

        // Тапы
        this.onTapStartGame = this.handleTapStartGame.bind(this);
        this.onTapJump = this.playerController.tryJump.bind(this.playerController);
        this.onTapTutorial = this.handleTapTutorial.bind(this);

        this.inputTapRouter.registerTapStartGame(this.onTapStartGame);
        this.inputTapRouter.registerTapJump(this.onTapJump);
        this.inputTapRouter.registerTapTutorial(this.onTapTutorial);

        // Смерть игрока
        if (this.playerDamageReceiver) {
            this.playerDamageReceiver.node.on('PlayerDied', this.onPlayerDied, this);
        }

        // Триггеры из зоны (их обычно эмитит TriggerZoneAabb)
        this.node.on('TutorialTriggered', this.onTutorialTriggered, this);
        this.node.on('FinishTriggered', this.onFinishTriggered, this);
        this.node.on('TutorialEnded', this.onTutorialEnded, this);
    }

    onDestroy(): void {
        if (this.inputTapRouter) {
            if (this.onTapStartGame) this.inputTapRouter.unregisterTapStartGame(this.onTapStartGame);
            if (this.onTapJump) this.inputTapRouter.unregisterTapJump(this.onTapJump);
            if (this.onTapTutorial) this.inputTapRouter.unregisterTapTutorial(this.onTapTutorial);
        }

        if (this.playerDamageReceiver) {
            this.playerDamageReceiver.node.off('PlayerDied', this.onPlayerDied, this);
        }

        this.node.off('TutorialTriggered', this.onTutorialTriggered, this);
        this.node.off('FinishTriggered', this.onFinishTriggered, this);
        this.node.off('TutorialEnded', this.onTutorialEnded, this);
    }

    private handleTapStartGame(): void {
        if (!this.gameStateController) return;

        this.gameStateController.transitionTo(GameState.Running);
        this.tutorialOverlay?.hideStart();

        this.playerController?.node.emit('GameStarted');
    }

    private handleTapTutorial(): void {
        if (!this.gameStateController) return;

        if (this.gameStateController.getCurrentState() === GameState.Tutorial) {
            this.gameStateController.transitionTo(GameState.Running);
            this.node.emit('TutorialEnded');
        }
    }

    private onTutorialTriggered(): void {
        this.gameStateController?.transitionTo(GameState.Tutorial);
        this.playerController?.node.emit('TutorialStarted');
    }

    private onTutorialEnded(): void {
        this.playerController?.node.emit('TutorialEnded');
    }

    private onFinishTriggered(): void {
        this.gameStateController?.transitionTo(GameState.Victory);
        this.node.emit('FinishTriggered');
    }

    private onPlayerDied(): void {
        this.gameStateController?.transitionTo(GameState.Defeat);
        this.node.emit('PlayerDied');
    }
}
