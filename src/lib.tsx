export type Value<T> = T | Gettable<T>

export function get<T>(value: Value<T>): T {
    if (value instanceof Gettable) return value.value
    return value
}

export class Watchable {
    callbacks: Array<() => void> = []

    fire() {
        this.callbacks.forEach((cb) => cb())
    }

    watch(cb: () => void) {
        this.callbacks.push(cb)
    }
}

export abstract class Gettable<T> extends Watchable {
    abstract value: T
}

export class GVar<T> extends Gettable<T> {
    name: string;
    default: T;

    private _value: T;

    constructor(name: string, value: T) {
        super()

        this.name = name
        this.default = value
        this._value = load(name, value)
    }

    get value() {
        return this._value
    }

    set value(v) {
        this._value = v
        save(this.name, v)
        this.fire()
    }
}

interface WithId {
    id: string;
}

export class ArrVar<T extends WithId> extends GVar<string[]> {
    constructor(name: string) {
        super(name, [])
    }

    push(...vs: T[]) {
        this.value.push(...vs.map((v) => v.id))
    }
}

export class Var extends GVar<number> {
    add(amt: number) {
        this.value += amt
    }

    use(amt: number) {
        this.value -= amt
    }
}

export class Eq<T> extends Gettable<T> {
    func: () => T

    constructor(func: () => T, use: Array<any>) {
        super()

        this.func = func

        for (const dep of use) {
            if (dep instanceof Watchable) {
                dep.watch(() => this.fire())
            }
        }
    }

    get value() {
        return this.func()
    }
}

export class Timer extends Watchable {
    name: string
    time: number
    start: number

    constructor(name: string) {
        super()

        this.name = name
        this.time = load(name, 0)
        this.start = load(name + ".start", 0)

        if (this.time > Date.now()) {
            setTimeout(() => this.fire(), this.time - Date.now())
        }
    }

    set(length: number) {
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

function save<T>(name: string, value: T) {
    localStorage.setItem(name, JSON.stringify(value))
}

function load<T>(name: string, def: T): T {
    const data = localStorage.getItem(name)
    
    if (data) {
        return JSON.parse(data)
    }

    return def
}

export function seconds(amu: number) {
    return amu * 1000
}

export function minute(amu: number) {
    return seconds(amu * 60)
}
