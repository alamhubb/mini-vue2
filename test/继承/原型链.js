//重要缺点，1.父类上的引用属性共享，
//2. 修改子类原型链，会直接修改父类
//3. 会更改构造函数

function Person() {
  this.name = 'qqq'
  this.pp = ['sdf']
  return this
}

Person.prototype.age = 10


function Per() {
  this.dudu = 'kkk'
}

const person1 = new Person()

Per.prototype = new Person()

per1 = new Per()
per2 = new Per()


per1.pp.push('123')

console.log(person1.name)
console.log(person1.age)
console.log(person1.ka)
console.log(person1.pp)

console.log(per1.name)
console.log(per1.age)
console.log(111111111)
console.log(per1.dudu)
console.log(112222)
console.log(per1.pp)
console.log(per2.pp)
