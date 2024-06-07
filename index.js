/********/
/* DATA */
/********/

class Watchable {
    callbacks = []

    fire() {
        this.callbacks.forEach((cb) => cb(this))
    }

    watch(cb) {
        this.callbacks.push(cb)
    }
}

class Var extends Watchable {
    constructor(value) {
        super()
        this.default = value
        this._value = value
    }

    get value() {
        return this._value
    }

    set value(v) {
        this._value = v
        this.fire()
    }

    add(amt) {
        this.value += amt
    }

    use(amt) {
        this.value -= amt
    }
}

class Eq extends Watchable {
    constructor(func, use) {
        super()

        this.func = func

        for (const dep of use) {
            dep.watch(() => this.fire())
        }
    }

    get value() {
        return this.func()
    }
}

const data = {
    space: new Var(7),
    resources: {
        food: new Var(0),
        wood: new Var(0),
    }
}

const newSpaceCost = new Eq(() => 3 ** (data.space.value - data.space.default), [data.space])

/*****************/
/* HTML ELEMENTS */
/*****************/

function m(desc, ...children) {
    const [tagName, ...classList] = desc.split(".")
    const el = document.createElement(tagName)
    el.classList = classList.join(" ")
    el.replaceChildren(...children.map((c) => {
        if (c instanceof Watchable) {
            const cel = m("span", c.value)
            c.watch(() => cel.replaceChildren(c.value))
            return cel
        } else {
            return c
        }
    }))
    return el
}

function s(...parts) {
    const make = () => parts
        .map((part) => {
            if (part instanceof Watchable) {
                return part.value
            } else {
                return part
            }
        })
        .join("")

    const el = m("span", make())

    for (const part of parts) {
        if (part instanceof Watchable) {
            part.watch(() => {
                el.replaceChildren(make())
            })
        }
    }

    return el
}

function button(text, onclick, classes="") {
    const el = m("button" + classes, text)
    el.onclick = onclick
    return el
}

function box(label, contents) {
    return m("div",
        m("label.box", label),
        m("div.box", ...contents)
    )
}

/********/
/* MAIN */
/********/

const crops = [
    {
        name: "corn",
        weight: 1,
        amu: new Var(0),
        action: () => data.resources.food.add(1)
    },
    {
        name: "tree",
        weight: 5,
        amu: new Var(0),
        action: () => data.resources.wood.add(1)
    },
]

const tiles = [
    {
        name: "garden",
        size: new Var(3),
        core: crops.map((crop) => 
            m("div.row",
                m("div.flex.align", crop.name),
                button("Harvest", crop.action)
            ),
        )
    }
]

const emptyTiles = new Eq(() => {
    const usedTiles = tiles
        .map(tile => tile.size.value)
        .reduce((a, b) => a + b, 0)
    
    return data.space.value - usedTiles
}, [data.space, ...tiles.map(tile => tile.size)])

document
    .getElementById('center-bar')
    .replaceChildren(
        /* Tiles */
        ...tiles.map((tile) =>
            box(s(tile.name, " (", tile.size, ")"), tile.core)
        ),
        box(s("empty tiles (", emptyTiles, ")"), [
        ]),
        /* Expand Island */
        m("div.row.padding-top", button(
            s("expand island (", newSpaceCost, " wood)"),
            () => {
                if (data.resources.wood.value >= newSpaceCost.value) {
                    data.resources.wood.use(newSpaceCost.value)
                    data.space.add(1)
                }
            },
            ".flex"
        ))
    )

document
    .getElementById('right-bar')
    .appendChild(box("resources",
        Object.keys(data.resources).map((resource) =>
            m("div.row",
                m("div.flex", resource),
                data.resources[resource]
            )
        )
    ))
