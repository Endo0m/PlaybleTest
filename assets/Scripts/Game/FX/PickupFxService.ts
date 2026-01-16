import { _decorator, Component, Node, Prefab, instantiate, UITransform, Sprite, Vec3 } from 'cc';
import { PickupFlyToScoreFx } from './PickupFlyToScoreFx';

const { ccclass, property } = _decorator;

@ccclass('PickupFxService')
export class PickupFxService extends Component {
    @property({ type: Prefab })
    public fxPrefab: Prefab | null = null;

    @property({ type: Node })
    public fxLayer: Node | null = null;

    @property({ type: Node })
    public scoreTargetNode: Node | null = null;

    public playPickupFly(fromNode: Node): void {
        if (!this.fxPrefab || !this.fxLayer || !this.scoreTargetNode) {
            return;
        }

        const fxLayerTransform = this.fxLayer.getComponent(UITransform);
        if (!fxLayerTransform) {
            return;
        }

        const fromWorld = fromNode.worldPosition;
        const targetWorld = this.scoreTargetNode.worldPosition;

        const fromLocal = fxLayerTransform.convertToNodeSpaceAR(fromWorld);
        const targetLocal = fxLayerTransform.convertToNodeSpaceAR(targetWorld);

        const fxNode = instantiate(this.fxPrefab);
        fxNode.parent = this.fxLayer;
        fxNode.setSiblingIndex(this.fxLayer.children.length - 1);
        fxNode.setScale(1, 1, 1);
        fxNode.angle = 0;

        this.copyVisual(fromNode, fxNode);

        const fx = fxNode.getComponent(PickupFlyToScoreFx);
        if (!fx) {
            fxNode.destroy();
            return;
        }

        fx.playLocal(fromLocal, targetLocal);
    }

    private copyVisual(fromNode: Node, fxNode: Node): void {
        const fromSprite = fromNode.getComponent(Sprite);
        const fxSprite = fxNode.getComponent(Sprite);

        if (fromSprite && fxSprite) {
            fxSprite.spriteFrame = fromSprite.spriteFrame;
            fxSprite.sizeMode = fromSprite.sizeMode;
        }

        const fromUi = fromNode.getComponent(UITransform);
        const fxUi = fxNode.getComponent(UITransform);

        if (fromUi && fxUi) {
            fxUi.setContentSize(fromUi.contentSize);
        }
    }
}
