import { _decorator, Component, Node } from 'cc';
import { GameEvents } from '../../Core/Events/GameEvents';
import { GameState } from '../../Core/StateMachine/GameState';

const { ccclass, property } = _decorator;

@ccclass('DefeatPanel')
export class DefeatPanel extends Component {
    @property({ type: Node })
    public panelNode: Node | null = null;

    public onLoad(): void {
        GameEvents.instance.on(GameEvents.PlayerDied, this.show, this);
        GameEvents.instance.on(GameEvents.GameStateChanged, this.onGameStateChanged, this);
        
        this.hide();
    }

    public onDestroy(): void {
        GameEvents.instance.off(GameEvents.PlayerDied, this.show, this);
        GameEvents.instance.off(GameEvents.GameStateChanged, this.onGameStateChanged, this);
    }

    private show(): void {
        const node = this.panelNode || this.node;
        node.active = true;
    }

    private hide(): void {
        const node = this.panelNode || this.node;
        node.active = false;
    }

    private onGameStateChanged(_previousState: GameState, newState: GameState): void {
        if (newState === GameState.Defeat) {
            this.show();
        } else {
            this.hide();
        }
    }
}

