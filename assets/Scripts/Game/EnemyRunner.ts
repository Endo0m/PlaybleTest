import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EnemyRunner')
export class EnemyRunner extends Component {
    @property({ type: Node })
    public target: Node | null = null;

    @property
    public speedUnitsPerSecond = 3;

    @property
    public runDurationSeconds = 2;

    @property
    public moveLeftOnly = true;

    private remainingSeconds = 0;
    private isRunning = false;
    private readonly temp = new Vec3();

    onEnable(): void {
        this.enabled = false;
    }

    public activateRun(): void {
        this.remainingSeconds = this.runDurationSeconds;
        this.isRunning = true;
        this.enabled = true;
    }

    update(deltaTime: number): void {
        if (!this.isRunning) return;

        this.remainingSeconds -= deltaTime;
        if (this.remainingSeconds <= 0) {
            this.isRunning = false;
            this.enabled = false;
            return;
        }

        if (this.target) {
            const enemyPos = this.node.worldPosition;
            const targetPos = this.target.worldPosition;

            this.temp.set(targetPos.x - enemyPos.x, targetPos.y - enemyPos.y, 0);
            this.temp.normalize();

            if (this.moveLeftOnly && this.temp.x > 0) {
                this.temp.x = -this.temp.x;
            }

            this.temp.multiplyScalar(this.speedUnitsPerSecond * deltaTime);
            this.node.translate(this.temp);
        } else {
            this.node.translate(new Vec3(-this.speedUnitsPerSecond * deltaTime, 0, 0));
        }
    }
}
