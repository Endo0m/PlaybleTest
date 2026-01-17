import { _decorator, Component, Animation, AnimationClip, AnimationState } from 'cc';
import { GameStateController, GameState } from '../../Core/GameStateController';
import { PauseService } from '../../Core/PauseService';
import { GameEvents } from '../../Core/Events/GameEvents';

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
        this.animationComponent?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);

        GameEvents.instance.on(GameEvents.GameStarted, this.onGameStarted, this);
        GameEvents.instance.on(GameEvents.TutorialTriggered, this.onTutorialShown, this);
        GameEvents.instance.on(GameEvents.TutorialDismissed, this.onTutorialDismissed, this);

        this.node.on('PlayerJumped', this.onPlayerJumped, this);
        this.node.on('PlayerLanded', this.onPlayerLanded, this);
        this.node.on('PlayerHurt', this.onPlayerHurt, this);

        this.setMode(PlayerAnimationMode.Idle);
    }

    onDisable(): void {
        this.animationComponent?.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);

        GameEvents.instance.off(GameEvents.GameStarted, this.onGameStarted, this);
        GameEvents.instance.off(GameEvents.TutorialTriggered, this.onTutorialShown, this);
        GameEvents.instance.off(GameEvents.TutorialDismissed, this.onTutorialDismissed, this);

        this.node.off('PlayerJumped', this.onPlayerJumped, this);
        this.node.off('PlayerLanded', this.onPlayerLanded, this);
        this.node.off('PlayerHurt', this.onPlayerHurt, this);
    }

    private onGameStarted(): void {
        this.isGrounded = true;
        this.syncToCurrentGameState();
    }

    private onTutorialShown(): void {
        
        this.setMode(PlayerAnimationMode.Idle);
    }

    private onTutorialDismissed(): void {
        
        this.syncToCurrentGameState();
    }

    private onPlayerJumped(): void {
        
        this.isGrounded = false;

        
        if (this.activeMode === PlayerAnimationMode.Hurt) return;

        
        if (!this.isGameplayVisualsAllowed()) return;

        this.setMode(PlayerAnimationMode.Jump);
    }

    private onPlayerLanded(): void {
        
        this.isGrounded = true;

        if (this.activeMode === PlayerAnimationMode.Hurt) return;

        if (!this.isGameplayVisualsAllowed()) return;

        this.setMode(PlayerAnimationMode.Run);
    }

    private onPlayerHurt(): void {
        
        if (!this.isGameplayVisualsAllowed()) return;

        this.setMode(PlayerAnimationMode.Hurt);
    }

    private isGameplayVisualsAllowed(): boolean {
        if (this.pauseService.isGamePaused()) return false;
        if (!this.gameStateController) return false;
        return this.gameStateController.getCurrentState() === GameState.Running;
    }

    private syncToCurrentGameState(): void {
        const controller = this.gameStateController;
        if (!controller) {
            this.setMode(PlayerAnimationMode.Idle);
            return;
        }

        if (controller.getCurrentState() !== GameState.Running) {
            this.setMode(PlayerAnimationMode.Idle);
            return;
        }

        // Running
        if (this.pauseService.isGamePaused()) {
            this.setMode(PlayerAnimationMode.Idle);
            return;
        }

        this.setMode(this.isGrounded ? PlayerAnimationMode.Run : PlayerAnimationMode.Jump);
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
        if (!state) return;

        
        if (state.name !== this.hurtClipName) return;

        this.syncToCurrentGameState();
    }
}
