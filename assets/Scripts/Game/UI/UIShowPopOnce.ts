import { _decorator, Component, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIShowPopOnce')
export class UIShowPopOnce extends Component {
    @property
    public durationSeconds: number = 0.18;

    @property
    public startScale: number = 0.0;

    @property
    public endScale: number = 1.0;

    @property
    public delaySeconds: number = 0.0;

    @property
    public easing: string = 'backOut';

    private hasPlayedInCurrentEnable: boolean = false;

    onEnable(): void {
        this.play();
    }

    public play(): void {
        if (!this.node.activeInHierarchy) return;

        // Чтобы при повторных активациях (panel active false/true) проигрывалось снова — оставляем.
        // Если тебе нужно строго 1 раз за всю игру — добавим флаг на весь жизненный цикл.
        this.hasPlayedInCurrentEnable = true;

        const z = this.node.scale.z;
        this.node.setScale(this.startScale, this.startScale, z);

        tween(this.node)
            .delay(this.delaySeconds)
            .to(this.durationSeconds, { scale: new Vec3(this.endScale, this.endScale, z) }, { easing: this.easing as any })
            .start();
    }
}
