在创建vue对象的时候，代理所有对象，创建get和set方法。

在编译vue模板时，收集依赖。

在使用了vue属性的地方，创建watcher

在get方法种，将watcher，添加进观察者中。

在set方法中，触发watch的update，所有使用了

