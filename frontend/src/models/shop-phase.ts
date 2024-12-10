import {GamePhase, PhaseState} from "./game-phase.js";
import {Pet} from "./pet.js";
import {FoodIDs, PetIDs} from "./enums.js";

/**
 * Shop phase class of the game. Individual phase.
 */
export class ShopPhase implements GamePhase {

    // State of the phase : "in_progress" or "finished"
    public state: PhaseState = PhaseState.InProgress;
    public pets: Pet[] = [];
    public food: FoodIDs[] = [];

    constructor(
        public game_id: string,
        public id: string,
        public start_time: Date,
        public available_time : number,
        public player_id: string,
        public money: number,
        public available_pets: Record<PetIDs, number>,
        public available_food: Record<FoodIDs, number>
    ) {}

    getStartTime() : Date {
        return this.start_time;
    }

    checkEndPhase() : boolean {
        return this.start_time.getTime() + this.available_time > Date.now();
    }

    /**
     *  Adds a pet to the pet table and retrieve one from the available pets in the shop
     * @param pet
     */
    buyPet(pet : PetIDs) : boolean {
        if (this.available_pets[pet] != null && this.available_pets[pet] > 0) {
            this.pets.push(new Pet(pet));
            this.available_pets[pet]--;
            return true;
        }

        return false;
    }

    /**
     *  Sells a pet from the table
     * @param petIndex Index of the pet in the table
     */
    sellPet(petIndex : number) : boolean {
        // TODO Implement the sell function
        console.log(petIndex);
        return true;
    }

    /**
     *  Adds a food ID to the food table and retrieve one from the available food in the shop
     * @param food
     */
    buyFood(food : FoodIDs) : boolean {
        if (this.available_food[food] != null && this.available_food[food] > 0) {
            this.food.push(food);
            this.available_food[food]--;
            return true;
        }

        return false;
    }
}