import { _decorator, Component, Node } from 'cc';
import { GameStateController, GameState } from '../../Core/GameStateController';
import { InputTapRouter, TapCallback } from '../../Core/InputTapRouter';

const { ccclass, property } = _decorator;

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

    private onTapTutorial: TapCallback | null = null;

    onLoad(): void {
        this.hideAllPanels();

        if (this.inputTapRouter) {
            this.onTapTutorial = this.onTutorialTap.bind(this);
            this.inputTapRouter.registerTapTutorial(this.onTapTutorial);
        }

        const scene = this.node.scene;
        if (scene) {
            scene.on('TutorialTriggered', this.showTutorial, this);
            scene.on('FinishTriggered', this.showVictory, this);
            scene.on('PlayerDied', this.showDefeat, this);
        }
    }

    onDestroy(): void {
        if (this.inputTapRouter && this.onTapTutorial) {
            this.inputTapRouter.unregisterTapTutorial(this.onTapTutorial);
        }

        const scene = this.node.scene;
        if (scene) {
            scene.off('TutorialTriggered', this.showTutorial, this);
            scene.off('FinishTriggered', this.showVictory, this);
            scene.off('PlayerDied', this.showDefeat, this);
        }
    }

    public showTutorial(): void {
        this.hideAllPanels();
        if (this.tutorialPanel) this.tutorialPanel.active = true;
    }

    public showVictory(): void {
        this.hideAllPanels();
        if (this.victoryPanel) this.victoryPanel.active = true;
    }

    public showDefeat(): void {
        this.hideAllPanels();
        if (this.defeatPanel) this.defeatPanel.active = true;
    }

    public showOffer(): void {
        if (this.offerPanel) this.offerPanel.active = true;
    }

    public hideOffer(): void {
        if (this.offerPanel) this.offerPanel.active = false;
    }

    private hideAllPanels(): void {
        if (this.tutorialPanel) this.tutorialPanel.active = false;
        if (this.victoryPanel) this.victoryPanel.active = false;
        if (this.defeatPanel) this.defeatPanel.active = false;
        if (this.offerPanel) this.offerPanel.active = false;
    }

    private onTutorialTap(): void {
        if (!this.gameStateController) return;

        if (this.gameStateController.isState(GameState.Tutorial)) {
            this.hideAllPanels();
            this.gameStateController.transitionTo(GameState.Running);
            this.node.scene?.emit('TutorialEnded');
        }
    }
}
