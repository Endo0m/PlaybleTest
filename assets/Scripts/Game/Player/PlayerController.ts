import { _decorator, Component } from 'cc';
import { GameStateController } from '../../Core/GameStateController';
import { PauseService } from '../../Core/PauseService';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property
    public groundY: number = -220;

    @property
    public jumpVelocityPixelsPerSecond: number = 900;

    @property
    public gravityPixelsPerSecond2: number = 2600;

    private verticalVelocity = 0;
    private isGrounded = true;

    private readonly pauseService: PauseService = PauseService.instance;

    onLoad(): void {
        this.snapToGround();
    }

    update(deltaTime: number): void {
        if (this.pauseService.isGamePaused()) return;
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;
        if (this.isGrounded) return;

        this.verticalVelocity -= this.gravityPixelsPerSecond2 * deltaTime;

        const p = this.node.position;
        const nextY = p.y + this.verticalVelocity * deltaTime;

        if (nextY <= this.groundY) {
            this.node.setPosition(p.x, this.groundY, p.z);
            this.isGrounded = true;
            this.verticalVelocity = 0;
            this.node.emit('PlayerLanded');
            return;
        }

        this.node.setPosition(p.x, nextY, p.z);
    }

    public tryJump(): void {
        if (this.pauseService.isGamePaused()) return;
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;
        if (!this.isGrounded) return;

        this.isGrounded = false;
        this.verticalVelocity = this.jumpVelocityPixelsPerSecond;

        this.node.emit('PlayerJumped');
    }

    public isGroundedNow(): boolean {
        return this.isGrounded;
    }

    private snapToGround(): void {
        const p = this.node.position;
        this.node.setPosition(p.x, this.groundY, p.z);
        this.isGrounded = true;
        this.verticalVelocity = 0;
    }
}
