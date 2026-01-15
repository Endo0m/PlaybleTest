import { _decorator } from 'cc';

const { ccclass } = _decorator;

/**
 * Простой сервис для управления паузой игры
 * Используется для остановки движения мира, врагов и игрока во время Tutorial/Victory/Defeat
 */
@ccclass('PauseService')
export class PauseService {
    public static readonly instance = new PauseService();

    private isPaused: boolean = false;

    private constructor() {}

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }

    public isGamePaused(): boolean {
        return this.isPaused;
    }
}

