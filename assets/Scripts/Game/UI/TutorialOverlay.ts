import { _decorator, Component, Node, Label, EventTouch } from 'cc';
import { GameStateController, GameState } from '../../Core/GameStateController';
import { PlayerController } from '../../Game/Player/PlayerController';

const { ccclass, property } = _decorator;

@ccclass('TutorialOverlay')
export class TutorialOverlay extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    @property({ type: Node })
    public overlayRoot: Node | null = null;

    @property({ type: Node })
    public tapCatcher: Node | null = null;

    @property({ type: Label })
    public tutorialTextLabel: Label | null = null;

    @property
    public startText: string = 'Tap to start';

    @property
    public triggerText: string = 'Tap to jump';

    @property
    public startVisible: boolean = true;

    private hasTriggeredTutorial = false;
    private isTriggeredMode = false;

    onLoad(): void {
        const root = this.overlayRoot ?? this.node;
        this.overlayRoot = root;

        if (this.tutorialTextLabel) {
            this.tutorialTextLabel.string = this.startText;
        }

        root.active = this.startVisible;

        this.node.scene?.on('TutorialTriggered', this.onTutorialTriggered, this);

        // В стартовом режиме не ловим тапы: старт игры делает InputTapRouter.
        this.setTapCatcherEnabled(false);
    }

    onDestroy(): void {
        this.node.scene?.off('TutorialTriggered', this.onTutorialTriggered, this);
        this.setTapCatcherEnabled(false);
    }

    /**
     * Дёргай из GameBootstrap при старте игры (по первому тапу),
     * чтобы скрыть стартовый оверлей.
     */
    public hideStart(): void {
        if (this.isTriggeredMode) return;
        this.hide();
    }

    private onTutorialTriggered(): void {
        if (this.hasTriggeredTutorial) return;
        this.hasTriggeredTutorial = true;

        this.isTriggeredMode = true;

        if (this.tutorialTextLabel) {
            this.tutorialTextLabel.string = this.triggerText;
        }

        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Tutorial);
        }

        this.show();

        // В триггерном режиме ловим тапы и глушим их, чтобы не ушли в InputTapRouter.
        this.setTapCatcherEnabled(true);
    }

    private show(): void {
        const root = this.overlayRoot ?? this.node;
        root.active = true;
    }

    private hide(): void {
        const root = this.overlayRoot ?? this.node;
        root.active = false;

        // После закрытия триггерного туториала перестаём ловить тапы.
        if (this.isTriggeredMode) {
            this.setTapCatcherEnabled(false);
        }
    }

    private setTapCatcherEnabled(enabled: boolean): void {
        const root = this.overlayRoot ?? this.node;
        const catcher = this.tapCatcher ?? root;

        if (enabled) {
            catcher.on(Node.EventType.TOUCH_START, this.onTriggeredTap, this, true);
        } else {
            catcher.off(Node.EventType.TOUCH_START, this.onTriggeredTap, this, true);
        }
    }

    private onTriggeredTap(event: EventTouch): void {
        // Ключевое: не даём тапу попасть в InputTapRouter,
        // иначе будет двойная логика (закрытие + прыжок/непрыжок).
        event.propagationStopped = true;

        // 1) Снимаем паузу
        if (this.gameStateController) {
            this.gameStateController.transitionTo(GameState.Running);
        }

        // 2) Закрываем панель
        this.hide();

        // 3) И сразу выполняем прыжок тем же тапом
        // (после transitionTo(Running), иначе tryJump откажется)
        this.playerController?.tryJump();

        this.node.scene?.emit('TutorialEnded');
    }
}
