import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { PlayerDamageReceiver } from './PlayerDamageReceiver';

const { ccclass, property } = _decorator;

/**
 * Источник урона - компонент для врагов и конусов, которые наносят урон при контакте
 */
@ccclass('DamageSource')
export class DamageSource extends Component {
    @property
    public damageAmount: number = 1;

    @property({ type: Collider2D })
    public collider: Collider2D | null = null;

    public onLoad(): void {
        const collider = this.collider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    public onDestroy(): void {
        const collider = this.collider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null): void {
        const playerNode = otherCollider.node;
        const damageReceiver = playerNode.getComponent(PlayerDamageReceiver);
        
        if (damageReceiver) {
            damageReceiver.takeDamage(this.damageAmount);
            console.log("damage");
        }
    }
}

