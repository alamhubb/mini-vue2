import Dep from "./Dep.js";

const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto)

export function def(obj, key, val, enumerable) {
  if (typeof obj === 'object') {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    })
  }
}


const interceptor = [
  'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'
]


interceptor.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    console.log(args)
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    console.log(ob.dep)
    ob.dep.notify()
    return result
  })
})


function observe(value, asRootData) {
  if (typeof value !== 'object') {
    return
  }
  let ob
  if (value.__ob__ && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}

export default class Observer {
  value
  dep
  vmCount // number of vms that has this object as root $data

  constructor(value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    //把当前这个observer挂载到value上
    //child.__ob__.dep.depend()
    def(value, '__ob__', this)

    console.log(value)
    if (Array.isArray(value)) {
      console.log(value.__proto__)
      Object.setPrototypeOf(value, arrayMethods)
      console.log(value.__proto__)
      this.observeArray(value)
    } else {
      this.observeObj(value)
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      new Observer(items[i])
    }
  }

  //为属性添加get set
  observeObj(value) {
    if (!value || typeof value !== 'object') {
      return
    }
    Object.keys(value).forEach(key => {
      console.log(value)
      this.defineReactive(value, key, value[key])
    })
  }

  defineReactive(obj, key, val) {
    let childOb = observe(val)
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        //只有创建watch时，才收集依赖，只有编译模板时才创建watcher
        if (Dep.target) {
          dep.depend()
          if (childOb) {
            childOb.dep.depend()
            if (Array.isArray(val)) {
              dependArray(val)
            }
          }
        }
        return val
      },
      // set(newValue){
      set: newValue => {
        if (newValue === val) {
          return
        }
        val = newValue
        observe(newValue)
        dep.notify()
      }
    })
  }
}
