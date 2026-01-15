import { _decorator, Component, Node } from 'cc';
import { GameStateMachine } from '../../Core/StateMachine/GameStateMachine';
import { EnemyController } from './EnemyController';

const { ccclass, property } = _decorator;

@ccclass('EnemyInitializer')
export class EnemyInitializer extends Component {
    @property({ type: Node })
    public playerNode: Node | null = null;

    @property({ type: Node })
    public enemiesRoot: Node | null = null;

    private stateMachine: GameStateMachine | null = null;

    public initialize(stateMachine: GameStateMachine, playerNode: Node): void {
        this.stateMachine = stateMachine;
        this.playerNode = playerNode;

        if (this.enemiesRoot) {
            const enemies = this.enemiesRoot.children;
            for (const enemyNode of enemies) {
                const enemyController = enemyNode.getComponent(EnemyController);
                if (enemyController) {
                    enemyController.initialize(stateMachine, playerNode);
                }
            }
        }
    }
}

