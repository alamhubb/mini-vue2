function A() {}
let a = new A();
// __proto__会引用构造函数的prototype
a.__proto__ === A.prototype;

console.log(a.__proto__)
console.log(A.prototype)
console.log(A.__proto__)
console.log('sadf'.__proto__)

// A.prototype === Object.prototype
a.__proto__.__proto__ === Object.prototype;

