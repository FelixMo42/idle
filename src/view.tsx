import { m, button, box, s, cond, boxe } from "./el.tsx"
import * as data from "./core.tsx"
import { Eq, get } from "./lib.tsx"

//

interface Props {
    children?: any[]
}

function Row({ children }: Props) {
    return <div class="row">{ ...children }</div>
}

//

export default function display() {
    document
        ?.getElementById('left-bar')
        ?.replaceChildren(
            /* Tiles */
            ...data.tiles
                .map((tile) =>
                    cond(
                        new Eq(() => get(tile.size) !== 0, [tile.size]),
                        boxe({
                            fadeIn: true,
                            label: s(tile.name, " (", tile.size, ")"),
                            contents: tile.view()
                        })
                    )
                )
        )

    // document
    //     ?.getElementById('left-bar')
    //     ?.replaceChildren(
    //         /* Tiles */
    //         ...data.tiles.map((tile) =>
    //             cond(
    //                 new Eq(() => get(tile.size) !== 0, [tile.size]),
    //                 box(s(tile.name, " (", tile.size, ")"), tile.view())
    //             )
    //         ),
            // box(s("empty tiles (", data.emptyTiles, ")"),
            //     data.buildTileButtons.map((buildButton) => 
            //         cond(buildButton.visable, button(buildButton.name, buildButton.onclick))
            //     )
            // ),
            /* Expand Island */
            // <Row>{ button(
            //     s("expand island (", data.newTileCost, " wood)"),
            //     () => {
            //         if (get(data.items.wood.qty) >= data.newTileCost.value) {
            //             data.items.wood.qty.use(data.newTileCost.value)
            //             data.space.add(1)
            //         }
            //     }
            // ) }</Row>
        // )

    // document
    //     ?.getElementById('right-bar')
    //     ?.appendChild(box("resources",
    //         Object.values(data.items).map((item) =>
    //             m("div.row.p",
    //                 m("div.flex", item.name),
    //                 item.qty
    //             )
    //         )
    //     ))
}
