import { GamePhase } from "./game-phase.js";
import { Pet } from "./pet.js";
import { Food } from "./food.js";

/**
 * Shop phase class of the game. Individual phase.
 */
export class ShopPhase implements GamePhase {
    constructor(
        public game_id: string,
        public id: string,
        public state: string,
        public start_time: string,
        public player_id: string,
        public money: number,
        public pets: Pet[],
        public food: Food[],
        public available_pets: Pet[],
        public available_food: Food[]
    ) {}

    Serialize(): string {
        return "";
    }
}