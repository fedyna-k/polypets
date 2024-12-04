export interface GamePhase {
    game_id: string;
    id: string;
    state: string;
    start_time: string;

    Serialize(): string;
}