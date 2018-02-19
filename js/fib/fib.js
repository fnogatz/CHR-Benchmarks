module.exports = test

function test (a) {
  var res = fib(a)
  //console.log(res)
  console.log('done')
}

function fib(num){
  var a = 1
  var b = 0
  var temp

  while (num >= 0) {
    temp = a
    a = a + b
    b = temp
    num--
    if (num % 1470 === 0) { // avoid crashing Number.MAX_VALUE
      a = 1
      b = 0
    }
  }

  return b
}

test(parseInt(process.argv[2]))
