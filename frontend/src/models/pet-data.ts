import {PetIDs} from "./enums.js";

export class PetData {
    constructor(
        public species: PetIDs,
        public base_life: number,
        public base_damage: number
    ) {}
}