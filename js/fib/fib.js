module.exports = test

function test (a) {
  console.log(fib(a))
}

function fib(num){
  var a = 1
  var b = 0
  var temp

  while (num >= 0){
    temp = a
    a = a + b
    b = temp
    num--
  }

  return b
}

test(parseInt(process.argv[2]))
