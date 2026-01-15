import { _decorator, Component, Node } from 'cc';
import { GameEvents } from '../../Core/Events/GameEvents';
import { GameState } from '../../Core/StateMachine/GameState';

const { ccclass, property } = _decorator;

@ccclass('TutorialOverlay')
export class TutorialOverlay extends Component {
    @property({ type: Node })
    public overlayNode: Node | null = null;

    public onLoad(): void {
        GameEvents.instance.on(GameEvents.TutorialTriggered, this.show, this);
        GameEvents.instance.on(GameEvents.TutorialDismissed, this.hide, this);
        GameEvents.instance.on(GameEvents.GameStateChanged, this.onGameStateChanged, this);
        
        this.hide();
    }

    public onDestroy(): void {
        GameEvents.instance.off(GameEvents.TutorialTriggered, this.show, this);
        GameEvents.instance.off(GameEvents.TutorialDismissed, this.hide, this);
        GameEvents.instance.off(GameEvents.GameStateChanged, this.onGameStateChanged, this);
    }

    private show(): void {
        const node = this.overlayNode || this.node;
        node.active = true;
    }

    private hide(): void {
        const node = this.overlayNode || this.node;
        node.active = false;
    }

    private onGameStateChanged(_previousState: GameState, newState: GameState): void {
        if (newState === GameState.Tutorial) {
            this.show();
        } else {
            this.hide();
        }
    }
}

