
import { buttonWithTimer, m } from "./el.js"
import { Eq, Timer, Var, minute } from "./lib.js"

// TYPES // 

export const space = new Var("space", 7)

export const items = {
    food: {
        name: "food",
        weight: 0.1,
        qty: new Var("items.food.qty", 0),
    },
    wood: {
        name: "wood",
        weight: 1,
        qty: new Var("items.wood.qty", 0),
    },
}

export const crops = {
    corn: {
        name: "corn",
        weight: 1,
        qty: new Var("crops.cord.qty", 1),
        growTime: minute(1),
        timer: new Timer("crops.corn.timer"),
        action: () => items.food.qty.add(1)
    },
    tree: {
        name: "tree",
        weight: 5,
        qty: new Var("crops.tree.qty", 1),
        growTime: minute(60),
        timer: new Timer("crops.tree.timer"),
        action: () => items.wood.qty.add(1)
    }
}

export const tiles = [
    {
        name: "garden",
        size: new Eq(() => Object.values(crops)
            .map(crop => crop.qty.value)
            .reduce((a, b) => a + b),
            [...Object.values(crops).map(crop => crop.qty)]
        ),
        view: () => Object.values(crops).map((crop) =>
            m("div.row",
                m("div.flex.align", crop.name),
                buttonWithTimer("Harvest", crop.timer, () => {
                    if (crop.timer.done()) {
                        crop.timer.set(crop.growTime)
                        crop.action(crop)
                    }
                }),
            ),
        )
    }
]

// EQUATIONS //

export const newTileCost = new Eq(() =>
    3 ** (space.value - space.default + 1),
[space])

export const emptyTiles = new Eq(() => {
    const usedTiles = tiles
        .map(tile => tile.size.value)
        .reduce((a, b) => a + b, 0)
    
    return space.value - usedTiles
}, [space, ...tiles.map(tile => tile.size)])
