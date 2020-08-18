function Person() {
  console.log(this.constructor)
  console.log(Person.constructor)
  this.constructor = Person.constructor
  console.log(this.constructor ===Person.constructor)
}

Person.constructor = () => {
  console.log(123)
}

new Person()


