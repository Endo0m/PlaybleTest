import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { CollisionTags } from '../Systems/CollisionTags';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('TutorialTrigger')
export class TutorialTrigger extends Component {
    @property({ type: Collider2D })
    public triggerCollider: Collider2D | null = null;

    private triggered: boolean = false;

    public onLoad(): void {
        if (this.triggerCollider) {
            this.triggerCollider.on(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this);
        }
    }

    public onDestroy(): void {
        if (this.triggerCollider) {
            this.triggerCollider.off(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this);
        }
    }

    private onTriggerEnter(_selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (this.triggered) {
            return;
        }

        const tag = otherCollider.tag as number;
        if (tag === CollisionTags.Player) {
            this.triggered = true;
            GameEvents.instance.emit(GameEvents.TutorialTriggered);
        }
    }
}

