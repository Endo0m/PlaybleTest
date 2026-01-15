import { _decorator, Component, Node } from 'cc';
import { PlayerDamageReceiver } from '../Game/PlayerDamageReceiver';

const { ccclass, property } = _decorator;

/**
 * Отображение здоровья - показывает сердечки на основе текущего здоровья
 * 
 * Где добавить: на ноде HealthUI (родитель сердечек)
 * 
 * @property fields в Inspector:
 * - heartNodes: Node[] - массив нод сердечек (3 элемента)
 * - playerDamageReceiver: PlayerDamageReceiver - компонент урона игрока
 */
@ccclass('HealthView')
export class HealthView extends Component {
    @property({ type: [Node] })
    public heartNodes: Node[] = [];

    @property({ type: PlayerDamageReceiver })
    public playerDamageReceiver: PlayerDamageReceiver | null = null;

    public onLoad(): void {
        this.updateDisplay();
    }

    public start(): void {
        this.updateDisplay();
    }

    public updateDisplay(): void {
        if (!this.playerDamageReceiver) {
            return;
        }

        const currentHealth = this.playerDamageReceiver.getCurrentHealth();

        for (let i = 0; i < this.heartNodes.length; i++) {
            const heartNode = this.heartNodes[i];
            if (heartNode) {
                heartNode.active = i < currentHealth;
            }
        }
    }
}

