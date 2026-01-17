import { _decorator, Component, Node } from 'cc';
import { ResultPanel, ResultType } from './ResultPanel';
import { ScoreView } from './ScoreView';
import { GameEvents } from '../../Core/Events/GameEvents';
import { PauseService } from '../../Core/PauseService';

const { ccclass, property } = _decorator;

@ccclass('PanelsController')
export class PanelsController extends Component {
    @property({ type: ResultPanel })
    public resultPanel: ResultPanel | null = null;

    @property({ type: ScoreView })
    public scoreView: ScoreView | null = null;

    @property({ type: Node })
    public defeatFlashNode: Node | null = null;

    @property
    public defeatFlashDurationSeconds: number = 1.0;

    private token = 0;
    private pauseService = PauseService.instance;

    onEnable(): void {
        GameEvents.instance.on(GameEvents.PlayerVictory, this.onVictory, this);
        GameEvents.instance.on(GameEvents.PlayerDied, this.onDefeat, this);
    }

    onDisable(): void {
        GameEvents.instance.off(GameEvents.PlayerVictory, this.onVictory, this);
        GameEvents.instance.off(GameEvents.PlayerDied, this.onDefeat, this);
    }

    private onVictory(): void {
        this.token++;
        this.pauseService.pause();

        const amount = this.scoreView?.getScore() ?? 0;
        this.resultPanel?.show(ResultType.Victory, amount);

        GameEvents.instance.emit('VictoryShown');
    }

    private onDefeat(): void {
        this.token++;
        const current = this.token;

        this.pauseService.pause();

        if (this.defeatFlashNode) {
            this.defeatFlashNode.active = true;
        }

        this.scheduleOnce(() => {
            if (current !== this.token) return;

            if (this.defeatFlashNode) {
                this.defeatFlashNode.active = false;
            }

            const amount = this.scoreView?.getScore() ?? 0;
            this.resultPanel?.show(ResultType.Defeat, amount);
        }, this.defeatFlashDurationSeconds);
    }
}
