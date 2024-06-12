import { Gettable, Timer, Value, Watchable, get } from "./lib.tsx"

type HTMLNode = Node | Value<string> | Value<number>

export function m(desc: string, ...children: HTMLNode[]) {
    const [tagName, ...classList] = desc.split(".")
    const el = document.createElement(tagName)
    el.classList.add(...classList)
    el.replaceChildren(...children.map((c) => {
        function format(v: Node | string | number): Node | string {
            if (typeof v === "number") {
                return String(Math.floor(v * 100) / 100)
            } else {
                return v
            }
        }

        if (c instanceof Gettable) {
            const cel = m("span", format(c.value))
            c.watch(() => cel.replaceChildren(format(c.value)))
            return cel
        } else {
            return format(c)
        }
    }))
    return el
}

export function s(...parts: any) {
    const make = () => parts
        .map((part: any) => {
            if (part instanceof Gettable) {
                if (typeof get(part) === "number") {
                    return Math.floor(get(part) * 100) / 100
                }

                return get(part)
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

export function button(text: HTMLNode, onclick: () => void) {
    const el = m("div.button", text)
    el.onclick = onclick
    return el
}

export function buttonWithTimer(text: HTMLNode, timer: Timer, onclick: () => void) {
    const cooldown = m("div.cooldown")

    const el = m("div.button", text, cooldown)

    setInterval(() => {
        cooldown.style.width = `${timer.percent()}%`

        if (timer.done()) {
            el.classList.remove("disabled")
        } else {
            el.classList.add("disabled")
        }
    }, 10)

    el.onclick = () => {
        if (timer.done()) {
            onclick()
        } else {
            timer.logTimeLeft()
        }
    }

    return el
}

export function box(label: HTMLNode, contents: HTMLNode[]) {
    return <div>
        <span class="box"><span>{label}</span></span>
        <div class="box">{...contents}</div>
    </div>
}

interface BoxeParams {
    label: HTMLNode,
    contents: HTMLNode[],
    fadeIn?: boolean
}

export function boxe(params: BoxeParams) {
    const el = <div>
        <span class="box"><span>{params.label}</span></span>
        <div class="box">{...params.contents}</div>
    </div>

    if (params.fadeIn) {
        el.classList.add("fade-in")
    }

    return el
}

export function cond(show: Gettable<boolean> | undefined, el: HTMLElement) {
    if (show === undefined) {
        return el
    }

    function check() {
        if (show?.value) {
            el.classList.remove("hide")
        } else {
            el.classList.add("hide")
        }
    }

    show.watch(check)

    check()

    return el
}