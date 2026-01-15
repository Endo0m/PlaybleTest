import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { GameStateController, GameState } from '../Core/GameStateController';

const { ccclass, property } = _decorator;

/**
 * Зона триггера - для Tutorial и Finish триггеров
 * @property fields в Inspector:
 * - triggerType: 'Tutorial' | 'Finish' - тип триггера
 * - triggerCollider: Collider2D - коллайдер триггера (должен быть sensor)
 * - gameStateController: GameStateController - контроллер состояний
 * 
 * Теги коллайдера:
 * - TutorialTrigger: тег 5
 * - FinishTrigger: тег 4
 */
export enum TriggerType {
    Tutorial = 'Tutorial',
    Finish = 'Finish',
}

@ccclass('TriggerZone')
export class TriggerZone extends Component {
    @property({ type: String })
    public triggerType: string = TriggerType.Tutorial;

    @property({ type: Collider2D })
    public triggerCollider: Collider2D | null = null;

    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    private triggered: boolean = false;

    public onLoad(): void {
        const collider = this.triggerCollider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this);
        }
    }

    public onDestroy(): void {
        const collider = this.triggerCollider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this);
        }
    }

    private onTriggerEnter(_selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (this.triggered) {
            return;
        }

        if (otherCollider.tag !== 0) {
            return;
        }

        this.triggered = true;

        if (this.triggerType === TriggerType.Tutorial) {
            if (this.gameStateController) {
                this.gameStateController.transitionTo(GameState.Tutorial);
            }
            this.node.emit('TutorialTriggered');
        } else if (this.triggerType === TriggerType.Finish) {
            if (this.gameStateController) {
                this.gameStateController.transitionTo(GameState.Victory);
            }
            this.node.emit('FinishTriggered');
        }
    }
}

