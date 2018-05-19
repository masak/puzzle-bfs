import * as hash from 'object-hash';

declare let Set: any;

interface Move<State> {
    description: string;
    isApplicable?: (s: State) => boolean;
    update: (s: State) => Partial<State>;
}

interface Puzzle<State> {
    initialDescription: string;
    initialState: State;

    validMoves: Array<Move<State>>;

    winningDescription: string;
    winningCondition: (s: State) => boolean;

    losingConditions?: Array<(s: State) => boolean>;
}

function solve <State> (puzzle: Puzzle<State>): void {
    let queue = [{ state: puzzle.initialState, trace: [puzzle.initialDescription] }];
    let queuedSet = new Set([puzzle.initialState]);

    while (queue.length) {
        let { state, trace } = queue.shift() as { state: State, trace: string[] };

        if (puzzle.winningCondition(state)) {
            for (let step of trace) {
                console.log(step);
            }
            console.log(puzzle.winningDescription);
            return;
        }

        for (let move of puzzle.validMoves) {
            if (!move.isApplicable || move.isApplicable(state)) {
                let newState = { ...(state as any), ...(move.update(state) as any) } as State;
                if (queuedSet.has(hash(newState)) || puzzle.losingConditions && puzzle.losingConditions.some(c => c(newState))) {
                    continue;
                }
                queue.push({
                    state: newState,
                    trace: [...trace, move.description],
                });
                queuedSet.add(hash(newState));
            }
        }
    }

    console.log("There's no solution.");
}

interface Vessels {
    threeLiter: number;
    fiveLiter: number;
}

let puzzle1: Puzzle<Vessels> = {
    initialDescription: "Both vessels are empty.",
    initialState: { threeLiter: 0, fiveLiter: 0 },

    validMoves: [
        {
            description: "Fill up the 3 L vessel.",
            update: () => ({ threeLiter: 3 }),
        },
        {
            description: "Fill up the 5 L vessel.",
            update: () => ({ fiveLiter: 5 }),
        },
        {
            description: "Empty the 3 L vessel.",
            update: () => ({ threeLiter: 0 }),
        },
        {
            description: "Empty the 5 L vessel.",
            update: () => ({ fiveLiter: 0 }),
        },
        {
            description: "Fill the 3 L vessel from the 5 L vessel.",
            update: (state: Vessels) => ({
                threeLiter: Math.min(3, state.threeLiter + state.fiveLiter),
                fiveLiter: state.threeLiter + state.fiveLiter - Math.min(3, state.threeLiter + state.fiveLiter),
            }),
        },
        {
            description: "Fill the 5 L vessel from the 3 L vessel.",
            update: (state: Vessels) => ({
                threeLiter: Math.min(5, state.threeLiter + state.fiveLiter),
                fiveLiter: state.threeLiter + state.fiveLiter - Math.min(5, state.threeLiter + state.fiveLiter),
            }),
        },
    ],

    winningDescription: "The 5 L vessel now has 4 L of water.",
    winningCondition: (state: Vessels) => state.fiveLiter === 4,
};

solve(puzzle1);

console.log("---");

enum Shore { Start, End }
function across(location: Shore) {
    return location === Shore.Start
        ? Shore.End
        : Shore.Start;
}

interface Items {
    boat: Shore;
    fox: Shore;
    goose: Shore;
    beans: Shore;
}

let puzzle2: Puzzle<Items> = {
    initialDescription: "The boat and all the animals are on the start shore.",
    initialState: { boat: Shore.Start, fox: Shore.Start, goose: Shore.Start, beans: Shore.Start },

    validMoves: [
        {
            description: "Take the fox across.",
            isApplicable: (state: Items) => state.boat === state.fox,
            update: (state: Items) => ({boat: across(state.boat), fox: across(state.fox)}),
        },
        {
            description: "Take the goose across.",
            isApplicable: (state: Items) => state.boat === state.goose,
            update: (state: Items) => ({boat: across(state.boat), goose: across(state.goose)}),
        },
        {
            description: "Take the bag of beans across.",
            isApplicable: (state: Items) => state.boat === state.beans,
            update: (state: Items) => ({boat: across(state.boat), beans: across(state.beans)}),
        },
        {
            description: "Go across with an empty boat.",
            update: (state: Items) => ({boat: across(state.boat)}),
        },
    ],

    winningDescription: "All the animals are now on the other side.",
    winningCondition: ({ fox, goose, beans }: Items) =>
        [fox, goose, beans].every((item) => item === Shore.End),

    losingConditions: [
        (state) => state.boat !== state.fox && state.boat !== state.goose,
        (state) => state.boat !== state.goose && state.boat !== state.beans,
    ],
};

solve(puzzle2);

console.log("---");

function topDisk(array: number[]) {
    return array[array.length - 1];
}

type Rod = "left" | "middle" | "right";

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

type Hanoi = {
    [K in Rod]: number[];
};

let puzzle3: Puzzle<Hanoi> = {
    initialDescription: "All the disks are on the left rod.",
    initialState: { left: [3, 2, 1], middle: [], right: [] },

    validMoves: MOVES.map(({ from, to }) => ({
        description: `Move ${from} to ${to}.`,
        isApplicable: (state: Hanoi) => state[from].length > 0,
        update: (state: Hanoi) => ({
            [from]: state[from].slice(0, state[from].length - 1),
            [to]: [...state[to], topDisk(state[from])],
        }),
    })),

    winningDescription: "All the disks are now on the right rod.",
    winningCondition: (state: Hanoi) => state.right.length === 3,

    losingConditions: [
        (state) => Object.keys(state).some((rod: Rod) => !decreasingOrder(state[rod])),
    ]
};

solve(puzzle3);
