// 父类初始化实例属性和原型的属性和方法
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
};

// 借用构造函数继承构造函数的实例的属性(解决引用类型共享的问题)
function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

// 将子类型的原型重写替换成父类的原型
inheritPrototype(SubType, SuperType);

//寄生式继承的基本模式
function inheritPrototype(subType, superType) {
  var prototype = Object.create(superType.prototype); // 创建对象，创建父类原型的一个副本
  prototype.constructor = subType; // 增强对象，弥补因重写原型而失去的默认的constructor 属性
  subType.prototype = prototype; // 指定对象，将新创建的对象赋值给子类的原型
}


// 对子类添加自己的方法
SubType.prototype.sayAge = function() {
  console.log(this.age);
};

var instance1 = new SubType("heyushuo");
var instance2 = new SubType("kebi");
instance1.sayName(); //heyushuo
instance2.sayName(); //kebi
instance1.colors.push("yellow"); // ["red", "blue", "green", "yellow"]
instance1.colors.push("black"); // ["red", "blue", "green", "black"]
