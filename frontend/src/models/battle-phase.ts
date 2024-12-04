import { GamePhase } from "./game-phase.js";

/**
 * Battle phase class of the game. Automatic phase between two players.
 */
export class BattlePhase implements GamePhase {
    constructor(
        public game_id: string,
        public id: string,
        public state: string,
        public start_time: string
    ) {}

    Serialize(): string {
        return "";
    }
}