import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PanelsController')
export class PanelsController extends Component {
    @property({ type: Node })
    public victoryPanel: Node | null = null;

    @property({ type: Node })
    public defeatPanel: Node | null = null;

    @property({ type: Node })
    public offerPanel: Node | null = null;

    @property({ type: Node })
    public defeatFlashNode: Node | null = null;

    @property
    public defeatFlashDurationSeconds: number = 1.0;

    private defeatFlowToken: number = 0;

    onLoad(): void {
        this.hideAllPanels();

        const scene = this.node.scene;
        if (scene) {
            scene.on('FinishTriggered', this.showVictory, this);
            scene.on('PlayerDied', this.showDefeatFlow, this);
        }
    }

    onDestroy(): void {
        const scene = this.node.scene;
        if (scene) {
            scene.off('FinishTriggered', this.showVictory, this);
            scene.off('PlayerDied', this.showDefeatFlow, this);
        }
    }

    public showVictory(): void {
        this.defeatFlowToken++;

        this.hideAllPanels();
        if (this.victoryPanel) this.victoryPanel.active = true;

        // Если нужно — здесь можно emit событие для конфетти:
        this.node.scene?.emit('VictoryShown');
    }

    public showDefeatFlow(): void {
        this.defeatFlowToken++;
        const token = this.defeatFlowToken;

        this.hideAllPanels();

        if (this.defeatFlashNode) {
            this.defeatFlashNode.active = true;
        }

        // Через секунду скрываем flash и показываем панель
        this.scheduleOnce(() => {
            if (token !== this.defeatFlowToken) return;

            if (this.defeatFlashNode) this.defeatFlashNode.active = false;
            if (this.defeatPanel) this.defeatPanel.active = true;
        }, this.defeatFlashDurationSeconds);
    }

    public showOffer(): void {
        if (this.offerPanel) this.offerPanel.active = true;
    }

    public hideOffer(): void {
        if (this.offerPanel) this.offerPanel.active = false;
    }

    private hideAllPanels(): void {
        if (this.victoryPanel) this.victoryPanel.active = false;
        if (this.defeatPanel) this.defeatPanel.active = false;
        if (this.offerPanel) this.offerPanel.active = false;
        if (this.defeatFlashNode) this.defeatFlashNode.active = false;
    }
}
