import { BattleTurnLog } from "./battle-turn-log.js";
import { GamePhase } from "./game-phase.js";
import { Pet } from "./pet.js";

/**
 * Battle phase class of the game. Automatic phase between two players.
 */
export class BattlePhase implements GamePhase {
    constructor(
        public game_id: string,
        public id: string,
        public state: string,
        public start_time: string,
        public turn_count: number,
        public max_turn_count: number = 999,
        public team0: Pet[],
        public team1: Pet[],
        public battle_state: string,
        public history: BattleTurnLog[]
    ) {}

    Serialize(): string {
        return "";
    }
}