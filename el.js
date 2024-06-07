import { Watchable } from "./lib.js"

export function m(desc, ...children) {
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

export function s(...parts) {
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

export function button(text, onclick, classes="") {
    const el = m("button" + classes, text)
    el.onclick = onclick
    return el
}

export function buttonWithTimer(text, timer, onclick) {
    const el = m("button", text)
    el.onclick = () => {
        if (timer.done()) {
            onclick()
        } else {
            timer.logTimeLeft()
        }
    }

    if (!timer.done()) {
        el.classList.add("disabled")
    }

    timer.watch(() => {
        if (timer.done()) {
            el.classList.remove("disabled")
        } else {
            el.classList.add("disabled")
        }
    })

    return el
}

export function box(label, contents) {
    return m("div",
        m("label.box", label),
        m("div.box", ...contents)
    )
}
