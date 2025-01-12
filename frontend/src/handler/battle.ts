import {randomBytes} from "crypto";
import Cache from "./cache.js";
import {BattlePhase} from "../models/battle-phase.js";
import {Pet} from "../models/pet.js";
import {FoodIDs, PetIDs} from "../models/enums.js";
import {Food} from "../models/food.js";
import {GameData} from "../models/game-data.js";
import {io} from "../app.js";

interface BattleRequest {
    gameId: string;
    playerId: string;
    team: number[]; // Team of 5 pets
    food: number[]; // Food assigned to each pet
}

interface BattleState {
    gameId: string;
    players: {
        [playerId: string]: BattleRequest;
    };
    isReady: boolean; // True when both players have sent their requests
}

interface BattleSim {
    gameId: string,
    id: string,
    battleState: string,
    winner: string,
    turnCount: string
}

function storeBattleRequest(jsonData: BattleRequest) {
    const { gameId, playerId, team, food } = jsonData;

    if (team.length !== 5 || food.length !== 5) {
        throw new Error("Invalid team or food size. Both must contain exactly 5 elements.");
    }

    let battleState: BattleState;

    // Fetch existing game state or create a new one
    const battleStateQuery = Cache.find({
        category: "battle-state",
        criteria: { gameId }
    });

    if (battleStateQuery.length > 0 && battleStateQuery[0]) {
        battleState = battleStateQuery[0];
    } else {
        battleState = {
            gameId,
            players: {},
            isReady: false
        };
    }

    // Add the player's request
    battleState.players[playerId] = { gameId, playerId, team, food };

    // Check if both players are ready
    battleState.isReady = Object.keys(battleState.players).length === 2;

    // Save the updated state
    Cache.add({
        category: "battle-state",
        value: battleState
    });

    console.log(`Battle state updated: ${JSON.stringify(battleState)}`);

    if (battleState.isReady) {
        io.to(gameId).emit("send-battle-result", simulateBattle(gameId));
        return { state: "success", message: "Waiting for battle result." };
    }

    return { state: "success", message: "Waiting for the second player." };
}

function simulateBattle(gameId: string): BattleSim {
    const battleStateQuery = Cache.find({
        category: "battle-state",
        criteria: { gameId }
    });

    if (!battleStateQuery.length || !battleStateQuery[0]) {
        throw new Error("No valid battle state found in cache.");
    }

    const battleState = battleStateQuery[0];
    if (!battleState.isReady) {
        throw new Error("Battle state is not ready for simulation.");
    }

    const [player1, player2]: BattleRequest[] = Object.values(battleState.players);

    if (player1 == undefined || player2 === undefined) {
        throw new Error("Battle state is not ready for simulation: Not enough players.");
    }

    const team1: Pet[] = player1.team.map((id) => new Pet(id as PetIDs));
    const team2: Pet[]  = player2.team.map((id) => new Pet(id as PetIDs));
    const food1: Food[] = player1.food.map((id) => GameData.foodData[id as FoodIDs]);
    const food2: Food[]  = player2.food.map((id) => GameData.foodData[id as FoodIDs]);

    // Apply food buff for each Pet
    for (let i = 0; i < team1.length; i++) {
        if (!team1[i]!.isNullOrNone() && !food1[i]!.isNullOrNone()) {
            team1[i]!.addFood(food1[i]!);
            team1[i]!.applyFoodBuffs();
        }
    }

    for (let i = 0; i < team2.length; i++) {
        if (!team2[i]!.isNullOrNone() && !food2[i]!.isNullOrNone()) {
            team2[i]!.addFood(food2[i]!);
            team2[i]!.applyFoodBuffs();
        }
    }

    const battlePhase = new BattlePhase(
        gameId,
        randomBytes(6).toString("base64url"),
        999,
        team1,
        team2
    );

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
    storeBattleRequest,
    simulateBattle,
    find
};
