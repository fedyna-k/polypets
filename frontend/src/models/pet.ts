import { Food } from "./food.js";

/**
 * Class representation of a PolyPet.
 */
export class Pet {
    constructor(
      public species: string,
      private base_life: number,
      private base_damage: number,
      private food: Food[],
      private life: number,
      private damage: number
    ) {
        this.life = this.base_life;
        this.damage = this.base_damage;
    }
  
    /**
     * Get the total life of the Polypet with buffs applied
     */
    get totalLife(): number {
        return this.life;
    }

    /**
     * Set the total life of the Polypet with buffs applied
     */
    set totalLife(value: number) {
        this.life = Math.max(0, value);
    }
    
    /**
     * Get the attack damage of the PolyPet with buffs applied.
     */
    get totalDamage(): number {
      return this.damage;
    }

    /**
     * Check if the PolyPet has 0 HP
     */
    get isFainted(): boolean {
        return this.totalLife <= 0;
    }

    /**
     * Adds food to the PolyPet
     * @param food 
     * @returns true if it has been correctly added
     */
    addFood(food: Food): boolean {
        // TODO check if there the food limit is reached
        // TODO add the food to the array
        console.log(`Food ${food} added.`)
        return true;
    }

    /**
     * Removes food to the PolyPet
     * @param food 
     * @returns true if it has been correctly removed
     */
    removeFood(food: Food): boolean {
        // TODO check if the food can be removed
        // TODO remove the food from the array
        console.log(`Food ${food} removed.`)
        return true;
    }

    /**
     * Apply the buffs of all the food to life and damage
     */
    applyFoodBuffs(): void {
        // TODO apply the buffs of all the food to life and damage
    }

    /**
     * Applies the damage to the PolyPet.
     * HP can't be negative.
     * @param damage : amount of damage taken
     */
    applyDamage(damage: number): void {
        this.totalLife = this.life - damage;
      }
  }