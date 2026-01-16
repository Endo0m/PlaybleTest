import { _decorator, Component, Rect } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Hitbox2D')
export class Hitbox2D extends Component {
    @property
    public width = 80;

    @property
    public height = 120;

    @property
    public offsetX = 0;

    @property
    public offsetY = 0;

    private readonly rect = new Rect();

    public getWorldRect(): Rect {
        const p = this.node.worldPosition;
        this.rect.x = p.x + this.offsetX - this.width * 0.5;
        this.rect.y = p.y + this.offsetY - this.height * 0.5;
        this.rect.width = this.width;
        this.rect.height = this.height;
        return this.rect;
    }
}
