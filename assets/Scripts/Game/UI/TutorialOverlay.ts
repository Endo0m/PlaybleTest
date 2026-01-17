import { _decorator, Component, Node, Label, input, Input, EventTouch, UIOpacity, Vec3 } from 'cc';
import { GameStateController, GameState } from '../../Core/GameStateController';
import { PlayerController } from '../../Game/Player/PlayerController';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('TutorialOverlay')
export class TutorialOverlay extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    @property({ type: Node })
    public overlayRoot: Node | null = null;

    @property({ type: Label })
    public tutorialTextLabel: Label | null = null;

    @property
    public startText: string = 'Tap to start';

    @property
    public triggerText: string = 'Tap to jump';

    @property
    public startVisible: boolean = true;

    private isTriggeredMode = false;
    private awaitingTriggeredTap = false;

    private getRoot(): Node {
        return this.overlayRoot ?? this.node;
    }

    onEnable(): void {
        GameEvents.instance.on(GameEvents.TutorialTriggered, this.onTutorialTriggered, this);

        if (this.tutorialTextLabel) {
            this.tutorialTextLabel.string = this.startText;
        }

        this.setVisible(this.startVisible);

        if (this.startVisible) {
            input.on(Input.EventType.TOUCH_START, this.onStartTap, this);
        }
    }

    onDisable(): void {
        GameEvents.instance.off(GameEvents.TutorialTriggered, this.onTutorialTriggered, this);
        input.off(Input.EventType.TOUCH_START, this.onStartTap, this);
        input.off(Input.EventType.TOUCH_START, this.onTriggeredTap, this);
    }

    /** Вызывается из GameBootstrap на старте, чтобы убрать стартовый оверлей. */
    public hideStart(): void {
        if (this.isTriggeredMode) return;

        this.setVisible(false);
        input.off(Input.EventType.TOUCH_START, this.onStartTap, this);
    }

    private onStartTap(_event: EventTouch): void {
        const controller = this.gameStateController;
        if (!controller) return;
        if (controller.getCurrentState() !== GameState.Waiting) return;

        controller.transitionTo(GameState.Running);
        GameEvents.instance.emit(GameEvents.GameStarted);

        this.setVisible(false);
        input.off(Input.EventType.TOUCH_START, this.onStartTap, this);
    }

    private onTutorialTriggered(): void {
        if (this.isTriggeredMode) return;

        this.isTriggeredMode = true;
        this.awaitingTriggeredTap = true;

        if (this.tutorialTextLabel) {
            this.tutorialTextLabel.string = this.triggerText;
        }

        this.gameStateController?.transitionTo(GameState.Tutorial);
        this.setVisible(true);

        input.off(Input.EventType.TOUCH_START, this.onTriggeredTap, this);
        input.on(Input.EventType.TOUCH_START, this.onTriggeredTap, this);
    }

    private onTriggeredTap(_event: EventTouch): void {
        if (!this.awaitingTriggeredTap) return;

        const controller = this.gameStateController;
        if (!controller) return;
        if (controller.getCurrentState() !== GameState.Tutorial) return;

        this.awaitingTriggeredTap = false;

        controller.transitionTo(GameState.Running);
        GameEvents.instance.emit(GameEvents.TutorialDismissed);

        this.setVisible(false);
        input.off(Input.EventType.TOUCH_START, this.onTriggeredTap, this);

        // Важно: прыжок должен случиться после перехода в Running.
        this.playerController?.tryJump();
    }

    private setVisible(visible: boolean): void {
        const root = this.getRoot();

        // Если root == this.node — не выключаем active (иначе component отключится).
        if (root === this.node) {
            const opacity = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
            opacity.opacity = visible ? 255 : 0;
            this.node.setScale(visible ? Vec3.ONE : new Vec3(0, 0, 1));
            return;
        }

        root.active = visible;
    }
}
