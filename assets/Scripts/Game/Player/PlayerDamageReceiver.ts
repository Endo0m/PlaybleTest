import { _decorator, Component, Sprite, Color } from 'cc';
import { PauseService } from '../../Core/PauseService';
import { GameEvents } from '../../Core/Events/GameEvents';
import { PlayerAnimationController } from './PlayerAnimationController';

const { ccclass, property } = _decorator;

@ccclass('PlayerDamageReceiver')
export class PlayerDamageReceiver extends Component {
    @property
    public maxHealth: number = 3;

    @property
    public invulnerabilityDuration: number = 1.0;

    @property
    public blinkInterval: number = 0.1;

    @property({ type: Sprite })
    public playerSprite: Sprite | null = null;

    @property({ type: PlayerAnimationController })
    public playerAnimationController: PlayerAnimationController | null = null;

    private currentHealth = 0;

    private invulnerabilityTimeRemaining = 0;
    private blinkTimeRemaining = 0;
    private blinkOn = false;

    private readonly originalColor: Color = new Color(255, 255, 255, 255);
    private readonly blinkColor: Color = new Color(255, 100, 100, 255);

    private readonly pauseService: PauseService = PauseService.instance;

    onLoad(): void {
        this.currentHealth = this.maxHealth;

        if (this.playerSprite) {
            const c = this.playerSprite.color;
            this.originalColor.set(c.r, c.g, c.b, c.a);
        }

        GameEvents.instance.emit(GameEvents.HealthChanged, this.currentHealth, this.maxHealth);
    }

    update(deltaTime: number): void {
        if (this.pauseService.isGamePaused()) return;
        if (this.invulnerabilityTimeRemaining <= 0) return;

        this.invulnerabilityTimeRemaining -= deltaTime;
        this.blinkTimeRemaining -= deltaTime;

        if (this.blinkTimeRemaining <= 0) {
            this.blinkTimeRemaining += this.blinkInterval;
            this.toggleBlink();
        }

        if (this.invulnerabilityTimeRemaining <= 0) {
            this.endInvulnerability();
        }
    }

    public takeDamage(amount: number): boolean {
        if (amount <= 0) return false;
        if (this.currentHealth <= 0) return false;
        if (this.isInvulnerable()) return false;

        this.currentHealth = Math.max(0, this.currentHealth - amount);

        this.node.emit('PlayerHurt');
        this.playerAnimationController?.node.emit('PlayerHurt');

        this.startInvulnerability();

        GameEvents.instance.emit(GameEvents.HealthChanged, this.currentHealth, this.maxHealth);

        if (this.currentHealth <= 0) {
            this.node.emit('PlayerDied');
        }

        return true;
    }

    public isInvulnerable(): boolean {
        return this.invulnerabilityTimeRemaining > 0;
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    private startInvulnerability(): void {
        this.invulnerabilityTimeRemaining = this.invulnerabilityDuration;
        this.blinkTimeRemaining = this.blinkInterval;
        this.blinkOn = false;
        this.applyColor(this.originalColor);
    }

    private endInvulnerability(): void {
        this.invulnerabilityTimeRemaining = 0;
        this.blinkTimeRemaining = 0;
        this.blinkOn = false;
        this.applyColor(this.originalColor);
    }

    private toggleBlink(): void {
        this.blinkOn = !this.blinkOn;
        this.applyColor(this.blinkOn ? this.blinkColor : this.originalColor);
    }

    private applyColor(color: Color): void {
        if (!this.playerSprite) return;
        this.playerSprite.color = color;
    }
}
