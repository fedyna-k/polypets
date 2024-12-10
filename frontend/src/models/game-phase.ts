/**
 * Base interface of a phase class for serialization.
 */
export interface GamePhase {
    game_id: string;
    id: string;
    // State of the phase : "in_progress" or "finished"
    state: PhaseState;
    start_time: Date;
}

export enum PhaseState {
    InProgress,
    Finished
}