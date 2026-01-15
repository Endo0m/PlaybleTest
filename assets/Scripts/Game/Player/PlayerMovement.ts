import { _decorator, Component, RigidBody2D, Vec2 } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {
    @property({ type: RigidBody2D })
    public rigidBody: RigidBody2D | null = null;

    @property
    public jumpImpulseY: number = 7.5;

    @property
    public forwardSpeed: number = 0;

    private stateMachine: GameStateMachine | null = null;
    private isGrounded: boolean = true;

    public initialize(stateMachine: GameStateMachine): void {
        this.stateMachine = stateMachine;
    }

    public tryJump(): void {
        if (!this.isGrounded || !this.stateMachine || !this.stateMachine.isGameplayActive()) {
            return;
        }

        if (this.rigidBody) {
            const currentVelocity = this.rigidBody.linearVelocity;
            this.rigidBody.linearVelocity = new Vec2(currentVelocity.x, 0);
            this.rigidBody.applyLinearImpulseToCenter(new Vec2(0, this.jumpImpulseY), true);
        }

        this.isGrounded = false;
    }

    public setGrounded(grounded: boolean): void {
        this.isGrounded = grounded;
    }

    public isPlayerGrounded(): boolean {
        return this.isGrounded;
    }
}

