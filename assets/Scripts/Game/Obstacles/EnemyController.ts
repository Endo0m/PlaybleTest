import { _decorator, Component, Node, Vec3, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { CollisionTags } from '../Systems/CollisionTags';

const { ccclass, property } = _decorator;

@ccclass('EnemyController')
export class EnemyController extends Component {
    @property({ type: Node })
    public playerNode: Node | null = null;

    @property
    public activationDistance: number = 500;

    @property
    public moveSpeed: number = 300;

    @property
    public moveDuration: number = 2.0;

    @property({ type: Collider2D })
    public activationTrigger: Collider2D | null = null;

    private stateMachine: GameStateMachine | null = null;
    private isActivated: boolean = false;
    private moveTimer: number = 0;
    private isMoving: boolean = false;

    public initialize(stateMachine: GameStateMachine, playerNode: Node): void {
        this.stateMachine = stateMachine;
        this.playerNode = playerNode;

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
        if (!this.stateMachine || !this.stateMachine.isGameplayActive()) {
            return;
        }

        if (!this.isActivated && this.playerNode) {
            const distance = Vec3.distance(this.node.position, this.playerNode.position);
            if (distance <= this.activationDistance) {
                this.activate();
            }
        }

        if (this.isMoving) {
            this.moveTimer -= deltaTime;
            const position = this.node.position;
            this.node.setPosition(position.x - this.moveSpeed * deltaTime, position.y, position.z);

            if (this.moveTimer <= 0) {
                this.isMoving = false;
            }
        }
    }

    private activate(): void {
        if (this.isActivated) {
            return;
        }

        this.isActivated = true;
        this.isMoving = true;
        this.moveTimer = this.moveDuration;
    }

    private onActivationTrigger(_selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        const tag = otherCollider.tag as number;
        if (tag === CollisionTags.Player) {
            this.activate();
        }
    }
}

