declare let Set: any;

class Puzzle<State> {
    public validMoves: Array<[string, (State) => State, (State) => boolean]> = [];
    public winningConditions: Array<[string, (State) => boolean]> = [];
    public losingConditions: Array<(State) => boolean> = [];

    constructor(
        public initialDescription: string,
        public initialState: State,
        public hashFn: (State) => number) {
    }

    validMove(description: string, move: (State) => State, isApplicable: (State) => boolean = () => true): this {
        this.validMoves.push([description, move, isApplicable]);
        return this;
    }

    winningCondition(description: string, isWinning: (State) => boolean): this {
        this.winningConditions.push([description, isWinning]);
        return this;
    }

    losingCondition(description: string, isLosing: (State) => boolean): this {
        this.losingConditions.push(isLosing);
        return this;
    }
}
    
function solve <State> (puzzle: Puzzle<State>): void {
    let queue = [{ state: puzzle.initialState, trace: [puzzle.initialDescription] }];

    let seen = new Set();
    while (queue.length) {
        let { state, trace } = queue.shift();

        if (seen.has(puzzle.hashFn(state))) {
            continue;
        }

        for (let [description, isWinning] of puzzle.winningConditions) {
            if (isWinning(state)) {
                for (let step of [...trace, description]) {
                    console.log(step);
                }
                return;
            }
        }

        for (let [description, move, isApplicable] of puzzle.validMoves) {
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
function across(location: Shore) { return location === Shore.One ? Shore.Other : Shore.One; }

let puzzle = new Puzzle(
    "The boat and all the animals are on the start shore.",
    { boat: Shore.One, fox: Shore.One, goose: Shore.One, beans: Shore.One },
    (state) => state.boat ^ 31 * (state.fox ^ 31 * (state.goose ^ 31 * state.beans)),
).validMove(
    "Take the fox across.",
    (state) => ({ ...state, boat: across(state.boat), fox: across(state.fox) }),
    (state) => state.boat === state.fox,
).validMove(
    "Take the goose across.",
    (state) => ({ ...state, boat: across(state.boat), goose: across(state.goose) }),
    (state) => state.boat === state.goose,
).validMove(
    "Take the bag of beans across.",
    (state) => ({ ...state, boat: across(state.boat), beans: across(state.beans) }),
    (state) => state.boat === state.beans,
).validMove(
    "Go across with an empty boat.",
    (state) => ({ ...state, boat: across(state.boat) }),
).winningCondition(
    "All the animals are now on the other side.",
    (state) => [state.fox, state.goose, state.beans].every((l) => l === Shore.Other),
).losingCondition(
    "The fox eats the goose",
    (state) => state.boat !== state.fox && state.boat !== state.goose,
).losingCondition(
    "The goose eats the beans",
    (state) => state.boat !== state.goose && state.boat !== state.beans,
);

solve(puzzle);
