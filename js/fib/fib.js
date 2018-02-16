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

  while (num >= 0){
    temp = a
    a = a + b
    b = temp
    num--
  }

  return b
}

test(parseInt(process.argv[2]))
