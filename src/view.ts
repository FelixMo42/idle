import { m, button, box, s, cond } from "./el.ts"
import * as data from "./core.ts"
import { Eq, get } from "./lib.ts"

export default function display() {
    document
        ?.getElementById('center-bar')
        ?.replaceChildren(
            /* Tiles */
            ...data.tiles.map((tile) =>
                cond(
                    new Eq(() => get(tile.size) !== 0, [tile.size]),
                    box(s(tile.name, " (", tile.size, ")"), tile.view())
                )
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
                    if (get(data.items.wood.qty) >= data.newTileCost.value) {
                        data.items.wood.qty.use(data.newTileCost.value)
                        data.space.add(1)
                    }
                },
                ".flex"
            )),
        )

    document
        ?.getElementById('right-bar')
        ?.appendChild(box("resources",
            Object.values(data.items).map((item) =>
                m("div.row.p",
                    m("div.flex", item.name),
                    item.qty
                )
            )
        ))
}
