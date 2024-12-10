import { Food } from "./food.js";
import { PetIDs } from "./enums.js";
import {PetData} from "./pet-data.js";
import {GameData} from "./game-data.js";

/**
 * Class representation of a PolyPet Instance.
 */
export class Pet {

  public petData: PetData;
  private life: number = 0;
  private damage: number = 0;
  public max_life : number = 0;
  public max_damage: number = 0;
  private food: Food[] = [];

  constructor(public species: PetIDs) {
    this.petData = GameData.petData[species];

    this.max_life = this.petData.base_life;
    this.life = this.max_life;
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
    this.life = Math.min(Math.max(0, value), this.max_life);
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
  get isDead(): boolean {
    return this.totalLife <= 0;
  }

  /**
   * Adds food to the PolyPet
   * @param food 
   * @returns true if it has been correctly added
   */
  addFood(food: Food): boolean {
    if (this.food.length >= 2) {
      console.log(`Cannot add food: food limit reached.`);
      return false; // Limit set to 2 (might be changed later)
    }

    this.food.push(food);
    console.log(`Food ${food.food_type} added.`);
    this.applyFoodBuffs();  // Update buffed life and damage
    return true;
  }

  /**
   * Removes food to the PolyPet
   * @param food 
   * @returns true if it has been correctly removed
   */
  removeFood(food: Food): boolean {
    const index = this.food.indexOf(food);

    if (index === -1) {
      console.log(`Food ${food.food_type} not found.`);
      return false;
    }

    this.food.splice(index, 1);
    console.log(`Food ${food.food_type} removed.`);
    this.applyFoodBuffs();  // Update buffed life and damage
    return true;
  }

  /**
   * Apply the buffs of all the food to life and damage
   */
  applyFoodBuffs(): void {
    // Resets the life and damage to the base values
    this.life = this.petData.base_life;
    this.damage = this.petData.base_damage;

    // Apply each buff
    this.food.forEach((item: Food): void => {
      this.life += item.life;
      this.damage += item.damage;
    });

    console.log(
      `Buffs applied. Life: ${this.life}, Damage: ${this.damage}`
    );
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
