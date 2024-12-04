import { BattleTurnLog } from "./battle-turn-log.js";
import { GamePhase } from "./game-phase.js";
import { Pet } from "./pet.js";

/**
 * Battle phase class of the game. Automatic phase between two players.
 */
export class BattlePhase implements GamePhase {
    constructor(
        // Identifier of the game
        public game_id: string,
        // Identifier of the battle
        public id: string,
        // State of the phase : "in_progress" or "finished"
        public state: string,
        // Start date of the battle
        public start_time: string,
        // Number of turns the battle lasted
        public turn_count: number,
        // Max number of turns the battle can last
        public max_turn_count: number = 999,
        // Team of the first player
        public team0: Pet[],
        // Team of the second player
        public team1: Pet[],
        // State of the battle : "win" or "draw"
        public battle_state: string,
        // History of the events occurred during the battle
        public history: BattleTurnLog[]
    ) {}

    /**
     * Set up the battle and check the validity
     */
    setup(): void {

    }

    /**
     * Calculates one turn of the battle
     */
    resolveTurn(): BattleTurnLog {
        return new BattleTurnLog();
    }

    end(): void {

    }

    simulate(): BattleTurnLog[] {

        do {
            this.history.push(this.resolveTurn());
            this.turn_count++;
        }
        while (this.checkEndBattle());

        return this.history;
    }

    /**
     * Checks if the battle should end next turn
     * @return true if the battle should end
     */
    checkEndBattle(): boolean {
        // Check if the battle has exceeded the maximum allowed duration
        if (this.turn_count >= this.max_turn_count) {
            this.state = "finished";
            this.battle_state = "draw";
            return true;
        }
        // Check if Team 2 wins
        if (this.countPetsAlive(this.team0) == 0 && this.countPetsAlive(this.team1) > 0) {
            this.state = "finished";
            this.battle_state = "win";
            return true;
        }
        // Check if Team 1 wins
        else if (this.countPetsAlive(this.team1) == 0 && this.countPetsAlive(this.team0) > 0) {
            this.state = "finished";
            this.battle_state = "win";
            return true;
        }
        // Check if both Team 1 and Team 2 are all fainted
        else if (this.countPetsAlive(this.team0) == 0 && this.countPetsAlive(this.team1) == 0) {
            this.state = "finished";
            this.battle_state = "draw";
            return true;
        }

        // Otherwise the battle continues
        return false;
    }

    /**
     * Counts the number of pet alive in a team
     * @param team
     */
    countPetsAlive(team: Pet[]): number {
        let count = 0;

        // Count non fainted pets in the team
        team.forEach((pet: Pet): void => {
            if (pet.isFainted) {
                count++;
            }
        });

        return count;
    }

    Serialize(): string {
        return "";
    }
}