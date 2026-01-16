import { EventTarget } from 'cc';

export class GameEvents {
    public static readonly instance = new EventTarget();

    public static readonly GameStateChanged = 'GameStateChanged';
    public static readonly HealthChanged = 'HealthChanged';
    public static readonly PlayerDied = 'PlayerDied';
    public static readonly PlayerVictory = 'PlayerVictory';
    public static readonly PlayerDamaged = 'PlayerDamaged';
    public static readonly PickupCollected = 'PickupCollected';

    public static readonly TutorialTriggered = 'TutorialTriggered';
    public static readonly TutorialDismissed = 'TutorialDismissed';
    public static readonly GameStarted = 'GameStarted';
    public static readonly GamePaused = 'GamePaused';
    public static readonly GameResumed = 'GameResumed';
}





