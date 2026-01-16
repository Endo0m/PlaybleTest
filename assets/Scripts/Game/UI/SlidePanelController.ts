import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SlidePanelController')
export class SlidePanelController extends Component {
    @property({ type: Node })
    public panelNode: Node | null = null;

    @property
    public closedY: number = -900;

    @property
    public openedY: number = 0;

    @property
    public durationSeconds: number = 0.25;

    @property
    public startOpened: boolean = false;

    private isOpened: boolean = false;
    private activeTween: Tween<Node> | null = null;

    onLoad(): void {
        const panel = this.panelNode ?? this.node;
        this.panelNode = panel;

        this.isOpened = this.startOpened;

        const p = panel.position;
        panel.setPosition(p.x, this.isOpened ? this.openedY : this.closedY, p.z);

        panel.active = true;
    }

    public open(): void {
        this.setOpened(true);
    }

    public close(): void {
        this.setOpened(false);
    }

    public toggle(): void {
        this.setOpened(!this.isOpened);
    }

    public setOpened(opened: boolean): void {
        if (!this.panelNode) return;
        if (this.isOpened === opened) return;

        this.isOpened = opened;

        if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = null;
        }

        const panel = this.panelNode;
        const targetY = opened ? this.openedY : this.closedY;

        this.activeTween = tween(panel)
            .to(this.durationSeconds, { position: new Vec3(panel.position.x, targetY, panel.position.z) }, { easing: 'quadOut' })
            .call(() => {
                this.activeTween = null;
            })
            .start();
    }

    public isOpenedNow(): boolean {
        return this.isOpened;
    }
}
