import {FoodIDs} from "./enums.js";

/**
 * Class representation of Food (buff objects).
 */
export class Food {
    constructor(
        public food_type: FoodIDs,
        private life_buff: number,
        private damage_buff: number
    ) {}

    get life() : number {
        return this.life_buff;
    }

    get damage() : number {
        return this.damage_buff;
    }

    isNullOrNone(): boolean {
        return this.food_type == FoodIDs.None;
    }
}