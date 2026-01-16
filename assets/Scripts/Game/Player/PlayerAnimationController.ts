import { _decorator, Component, Animation, AnimationClip, AnimationState } from 'cc';
import { GameStateController } from '../../Core/GameStateController';
import { PauseService } from '../../Core/PauseService';

const { ccclass, property } = _decorator;

enum PlayerAnimationMode {
    Idle = 'Idle',
    Run = 'Run',
    Jump = 'Jump',
    Hurt = 'Hurt',
}

@ccclass('PlayerAnimationController')
export class PlayerAnimationController extends Component {
    @property({ type: Animation })
    public animationComponent: Animation | null = null;

    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property
    public idleClipName = 'idle';

    @property
    public runClipName = 'run';

    @property
    public jumpClipName = 'jump';

    @property
    public hurtClipName = 'hurt';

    private activeMode: PlayerAnimationMode = PlayerAnimationMode.Idle;
    private isGrounded = true;

    private readonly pauseService: PauseService = PauseService.instance;

    onEnable(): void {
        if (this.animationComponent) {
            this.animationComponent.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        }

        this.node.on('GameStarted', this.onGameStarted, this);
        this.node.on('TutorialStarted', this.onTutorialStarted, this);
        this.node.on('TutorialEnded', this.onTutorialEnded, this);

        this.node.on('PlayerJumped', this.onPlayerJumped, this);
        this.node.on('PlayerLanded', this.onPlayerLanded, this);
        this.node.on('PlayerHurt', this.onPlayerHurt, this);

        this.setMode(PlayerAnimationMode.Idle);
    }

    onDisable(): void {
        this.node.off('GameStarted', this.onGameStarted, this);
        this.node.off('TutorialStarted', this.onTutorialStarted, this);
        this.node.off('TutorialEnded', this.onTutorialEnded, this);

        this.node.off('PlayerJumped', this.onPlayerJumped, this);
        this.node.off('PlayerLanded', this.onPlayerLanded, this);
        this.node.off('PlayerHurt', this.onPlayerHurt, this);

        if (this.animationComponent) {
            this.animationComponent.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        }
    }

    private onGameStarted(): void {
        this.isGrounded = true;
        this.setMode(PlayerAnimationMode.Run);
    }

    private onTutorialStarted(): void {
        this.setMode(PlayerAnimationMode.Idle);
    }

    private onTutorialEnded(): void {
        if (this.gameStateController && this.gameStateController.isGameplayActive()) {
            this.setMode(this.isGrounded ? PlayerAnimationMode.Run : PlayerAnimationMode.Jump);
        }
    }

    private onPlayerJumped(): void {
        if (this.pauseService.isGamePaused()) return;
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;

        if (this.activeMode === PlayerAnimationMode.Hurt) return;

        this.isGrounded = false;
        this.setMode(PlayerAnimationMode.Jump);
    }

    private onPlayerLanded(): void {
        if (this.pauseService.isGamePaused()) return;
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;

        this.isGrounded = true;

        if (this.activeMode !== PlayerAnimationMode.Hurt) {
            this.setMode(PlayerAnimationMode.Run);
        }
    }

    private onPlayerHurt(): void {
        if (this.pauseService.isGamePaused()) return;
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;

        this.setMode(PlayerAnimationMode.Hurt);
    }

    private setMode(nextMode: PlayerAnimationMode): void {
        if (this.activeMode === nextMode) return;

        this.activeMode = nextMode;

        switch (nextMode) {
            case PlayerAnimationMode.Idle:
                this.play(this.idleClipName, AnimationClip.WrapMode.Loop);
                break;
            case PlayerAnimationMode.Run:
                this.play(this.runClipName, AnimationClip.WrapMode.Loop);
                break;
            case PlayerAnimationMode.Jump:
                this.play(this.jumpClipName, AnimationClip.WrapMode.Normal);
                break;
            case PlayerAnimationMode.Hurt:
                this.play(this.hurtClipName, AnimationClip.WrapMode.Normal);
                break;
        }
    }

    private play(clipName: string, wrapMode: AnimationClip.WrapMode): void {
        const anim = this.animationComponent;
        if (!anim) return;

        anim.play(clipName);

        const state = anim.getState(clipName);
        if (state) state.wrapMode = wrapMode;
    }

    private onAnimationFinished(_type: string, state: AnimationState): void {
        if (!this.gameStateController || !this.gameStateController.isGameplayActive()) return;
        if (!state) return;

        if (state.name === this.hurtClipName) {
            this.setMode(this.isGrounded ? PlayerAnimationMode.Run : PlayerAnimationMode.Jump);
        }
    }
}
