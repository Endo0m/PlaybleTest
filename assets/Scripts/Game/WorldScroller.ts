import { _decorator, Component } from 'cc';
import { PauseService } from '../Core/PauseService';
import { GameStateController, GameState } from '../Core/GameStateController';

const { ccclass, property } = _decorator;

/**
 * Скроллер мира - двигает корневой узел мира влево с постоянной скоростью
 */
@ccclass('WorldScroller')
export class WorldScroller extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property
    public scrollSpeed: number = 420;

    private pauseService: PauseService = PauseService.instance;

    public update(deltaTime: number): void {
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) {
            return;
        }

        if (this.pauseService.isGamePaused()) {
            return;
        }

        const position = this.node.position;
        this.node.setPosition(position.x - this.scrollSpeed * deltaTime, position.y, position.z);
    }
}

