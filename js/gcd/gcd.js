module.exports = test

function test (a, b) {
  console.log(gcd(a, b))
}

function gcd (a, b) {
  while (true) {
    if (b == 0) return a;
    if (a >= b) {
      a -= b;
      continue;
    }
    c = b - a
    b = a
    a = c
  }
}

test(parseInt(process.argv[2]), parseInt(process.argv[3]) || 5)
