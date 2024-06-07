export class Watchable {
    callbacks = []

    fire() {
        this.callbacks.forEach((cb) => cb(this))
    }

    watch(cb) {
        this.callbacks.push(cb)
    }
}

export class Var extends Watchable {
    constructor(name, value) {
        super()

        this.default = value
        this._value = load(name, value)
        this.name = name
    }

    get value() {
        return this._value
    }

    set value(v) {
        this._value = v
        save(this.name, v)
        this.fire()
    }

    add(amt) {
        this.value += amt
    }

    use(amt) {
        this.value -= amt
    }
}

export class Eq extends Watchable {
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

export class Timer extends Watchable {
    time = 0

    constructor(name) {
        super()

        this.name = name
        this.time = load(name, 0)

        if (this.time > Date.now()) {
            setTimeout(() => this.fire(), this.time - Date.now())
        }
    }

    set(length) {
        if (!length) throw new Error("no length!")
        this.time = Date.now() + length
        save(this.name, this.time)
        this.fire()
        setTimeout(() => this.fire(), length)
    }

    done() {
        return Date.now() > this.time
    }

    logTimeLeft() {
        const left = this.time - Date.now()

        const seconds = Math.floor(left / 1000) % 60
        const minutes = Math.floor(left / 1000 / 60) % 60
        const hours = Math.floor(left / 1000 / 60 / 60)

        console.log(`${hours}h ${minutes}m ${seconds}s`)
    }
}

function save(name, value) {
    localStorage.setItem(name, JSON.stringify(value))
}

function load(name, def) {
    const data = localStorage.getItem(name)
    
    if (data) {
        return JSON.parse(data)
    }

    return def
}

export function seconds(amu) {
    return amu * 1000
}

export function minute(amu) {
    return seconds(amu * 60)
}

export function toObj(arr, func) {
    let obj = {}

    arr.forEach(v => {
        obj = {
            ...obj,
            ...func(v)
        }
    })

    return obj
}