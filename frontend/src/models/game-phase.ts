/**
 * Base interface of a phase class for serialization.
 */
export interface GamePhase {
    game_id: string;
    id: string;
    state: string;
    start_time: string;

    Serialize(): string;
}