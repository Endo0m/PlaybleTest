import { _decorator, Component, Node } from 'cc';
import { GameEvents } from '../../Core/Events/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('HealthUI')
export class HealthUI extends Component {
    @property({ type: [Node] })
    public heartNodes: Node[] = [];

    @property
    public defaultMaxHealth: number = 3;

    private currentHealth: number = 0;
    private maxHealth: number = 0;

    onEnable(): void {
        GameEvents.instance.on(GameEvents.HealthChanged, this.onHealthChanged, this);

        // Если событие ещё не прилетало — покажем дефолт (обычно 3/3).
        // Как только система здоровья пришлёт реальное значение, UI обновится.
        if (this.maxHealth <= 0) {
            this.currentHealth = this.defaultMaxHealth;
            this.maxHealth = this.defaultMaxHealth;
            this.apply();
        }
    }

    onDisable(): void {
        GameEvents.instance.off(GameEvents.HealthChanged, this.onHealthChanged, this);
    }

    private onHealthChanged(currentHealth: number, maxHealth: number): void {
        this.currentHealth = Math.max(0, currentHealth);
        this.maxHealth = Math.max(0, maxHealth);
        this.apply();
    }

    private apply(): void {
        const current = this.currentHealth;
        const max = this.maxHealth;

        for (let i = 0; i < this.heartNodes.length; i++) {
            const heartNode = this.heartNodes[i];
            if (!heartNode) continue;

            // Сердце вообще существует (если max меньше количества нод)
            const exists = i < max;

            // Сердце видно, только если оно в пределах currentHealth
            const visible = i < current;

            heartNode.active = exists && visible;
        }
    }
}
