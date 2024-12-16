import {randomBytes} from "crypto";
import Cache from "./cache.js";
import {BattlePhase} from "../models/battle-phase.js";
import {Pet} from "../models/pet.js";
import {PetIDs} from "../models/enums.js";

function create(gameId: string) {
    const bytes = randomBytes(6);
    const randomId = bytes.toString("base64url");

    const battlePhase = new BattlePhase(gameId, randomId, 999,
        [new Pet(PetIDs.Cow), new Pet(PetIDs.Cow), new Pet(PetIDs.Cow), new Pet(PetIDs.Cow), new Pet(PetIDs.Cow)],
        [new Pet(PetIDs.Rat), new Pet(PetIDs.Rat), new Pet(PetIDs.Rat), new Pet(PetIDs.Rat), new Pet(PetIDs.Rat)]);

    battlePhase.setup();
    const battleSim = battlePhase.simulate();

    const cacheValue = {
        gameId: battlePhase.game_id,
        id: battlePhase.id,
        battleState: battleSim.result.toString(),
        winner: battleSim.winner.toString(),
        turnCount: battlePhase.turn_count.toString()
    };

    Cache.add({
        category: "battle",
        value: cacheValue
    });

    return cacheValue;
}

function find(gameId: string) {
    const params = {
        category: "battle",
        criteria: { gameId: gameId }
    };

    return Cache.find(params);
}

export default {
    create, find
};