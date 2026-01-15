import { _decorator, Component, Node } from 'cc';
import { GameStateController } from './GameStateController';
import { HealthSystem } from './HealthSystem';
import { WorldScroller } from './WorldScroller';
import { PlayerController } from '../Player/PlayerController';
import { HealthUI } from '../UI/HealthUI';
import { TapInput } from '../../Core/Input/TapInput';
import { GameTime } from '../../Core/Time/GameTime';
import { EnemyInitializer } from '../Obstacles/EnemyInitializer';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property({ type: GameStateController })
    public gameStateController: GameStateController | null = null;

    @property({ type: TapInput })
    public tapInput: TapInput | null = null;

    @property({ type: GameTime })
    public gameTime: GameTime | null = null;

    @property({ type: WorldScroller })
    public worldScroller: WorldScroller | null = null;

    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    @property({ type: HealthUI })
    public healthUI: HealthUI | null = null;

    @property({ type: EnemyInitializer })
    public enemyInitializer: EnemyInitializer | null = null;

    @property({ type: Node })
    public playerNode: Node | null = null;

    @property
    public maxHealth: number = 3;

    private healthSystem: HealthSystem | null = null;

    public onLoad(): void {
        if (!this.gameStateController) {
            console.error('GameBootstrap: GameStateController is required');
            return;
        }

        const stateMachine = this.gameStateController.getStateMachine();

        if (this.tapInput) {
            this.tapInput.initialize(stateMachine);
        }

        if (this.gameTime) {
            this.gameTime.initialize(stateMachine);
        }

        this.healthSystem = new HealthSystem(this.maxHealth);

        if (this.worldScroller) {
            this.worldScroller.initialize(stateMachine);
        }

        if (this.playerController && this.healthSystem) {
            this.playerController.initialize(stateMachine, this.healthSystem);
            
            if (this.tapInput) {
                this.tapInput.registerCallback(() => {
                    this.playerController?.tryJump();
                });
            }
        }

        if (this.healthUI) {
            this.healthUI.initialize(this.healthSystem);
        }

        if (this.enemyInitializer && this.playerNode) {
            this.enemyInitializer.initialize(stateMachine, this.playerNode);
        }
    }
}

