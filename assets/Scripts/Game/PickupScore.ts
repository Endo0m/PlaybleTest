import { _decorator, Component } from 'cc';
import { CollisionWorld, Collidable, HitboxKind } from '../Core/CollisionWorld';
import { Hitbox2D } from '../Core/Hitbox2D';
import { GameEvents } from '../Core/Events/GameEvents';
import { PickupFxService } from '../../Scripts/Game/FX/PickupFxService';

const { ccclass, property } = _decorator;

@ccclass('PickupScoreAabb')
export class PickupScore extends Component implements Collidable {
    @property
    public scoreAmount = 10;

    @property({ type: Hitbox2D })
    public hitbox: Hitbox2D | null = null;

    @property({ type: CollisionWorld })
    public collisionWorld: CollisionWorld | null = null;

    @property({ type: PickupFxService })
    public pickupFxService: PickupFxService | null = null;

    public kind: HitboxKind = HitboxKind.Pickup;

    private collected = false;

    onEnable(): void {
        if (!this.hitbox) {
            this.hitbox = this.node.getComponent(Hitbox2D);
        }

        if (!this.collisionWorld) {
            const scene = this.node.scene;
            this.collisionWorld = scene ? scene.getComponentInChildren(CollisionWorld) : null;
        }

        this.collisionWorld?.register(this);

        if (!this.pickupFxService) {
            const scene = this.node.scene;
            this.pickupFxService = scene ? scene.getComponentInChildren(PickupFxService) : null;
        }
    }

    onDisable(): void {
        this.collisionWorld?.unregister(this);
    }

    public isActive(): boolean {
        return this.node.activeInHierarchy && !this.collected;
    }

    public onHitPlayer(): void {
        if (this.collected) return;
        this.collected = true;

        this.pickupFxService?.playPickupFly(this.node);

        GameEvents.instance.emit(GameEvents.PickupCollected, this.scoreAmount);

        this.node.active = false;
    }
}
