import * as hash from 'object-hash';

declare let Set: any;

declare interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

class Puzzle<State> {
    public validMoves: Array<[string, (State) => Partial<State>, (State) => boolean]> = [];
    public winningConditions: Array<[string, (State) => boolean]> = [];
    public losingConditions: Array<(State) => boolean> = [];

    constructor(public initialDescription: string, public initialState: State) {
    }

    validMove(description: string, update: (State) => Partial<State>, isApplicable: (State) => boolean = () => true): this {
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
    if (puzzle.winningConditions.length === 0) {
        console.log("There's no way to solve this puzzle because there are no winning conditions.");
        return;
    }

    let queue = [{ state: puzzle.initialState, trace: [puzzle.initialDescription] }];

    let seenSet = new Set();

    while (queue.length) {
        let { state, trace } = queue.shift();

        if (seenSet.has(hash(state))) {
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
                let newState = (<any>Object).assign({}, state, update(state));
                if (seenSet.has(hash(newState)) || puzzle.isLosing(newState)) {
                    continue;
                }
                queue.push({
                    state: newState,
                    trace: [...trace, description],
                });
            }
        }

        seenSet.add(hash(state));
    }

    console.log("There's no solution.");
}

let puzzle1 = new Puzzle(
    "Both vessels are empty.",
    { threeLiter: 0, fiveLiter: 0 },
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

solve(puzzle1);

console.log("---");

enum Shore { One, Other }
function across(location: Shore) { return location === Shore.One ? Shore.Other : Shore.One; }

let puzzle2 = new Puzzle(
    "The boat and all the animals are on the start shore.",
    { boat: Shore.One, fox: Shore.One, goose: Shore.One, beans: Shore.One },
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

solve(puzzle2);

console.log("---");

function hashArray(array) {
    return (array[0] || -1) ^ 31 * ((array[1] || -1) ^ 31 * (array[2] || -1));
}

function topDisk(array) {
    return array[array.length - 1];
}

type Rod = "left" | "middle" | "right";

function moveDisk(from: Rod, to: Rod) {
    return (state) => ({
        [from]: state[from].slice(0, state[from].length - 1),
        [to]: [...state[to], topDisk(state[from])],
    });
}

function decreasingOrder(disks: number[]) {
    return String(disks) === String(disks.slice().sort().reverse());
}

const MOVES: Array<{ from: Rod, to: Rod }> = [
    { from: "left", to: "middle" },
    { from: "left", to: "right" },
    { from: "middle", to: "left" },
    { from: "middle", to: "right" },
    { from: "right", to: "left" },
    { from: "right", to: "middle" },
];

let puzzle3 = new Puzzle(
    "All the disks are on the left rod.",
    { left: [3, 2, 1], middle: [], right: [] },
).winningCondition(
    "All the disks are now on the right rod.",
    (state) => state.right.length === 3,
).losingCondition(
    "Wrong order of disks on a rod.",
    (state) => Object.keys(state).some((rod) => !decreasingOrder(state[rod])),
);

for (let { from, to } of MOVES) {
    puzzle3.validMove(`Move ${from} to ${to}.`, moveDisk(from, to), (state) => state[from].length > 0);
}

solve(puzzle3);
