import { _decorator, Component, Sprite, Color } from 'cc';
import { PauseService } from '../Core/PauseService';

const { ccclass, property } = _decorator;

/**
 * Приемник урона для игрока - управляет здоровьем, неуязвимостью и миганием
 */
@ccclass('PlayerDamageReceiver')
export class PlayerDamageReceiver extends Component {
    @property
    public maxHealth: number = 3;

    @property
    public invulnerabilityDuration: number = 1.0;

    @property
    public blinkInterval: number = 0.1;

    @property
    public hurtClipName: string = 'hurt';

    @property({ type: Sprite })
    public playerSprite: Sprite | null = null;

    @property({ type: Animation })
    public animationComponent: Animation | null = null;

    private currentHealth: number = 3;
    private isInvulnerable: boolean = false;
    private invulnerabilityTimer: number = 0;
    private blinkTimer: number = 0;
    private originalColor: Color = new Color(255, 255, 255, 255);
    private pauseService: PauseService = PauseService.instance;

    public onLoad(): void {
        this.currentHealth = this.maxHealth;
        if (this.playerSprite) {
            this.originalColor = this.playerSprite.color.clone();
        }
    }

    public update(deltaTime: number): void {
        if (this.pauseService.isGamePaused()) {
            return;
        }

        if (!this.isInvulnerable) {
            return;
        }

        this.invulnerabilityTimer -= deltaTime;
        this.blinkTimer -= deltaTime;

        if (this.blinkTimer <= 0) {
            this.blinkTimer = this.blinkInterval;
            this.toggleBlink();
        }

        if (this.invulnerabilityTimer <= 0) {
            this.endInvulnerability();
        }
    }

    public takeDamage(amount: number): boolean {
        if (this.isInvulnerable || this.currentHealth <= 0) {
            return false;
        }

        this.currentHealth = Math.max(0, this.currentHealth - amount);

        console.log("damage");
        this.startInvulnerability();

        if (this.currentHealth <= 0) {
            this.onHealthDepleted();
        }

        return true;
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public isInvulnerableNow(): boolean {
        return this.isInvulnerable;
    }

    private startInvulnerability(): void {
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityDuration;
        this.blinkTimer = this.blinkInterval;
    }

    private endInvulnerability(): void {
        this.isInvulnerable = false;
        if (this.playerSprite) {
            this.playerSprite.color = this.originalColor.clone();
        }
    }

    private toggleBlink(): void {
        if (!this.playerSprite) {
            return;
        }

        if (this.playerSprite.color.r === 255) {
            this.playerSprite.color = new Color(255, 100, 100, 255);
        } else {
            this.playerSprite.color = this.originalColor.clone();
        }
    }

    private onHealthDepleted(): void {
        this.node.emit('PlayerDied');
    }
    
}

