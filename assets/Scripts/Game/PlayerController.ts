import { _decorator, Component, Animation, AnimationClip, RigidBody2D, Vec2, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';
import { PauseService } from '../Core/PauseService';

const { ccclass, property } = _decorator;

/**
 * Контроллер игрока - управляет прыжком и переключением анимаций
 */
@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: Animation })
    public animationComponent: Animation | null = null;

    @property
    public idleClipName: string = 'idle';

    @property
    public runClipName: string = 'run';

    @property
    public jumpClipName: string = 'jump';

    @property({ type: RigidBody2D })
    public rigidBody: RigidBody2D | null = null;

    @property
    public jumpImpulseY: number = 7.5;

    @property({ type: Collider2D })
    public bodyCollider: Collider2D | null = null;

    @property
    public groundTag: number = 3;

    private isGrounded: boolean = false;
    private pauseService: PauseService = PauseService.instance;

    public onLoad(): void {
        if (this.bodyCollider) {
            this.bodyCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.bodyCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        if (this.animationComponent) {
            this.playAnimation(this.idleClipName, AnimationClip.WrapMode.Loop);
        }
    }

    public onDestroy(): void {
        if (this.bodyCollider) {
            this.bodyCollider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.bodyCollider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        this.node.off('GameStarted', this.onGameStarted, this);
        this.node.off('TutorialStarted', this.onTutorialStarted, this);
        this.node.off('TutorialEnded', this.onTutorialEnded, this);
    }

    public start(): void {
        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Waiting);
        }
        this.node.on('GameStarted', this.onGameStarted, this);
        this.node.on('TutorialStarted', this.onTutorialStarted, this);
        this.node.on('TutorialEnded', this.onTutorialEnded, this);
    }

    public onGameStarted(): void {
        if (this.animationComponent) {
            this.playAnimation(this.runClipName, AnimationClip.WrapMode.Loop);
        }
    }

    public onTutorialStarted(): void {
        if (this.animationComponent) {
            this.playAnimation(this.idleClipName, AnimationClip.WrapMode.Loop);
        }
    }

    public onTutorialEnded(): void {
        if (this.animationComponent) {
            this.playAnimation(this.runClipName, AnimationClip.WrapMode.Loop);
        }
    }

    public tryJump(): void {
        if (!this.isGrounded || this.pauseService.isGamePaused()) {
            return;
        }

        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) {
            return;
        }

        if (this.rigidBody) {
            const currentVelocity = this.rigidBody.linearVelocity;
            this.rigidBody.linearVelocity = new Vec2(currentVelocity.x, 0);
            this.rigidBody.applyLinearImpulseToCenter(new Vec2(0, this.jumpImpulseY), true);
        }

        if (this.animationComponent) {
            this.playAnimation(this.jumpClipName, AnimationClip.WrapMode.Normal);
        }

        this.isGrounded = false;
    }

    private playAnimation(clipName: string, wrapMode: AnimationClip.WrapMode): void {
        if (!this.animationComponent) {
            return;
        }

        this.animationComponent.play(clipName);
        const state = this.animationComponent.getState(clipName);
        if (state) {
            state.wrapMode = wrapMode;
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (selfCollider !== this.bodyCollider) {
            return;
        }

        if (otherCollider.tag === this.groundTag) {
            this.isGrounded = true;
            if (this.gameStateController && this.gameStateController.isGameplayActive()) {
                if (this.animationComponent) {
                    const currentState = this.animationComponent.getState(this.jumpClipName);
                    if (currentState && currentState.isPlaying) {
                        this.playAnimation(this.runClipName, AnimationClip.WrapMode.Loop);
                    }
                }
            }
        }
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (selfCollider !== this.bodyCollider) {
            return;
        }

        if (otherCollider.tag === this.groundTag) {
            this.isGrounded = false;
        }
    }
}

