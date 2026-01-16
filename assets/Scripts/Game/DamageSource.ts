import { _decorator, Component } from 'cc';
import { CollisionWorld, Collidable, HitboxKind } from '../Core/CollisionWorld';
import { Hitbox2D } from '../Core/Hitbox2D';
import { PlayerDamageReceiver } from './Player/PlayerDamageReceiver';

const { ccclass, property } = _decorator;

@ccclass('DamageSourceAabb')
export class DamageSource extends Component implements Collidable {
    @property
    public damageAmount = 1;

    @property
    public disableAfterHit = true;

    @property({ type: Hitbox2D })
    public hitbox: Hitbox2D | null = null;

    @property({ type: CollisionWorld })
    public collisionWorld: CollisionWorld | null = null;

    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    public kind: HitboxKind = HitboxKind.Damage;

    private hasHit = false;

    onEnable(): void {
        if (!this.hitbox) {
            this.hitbox = this.node.getComponent(Hitbox2D);
        }

        if (!this.collisionWorld) {
            const scene = this.node.scene;
            this.collisionWorld = scene ? scene.getComponentInChildren(CollisionWorld) : null;
        }

        this.collisionWorld?.register(this);
    }

    onDisable(): void {
        this.collisionWorld?.unregister(this);
    }

    public isActive(): boolean {
        if (!this.node.activeInHierarchy) return false;
        if (this.disableAfterHit && this.hasHit) return false;
        return true;
    }

    public onHitPlayer(): void {
        if (this.disableAfterHit && this.hasHit) return;

        const receiver = this.playerDamageReceiver
            ?? this.node.scene?.getComponentInChildren(PlayerDamageReceiver)
            ?? null;

        if (!receiver) return;

        this.hasHit = true;
        receiver.takeDamage(this.damageAmount);

        if (this.disableAfterHit) {
            this.node.active = false;
        }
    }
}
