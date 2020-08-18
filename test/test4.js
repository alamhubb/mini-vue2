function A() {
  this.hah = 'haha'
  this.ee = ['a']
}

function B() {
  this.bb = 'bb'
}

B.prototype = new A()

const aa = new A()

const b = new B()
const c = new B()

const hah = A

console.log(null instanceof Object)
console.log(hah.__proto__)
console.log(hah.prototype)
console.log(A.prototype.__proto__)
