import { _decorator, Component, Node, Collider2D, Contact2DType, IPhysics2DContact, Vec3 } from 'cc';
import { PauseService } from '../Core/PauseService';

const { ccclass, property } = _decorator;

/**
 * Движение врага - активируется триггером и двигает врага влево к игроку
 */
@ccclass('EnemyMover')
export class EnemyMover extends Component {
    @property
    public moveSpeed: number = 300;

    @property
    public moveDuration: number = 2.0;

    @property({ type: Collider2D })
    public activationTrigger: Collider2D | null = null;

    @property
    public activationDistance: number = 500;

    @property({ type: Node })
    public playerNode: Node | null = null;

    private isActivated: boolean = false;
    private moveTimer: number = 0;
    private pauseService: PauseService = PauseService.instance;

    public onLoad(): void {
        if (this.activationTrigger) {
            this.activationTrigger.on(Contact2DType.BEGIN_CONTACT, this.onActivationTrigger, this);
        }
    }

    public onDestroy(): void {
        if (this.activationTrigger) {
            this.activationTrigger.off(Contact2DType.BEGIN_CONTACT, this.onActivationTrigger, this);
        }
    }

    public update(deltaTime: number): void {
        if (this.pauseService.isGamePaused()) {
            return;
        }

        if (!this.isActivated && this.playerNode && !this.activationTrigger) {
            const distance = Vec3.distance(this.node.position, this.playerNode.position);
            if (distance <= this.activationDistance) {
                this.activate();
            }
        }

        if (this.isActivated && this.moveTimer > 0) {
            this.moveTimer -= deltaTime;
            const position = this.node.position;
            this.node.setPosition(position.x - this.moveSpeed * deltaTime, position.y, position.z);
        }
    }

    private activate(): void {
        if (this.isActivated) {
            return;
        }

        this.isActivated = true;
        this.moveTimer = this.moveDuration;
    }

    private onActivationTrigger(_selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (otherCollider.tag === 0) {
            this.activate();
        }
    }
}

