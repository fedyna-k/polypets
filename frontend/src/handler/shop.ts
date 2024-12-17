import {randomBytes} from "crypto";
import Cache from "./cache.js";
import {FoodIDs, PetIDs} from "../models/enums.js";
import {ShopPhase} from "../models/shop-phase.js";

function create(gameId: string, playerId: string) {
    const bytes = randomBytes(6);
    const randomId = bytes.toString("base64url");
    const availablePets = {} as Record<PetIDs, number>;
    const time: number = 120 * 1000; /* 120 seconds */
    
    availablePets[PetIDs.Cow] = 1;
    availablePets[PetIDs.Pig] = 1;
    availablePets[PetIDs.Goat] = 1;
    availablePets[PetIDs.Rat] = 1;
    availablePets[PetIDs.Sheep] = 1;
    availablePets[PetIDs.Chicken] = 1;

    const availableFood = {} as Record<FoodIDs, number>;

    availableFood[FoodIDs.Apple] = 1;
    availableFood[FoodIDs.SunFlouche] = 1;
    availableFood[FoodIDs.Banana] = 1;
    availableFood[FoodIDs.Coconut] = 1;

    const shopPhase = new ShopPhase(gameId, randomId, time, playerId, 100, availablePets, availableFood);

    const cacheValue = {
        gameId: shopPhase.game_id,
        id: shopPhase.id,
        availablePets: shopPhase.available_pets,
        availableFood: shopPhase.available_food,
        start_time: shopPhase.start_time,
        time: shopPhase.available_time.toString()
    };

    Cache.add({
        category: "shop",
        value: cacheValue
    });

    // Delete data from cache after the maximum time
    setTimeout(() => {
        const params = {
            category: "shop",
            criteria: {gameId: gameId, id: randomId}
        };

        Cache.findRemove(params);
    }, time);

    return cacheValue;
}

function find(gameId: string) {
    const params = {
        category: "shop",
        criteria: { gameId: gameId }
    };

    return Cache.find(params);
}

export default {
    create, find
};