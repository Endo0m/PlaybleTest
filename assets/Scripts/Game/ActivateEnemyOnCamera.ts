import { _decorator, Component, Camera, UITransform, Vec3, view } from 'cc';
import { EnemyRunner } from './EnemyRunner';

const { ccclass, property } = _decorator;

@ccclass('ActivateEnemyOnCamera')
export class ActivateEnemyOnCamera extends Component {
    @property({ type: Camera })
    public camera: Camera | null = null;

    @property({ type: EnemyRunner })
    public enemyRunner: EnemyRunner | null = null;

    @property
    public screenMarginPixels = 100;

    private activated = false;
    private readonly temp = new Vec3();

    onEnable(): void {
        if (!this.enemyRunner) this.enemyRunner = this.getComponent(EnemyRunner);
    }

    update(): void {
        if (this.activated) return;
        if (!this.camera || !this.enemyRunner) return;

        const uiTransform = this.node.getComponent(UITransform);
        const worldPos = uiTransform ? uiTransform.convertToWorldSpaceAR(this.temp.set(0, 0, 0)) : this.node.worldPosition;

        this.camera.worldToScreen(worldPos, this.temp);

        const visibleSize = view.getVisibleSize();
        const x = this.temp.x;
        const y = this.temp.y;

        const m = this.screenMarginPixels;
        const inView =
            x >= -m &&
            x <= visibleSize.width + m &&
            y >= -m &&
            y <= visibleSize.height + m;

        if (!inView) return;

        this.activated = true;
        this.enemyRunner.activateRun();
        this.enabled = false;
    }
}
