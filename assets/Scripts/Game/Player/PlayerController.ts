import { _decorator, Component, RigidBody2D, Vec2, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { CollisionTags } from '../Systems/CollisionTags';
import { PlayerAnimationController } from './PlayerAnimationController';
import { PlayerMovement } from './PlayerMovement';
import { PlayerInvulnerability } from './PlayerInvulnerability';
import { HealthSystem } from '../Systems/HealthSystem';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ type: RigidBody2D })
    public rigidBody: RigidBody2D | null = null;

    @property({ type: Collider2D })
    public bodyCollider: Collider2D | null = null;

    @property({ type: PlayerAnimationController })
    public animationController: PlayerAnimationController | null = null;

    @property({ type: PlayerMovement })
    public movement: PlayerMovement | null = null;

    @property({ type: PlayerInvulnerability })
    public invulnerability: PlayerInvulnerability | null = null;

    private stateMachine: GameStateMachine | null = null;

    public initialize(stateMachine: GameStateMachine, healthSystem: HealthSystem): void {
        this.stateMachine = stateMachine;
        
        if (this.animationController) {
            this.animationController.initialize(stateMachine);
        }

        if (this.movement) {
            this.movement.initialize(stateMachine);
        }

        if (this.invulnerability) {
            this.invulnerability.initialize(healthSystem);
        }

        if (this.bodyCollider) {
            this.bodyCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.bodyCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    public onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (selfCollider !== this.bodyCollider) {
            return;
        }

        const tag = otherCollider.tag as number;
        if (tag === CollisionTags.Ground) {
            this.setGrounded(false);
        }
    }

    public onDestroy(): void {
        if (this.bodyCollider) {
            this.bodyCollider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.bodyCollider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    public tryJump(): void {
        if (!this.stateMachine || !this.stateMachine.isGameplayActive()) {
            return;
        }

        if (this.movement) {
            this.movement.tryJump();
        }

        if (this.animationController) {
            this.animationController.triggerJump();
        }
    }

    public setGrounded(isGrounded: boolean): void {
        if (this.animationController) {
            this.animationController.setGrounded(isGrounded);
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (selfCollider !== this.bodyCollider) {
            return;
        }

        const otherTag = otherCollider.tag as number;
        
        if (otherTag === CollisionTags.Ground) {
            this.setGrounded(true);
            return;
        }

        if (otherTag === CollisionTags.Enemy || otherTag === CollisionTags.Cone) {
            this.handleObstacleCollision();
        }
    }

    private handleObstacleCollision(): void {
        if (!this.invulnerability || this.invulnerability.isInvulnerableNow()) {
            return;
        }

        this.invulnerability.startInvulnerability();
    }
}

