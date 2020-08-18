if (!Object.create) {
  Object.create = function (o) {
    function F() {
    }  //定义了一个隐式的构造函数
    F.prototype = o;
    return new F();  //其实还是通过new来实现的
  };
}

function Person(name) {
  this.name = name
  this.hello = function () {
    console.log(this.name)
  }
}

Person.prototype.age = 10

//1 原型继承
//无法继承实例属性，无法像父类构造函数传参，共享属性修改一个实例全部修改  包含引用类型的属性值始终都会共享相应的值，和原型链继承一样
/*function Per() {
}

Per.prototype = new Person()

var per1 = new Per('dd');

console.log(per1.name)
console.log(per1.age)*/

//缺点，原型不等，无法继承原型上的属性，
function Con() {
  Person.call(this, 'jer')
}

var con1 = new Con()
console.log(con1.name)
console.log(con1.age)
console.log(con1 instanceof Person)


Object.create1 = function (prototype) {
  var cls = function () {
  }
  cls.prototype = prototype;
  return new cls;
}

const haha = Object.create1(null)

console.log(typeof haha)
console.log(typeof null)
console.log(Object.prototype.toString.call(Con))
console.log(new Con)


function QPr(exc) {
  this.then = (cb) => {
    this.cb = cb
  }

  this.resolve = (res) => {
    console.log(res)
    console.log(this)
    this.cb(res)
  }

  exc(this.resolve)
}

//极简的实现
class QPromise {
  cb;

  constructor(fn) {
    fn(this._resolve);
  }

  then=(onFulfilled)=> {
    this.cb = onFulfilled;
  }

  _resolve =(value)=> {
    console.log(this)
    this.cb(value);
  }
}

new QPromise((resolve) => {
  console.log(123)
  resolve('dudu')
  console.log(456)
}).then((res) => {
  console.log(res)
})
