import { GameEvents } from '../../Core/Events/GameEvents';

export class HealthSystem {
    private currentHealth: number;
    private maxHealth: number;

    constructor(maxHealth: number) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public takeDamage(amount: number): boolean {
        if (this.currentHealth <= 0) {
            return false;
        }

        this.currentHealth = Math.max(0, this.currentHealth - amount);
        GameEvents.instance.emit(GameEvents.HealthChanged, this.currentHealth, this.maxHealth);
        GameEvents.instance.emit(GameEvents.PlayerDamaged, this.currentHealth);

        if (this.currentHealth <= 0) {
            GameEvents.instance.emit(GameEvents.PlayerDied);
        }

        return true;
    }

    public isAlive(): boolean {
        return this.currentHealth > 0;
    }

    public reset(): void {
        this.currentHealth = this.maxHealth;
        GameEvents.instance.emit(GameEvents.HealthChanged, this.currentHealth, this.maxHealth);
    }
}





