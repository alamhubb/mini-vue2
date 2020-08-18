function Person() {
  this.name = 'qqq'
}

Person.prototype.age = 10

function Per() {
  this.name = 'kkk'
}

Per.prototype = new Person()

per1 = new Per()

console.log(per1.name)
console.log(per1.age)
