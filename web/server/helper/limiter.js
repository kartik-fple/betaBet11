class Limiter {
    constructor({key, ip, onClearLimit, onBlock}) {
        this.key = key
        this.ip = ip
        this.onClearLimit = onClearLimit
        this.count = 0
        this.timer = null
        this.onBlock = onBlock
    }
    isBlocked() {
        this.count += 1
        if (this.count > 14) {
            clearTimeout(this.timer)
            this.timer = null
            this.onBlock(this.ip, this.key)
            return true
        }
        if (this.timer) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            clearTimeout(this.timer)
            this.timer = null
            this.onClearLimit(this.key)
        }, 100)
        return false
    }
}

export default Limiter