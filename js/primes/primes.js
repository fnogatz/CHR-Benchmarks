module.exports = test

function test (a) {
  var res = genPrimes(a)
  console.log(res)
}

function genPrimes (upto) {
  var primes = []
  primes[0] = 2
  var n = 1
  var k
  var t
  for (var j = 3; j <= upto; j++) {
    k = 0
    while (k < n) {
      t = primes[k]
      if ((j % t) == 0) {
        break
      }
      k++
    }
    if (k === n) {
      primes[n++] = j
    }
  }
  ret = primes[n-1]
  return ret
}

test(parseInt(process.argv[2]))
