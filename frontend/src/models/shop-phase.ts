import {GamePhase, PhaseState} from "./game-phase.js";
import {Pet} from "./pet.js";
import {FoodIDs, PetIDs} from "./enums.js";
import {GameData} from "./game-data.js";

/**
 * Shop phase class of the game. Individual phase.
 */
export class ShopPhase implements GamePhase {

    private petPrice : number = 1;

    public start_time: number;

    // State of the phase : "in_progress" or "finished"
    public state: PhaseState = PhaseState.InProgress;
    public pets: Pet[] = [];
    public food: FoodIDs[] = [];

    constructor(
        public game_id: string,
        public id: string,
        public available_time : number,
        public player_id: string,
        public money: number,
        public available_pets: Record<PetIDs, number>,
        public available_food: Record<FoodIDs, number>
    ) {
        // Initialize the table with 'None' pets
        this.pets = [
            new Pet(PetIDs.None),
            new Pet(PetIDs.None),
            new Pet(PetIDs.None),
            new Pet(PetIDs.None),
            new Pet(PetIDs.None)
        ];
        // Initialize the food with 'None' food
        this.food = [
            FoodIDs.None,
            FoodIDs.None,
            FoodIDs.None,
            FoodIDs.None,
            FoodIDs.None
        ];

        this.start_time = Date.now();
    }

    /**
     * Get the start time of the shop phase
     */
    getStartTime() : number {
        return this.start_time;
    }

    /**
     * Checks if the shop phase should end server-wise
     */
    checkEndPhase() : boolean {
        return this.start_time + this.available_time > Date.now();
    }

    /**
     *  Adds a pet to the pet table and retrieve one from the available pets in the shop
     * @param pet
     */
    buyPet(pet : PetIDs, index : number) : boolean {
        if (this.available_pets[pet] != null && this.available_pets[pet] > 0) {
            this.pets[index] = new Pet(pet);
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
        if (this.pets[petIndex] != null) {
            this.money += this.petPrice;
            this.pets[petIndex] = new Pet(PetIDs.None);
            return true;
        }

        return false;
    }

    /**
     *  Adds a food ID to the food table and retrieve one from the available food in the shop
     * @param food
     */
    buyFood(food : FoodIDs, index : number) : boolean {
        if (this.available_food[food] != null && this.available_food[food] > 0) {
            this.food[index] = food;
            this.available_food[food]--;
            return true;
        }

        return false;
    }

    /**
     * Update the buff of all pets on the board (mostly for display)
     */
    updateFoodBuffs() : Pet[] {
        let i : number = 0;
        this.pets.forEach((p : Pet) => {
            if (p != null) {
                p.clearFood();

                const foodItem = this.food[i];
                if (foodItem !== null && foodItem !== undefined) {
                    p.addFood(GameData.foodData[foodItem]);
                }
                p.applyFoodBuffs();
                i++;
            }
        });

        return this.pets;
    }

    /**
     *  Get the battle-ready team from the Polypet shop
     */
    GetTeamCompacted(): Pet[] {
        // Filter out null elements or elements with species None
        const validPets : Pet[] = this.pets.filter(
            (pet : Pet): pet is Pet => (pet !== null && pet.species !== PetIDs.None)
        );

        // Ensure the resulting array has a length of 5 by filling with "None" pets
        while (validPets.length < 5) {
            validPets.push(new Pet(PetIDs.None));
        }

        return validPets;
    }
}