
import { button, buttonWithTimer, cond, m, s } from "./el.js"
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
    metal: {
        name: "metal",
        weight: 2,
        qty: new Var("items.metal.qty", 0),
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

const timeMachineInvestigated = new Var("time_machine.investigated")
const notTimeMachineInvestigated = new Eq(
    () => !timeMachineInvestigated.value,
    [ timeMachineInvestigated ]
)
const timeMachineFixed = new Var("time_machine.fixed", false)
const notTimeMachineFixed = new Eq(
    () => !timeMachineFixed.value,
    [ timeMachineFixed ]
)
const timeMachineLevel = new Var("time_machine.level", 0)
const timeMachineSize = new Eq(
    () => timeMachineLevel.value + (timeMachineFixed.value ? 0 : 1),
    [timeMachineLevel, timeMachineFixed]
)

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
                buttonWithTimer(
                    s("harvest ", crop.name, " (", crop.qty, ")"),
                    crop.timer,
                    () => {
                        if (crop.timer.done()) {
                            crop.timer.set(crop.growTime)
                            for (let i = 0; i < crop.qty.value; i++) {
                                crop.action(crop)
                            }
                        }
                    },
                    ".width"
                ),
            ),
        )
    },
    {
        name: "mysterious capsule",
        size: timeMachineSize,
        view: () => [
            cond(notTimeMachineInvestigated, button("investigate", () => {
                timeMachineInvestigated.value = true
                // TODO: inside you find...
            }, ".width")),
            cond(timeMachineInvestigated, m("div",
                cond(notTimeMachineFixed, button("fix time machine (5 metal)", () => {
                    if (items.metal.qty.value >= 5) {
                        timeMachineLevel.value += 1
                        timeMachineFixed.value = true
                        items.metal.qty.use(5)
                    }
                }, ".width")),
                button("travel back to the start", () => {}, ".width")
            ))
        ]
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
            buttonWithTimer(
                "recive the blessing of the soil",
                compostTimer,
                () => {
                    if (compostWeight.value >= 4) {
                        const sqrt = Math.sqrt(compostWeight.value)
                        compostWeight.use(sqrt)
                        items.soil.qty.add(1)
                    }
                },
                ".width"
            )
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
                items.soil.qty.use(1)
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
