declare let Set: any;

class Puzzle<State> {
    public validMoves: Array<[(State) => boolean, (State) => State, string]> = [];
    public winningConditions: Array<[(State) => boolean, string]> = [];
    public losingConditions: Array<(State) => boolean> = [];

    constructor(
        public initialState: State,
        public initialDescription: string,
        public hashFn: (State) => number) {
    }

    validMove(isApplicable: (State) => boolean, move: (State) => State, description: string): this {
        this.validMoves.push([isApplicable, move, description]);
        return this;
    }

    winningCondition(isWinning: (State) => boolean, description: string): this {
        this.winningConditions.push([isWinning, description]);
        return this;
    }

    losingCondition(isLosing: (State) => boolean): this {
        this.losingConditions.push(isLosing);
        return this;
    }
}
    
function solve <State> (puzzle: Puzzle<State>): void {
    let queue = [
        { state: puzzle.initialState, trace: [puzzle.initialDescription] },
    ];

    let seen = new Set();
    while (queue.length) {
        let { state, trace } = queue.shift();

        if (seen.has(state)) {
            continue;
        }

        for (let [isWinning, winningDescription] of puzzle.winningConditions) {
            if (isWinning(state)) {
                for (let step of trace) {
                    console.log(step);
                }
                console.log(winningDescription);
                return;
            }
        }

        for (let [isApplicable, move, description] of puzzle.validMoves) {
            if (isApplicable(state)) {
                let newState = move(state);
                if (!seen.has(puzzle.hashFn(newState)) && !puzzle.losingConditions.some((isLosing) => isLosing(newState))) {
                    queue.push({
                        state: newState,
                        trace: [...trace, description],
                    });
                }
            }
        }

        seen.add(puzzle.hashFn(state));
    }

    console.log("There's no solution.");
}

enum Shore { One, Other }

function across(location: Shore) {
    return location === Shore.One
        ? Shore.Other
        : Shore.One;
}

let puzzle = new Puzzle(
    { boat: Shore.One, fox: Shore.One, goose: Shore.One, beans: Shore.One },
    "The boat and all the animals are on the start shore.",
    (state) => state.boat ^ 31 * (state.fox ^ 31 * (state.goose ^ 31 * state.beans)))
    .validMove(
        (state) => state.boat === state.fox,
        (state) => ({ ...state, boat: across(state.boat), fox: across(state.fox) }),
        "Take the fox across.")
    .validMove(
        (state) => state.boat === state.goose,
        (state) => ({ ...state, boat: across(state.boat), goose: across(state.goose) }),
        "Take the goose across.")
    .validMove(
        (state) => state.boat === state.beans,
        (state) => ({ ...state, boat: across(state.boat), beans: across(state.beans) }),
        "Take the bag of beans across.")
    .validMove(
        () => true,
        (state) => ({ ...state, boat: across(state.boat) }),
        "Go across with an empty boat.")
    .winningCondition(
        (state) => [state.fox, state.goose, state.beans].every((l) => l === Shore.Other),
        "All the animals are now on the other side.")
    .losingCondition(
        (state) => state.boat !== state.fox && state.boat !== state.goose)
    .losingCondition(
        (state) => state.boat !== state.goose && state.boat !== state.beans)
;

solve(puzzle);
