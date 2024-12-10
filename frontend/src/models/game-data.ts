import {FoodIDs, PetIDs} from "./enums.js";
import {PetData} from "./pet-data.js";
import {Food} from "./food.js";

export class GameData {
    public static petData: Record<PetIDs, PetData>;
    public static foodData: Record<FoodIDs, Food>;
}