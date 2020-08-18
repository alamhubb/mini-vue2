//与原型链相比，没有命名子类，而是匿名子类，需要把父对象赋值到空对象的原型上，然后new出空对象复制给子对象
function Person() {
  this.name = 'qqq'
  this.qq = ['qqq']
}

Person.prototype.age = 10

function content(parent){
  function F(){}
  F.prototype = parent
  return new F()
}

const person = new Person();

per1 = content(person)
per2 = content(person)

per1.qq.push('123')

console.log(per1.name)
console.log(per1.age)
console.log(per1.qq)

console.log(per2.name)
console.log(per2.age)
console.log(per2.qq)
console.log(per1 instanceof Person)
