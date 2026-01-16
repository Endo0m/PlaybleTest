import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Пульсация UI элемента - плавно масштабирует элемент вверх/вниз для привлечения внимания
 * 
 * Где добавить: на любой UI ноде, которую нужно анимировать (например, кнопка)
 * 
 * @property fields в Inspector:
 * - pulseScale: number - максимальный масштаб при пульсации (например, 1.2)
 * - pulseSpeed: number - скорость пульсации (например, 2.0)
 * - pulseEnabled: boolean - включена ли пульсация (по умолчанию true)
 */
@ccclass('UIPulseScale')
export class UIPulseScale extends Component {
    @property
    public pulseScale: number = 1.2;

    @property
    public pulseSpeed: number = 2.0;

    @property
    public pulseEnabled: boolean = true;

    private baseScale: Vec3 = new Vec3(1, 1, 1);
    private time: number = 0;

    public onLoad(): void {
        this.baseScale = this.node.scale.clone();
    }

    public update(deltaTime: number): void {
        if (!this.pulseEnabled || !this.enabled) {
            return;
        }

        this.time += deltaTime * this.pulseSpeed;
        const scale = 1.0 + (this.pulseScale - 1.0) * (Math.sin(this.time) * 0.5 + 0.5);
        const newScale = this.baseScale.clone().multiplyScalar(scale);
        this.node.setScale(newScale);
    }
}

