import { _decorator, Component, Node } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';
import { InputTapRouter } from '../Core/InputTapRouter';

const { ccclass, property } = _decorator;

/**
 * Контроллер панелей - управляет показом/скрытием панелей Tutorial, Victory, Defeat, Offer
 * 
 * Где добавить: на Canvas или корневой ноде UI
 * 
 * @property fields в Inspector:
 * - gameStateController: GameStateController - контроллер состояний
 * - inputTapRouter: InputTapRouter - роутер тапов
 * - tutorialPanel: Node - нода панели туториала
 * - victoryPanel: Node - нода панели победы
 * - defeatPanel: Node - нода панели поражения
 * - offerPanel: Node - нода панели предложения (с кнопками)
 */
@ccclass('PanelsController')
export class PanelsController extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: InputTapRouter })
    public inputTapRouter: InputTapRouter | null = null;

    @property({ type: Node })
    public tutorialPanel: Node | null = null;

    @property({ type: Node })
    public victoryPanel: Node | null = null;

    @property({ type: Node })
    public defeatPanel: Node | null = null;

    @property({ type: Node })
    public offerPanel: Node | null = null;

    public onLoad(): void {
        this.hideAllPanels();

        if (this.inputTapRouter) {
            this.inputTapRouter.registerTapTutorial(this.onTutorialTap.bind(this));
        }

        this.node.on('TutorialTriggered', this.showTutorial, this);
        this.node.on('FinishTriggered', this.showVictory, this);
        this.node.on('PlayerDied', this.showDefeat, this);
    }

    public onDestroy(): void {
        this.node.off('TutorialTriggered', this.showTutorial, this);
        this.node.off('FinishTriggered', this.showVictory, this);
        this.node.off('PlayerDied', this.showDefeat, this);
    }

    public showTutorial(): void {
        this.hideAllPanels();
        if (this.tutorialPanel) {
            this.tutorialPanel.active = true;
        }
    }

    public showVictory(): void {
        this.hideAllPanels();
        if (this.victoryPanel) {
            this.victoryPanel.active = true;
        }
    }

    public showDefeat(): void {
        this.hideAllPanels();
        if (this.defeatPanel) {
            this.defeatPanel.active = true;
        }
    }

    public showOffer(): void {
        if (this.offerPanel) {
            this.offerPanel.active = true;
        }
    }

    public hideOffer(): void {
        if (this.offerPanel) {
            this.offerPanel.active = false;
        }
    }

    private hideAllPanels(): void {
        if (this.tutorialPanel) {
            this.tutorialPanel.active = false;
        }
        if (this.victoryPanel) {
            this.victoryPanel.active = false;
        }
        if (this.defeatPanel) {
            this.defeatPanel.active = false;
        }
        if (this.offerPanel) {
            this.offerPanel.active = false;
        }
    }

    private onTutorialTap(): void {
        if (this.gameStateController && this.gameStateController.isState(GameState.Tutorial)) {
            this.hideAllPanels();
            if (this.gameStateController) {
                this.gameStateController.transitionTo(GameState.Running);
            }
            this.node.emit('TutorialEnded');
        }
    }
}

