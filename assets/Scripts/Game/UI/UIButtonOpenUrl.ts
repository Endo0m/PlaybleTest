import { _decorator, Component, Button, EventHandler } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Кнопка открытия URL - открывает указанный URL в новой вкладке браузера
 * 
 * Где добавить: на ноде Button (кнопка в OfferPanel)
 * 
 * @property fields в Inspector:
 * - url: string - URL для открытия (например, "https://example.com")
 * - button: Button - компонент Button (или оставить null для авто-поиска)
 */
@ccclass('UIButtonOpenUrl')
export class UIButtonOpenUrl extends Component {
    @property
    public url: string = '';

    @property({ type: Button })
    public button: Button | null = null;

    public onLoad(): void {
        const button = this.button || this.node.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }

    public onDestroy(): void {
        const button = this.button || this.node.getComponent(Button);
        if (button) {
            button.node.off(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }

    private onButtonClick(): void {
        if (this.url) {
            if (typeof window !== 'undefined' && window.open) {
                window.open(this.url, '_blank');
            }
        }
    }
}





