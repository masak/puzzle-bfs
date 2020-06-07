import * as hash from 'object-hash';

declare let Set: any;

interface Move<State> {
    description: string;
    newState: State;
}

interface Puzzle<State> {
    initialDescription: string;
    initialState: State;

    validMoves: (s: State) => Array<Move<State>>;

    winningDescription: string;
    winningCondition: (s: State) => boolean;
}

function solve <State> (puzzle: Puzzle<State>): void {
    let queue = [{ state: puzzle.initialState, trace: [puzzle.initialDescription] }];
    let queuedSet = new Set([hash(puzzle.initialState)]);

    let elem: { state: State, trace: string[] };

    while (elem = queue.shift()!) {
        let { state, trace } = elem;

        if (puzzle.winningCondition(state)) {
            for (let step of trace) {
                console.log(step);
            }
            console.log(puzzle.winningDescription);
            return;
        }

        for (let { newState, description } of puzzle.validMoves(state)) {
            if (queuedSet.has(hash(newState))) {
                continue;
            }
            queue.push({
                state: newState,
                trace: [...trace, description],
            });
            queuedSet.add(hash(newState));
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

    validMoves: ({ threeLiter, fiveLiter }: Vessels) => {
        let fiveToThree = Math.min(3 - threeLiter, fiveLiter);
        let threeToFive = Math.min(5 - fiveLiter, threeLiter);

        return [
            {
                description: "Fill up the 3 L vessel.",
                newState: { threeLiter: 3, fiveLiter },
            },
            {
                description: "Fill up the 5 L vessel.",
                newState: { threeLiter, fiveLiter: 5 },
            },
            {
                description: "Empty the 3 L vessel.",
                newState: { threeLiter: 0, fiveLiter },
            },
            {
                description: "Empty the 5 L vessel.",
                newState: { threeLiter, fiveLiter: 0 },
            },
            {
                description: "Fill the 3 L vessel from the 5 L vessel.",
                newState: {
                    threeLiter: threeLiter + fiveToThree,
                    fiveLiter: fiveLiter - fiveToThree,
                },
            },
            {
                description: "Fill the 5 L vessel from the 3 L vessel.",
                newState: {
                    threeLiter: threeLiter - threeToFive,
                    fiveLiter: fiveLiter + threeToFive,
                }
            },
        ];
    },

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

function acrossWithBoat(state: Items, item: "fox" | "goose" | "beans"): Items {
    return state.boat === state[item]
        ? { ...state, boat: across(state.boat), [item]: across(state[item]) }
        : state;
}

let puzzle2: Puzzle<Items> = {
    initialDescription: "The boat and all the animals are on the start shore.",
    initialState: { boat: Shore.Start, fox: Shore.Start, goose: Shore.Start, beans: Shore.Start },

    validMoves: (state: Items) => [
        {
            description: "Take the fox across.",
            newState: acrossWithBoat(state, "fox"),
        },
        {
            description: "Take the goose across.",
            newState: acrossWithBoat(state, "goose"),
        },
        {
            description: "Take the bag of beans across.",
            newState: acrossWithBoat(state, "beans"),
        },
        {
            description: "Go across with an empty boat.",
            newState: { ...state, boat: across(state.boat) },
        },
    ].filter(({ newState: { boat, fox, goose, beans } }: { newState: Items }) => {
        return (boat === fox || boat === goose) && (boat === goose || boat === beans);
    }),

    winningDescription: "All the animals are now on the other side.",
    winningCondition: ({ fox, goose, beans }: Items) =>
        [fox, goose, beans].every((item) => item === Shore.End),
};

solve(puzzle2);

console.log("---");

function topDisk(array: number[]) {
    return array[array.length - 1];
}

type Rod = "left" | "middle" | "right";

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

    validMoves: (state: Hanoi) => MOVES.map(({ from, to }) => ({
        description: `Move ${from} to ${to}.`,
        newState: state[from].length > 0 && (state[to].length === 0 || topDisk(state[from]) < topDisk(state[to]))
            ? (
                {
                    ...state,
                    [from]: state[from].slice(0, state[from].length - 1),
                    [to]: [...state[to], topDisk(state[from])],
                }
            )
            : state,
    })),

    winningDescription: "All the disks are now on the right rod.",
    winningCondition: (state: Hanoi) => state.right.length === 3,
};

solve(puzzle3);

console.log("---");

interface Level {
    catX: number;
    catY: number;
    sizeX: 5,
    sizeY: 5,
    level: boolean[][];
}

function moveUp(state: Level) {
    let { catX, catY, level } = state;
    level = JSON.parse(JSON.stringify(level));
    while (catY > 0 && !level[catY-1][catX]) {
        catY--;
        level[catY][catX] = true;
    }
    return { ...state, catY, level };
}

function moveDown(state: Level) {
    let { catX, catY, level, sizeY } = state;
    level = JSON.parse(JSON.stringify(level));
    while (catY < sizeY - 1 && !level[catY+1][catX]) {
        catY++;
        level[catY][catX] = true;
    }
    return { ...state, catY, level };
}

function moveLeft(state: Level) {
    let { catX, catY, level } = state;
    level = JSON.parse(JSON.stringify(level));
    while (catX > 0 && !level[catY][catX-1]) {
        catX--;
        level[catY][catX] = true;
    }
    return { ...state, catX, level };
}

function moveRight(state: Level) {
    let { catX, catY, level, sizeX } = state;
    level = JSON.parse(JSON.stringify(level));
    while (catX < sizeX - 1 && !level[catY][catX+1]) {
        catX++;
        level[catY][catX] = true;
    }
    return { ...state, catX, level };
}

let puzzle4: Puzzle<Level> = {
    initialDescription: "The cat is in its starting position.",
    initialState: {
        catX: 1,
        catY: 2,
        sizeX: 5,
        sizeY: 5,
        level: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, true, false, false, false],
            [false, false, false, true, false],
            [false, false, false, false, false],
        ],
    },

    validMoves: (state: Level) => [
        {
            description: "Move up.",
            newState: moveUp(state),
        },
        {
            description: "Move down.",
            newState: moveDown(state),
        },
        {
            description: "Move left.",
            newState: moveLeft(state),
        },
        {
            description: "Move right.",
            newState: moveRight(state),
        },
    ].filter((move: any) => move.newState.catX != state.catX || move.newState.catY != state.catY),

    winningDescription: "The whole level is filled.",
    winningCondition: (state: Level) => state.level.every((row) => row.every((cell) => cell)),
};

solve(puzzle4);
