/**
 * Class representation of Food (buff objects).
 */
export class Food {
    constructor(
        public food_type: string,
        public life_buff: number,
        public damage_buff: number
    ) {}
}