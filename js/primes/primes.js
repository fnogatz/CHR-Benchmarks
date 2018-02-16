module.exports = test

function test (a) {
  console.log('done')
  //console.log(primes(a))
}

function primes (n) {
  var array = []
  var upperLimit = Math.sqrt(n)
  var output = []
  var i

  for (i = 0; i < n; i++) {
    array.push(true)
  }

  for (i = 2; i <= upperLimit; i++) {
    if (array[i]) {
      for (var j = i * i; j < n; j += i) {
        array[j] = false;
      }
    }
  }

  for (i = 2; i < n; i++) {
    if(array[i]) {
      output.push(i);
    }
  }

  return output;
}

test(parseInt(process.argv[2]))
