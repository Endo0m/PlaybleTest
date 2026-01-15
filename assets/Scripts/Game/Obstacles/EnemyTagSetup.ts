import { _decorator, Component, Collider2D } from 'cc';
import { CollisionTags } from '../Systems/CollisionTags';

const { ccclass, property } = _decorator;

@ccclass('EnemyTagSetup')
export class EnemyTagSetup extends Component {
    @property({ type: Collider2D })
    public collider: Collider2D | null = null;

    public onLoad(): void {
        const collider = this.collider || this.node.getComponent(Collider2D);
        if (collider) {
            collider.tag = CollisionTags.Enemy;
        }
    }
}

