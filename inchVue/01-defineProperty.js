// Object.defineProperty()

function defineProperty(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key)
            return val
        },
        set(newVal) {
            if (val !== newVal) {
                val = newVal
                console.log('set', key)
            }
        }
    })
}

const obj = {}

defineProperty(obj, 'foo', '1')
obj.foo
obj.foo = '2'


