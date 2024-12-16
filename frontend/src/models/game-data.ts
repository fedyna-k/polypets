import {FoodIDs, PetIDs} from "./enums.js";
import {PetData} from "./pet-data.js";
import {Food} from "./food.js";

export class GameData {
    public static petData: Record<PetIDs, PetData> = {} as Record<PetIDs, PetData>;
    public static foodData: Record<FoodIDs, Food> = {} as Record<FoodIDs, Food>;

    static initializeData() {
        GameData.initializePetData();
        console.log("Initialized PetData");
        GameData.initializeFoodData();
        console.log("Initialized FoodData");
    }

    private static initializePetData(): void {
        GameData.petData[PetIDs.None] = new PetData(PetIDs.None, 0, 0);
        GameData.petData[PetIDs.Cow] = new PetData(PetIDs.Cow, 5, 2);
        GameData.petData[PetIDs.Pig] = new PetData(PetIDs.Pig, 4, 2);
        GameData.petData[PetIDs.Rat] = new PetData(PetIDs.Rat, 1, 1);
        GameData.petData[PetIDs.Goat] = new PetData(PetIDs.Goat, 3, 4);
        GameData.petData[PetIDs.Sheep] = new PetData(PetIDs.Sheep, 3, 2);
        GameData.petData[PetIDs.Chicken] = new PetData(PetIDs.Chicken, 1, 3);
    }

    private static initializeFoodData(): void {
        GameData.foodData[FoodIDs.None] = new Food(FoodIDs.None, 0, 0);
        GameData.foodData[FoodIDs.Banana] = new Food(FoodIDs.Banana, 0, 1);
        GameData.foodData[FoodIDs.Apple] = new Food(FoodIDs.Apple, 1, 0);
        GameData.foodData[FoodIDs.Coconut] = new Food(FoodIDs.Coconut, 1, 1);
        GameData.foodData[FoodIDs.SunFlouche] = new Food(FoodIDs.SunFlouche, 0, 0);
    }
}