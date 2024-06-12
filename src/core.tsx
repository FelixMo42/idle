
import { button, buttonWithTimer, cond, m, s } from "./el.tsx"
import { Eq, GVar, Gettable, Timer, Value, Var, get, minute } from "./lib.tsx"

// ITEMS //

interface ItemDO {
    name: string;
    weight: number;
    compostable?: boolean; 
}

interface Item {
    name: string;
    weight: number;
    qty: Var;
    compostable?: boolean; 
}

export const items: { [k: string]: Item } = {}

function addItems(...descs: ItemDO[]) {
    for (const desc of descs) {
        items[desc.name] = {
            qty: new Var(`items.${desc.name}.qty`, 0),
            ...desc
        }
    }
}

addItems(
    {
        name: "food",
        weight: 0.1,
        compostable: true,
    },
    {
        name: "wood",
        weight: 1,
        compostable: true,
    },
    {
        name: "metal",
        weight: 2,
    },
    {
        name: "soil",
        weight: 3,
    },
)

// TILES //

interface Tile {
    name: string;
    size: Value<number>;
    view: () => HTMLElement[];
}

export const space = new Var("space", 7)

export const tiles: Array<Tile> = []

export const newTileCost = new Eq(() =>
    3 ** (space.value - space.default + 1),
[space])

export const emptyTiles = new Eq(() => {
    const usedTiles = tiles
        .map(tile => get(tile.size))
        .reduce((a, b) => a + b, 0)
    
    return space.value - usedTiles
}, [space, ...tiles.map(tile => tile.size)])

function addTile(...descs: Tile[]) {
    tiles.push(...descs)
}

interface BuildTileButton {
    name: string;
    visable?: Gettable<boolean>;
    onclick: () => void;
}

export const buildTileButtons: BuildTileButton[] = []

function addBuildTileButton(...descs: BuildTileButton[]) {
    buildTileButtons.push(...descs.map((desc) => ({
        ...desc,
        onclick: () => {
            if (emptyTiles.value > 0) {
                desc.onclick()
            }
        }
    })))
}

// GARDEN //

export const cropTypes = {
    berries: {
        name: "berries",
        weight: 1,
        growTime: minute(1),
        action: () => items.food.qty.add(1)
    },
    tree: {
        name: "tree",
        weight: 5,
        growTime: minute(60),
        timer: new Timer("crops.tree.timer"),
        action: () => items.wood.qty.add(1)
    }
}

const crops = new GVar("crops")

function uuid() {
    return String(Math.floor(Math.random() * 100000))
}

function plantCrop(name) {
    const id = uuid()
    crops.value.push({
        ...cropTypes[name],
        timer: new Timer(`crops.${id}.timer`),
    })

    crops.fire()
}

addTile({
    name: "garden",
    size: new Eq(() => crops.value
        .map(crop => crop.qty.value)
        .reduce((a, b) => a + b),
        [ crops ]
    ),
    view: () => crops.map((crop) =>
        buttonWithTimer(
            s("harvest ", crop.name, " (", crop.qty, ")"),
            crop.timer,
            () => {
                if (crop.timer.done()) {
                    crop.timer.set(crop.growTime)
                    for (let i = 0; i < crop.qty.value; i++) {
                        crop.action()
                    }
                }
            }
        ),
    )
})

addBuildTileButton(...Object.values(crops).map((crop) => ({
    name: `plant ${crop.name} (1 soil)`,
    onclick: () => {
        if (items.soil.qty.value >= 1) {
            items.soil.qty.use(1)
            crop.qty.add(1)
        }
    }
})))

// COMPOST //

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

const compostTile = {
    name: "compost",
    size: new Var("tiles.compost.size", 0),
    view: () => [
        m("div.p.center", s("~~ net weight: ", compostWeight, " ~~")),
        ...Object.values(items)
            .filter((item) => item.compostable)
            .map((item) => m("div.row",
                button(`sacrifice 1 ${item.name}`, () => compost1(item.name)),
                button(`sacrifice all ${item.name}`, () => compostAll(item.name)),
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
            }
        )
    ]
}

addTile(compostTile)

addBuildTileButton({
    name: "build compost shrine (3 food)",
    visable: new Eq(() =>
        compostTile.size.value == 0
    , [ compostTile.size ]),
    onclick: () => {
        if (items.food.qty.value >= 3) {
            items.food.qty.use(3)
            compostTile.size.value = 1
        }
    }
})

// TIME MACHINE // 

const timeMachineInvestigated = new GVar("time_machine.investigated", false)
const notTimeMachineInvestigated = new Eq(
    () => !timeMachineInvestigated.value,
    [ timeMachineInvestigated ]
)
const timeMachineFixed = new GVar("time_machine.fixed", false)
const notTimeMachineFixed = new Eq(
    () => !timeMachineFixed.value,
    [ timeMachineFixed ]
)
const timeMachineLevel = new Var("time_machine.level", 0)
const timeMachineSize = new Eq(
    () => timeMachineLevel.value + (timeMachineFixed.value ? 0 : 1),
    [timeMachineLevel, timeMachineFixed]
)

const timeMachineUsable = new Eq(
    () => timeMachineLevel.value >= 0,
    [ timeMachineLevel ]
)

//

const popel = document.getElementById("popup")!
popel.onclick = () => closePopup()

const popcel = document.getElementById("popc")!
popcel.onclick = (e) => e.stopPropagation()

function popup(el: HTMLElement) {
    popel.classList.remove("hide")
    popcel.replaceChildren(el)
}

function closePopup() {
    popel.classList.add("hide")
}

//

function investigateTimeMachine() {
    // timeMachineInvestigated.value = true
    popup(m("div",
        m("div.title.p", "> investigate the pod"),
        m("div.p",
            "The door opens with a hissssss. ",
            "Inside is a pile of goo wearing cloths.",
        ),
        m("div.title.p", "> pickpocket the goo"),
        m("div.p",
            "You find a ", m("span.green", "time machine instruction manual"), "!!! ",
            "They must have intrepid explorer must be from the future! ",
            "It's too bad he's a pile of goo now.",
        ),
        m("div.title.p", "> travel to the year 9001!"),
        m("div.p",
            "clank ^barn &*, piiiishhh plop %o6 ~~!"
        ),
        m("div.p",
            "You open the door..."
        ),
        m("div.p",
            "Bummer. ",
            "Looks like its broken. ",
        ),
        button("exit the broken time machine", () => closePopup())
    ))
}

function fixTimeMachine() {
    if (items.metal.qty.value >= 5) {
        timeMachineLevel.value += 1
        timeMachineFixed.value = true
        items.metal.qty.use(5)
    }
}

addTile({
    name: "mysterious capsule",
    size: timeMachineSize,
    view: () => [
        cond(notTimeMachineInvestigated, button("investigate", investigateTimeMachine)),
        cond(timeMachineInvestigated, m("div",
            cond(notTimeMachineFixed, button("fix time machine (5 metal)", fixTimeMachine)),
            cond(timeMachineUsable, button("travel back to the start", () => {}))
        ))
    ]
})
