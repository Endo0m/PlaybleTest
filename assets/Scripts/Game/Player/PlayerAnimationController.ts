import {
  _decorator,
  Component,
  Animation,
  AnimationClip,
  AnimationState,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
} from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { GameState } from '../../Core/StateMachine/GameState';
import { GameEvents } from '../../Core/Events/GameEvents';
import { CollisionTags } from '../Systems/CollisionTags';

const { ccclass, property } = _decorator;

enum PlayerAnimationMode {
  Idle = 'Idle',
  Run = 'Run',
  Jump = 'Jump',
}

@ccclass('PlayerAnimationController')
export class PlayerAnimationController extends Component {
  @property({ type: Animation })
  public animationComponent: Animation | null = null;

  @property
  public idleClipName: string = 'idle';

  @property
  public runClipName: string = 'run';

  @property
  public jumpClipName: string = 'jump';

  @property({ type: Collider2D })
  public bodyCollider: Collider2D | null = null;

  private stateMachine: GameStateMachine | null = null;
  private isGrounded: boolean = false;
  private activeMode: PlayerAnimationMode = PlayerAnimationMode.Idle;

  public initialize(stateMachine: GameStateMachine): void {
    this.stateMachine = stateMachine;

    GameEvents.instance.on(GameEvents.GameStarted, this.onGameStarted, this);
    GameEvents.instance.on(GameEvents.GameStateChanged, this.onGameStateChanged, this);

    if (this.bodyCollider) {
      this.bodyCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.bodyCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  public onDestroy(): void {
    GameEvents.instance.off(GameEvents.GameStarted, this.onGameStarted, this);
    GameEvents.instance.off(GameEvents.GameStateChanged, this.onGameStateChanged, this);

    if (this.bodyCollider) {
      this.bodyCollider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.bodyCollider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    if (this.animationComponent) {
      this.animationComponent.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }
  }

  public start(): void {
    if (this.animationComponent) {
      this.animationComponent.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    this.setMode(PlayerAnimationMode.Idle);
  }

  public setGrounded(grounded: boolean): void {
    this.isGrounded = grounded;

    if (this.isGrounded && this.activeMode === PlayerAnimationMode.Jump) {
      if (this.stateMachine && this.stateMachine.isGameplayActive()) {
        this.setMode(PlayerAnimationMode.Run);
      }
    }
  }

  public triggerJump(): void {
    if (this.isGrounded) {
      this.setMode(PlayerAnimationMode.Jump);
    }
  }

  private onGameStarted(): void {
    if (this.stateMachine && this.stateMachine.isGameplayActive()) {
      this.setMode(PlayerAnimationMode.Run);
    }
  }

  private onGameStateChanged(_previousState: GameState, newState: GameState): void {
    if (newState === GameState.Ready || newState === GameState.Boot) {
      this.setMode(PlayerAnimationMode.Idle);
    } else if (newState === GameState.Running && this.isGrounded) {
      this.setMode(PlayerAnimationMode.Run);
    }
  }

  private setMode(nextMode: PlayerAnimationMode): void {
    if (this.activeMode === nextMode) {
      return;
    }

    this.activeMode = nextMode;

    switch (nextMode) {
      case PlayerAnimationMode.Idle:
        this.playWithWrapMode(this.idleClipName, AnimationClip.WrapMode.Loop);
        break;
      case PlayerAnimationMode.Run:
        this.playWithWrapMode(this.runClipName, AnimationClip.WrapMode.Loop);
        break;
      case PlayerAnimationMode.Jump:
        this.playWithWrapMode(this.jumpClipName, AnimationClip.WrapMode.Normal);
        break;
    }
  }

  private playWithWrapMode(clipName: string, wrapMode: AnimationClip.WrapMode): void {
    const animationComponent = this.animationComponent;
    if (!animationComponent) {
      return;
    }

    animationComponent.play(clipName);

    const state = animationComponent.getState(clipName);
    if (state) {
      state.wrapMode = wrapMode;
    }
  }

  private onAnimationFinished(_type: string, state: AnimationState): void {
    if (!this.stateMachine || !this.stateMachine.isGameplayActive()) {
      return;
    }

    if (state && state.name === this.jumpClipName) {
      if (this.isGrounded) {
        this.setMode(PlayerAnimationMode.Run);
      }
    }
  }

  private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
    if (selfCollider !== this.bodyCollider) {
      return;
    }

    const tag = otherCollider.tag as number;
    if (tag === CollisionTags.Ground) {
      this.setGrounded(true);
    }
  }

  private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
    if (selfCollider !== this.bodyCollider) {
      return;
    }

    const tag = otherCollider.tag as number;
    if (tag === CollisionTags.Ground) {
      this.setGrounded(false);
    }
  }
}

