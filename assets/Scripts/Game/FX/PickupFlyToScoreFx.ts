import { _decorator, Component, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PickupFlyToScoreFx')
export class PickupFlyToScoreFx extends Component {
    @property
    public duration = 0.75;

    @property
    public rotateDegrees = 720;

    @property
    public arcHeight = 180;

    public playLocal(fromLocal: Vec3, targetLocal: Vec3): void {
        this.node.setPosition(fromLocal);
        this.node.setScale(.3, .3, .3);
        this.node.angle = 0;

        const start = fromLocal.clone();
        const end = targetLocal.clone();
        const mid = new Vec3(
            (start.x + end.x) * 0.5,
            Math.max(start.y, end.y) + this.arcHeight,
            0
        );

        const tProxy = { t: 0 };

        tween(tProxy)
            .to(this.duration, { t: 1 }, {
                easing: 'quadInOut',
                onUpdate: () => {
                    const t = tProxy.t;
                    const oneMinus = 1 - t;

                    const p0 = start.clone().multiplyScalar(oneMinus * oneMinus);
                    const p1 = mid.clone().multiplyScalar(2 * oneMinus * t);
                    const p2 = end.clone().multiplyScalar(t * t);

                    this.node.setPosition(p0.add(p1).add(p2));
                }
            })
            .start();

        tween(this.node)
            .parallel(
                tween(this.node).to(this.duration, { scale: new Vec3(0, 0, 1) }, { easing: 'quadIn' }),
                tween(this.node).by(this.duration, { angle: this.rotateDegrees })
            )
            .call(() => this.node.destroy())
            .start();
    }
}
