import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { HealthSystem } from '../Systems/HealthSystem';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('HealthUI')
export class HealthUI extends Component {
    @property({ type: [Node] })
    public heartNodes: Node[] = [];

    @property({ type: SpriteFrame })
    public fullHeartSprite: SpriteFrame | null = null;

    @property({ type: SpriteFrame })
    public emptyHeartSprite: SpriteFrame | null = null;

    private healthSystem: HealthSystem | null = null;

    public initialize(healthSystem: HealthSystem): void {
        this.healthSystem = healthSystem;
        GameEvents.instance.on(GameEvents.HealthChanged, this.onHealthChanged, this);
        this.updateDisplay();
    }

    public onDestroy(): void {
        GameEvents.instance.off(GameEvents.HealthChanged, this.onHealthChanged, this);
    }

    private onHealthChanged(currentHealth: number, maxHealth: number): void {
        this.updateDisplay();
    }

    private updateDisplay(): void {
        if (!this.healthSystem) {
            return;
        }

        const currentHealth = this.healthSystem.getCurrentHealth();
        const maxHealth = this.healthSystem.getMaxHealth();

        for (let i = 0; i < this.heartNodes.length; i++) {
            const heartNode = this.heartNodes[i];
            if (!heartNode) {
                continue;
            }

            const sprite = heartNode.getComponent('Sprite') as any;
            if (sprite && this.fullHeartSprite && this.emptyHeartSprite) {
                if (i < currentHealth) {
                    sprite.spriteFrame = this.fullHeartSprite;
                } else {
                    sprite.spriteFrame = this.emptyHeartSprite;
                }
            }

            heartNode.active = i < maxHealth;
        }
    }
}

