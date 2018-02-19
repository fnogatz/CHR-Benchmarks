module.exports = test

function test (a) {
  var res = ram(a)
  //console.log(res)
  console.log('done')
}

function ram(num) {
  num = num || 10000
  var mem = [0, 1, num, 0]

  var prog = [
    [0, 'halt',  0, 0],
    [2, 'add',   1, 3],
    [3, 'sub',   1, 2],
    [1, 'cjump', 2, 4],
    [0, 'halt',  0, 0]
  ]

  var pos = 1
  var curr
  l: while(true) {
    curr = prog[pos]
    switch(curr[1]) {
      case 'add':
        mem[curr[3]] += mem[curr[2]]
        pos = curr[0]
        break
      case 'sub':
        mem[curr[3]] -= mem[curr[2]]
        pos = curr[0]
        break
      case 'mult':
        mem[curr[3]] *= mem[curr[2]]
        pos = curr[0]
        break
      case 'div':
        mem[curr[3]] /= mem[curr[2]]
        pos = curr[0]
        break
      case 'move':
        mem[curr[3]] = mem[curr[2]]
        pos = curr[0]
        break
      case 'i_move':
        mem[curr[3]] = mem[mem[curr[2]]]
        pos = curr[0]
        break
      case 'move_i':
        mem[mem[curr[3]]] = mem[curr[2]]
        pos = curr[0]
        break
      case 'const':
        mem[curr[3]] = curr[2]
        pos = curr[0]
        break
      case 'jump':
        pos = curr[3]
        break
      case 'cjump':
        if (mem[curr[2]] === 0) {
          pos = curr[3]
        } else {
          pos = curr[0]
        }
        break
      case 'halt':
        break l
    }
  }

  return mem
}

test(parseInt(process.argv[2]))
