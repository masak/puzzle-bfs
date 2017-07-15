declare let Set: any;

declare interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

class Puzzle<State> {
    public validMoves: Array<[string, (State) => Partial<State>, (State) => boolean]> = [];
    public winningConditions: Array<[string, (State) => boolean]> = [];
    public losingConditions: Array<(State) => boolean> = [];

    constructor(
        public initialDescription: string,
        public initialState: State,
        public hashFn: (State) => number) {
    }

    validMove(
        description: string,
        update: (State) => Partial<State>,
        isApplicable: (State) => boolean = () => true): this {

        this.validMoves.push([description, update, isApplicable]);
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

    isLosing(state: State) {
        return this.losingConditions.some((isLosing) => isLosing(state));
    }
}
    
function solve <State> (puzzle: Puzzle<State>): void {
    let queue = [{ state: puzzle.initialState, trace: [puzzle.initialDescription] }];

    let seenSet = new Set();
    function seen(state: State) {
        return seenSet.has(puzzle.hashFn(state));
    }

    while (queue.length) {
        let { state, trace } = queue.shift();

        if (seen(state)) {
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

        for (let [description, update, isApplicable] of puzzle.validMoves) {
            if (isApplicable(state)) {
                let newState = Object.assign({}, state, update(state));
                if (seen(newState) || puzzle.isLosing(newState)) {
                    continue;
                }
                queue.push({
                    state: newState,
                    trace: [...trace, description],
                });
            }
        }

        seenSet.add(puzzle.hashFn(state));
    }

    console.log("There's no solution.");
}

enum Shore { One, Other }
function across(location: Shore) { return location === Shore.One ? Shore.Other : Shore.One; }

let puzzle1 = new Puzzle(
    "The boat and all the animals are on the start shore.",
    { boat: Shore.One, fox: Shore.One, goose: Shore.One, beans: Shore.One },
    (state) => state.boat ^ 31 * (state.fox ^ 31 * (state.goose ^ 31 * state.beans)),
).validMove(
    "Take the fox across.",
    (state) => ({ boat: across(state.boat), fox: across(state.fox) }),
    (state) => state.boat === state.fox,
).validMove(
    "Take the goose across.",
    (state) => ({ boat: across(state.boat), goose: across(state.goose) }),
    (state) => state.boat === state.goose,
).validMove(
    "Take the bag of beans across.",
    (state) => ({ boat: across(state.boat), beans: across(state.beans) }),
    (state) => state.boat === state.beans,
).validMove(
    "Go across with an empty boat.",
    (state) => ({ boat: across(state.boat) }),
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

solve(puzzle1);

console.log("---");

let puzzle2 = new Puzzle(
    "Both vessels are empty.",
    { threeLiter: 0, fiveLiter: 0 },
    (state) => state.threeLiter ^ 31 * state.fiveLiter,
).validMove(
    "Fill up the 3 L vessel.",
    (state) => ({ threeLiter: 3 }),
).validMove(
    "Fill up the 5 L vessel.",
    (state) => ({ fiveLiter: 5 }),
).validMove(
    "Empty the 3 L vessel.",
    (state) => ({ threeLiter: 0 }),
).validMove(
    "Empty the 5 L vessel.",
    (state) => ({ fiveLiter: 0 }),
).validMove(
    "Fill the 3 L vessel from the 5 L vessel.",
    (state) => ({
        threeLiter: Math.min(3, state.threeLiter + state.fiveLiter),
        fiveLiter: state.threeLiter + state.fiveLiter - Math.min(3, state.threeLiter + state.fiveLiter),
    }),
).validMove(
    "Fill the 5 L vessel from the 3 L vessel.",
    (state) => ({
        fiveLiter: Math.min(5, state.threeLiter + state.fiveLiter),
        threeLiter: state.threeLiter + state.fiveLiter - Math.min(5, state.threeLiter + state.fiveLiter),
    }),
).winningCondition(
    "The 5 L vessel now has 4 L of water.",
    (state) => state.fiveLiter === 4,
);

solve(puzzle2);
