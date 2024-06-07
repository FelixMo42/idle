
import { button, buttonWithTimer, m, s } from "./el.js"
import { Eq, Timer, Var, minute } from "./lib.js"

// TYPES // 

export const space = new Var("space", 7)

export const items = {
    food: {
        name: "food",
        weight: 0.1,
        qty: new Var("items.food.qty", 0),
        compostable: true,
    },
    wood: {
        name: "wood",
        weight: 1,
        qty: new Var("items.wood.qty", 0),
        compostable: true,
    },
    soil: {
        name: "soil",
        weight: 3,
        qty: new Var("items.soil.qty", 0),
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

const compostWeight = new Var("compost.weight", 0)
const compostTimer = new Timer("compost.timer")

function compost1(itemName) {
    if (items[itemName].qty.value >= 1) {
        compostWeight.add(items[itemName].weight)
        items[itemName].qty.use(1)
    }
}

function compostAll(itemName) {
    const qty = items[itemName].qty.value
    compostWeight.add(items[itemName].weight * qty)
    items[itemName].qty.use(qty)
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
    },
    {
        name: "compost",
        size: new Var("tiles.compost.size", 0),
        view: () => [
            m("div.p.center", s("~~ net weight: ", compostWeight, " ~~")),
            ...Object.values(items)
                .filter((item) => item.compostable)
                .map((item) => m("div.row",
                    button(`sacrafice 1 ${item.name}`, () => compost1(item.name), ".flex.margin-right"),
                    button(`sacrafice all ${item.name}`, () => compostAll(item.name), ".flex"),
                )),
            buttonWithTimer("recive the blessing of the soil", compostTimer, () => {}, ".width")
        ]
    }
]

export const buildButtons = [
    {
        name: "build compost shrine (3 food)",
        visable: new Eq(() =>
            tiles.find((t) => t.name === "compost").size.value == 0
        , [ tiles.find((t) => t.name === "compost").size ]),
        onclick: () => {
            if (items.food.qty.value >= 3) {
                items.food.qty.use(3)
                tiles.find((t) => t.name === "compost").size.value = 1
            }
        }
    },
    ...Object.values(crops).map((crop) => ({
        name: `plant ${crop.name} (1 soil)`,
        onclick: () => {
            if (items.soil.qty.value >= 1) {
                items.soil.qty.use(3)
                crop.qty.add(1)
            }
        }
    }))
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
