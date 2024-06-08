import { m, button, box, s, cond } from "./el.js"
import * as data from "./core.js"

export default function display() {
    document
        .getElementById('center-bar')
        .replaceChildren(
            /* Tiles */
            ...data.tiles.map((tile) =>
                cond(tile.size, box(s(tile.name, " (", tile.size, ")"), tile.view()))
            ),
            box(s("empty tiles (", data.emptyTiles, ")"),
                data.buildTileButtons.map((buildButton) => 
                    cond(buildButton.visable, button(buildButton.name, buildButton.onclick, ".width"))
                )
            ),
            /* Expand Island */
            m("div.row.padding-top", button(
                s("expand island (", data.newTileCost, " wood)"),
                () => {
                    if (data.items.wood.value >= data.newTileCost.value) {
                        data.items.wood.use(data.newTileCost.value)
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
                m("div.row.p",
                    m("div.flex", item.name),
                    item.qty
                )
            )
        ))
}
