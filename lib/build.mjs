import pck from "../package.json" assert { type: "json" }
import * as esbuild from 'esbuild'

const banner = `
    function _(tagName, props, ...children) {
        if (typeof tagName === "function") {
            return tagName({ ...props, children })
        }

        const el = document.createElement(tagName)

        if (props) {
            if ("class" in props) {
                el.classList.add(...props["class"].split(" "))
            }
        }

        el.replaceChildren(...children)

        return el
    }
`

async function build() {
    const context = await esbuild.context({
        entryPoints: [pck.main],
        bundle: true,
        minify: true,
        banner: { js: banner },
        sourcemap: true,
        outfile: "out/index.js",
        jsx: "transform",
        jsxFactory: "_",
        logLevel: "info"
    })
    await context.watch()
    console.log('Watching...')
}

build()