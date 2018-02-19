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

  chr.mem(1,1)
  chr.mem(2,a)
  chr.mem(3,0)
  chr.prog_counter(1)
  chr.prog(1,2,'add',1,3)
  chr.prog(2,3,'sub',1,2)
  chr.prog(3,1,'cjump',2,4)
  chr.prog(4,0,'halt',0)

  //console.log('done')
  console.log(chr.Store.toString())
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
    if (!this._index[constraint.functor]) {
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
      } else if (this._index[patterns[i]]) {
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
  
  function __prog_counter_1_0 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(0, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_1, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "add") {
      constraint.cont = [__prog_counter_1_0, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_0, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X + Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_0 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(0, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_1, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "add") {
      constraint.cont = [__mem_2_0, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_0, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X + Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_1 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var Y = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(0, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "add") {
      constraint.cont = [__mem_2_1, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X + Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_1, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_0 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "add") {
      constraint.cont = [__prog_5_1, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(0, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_1, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_0, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X + Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_0, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_1 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "sub") {
      constraint.cont = [__prog_counter_1_1, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X - Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_2 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_3, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "sub") {
      constraint.cont = [__mem_2_2, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_2, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X - Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_3 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var Y = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_4, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "sub") {
      constraint.cont = [__mem_2_3, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_3, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X - Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_3, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_1 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "sub") {
      constraint.cont = [__prog_5_2, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(1, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X - Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_1, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_2 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(2, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_3, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "mult") {
      constraint.cont = [__prog_counter_1_2, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_2, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X * Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_4 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(2, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_5, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "mult") {
      constraint.cont = [__mem_2_4, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_4, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X * Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_5 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var Y = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(2, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_6, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "mult") {
      constraint.cont = [__mem_2_5, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_5, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X * Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_5, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_2 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "mult") {
      constraint.cont = [__prog_5_3, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(2, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_3, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_2, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X * Y ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_2, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_3 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(3, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_4, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "div") {
      constraint.cont = [__prog_counter_1_3, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_3, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, (X / Y) >> 0 ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_6 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(3, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_7, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "div") {
      constraint.cont = [__mem_2_6, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_6, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, (X / Y) >> 0 ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_7 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var Y = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(3, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_8, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "div") {
      constraint.cont = [__mem_2_7, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_7, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, (X / Y) >> 0 ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_7, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_3 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "div") {
      constraint.cont = [__prog_5_4, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(3, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_4, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var Y = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_3, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, (X / Y) >> 0 ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_3, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_4 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(4, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_5, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "move") {
      constraint.cont = [__prog_counter_1_4, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var QQ = constraints[2].args[1]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_4, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_8 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var QQ = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(4, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_9, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "move") {
      constraint.cont = [__mem_2_8, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_8, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_9 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(4, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_10, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "move") {
      constraint.cont = [__mem_2_9, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var QQ = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_9, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_9, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_4 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "move") {
      constraint.cont = [__prog_5_5, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(4, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_5, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var QQ = constraints[2].args[1]

    var L_0 = constraints[3].args[0]

    if (!(B === B_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_4, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])
    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_4, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_5 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(5, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_6, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__prog_counter_1_5, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var C = constraints[1].args[1]

    var C_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var A_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    if (!(B === B_0 && C === C_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_5, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_10 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var QQ = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(5, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_11, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_10, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var C = constraints[1].args[1]

    var C_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && C === C_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_10, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_11 (constraint, __n) {
    __n = __n || 0

    var C_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(5, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_12, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_11, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var C = constraints[1].args[1]

    var A_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && C === C_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_11, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_11, __n + 1]
    stack.push(constraint)
    return
  }

  function __mem_2_12 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var C = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(5, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_13, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_12, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var C_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var A_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && C === C_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_12, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_12, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_5 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "i_move") {
      constraint.cont = [__prog_5_6, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(5, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_6, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var C = constraints[1].args[1]

    var C_0 = constraints[2].args[0]
    var X = constraints[2].args[1]

    var A_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && C === C_0 && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_5, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_5, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_6 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(6, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_7, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__prog_counter_1_6, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var C = constraints[2].args[1]

    var C_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    if (!(B === B_0 && A === A_0 && C === C_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_6, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])

    ;(function () {
      var _c = new Constraint("mem", 2, [ C, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_13 (constraint, __n) {
    __n = __n || 0

    var C_0 = constraint.args[0]
    var QQ = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "mem/2", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(6, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_14, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_13, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var C = constraints[2].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && A === A_0 && C === C_0 && L === L_0)) {
      constraint.cont = [__mem_2_13, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ C, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_14 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var C = constraint.args[1]

    var constraintPattern = [ "prog/5", "mem/2", "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(6, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_15, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_14, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var C_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && A === A_0 && C === C_0 && L === L_0)) {
      constraint.cont = [__mem_2_14, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ C, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_14, __n + 1]
    stack.push(constraint)
    return
  }

  function __mem_2_15 (constraint, __n) {
    __n = __n || 0

    var B_0 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(6, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_16, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "i_move") {
      constraint.cont = [__mem_2_15, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[2].args[0]
    var C = constraints[2].args[1]

    var C_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && A === A_0 && C === C_0 && L === L_0)) {
      constraint.cont = [__mem_2_15, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ C, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_15, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_6 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "i_move") {
      constraint.cont = [__prog_5_7, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "mem/2", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(6, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_7, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var B_0 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var A_0 = constraints[2].args[0]
    var C = constraints[2].args[1]

    var C_0 = constraints[3].args[0]
    var QQ = constraints[3].args[1]

    var L_0 = constraints[4].args[0]

    if (!(B === B_0 && A === A_0 && C === C_0 && L === L_0)) {
      constraint.cont = [__prog_5_6, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[3])
    chr.Store.remove(constraints[4])

    ;(function () {
      var _c = new Constraint("mem", 2, [ C, X ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_6, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_7 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(7, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_8, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "const") {
      constraint.cont = [__prog_counter_1_7, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var A_0 = constraints[1].args[0]
    var QQ = constraints[1].args[1]

    if (!(Const === "const" && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_counter_1_7, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[1])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, B ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_16 (constraint, __n) {
    __n = __n || 0

    var A_0 = constraint.args[0]
    var QQ = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(7, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_17, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "const") {
      constraint.cont = [__mem_2_16, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]
    var A = constraints[0].args[4]

    var L_0 = constraints[2].args[0]

    if (!(Const === "const" && A === A_0 && L === L_0)) {
      constraint.cont = [__mem_2_16, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, B ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __prog_5_7 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "const") {
      constraint.cont = [__prog_5_8, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(7, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_8, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var A_0 = constraints[1].args[0]
    var QQ = constraints[1].args[1]

    var L_0 = constraints[2].args[0]

    if (!(Const === "const" && A === A_0 && L === L_0)) {
      constraint.cont = [__prog_5_7, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[1])
    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("mem", 2, [ A, B ])
      _c.cont = [__mem_2_0, 0]
      stack.push(_c)
    })()

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_7, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_8 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/4", "_" ]
    var lookupResult = chr.Store.lookupResume(8, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_9, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var QQ = constraints[0].args[1]
    if (constraints[0].args[2] !== "jump") {
      constraint.cont = [__prog_counter_1_8, __n + 1]
      stack.push(constraint)
      return
    }
    var A = constraints[0].args[3]

    if (!(L === L_0)) {
      constraint.cont = [__prog_counter_1_8, __n + 1]
      stack.push(constraint)
      return
    }

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ A ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __prog_4_0 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var QQ = constraint.args[1]
    if (constraint.args[2] !== "jump") {
      constraint.cont = [__prog_4_1, 0]
      stack.push(constraint)
      return
    }
    var A = constraint.args[3]

    var constraintPattern = [ "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(8, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_4_1, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L_0 = constraints[1].args[0]

    if (!(L === L_0)) {
      constraint.cont = [__prog_4_0, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[1])

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ A ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_4_0, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_9 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(9, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_10, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var QQ = constraints[0].args[1]
    if (constraints[0].args[2] !== "cjump") {
      constraint.cont = [__prog_counter_1_9, __n + 1]
      stack.push(constraint)
      return
    }
    var R1 = constraints[0].args[3]
    var A = constraints[0].args[4]

    var R2 = constraints[1].args[0]
    var X = constraints[1].args[1]

    if (!(X === 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__prog_counter_1_9, __n + 1]
      stack.push(constraint)
      return
    }

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ A ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_17 (constraint, __n) {
    __n = __n || 0

    var R2 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(9, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_18, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var QQ = constraints[0].args[1]
    if (constraints[0].args[2] !== "cjump") {
      constraint.cont = [__mem_2_17, __n + 1]
      stack.push(constraint)
      return
    }
    var R1 = constraints[0].args[3]
    var A = constraints[0].args[4]

    var L_0 = constraints[2].args[0]

    if (!(X === 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__mem_2_17, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ A ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_17, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_8 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var QQ = constraint.args[1]
    if (constraint.args[2] !== "cjump") {
      constraint.cont = [__prog_5_9, 0]
      stack.push(constraint)
      return
    }
    var R1 = constraint.args[3]
    var A = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(9, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_9, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var R2 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var L_0 = constraints[2].args[0]

    if (!(X === 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__prog_5_8, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ A ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_8, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_10 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/5", "mem/2", "_" ]
    var lookupResult = chr.Store.lookupResume(10, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_11, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "cjump") {
      constraint.cont = [__prog_counter_1_10, __n + 1]
      stack.push(constraint)
      return
    }
    var R1 = constraints[0].args[3]
    var QQ = constraints[0].args[4]

    var R2 = constraints[1].args[0]
    var X = constraints[1].args[1]

    if (!(X !== 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__prog_counter_1_10, __n + 1]
      stack.push(constraint)
      return
    }

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    // active constraint gets removed
  }

  function __mem_2_18 (constraint, __n) {
    __n = __n || 0

    var R2 = constraint.args[0]
    var X = constraint.args[1]

    var constraintPattern = [ "prog/5", "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(10, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__mem_2_19, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var L1 = constraints[0].args[1]
    if (constraints[0].args[2] !== "cjump") {
      constraint.cont = [__mem_2_18, __n + 1]
      stack.push(constraint)
      return
    }
    var R1 = constraints[0].args[3]
    var QQ = constraints[0].args[4]

    var L_0 = constraints[2].args[0]

    if (!(X !== 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__mem_2_18, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__mem_2_18, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_5_9 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var L1 = constraint.args[1]
    if (constraint.args[2] !== "cjump") {
      constraint.cont = [__prog_5_10, 0]
      stack.push(constraint)
      return
    }
    var R1 = constraint.args[3]
    var QQ = constraint.args[4]

    var constraintPattern = [ "_", "mem/2", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(10, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_5_10, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var R2 = constraints[1].args[0]
    var X = constraints[1].args[1]

    var L_0 = constraints[2].args[0]

    if (!(X !== 0 && R1 === R2 && L === L_0)) {
      constraint.cont = [__prog_5_9, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[2])

    ;(function () {
      var _c = new Constraint("prog_counter", 1, [ L1 ])
      _c.cont = [__prog_counter_1_0, 0]
      stack.push(_c)
    })()

    constraint.cont = [__prog_5_9, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_counter_1_11 (constraint, __n) {
    __n = __n || 0

    var L_0 = constraint.args[0]

    var constraintPattern = [ "prog/4", "_" ]
    var lookupResult = chr.Store.lookupResume(11, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_counter_1_12, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L = constraints[0].args[0]
    var A = constraints[0].args[1]
    if (constraints[0].args[2] !== "halt") {
      constraint.cont = [__prog_counter_1_11, __n + 1]
      stack.push(constraint)
      return
    }
    var B = constraints[0].args[3]

    if (!(L === L_0)) {
      constraint.cont = [__prog_counter_1_11, __n + 1]
      stack.push(constraint)
      return
    }

    // active constraint gets removed
  }

  function __prog_4_1 (constraint, __n) {
    __n = __n || 0

    var L = constraint.args[0]
    var A = constraint.args[1]
    if (constraint.args[2] !== "halt") {
      constraint.cont = [__prog_4_2, 0]
      stack.push(constraint)
      return
    }
    var B = constraint.args[3]

    var constraintPattern = [ "_", "prog_counter/1" ]
    var lookupResult = chr.Store.lookupResume(11, constraintPattern, constraint, __n)
    if (lookupResult === false) {
      constraint.cont = [__prog_4_2, 0]
      stack.push(constraint)
      return
    }
    var constraints = lookupResult.res

    var L_0 = constraints[1].args[0]

    if (!(L === L_0)) {
      constraint.cont = [__prog_4_1, __n + 1]
      stack.push(constraint)
      return
    }

    chr.Store.remove(constraints[1])

    constraint.cont = [__prog_4_1, __n + 1]
    stack.push(constraint)
    return
  }

  function __prog_4_2 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function __prog_5_10 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function __mem_2_19 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function __prog_counter_1_12 (constraint) {
    constraint.cont = null
    chr.Store.add(constraint)
  }

  function prog () {
    var args = Array.prototype.slice.call(arguments)
    var arity = arguments.length
    var functor = "prog/" + arity
    var constraint = new Constraint("prog", arity, args)
    switch(arity) {
      case 4:
        constraint.cont = [__prog_4_0, ]
        break
      case 5:
        constraint.cont = [__prog_5_0, ]
        break
      default:
        throw new Error("Undefined constraint: " + functor)
    }
    stack.push(constraint)

    trampoline()
  }

  function mem () {
    var args = Array.prototype.slice.call(arguments)
    var arity = arguments.length
    var functor = "mem/" + arity
    var constraint = new Constraint("mem", arity, args)
    if (arity === 2) {
      constraint.cont = [__mem_2_0, ]
    } else {
      throw new Error("Undefined constraint: " + functor)
    }
    stack.push(constraint)

    trampoline()
  }

  function prog_counter () {
    var args = Array.prototype.slice.call(arguments)
    var arity = arguments.length
    var functor = "prog_counter/" + arity
    var constraint = new Constraint("prog_counter", arity, args)
    if (arity === 1) {
      constraint.cont = [__prog_counter_1_0, ]
    } else {
      throw new Error("Undefined constraint: " + functor)
    }
    stack.push(constraint)

    trampoline()
  }

  chr.prog = prog
  chr.mem = mem
  chr.prog_counter = prog_counter

  return chr
}
