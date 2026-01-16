import { _decorator, Component } from 'cc';
import { CollisionWorld, Collidable, HitboxKind } from '../Core/CollisionWorld';
import { Hitbox2D } from '../Core/Hitbox2D';

const { ccclass, property } = _decorator;

export enum TriggerType {
    Tutorial = 'Tutorial',
    Finish = 'Finish',
}

@ccclass('TriggerZoneAabb')
export class TriggerZone extends Component implements Collidable {
    @property({ type: String })
    public triggerType: string = TriggerType.Tutorial;

    @property({ type: Hitbox2D })
    public hitbox: Hitbox2D | null = null;

    @property({ type: CollisionWorld })
    public collisionWorld: CollisionWorld | null = null;

    public kind: HitboxKind = HitboxKind.Trigger;

    private triggered = false;

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
        return this.node.activeInHierarchy && !this.triggered;
    }

    public onHitPlayer(): void {
        if (this.triggered) return;
        this.triggered = true;

        const scene = this.node.scene;
        if (!scene) return;

        if (this.triggerType === TriggerType.Tutorial) {
            scene.emit('TutorialTriggered');
        } else if (this.triggerType === TriggerType.Finish) {
            scene.emit('FinishTriggered');
        }
    }
}
