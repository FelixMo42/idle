import { box, button } from "./el.tsx"
import { Value } from "./lib.tsx"
import display from "./view.tsx"

// display()

function title(text) {
    return <div class="p title">{text}</div>
}

function p(text) {
    return <div class="p">{text}</div>
}

function b(text, onclick) {
    const el = <div class="p title b">{text}</div>
    el.onclick = onclick
    return el
}

type HTMLNode = Node | Value<string> | Value<number>

export function box2(label: HTMLNode, contents: HTMLNode[]) {
    return <div class="flex">
        <span class="box"><span>{label}</span></span>
        <div class="box flex">{...contents}</div>
    </div>
}

document
    .getElementById("center-bar")
    .replaceChildren(
        box2("icarus idle", [
            title("> play icarus idle"),
            p("A screeching, thuddering crash frees you from your prison of slumber."),
            p("Before you lies your once-idyllic garden, brought low by centuries of neglect."),
            p("In the middle a mysterious intricate metal pod smokes half burried in the dirt."),
            p("But first: hunger calls opon you."),

            b("> havest berries", () => {
                display()
            })
        ])
    )
