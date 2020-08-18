import Dep from "./Dep.js";

export default class Watcher {
  vm = null
  key = null
  callBack = null
  oldValue = null

  constructor(vm, key, callBack) {
    this.vm = vm;
    this.key = key;
    this.callBack = callBack;

    Dep.target = this
    this.oldValue = this.vm[key]
    Dep.target = null
  }


  update() {
    let newValue = this.vm[this.key]
    if (!Array.isArray(newValue)) {
      if (this.oldValue === newValue) {
        return
      }
    }
    this.callBack(newValue)
  }
}
