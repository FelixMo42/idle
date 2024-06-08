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
    constructor(name) {
        super()

        this.name = name
        this.time = load(name, 0)
        this.start = load(name + ".start", 0)

        if (this.time > Date.now()) {
            setTimeout(() => this.fire(), this.time - Date.now())
        }
    }

    set(length) {
        // update data
        this.time = Date.now() + length
        this.start = Date.now()
        
        // save it
        save(this.name, this.time)
        save(this.name + ".start", this.start)

        // trigger callbacks
        this.fire()
        setTimeout(() => this.fire(), length)
    }

    percent() {
        if (this.done()) return 0
        if (this.time === 0) return 0

        const duration = this.time - this.start
        const elapsed = Date.now() - this.start

        return 100 - Math.floor(elapsed / duration * 10000) / 100
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