import { _decorator, Component, Rect } from 'cc';
import { PauseService } from './PauseService';
import { GameStateController } from './GameStateController';
import { Hitbox2D } from './Hitbox2D';

const { ccclass, property } = _decorator;

export enum HitboxKind {
    Damage = 1,
    Trigger = 2,
    Pickup = 3,
}

export interface Collidable {
    hitbox: Hitbox2D;
    kind: HitboxKind;

    isActive?(): boolean;
    onHitPlayer(): void;
}

@ccclass('CollisionWorld')
export class CollisionWorld extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: Hitbox2D })
    public playerHitbox: Hitbox2D | null = null;

    private readonly pauseService: PauseService = PauseService.instance;

    private readonly collidables: Collidable[] = [];
    private readonly playerRect = new Rect();
    private readonly otherRect = new Rect();

    public register(collidable: Collidable): void {
        if (this.collidables.indexOf(collidable) === -1) {
            this.collidables.push(collidable);
        }
    }

    public unregister(collidable: Collidable): void {
        const index = this.collidables.indexOf(collidable);
        if (index !== -1) {
            this.collidables.splice(index, 1);
        }
    }

    update(): void {
        if (this.pauseService.isGamePaused()) {
            return;
        }

        if (this.gameStateController && !this.gameStateController.isGameplayActive()) {
            return;
        }

        if (!this.playerHitbox) {
            return;
        }

        const p = this.playerHitbox.getWorldRect();
        this.playerRect.set(p.x, p.y, p.width, p.height);

        for (let i = 0; i < this.collidables.length; i++) {
            const c = this.collidables[i];

            if (!c) continue;
            if (c.isActive && !c.isActive()) continue;
            if (!c.hitbox) continue;

            const o = c.hitbox.getWorldRect();
            this.otherRect.set(o.x, o.y, o.width, o.height);

            if (!this.playerRect.intersects(this.otherRect)) {
                continue;
            }

            c.onHitPlayer();
        }
    }
}
