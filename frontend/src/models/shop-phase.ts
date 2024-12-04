import { GamePhase } from "./game-phase.js";

/**
 * Shop phase class of the game. Individual phase.
 */
export class ShopPhase implements GamePhase {
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