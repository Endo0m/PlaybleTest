import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Пикап очков - собираемый предмет, который добавляет очки
 */
@ccclass('PickupScore')
export class PickupScore extends Component {
    @property
    public scoreAmount: number = 10;

    @property({ type: Collider2D })
    public collider: Collider2D | null = null;

    private collected: boolean = false;

    public onLoad(): void {
        const collider = this.collider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollect, this);
        }
    }

    public onDestroy(): void {
        const collider = this.collider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onCollect, this);
        }
    }

    private onCollect(_selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        if (this.collected) {
            return;
        }

        if (otherCollider.tag !== 0) {
            return;
        }

        this.collected = true;
        this.node.emit('PickupCollected', this.scoreAmount);
        this.node.active = false;
    }
}

