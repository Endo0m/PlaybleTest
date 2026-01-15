import { _decorator, Component, Node } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';
import { InputTapRouter } from '../Core/InputTapRouter';
import { PlayerController } from './PlayerController';
import { WorldScroller } from './WorldScroller';
import { PlayerDamageReceiver } from './PlayerDamageReceiver';

const { ccclass, property } = _decorator;

/**
 * Главный бутстрап игры - связывает все компоненты вместе
 */
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

    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    public onLoad(): void {
        if (!this.gameStateController || !this.inputTapRouter) {
            console.error('GameBootstrap: gameStateController and inputTapRouter are required');
            return;
        }

        if (this.inputTapRouter) {
            this.inputTapRouter.registerTapStartGame(this.onGameStart.bind(this));
        }

        if (this.playerDamageReceiver) {
            this.playerDamageReceiver.node.on('PlayerDied', this.onPlayerDied, this);
        }

        this.node.on('TutorialTriggered', this.onTutorialTriggered, this);
        this.node.on('TutorialEnded', this.onTutorialEnded, this);
    }

    public onDestroy(): void {
        if (this.playerDamageReceiver) {
            this.playerDamageReceiver.node.off('PlayerDied', this.onPlayerDied, this);
        }
        this.node.off('TutorialTriggered', this.onTutorialTriggered, this);
        this.node.off('TutorialEnded', this.onTutorialEnded, this);
    }

    private onTutorialEnded(): void {
        if (this.playerController) {
            this.playerController.node.emit('TutorialEnded');
        }
    }

    private onGameStart(): void {
        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Running);
        }
        if (this.playerController) {
            this.playerController.node.emit('GameStarted');
        }
    }

    private onPlayerDied(): void {
        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Defeat);
        }
        this.node.emit('PlayerDied');
    }

    private onTutorialTriggered(): void {
        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Tutorial);
        }
        if (this.playerController) {
            this.playerController.node.emit('TutorialStarted');
        }
        this.node.emit('TutorialTriggered');
    }
}

