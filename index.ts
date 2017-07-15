declare let Set: any;

interface SolveConfiguration<State> {
    initialState: State,
    initialDescription: string,
    hashFn: (State) => number,
    validMoves: Array<[(State) => boolean, (State) => State, string]>,
    winningConditions: Array<[(State) => boolean, string]>,
    losingConditions: Array<(State) => boolean>,
}

function solve <State> ({
    initialState,
    initialDescription,
    hashFn,
    validMoves = [],
    winningConditions = [],
    losingConditions = [],
}: SolveConfiguration<State>): void {
    interface StateWithTrace {
        state: State,
        trace: Array<string>,
    }

    let queue: Array<StateWithTrace> = [
        { state: initialState, trace: [initialDescription] },
    ];

    let seen = new Set();
    while (queue.length) {
        let { state, trace }: StateWithTrace = queue.shift();

        if (seen.has(state)) {
            continue;
        }

        for (let [isWinning, winningDescription] of winningConditions) {
            if (isWinning(state)) {
                for (let step of trace) {
                    console.log(step);
                }
                console.log(winningDescription);
                return;
            }
        }

        for (let [isApplicable, move, description] of validMoves) {
            if (isApplicable(state)) {
                let newState = move(state);
                if (!seen.has(hashFn(newState)) && !losingConditions.some((isLosing) => isLosing(newState))) {
                    queue.push({
                        state: newState,
                        trace: [...trace, description],
                    });
                }
            }
        }

        seen.add(hashFn(state));
    }

    console.log("There's no solution.");
}

enum Shore {
    One,
    Other,
}

function across(location: Shore) {
    return location === Shore.One
        ? Shore.Other
        : Shore.One;
}

interface PuzzleState {
    boat: Shore;
    fox: Shore;
    goose: Shore;
    beans: Shore;
}

let initialState: PuzzleState = {
    boat: Shore.One,
    fox: Shore.One,
    goose: Shore.One,
    beans: Shore.One,
};

solve<PuzzleState>({
    initialState,
    initialDescription: "The boat and all the animals are on the start shore.",
    hashFn: (state) => state.boat ^ 31 * (state.fox ^ 31 * (state.goose ^ 31 * state.beans)),
    validMoves: [
        [
            (state) => state.boat === state.fox,
            (state) => ({ ...state, boat: across(state.boat), fox: across(state.fox) }),
            "Take the fox across.",
        ],
        [
            (state) => state.boat === state.goose,
            (state) => ({ ...state, boat: across(state.boat), goose: across(state.goose) }),
            "Take the goose across.",
        ],
        [
            (state) => state.boat === state.beans,
            (state) => ({ ...state, boat: across(state.boat), beans: across(state.beans) }),
            "Take the bag of beans across.",
        ],
        [
            () => true,
            (state) => ({ ...state, boat: across(state.boat) }),
            "Go across with an empty boat.",
        ]
    ],
    winningConditions: [
        [
            (state) => [state.fox, state.goose, state.beans].every((l) => l === Shore.Other),
            "All the animals are now on the other side.",
        ],
    ],
    losingConditions: [
        (state) => state.boat !== state.fox && state.boat !== state.goose,
        (state) => state.boat !== state.goose && state.boat !== state.beans,
    ],
});
