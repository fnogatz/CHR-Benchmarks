/**
  *
  *  Automatically generated
  *  Do not edit
  *
  *  Created using CHR.js AOT compiler
  *  (CHR.js version v3.3.1)
  *  http://github.com/fnogatz/CHR.js
  *
  */

function test (a) {
  var chr = CHR()
  chr.upto(a)
  console.log('done')
  //console.log(chr.Store.toString())
}

test(parseInt(process.argv[2]))


function CHR () {

  /* eslint no-labels: ["error", { "allowLoop": true }] */
  
  // Constraint
  function Constraint (name, arity, args) {
    this.name = name
    this.arity = arity
    this.functor = name + '/' + arity
    this.args = args
    this.id = null
    this.alive = true
    this.activated = false
    this.stored = false
    this.hist = null
    this.cont = null
  }
  
  Constraint.prototype.continue = function () {
    this.cont[0].call(this, this, this.cont[1])
  }
  
  Constraint.prototype.toString = function () {
    var s = this.name
    if (this.arity >= 1) {
      s += '(' + this.args.join(',') + ')'
    }
    return s
  }
  
  // Store
  function Store () {
    this._index = {}
    this._size = 0
    this._nextId = 0
  }
  
  Store.prototype.add = function (constraint) {
    if (!this._index.hasOwnProperty(constraint.functor)) {
      this._index[constraint.functor] = []
    }
    constraint.id = this._nextId
    this._index[constraint.functor].push(constraint)
    this._size += 1
    this._nextId += 1
  }
  
  Store.prototype.remove = function (constraint) {
    constraint.alive = false
    var ix = this._index[constraint.functor].indexOf(constraint)
    this._index[constraint.functor].splice(ix, 1)
  
    this._size -= 1
  }
  
  Store.prototype.lookup = function (rule, patterns, constraint) {
    var ret = this.lookupResume(rule, patterns, constraint, 0)
    if (!ret || !ret.res) {
      return false
    }
    return ret.res
  }
  
  Store.prototype.lookupResume = function (rule, patterns, constraint, startFrom) {
    startFrom = startFrom || 0
  
    var lastPattern = patterns.length - 1
    var lengths = []
    var divs = []
    var div = 1
    var i
  
    // build array of arrays
    var arr = []
    for (i = 0; i <= lastPattern; i++) {
      if (patterns[i] === '_') {
        // "_" is a placeholder for the given `constraint`
        arr[i] = [ constraint ]
      } else if (this._index.hasOwnProperty(patterns[i])) {
        arr[i] = this._index[patterns[i]]
      } else {
        // not a single element for this functor
        return false
      }
    }
  
    for (i = lastPattern; i >= 0; i--) {
      lengths[i] = arr[i].length
      divs[i] = div
      div *= arr[i].length
    }
    var max = divs[0] * arr[0].length
  
    var res
    var resIds
    var curr
    loopng: for (var n = startFrom; n < max; n++) {
      res = []
      resIds = []
      curr = n
      for (i = 0; i <= lastPattern; i++) {
        res[i] = arr[i][curr / divs[i] >> 0]
        resIds[i] = res[i].id
  
        // avoid multiple occurences of the same constraint
        if (res.slice(0, i).indexOf(res[i]) !== -1) {
          continue loopng
        }
  
        curr = curr % divs[i]
      }
  
      // check if already in history
  /*
      if (history.lookup(rule, resIds)) {
        continue loopng
      }
  */
      return {
        n: n,
        res: res
      }
    }
  
    return false
  }
  
  Store.prototype.size = function () {
    return this._size
  }
  
  Store.prototype.valueOf = function () {
    return this.size()
  }
  
  Store.prototype.toString = function () {
    if (this.size() === 0) {
      return '(empty)'
    }
  
    var maxLengthC = 'constraint'.length
    var maxLengthI = 'id'.length
    var rows = []
    var functor
    for (functor in this._index) {
      this._index[functor].forEach(function (c) {
        var s = c.toString()
        maxLengthC = Math.max(s.length, maxLengthC)
        maxLengthI = Math.max(c.id.toString().length + 1, maxLengthI)
      })
    }
    for (functor in this._index) {
      this._index[functor].forEach(function (c) {
        rows.push(c.id.toString().padStart(maxLengthI) + ' | ' + c.toString().padEnd(maxLengthC))
      })
    }
  
    return [
      'id'.padStart(maxLengthI) + ' | ' + 'constraint'.padEnd(maxLengthC),
      ''.padStart(maxLengthI, '-') + '-+-' + ''.padEnd(maxLengthC, '-')
    ].concat(rows).join('\n')
  }
  
  // History
  /*
  function History () {
    this._index = {}
    this._size = 0
  }
  
  History.prototype.size = function () {
    return this._size
  }
  
  History.prototype.valueOf = function () {
    return this.size()
  }
  
  History.prototype.toString = function () {
    if (this.size() === 0) {
      return "(empty)"
    }
  
    var maxLength_r = "rule".length
    var maxLength_f = "fired with".length
    var rows = []
    var curr
    for (var rule in this._index) {
      maxLength_r = Math.max(rule.toString().length, maxLength_r)
    }
  
    // TODO
  }
  
  History.prototype.add = function (rule, ids) {
    if (!this._index.hasOwnProperty(rule)) {
      this._index[rule] = {}
    }
  
    var curr = this._index[rule]
    for (var i = 0; i < ids.length-1; i++) {
      if (!curr.hasOwnProperty(ids[i])) {
        curr[ids[i]] = {}
      }
      curr = curr[ids[i]]
    }
    curr[ids[i]] = true
  
    this._size += 1
  }
  
  History.prototype.lookup = function (rule, ids) {
    if (!this._index.hasOwnProperty(rule)) {
      return false
    }
  
    var curr = this._index[rule]
    for (var i = 0; i < ids.length; i++) {
      if (!curr[ids[i]]) {
        return false
      }
      curr = curr[ids[i]]
    }
  
    if (curr !== true) {
      return false
    }
  
    return true
  }
  */
  // trampoline
  function trampoline () { // eslint-disable-line
    var constraint
    while (constraint = stack.pop()) { // eslint-disable-line
      constraint.continue()
    }
  }
  
  var chr = { // eslint-disable-line
    Store: new Store()
  }
  
  var stack = []
  // var history = new History()
  
  function __upto_1_0 (constraint, __n) {
    __n = __n || 0

    var N = constraint.args[0]

    ;(function () {
      var _c = new Constraint("fib", 2, [ 0, 1 ])
      _c.cont = [__fib_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("fib", 2, [ 1, 1 ])
      _c.cont = [__fib_2_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__upto_1_1, 0]
    stack.push(constraint)
    return
  }

  function __fib_2_0 (constraint, __n) {
    __n = __n || 0

    var N1 = constraint.args[0]
    var M1 = constraint.args[1]

    var constraintPattern = [ "upto/1", "fib/2", "_" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__fib_2_1, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var Max = constraints[0].args[0]

    var N2 = constraints[1].args[0]
    var M2 = constraints[1].args[1]

    if (!(Max > N2 && N2 === (N1 + 1))) {
      constraint.cont = [__fib_2_0, __n + 1]
      stack.push(constraint)
      return
    }

    ;(function () {
      var _c = new Constraint("fib", 2, [ N2 + 1, M1 + M2 ])
      _c.cont = [__fib_2_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __fib_2_1 (constraint, __n) {
    __n = __n || 0

    var N2 = constraint.args[0]
    var M2 = constraint.args[1]

    var constraintPattern = [ "upto/1", "_", "fib/2" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__fib_2_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var Max = constraints[0].args[0]

    var N1 = constraints[2].args[0]
    var M1 = constraints[2].args[1]

    if (!(Max > N2 && N2 === (N1 + 1))) {
      constraint.cont = [__fib_2_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("fib", 2, [ N2 + 1, M1 + M2 ])
      _c.cont = [__fib_2_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__fib_2_1, __n + 1]
    stack.push(constraint)
    return
  }

  function __upto_1_1 (constraint, __n) {
    __n = __n || 0

    var Max = constraint.args[0]

    var constraintPattern = [ "_", "fib/2", "fib/2" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__upto_1_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var N2 = constraints[1].args[0]
    var M2 = constraints[1].args[1]

    var N1 = constraints[2].args[0]
    var M1 = constraints[2].args[1]

    if (!(Max > N2 && N2 === (N1 + 1))) {
      constraint.cont = [__upto_1_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("fib", 2, [ N2 + 1, M1 + M2 ])
      _c.cont = [__fib_2_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__upto_1_1, __n + 1]
    stack.push(constraint)
    return
  }

  function __upto_1_2 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function __fib_2_2 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function upto () {
    var args = Array.prototype.slice.call(arguments)
    var arity = arguments.length
    var functor = "upto/" + arity
    var constraint = new Constraint("upto", arity, args)
    if (arity === 1) {
      constraint.cont = [__upto_1_0, ]
    } else {
      throw new Error("Undefined constraint: " + functor)
    }
    stack.push(constraint)

    trampoline()
  }

  function fib () {
    var args = Array.prototype.slice.call(arguments)
    var arity = arguments.length
    var functor = "fib/" + arity
    var constraint = new Constraint("fib", arity, args)
    if (arity === 2) {
      constraint.cont = [__fib_2_0, ]
    } else {
      throw new Error("Undefined constraint: " + functor)
    }
    stack.push(constraint)

    trampoline()
  }

  chr.upto = upto
  chr.fib = fib

  return chr
}
