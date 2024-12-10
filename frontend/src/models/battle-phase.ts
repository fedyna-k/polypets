import {BattleTurnLog} from "./battle-turn-log.js";
import {GamePhase, PhaseState} from "./game-phase.js";
import {Pet} from "./pet.js";

enum BattleState {
    Win,
    Draw
}

/**
 * Battle phase class of the game. Automatic phase between two players.
 */
export class BattlePhase implements GamePhase {
    // State of the phase : "in_progress" or "finished"
    public state: PhaseState = PhaseState.InProgress;
    // Number of turns the battle lasted
    public turn_count: number = 0;
    // History of the events occurred during the battle
    public history: BattleTurnLog[] = [];
    // State of the battle : "win" or "draw"
    public battle_state: BattleState = BattleState.Draw;
    // Current index for each team
    public team0_index : number = 0;
    public team1_index : number = 0;

    constructor(
        // Identifier of the game
        public game_id: string,
        // Identifier of the battle
        public id: string,
        // Start date of the battle
        public start_time: Date,
        // Max number of turns the battle can last
        public max_turn_count: number = 999,
        // Team of the first player
        public team0: Pet[],
        // Team of the second player
        public team1: Pet[]
    ) {
        this.state = PhaseState.InProgress;
        this.turn_count = 0;
    }
    /**
     * Set up the battle and check the integrity of the data
     */
    setup(): void {
        // TODO Apply buff on each pet
    }

    /**
     * Calculates one turn of the battle
     */
    resolveTurn(): BattleTurnLog {
        const log : BattleTurnLog = new BattleTurnLog();
        this.damagePhase();
        this.updateDeadPets();
        return log;
    }

    damagePhase(): void {
        // Team0 takes damage
        this.team0[this.team0_index]!.totalLife -= this.calculateDamage(this.team1[this.team1_index]!);
        // Team1 takes damage
        this.team1[this.team1_index]!.totalLife -= this.calculateDamage(this.team0[this.team0_index]!);
    }

    calculateDamage(attacker : Pet) : number {
        // Possibly add critical hit
        return attacker.totalDamage;
    }

    updateDeadPets() : void {
        if (this.team0[this.team0_index]!.isDead) {

            console.log(`${this.team0[this.team0_index]!.species} fainted.`);

            // Increments the index for the next pet
            if (this.team0_index < this.team0.length)
                this.team0_index++;
        }
        if (this.team1[this.team1_index]!.isDead) {
            console.log(`${this.team1[this.team1_index]!.species} fainted.`);

            // Increments the index for the next pet
            if (this.team1_index < this.team1.length)
                this.team1_index++;
        }
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
            this.state = PhaseState.Finished;
            this.battle_state = BattleState.Draw;
            return true;
        }
        // Check if Team 2 wins
        if (this.countPetsAlive(this.team0) == 0 && this.countPetsAlive(this.team1) > 0) {
            this.state = PhaseState.Finished;
            this.battle_state = BattleState.Win;
            return true;
        }
        // Check if Team 1 wins
        else if (this.countPetsAlive(this.team1) == 0 && this.countPetsAlive(this.team0) > 0) {
            this.state = PhaseState.Finished;
            this.battle_state = BattleState.Win;
            return true;
        }
        // Check if both Team 1 and Team 2 are all fainted
        else if (this.countPetsAlive(this.team0) == 0 && this.countPetsAlive(this.team1) == 0) {
            this.state = PhaseState.Finished;
            this.battle_state = BattleState.Draw;
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
            if (!pet.isDead) {
                count++;
            }
        });

        return count;
    }
}