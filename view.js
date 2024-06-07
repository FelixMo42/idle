import { m, button, box, s } from "./el.js"
import * as data from "./core.js"

function cond(show, el) {
    if (show === undefined) return el

    function check() {
        if (show.value) {
            el.classList.remove("hide")
        } else {
            el.classList.add("hide")
        }
    }

    show.watch(check)

    check()

    return el
}

export default function display() {
    document
        .getElementById('center-bar')
        .replaceChildren(
            /* Tiles */
            ...data.tiles.map((tile) =>
                cond(tile.size, box(s(tile.name, " (", tile.size, ")"), tile.view()))
            ),
            box(s("empty tiles (", data.emptyTiles, ")"),
                data.buildButtons.map((buildButton) => 
                    cond(buildButton.visable, button(buildButton.name, buildButton.onclick, ".width"))
                )
            ),
            /* Expand Island */
            m("div.row.padding-top", button(
                s("expand island (", data.newTileCost, " wood)"),
                () => {
                    if (data.items.wood.value >= newTileCost.value) {
                        data.items.wood.use(newTileCost.value)
                        data.space.add(1)
                    }
                },
                ".flex"
            )),
        )

    document
        .getElementById('right-bar')
        .appendChild(box("resources",
            Object.values(data.items).map((item) =>
                m("div.row",
                    m("div.flex", item.name),
                    item.qty
                )
            )
        ))
}
