// 定义一个动物类
function Animal(name) {
  // 属性
  this.name = name || 'Animal';
  // 实例方法
  this.sleep = function () {
    console.log(this.name + '正在睡觉！');
  }
}

Animal.prototype.child = ['123']

// 原型方法
Animal.prototype.eat = function (food) {
  console.log(this.name + '正在吃：' + food);
};

const a1 = new Animal()
const a2 = new Animal()
console.log(a1.child)
console.log(a2.child)
a1.child.push('222')
console.log(a1.child)
console.log(a2.child)

