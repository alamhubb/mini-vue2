
console.log(1)

export default class ColorLight {
  colors = [
    {color: 'green', time: 3000},
    {color: 'yellow', time: 1000},
    {color: 'red', time: 2000},
  ]

  index = 0

  excLight(time) {
    return new Promise((resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    }))
  }
}

