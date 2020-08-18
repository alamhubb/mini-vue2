//组合方式，缺点，调用两次，构造函数指向问题
function Person(name) {
  this.name = name | 'qqq'
}

Person.prototype.age = 10

function Per(name) {
  Person.call(this, name)
}

//Person.prototype
Per.prototype = new Person()

const per1 = new Per('dudu')

console.log(per1.name)
console.log(per1.constructor)
console.log(per1.age)
console.log(per1 instanceof Person)
