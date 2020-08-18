//构造函数、不获取父类原型，不在原型链上
function Person(name) {
  this.name = name | 'qqq'
}

Person.prototype.age = 10

function Per(name) {
  Person.call(this, name)
}

const per1 = new Per('dudu')

console.log(per1.name)
console.log(per1.age)
console.log(per1 instanceof Person)
