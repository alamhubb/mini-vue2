function Person(){
  this.a = 'a'
}
//我们定义一个函数来覆盖C3原型中的constructor，试图改变属性p的值
function fake(){
  this.a = 'b';
}

Person.prototype.constructor = fake; //覆盖C3原型中的constructor
var person = new Person();
console.log(person.constructor)
console.log(person.constructor === fake)
console.log(person.a)



