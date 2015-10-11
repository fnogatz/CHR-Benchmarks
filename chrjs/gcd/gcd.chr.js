function _chr () {
  "use strict";

  function Constraint (name, arity, args) {
    this.name = name
    this.arity = arity
    this.functor = name + '/' + arity
    this.args = args
    this.id = null
    this.alive = true

    this.store = null
  }

  Constraint.prototype.kill = function kill () {
    this.alive = false

    var self = this
    if (this.store) {
      this.store.remove(self)
    }
  }

  Constraint.prototype.toString = function toString () {
    var res = this.name
    if (this.arity > 0) {
      res += '('
      res += this.args.map(escape).join(',')
      res += ')'
    }
    return res
  }

  function Store () {
    this._lastId = 0
    this._index = {}
    this.length = 0
  }

  Store.prototype.add = function add (constraint) {
    var id = this._getNewConstraintId()
    constraint.id = id
    constraint.store = this

    this._addToIndex(constraint)
    this.length++

    return id
  }

  Store.prototype.remove = function remove (constraint) {
    var ix = this._index[constraint.name][constraint.arity].indexOf(constraint)
    if (ix >= 0) {
      this._index[constraint.name][constraint.arity].splice(ix, 1)
    }
  }

  Store.prototype._getNewConstraintId = function _getNewConstraintId () {
    this._lastId++
    return this._lastId
  }

  Store.prototype._addToIndex = function _addToIndex (constraint) {
    if (!this._index[constraint.name]) {
      this._index[constraint.name] = {}
    }
    if (!this._index[constraint.name][constraint.arity]) {
      this._index[constraint.name][constraint.arity] = []
    }

    this._index[constraint.name][constraint.arity].push(constraint)
  }

  Store.prototype.lookup = function (name, arity) {
    if (this._index[name] && this._index[name][arity]) {
      return this._index[name][arity]
    }

    return []
  }

  Store.prototype.forEach = function forEach (cb) {
    for (var name in this._index) {
      for (var arity in this._index[name]) {
        this._index[name][arity].forEach(function (c) {
          cb(c)
        })
      }
    }
  }

  Store.prototype.toString = function storeToString () {
    if (this.length === 0) {
      return '(empty)'
    }

    var str = ''

    this.forEach(function (constraint) {
      str += '#'+constraint.id+'\t\t'+constraint.toString()+'\n'
    })

    return str
  }

  function escape (val) {
    if (typeof val === 'string') {
      return '"' + val + '"'
    }

    return val
  }

  function Lookup (chr, queryArray) {
    this.chr = chr
    this.elements = queryArray.length

    var pos
    var used = {}
    var disjoint = true
    for (pos = 0; pos < queryArray.length; pos++) {
      if (queryArray[pos].constraint) {
        if (used[queryArray[pos].constraint.id]) {
          disjoint = false
          break
        }

        used[queryArray[pos].constraint.id] = true
      }
    }

    var constraints
    if (disjoint === false) {
      constraints = []
    } else {
      constraints = new Array(queryArray.length)
      var subConstraints
      for (pos = 0; pos < queryArray.length; pos++) {
        if (queryArray[pos].constraint) {
          constraints[pos] = [ queryArray[pos].constraint ]
          continue
        }

        subConstraints = chr.Store.lookup(queryArray[pos].name, queryArray[pos].arity)
        if (!subConstraints) {
          constraints = []
          break
        }

        constraints[pos] = subConstraints
      }
    }

    var divisors = new Array(this.elements)
    var permutations = 1
    for (pos = constraints.length - 1; pos >= 0; pos--) {
      divisors[pos] = divisors[pos + 1] ? divisors[pos + 1] * constraints[pos + 1].length : 1
      permutations *= constraints[pos].length
    }
    this.divisors = divisors
    this.permutations = permutations

    this.constraints = constraints.length ? constraints : false

    this.current = 0
  }

  Lookup.prototype.next = function () {
    var constraints = this.constraints

    if (!constraints) {
      return false
    }

    var currArray, currConstraint, result, pos, used
    loop_permutations: while (this.current++ < this.permutations) {
      result = []
      used = {}

      for (pos = 0; pos < this.elements; pos++) {
        currArray = constraints[pos]
        currConstraint = currArray[(((this.current-1) / this.divisors[pos]) | 0) % currArray.length]

        if (used[currConstraint.id]) {
          continue loop_permutations
        }

        result[pos] = currConstraint
        used[currConstraint.id] = true
      }

      return result
    }

    return false
  }

  function State (constraint, type, step, lookup, scope) {
    this.type = type
    this.constraint = constraint
    this.step = step
    this.lookup = lookup
    this.scope = scope
  }

  function saveState (constraint, step, lookup, scope) {
    return new State(constraint, 'intermediate', step, lookup, scope)
  }

  function constraintState (constraint) {
    return new State(constraint, 'constraint', null, null, null)
  }

  function tell () {
    var current
    while (chr.Tells.length > 0) {
      current = chr.Tells.pop()
      if (current.type === 'constraint') {
        chr.Store.add(current.constraint)
      }
      dispatchTell(current)(current)
    }
  }

  function dispatchTell (current) {
    switch (current.constraint.functor) {
      case 'gcd/1':
        return gcd_1
      break
    }
  }

  function thenable () {
    return {
      then: function (cb) {
        cb()
        return thenable()
      }
    }
  }

  var chr = {
    Store: new Store(),
    Functors: {
      'gcd/1': true
    },
    Tells: [],
    gcd: gcd
  }

  function gcd () {
    var l = arguments.length
    var args = new Array(l)
    for (var i = 0; i < l; i++) args[i] = arguments[i];

    var arity = args.length;
    var constraint = new Constraint('gcd', arity, args)

    chr.Tells.push(constraintState(constraint))
    tell()

    return thenable()
  }

  function gcd_1_0 (current) {
    if (current.type === 'intermediate') {
      current.type = 'constraint'
    }

    if (current.constraint.args[0] === 0) {
      current.constraint.kill()
      return true
    }
  }

  function gcd_1_1 (current) {
    var lookup, constraints
    if (current.type === 'intermediate') {
      current.type = 'constraint'
      lookup = current.lookup
    } else {
      lookup = new Lookup(
        chr,
        [
          { name: 'gcd', arity: 1 },
          { constraint: current.constraint }
        ]
      )
    }

    while (constraints = lookup.next()) {
      if (gcd_1_1_h0(current, constraints)) {
        return true
      }
    }
  }

  function gcd_1_1_h0 (current, constraints) {
    var scope = {
      N: constraints[0].args[0],
      M: current.constraint.args[0]
    }

    if (!(0 < scope.N && scope.N <= scope.M)) {
      return
    }
    current.constraint.kill()

    chr.Tells.push(constraintState(new Constraint('gcd', 1, [ scope.M-scope.N ])))
    return true
  }

  function gcd_1_2 (current) {
    var lookup, scope, constraints
    if (current.type === 'intermediate') {
      lookup = current.lookup
    } else {
      lookup = new Lookup(
        chr,
        [
          { constraint: current.constraint },
          { name: 'gcd', arity: 1 }
        ]
      )
    }

    scope = {
      N: current.constraint.args[0]
    }

    if (0 < scope.N) {
      while (constraints = lookup.next()) {
        scope.M = constraints[1].args[0]

        if (!(scope.N <= scope.M)) {
          continue
        }
        constraints[1].kill()

        // save current state
        chr.Tells.push(
          saveState(current.constraint, 2, lookup, scope),
          constraintState(new Constraint('gcd', 1, [ scope.M-scope.N ]))
        )

        // continue with these constraints
        return true
      }
    }
  }

  function gcd_1 (current) {
    if (current.type !== 'intermediate' || current.step === 0) {
      if (gcd_1_0(current)) {
        return
      }
    }

    if (current.type !== 'intermediate' || current.step === 1) {
      if (gcd_1_1(current)) {
        return
      }
    }

    if (current.type !== 'intermediate' || current.step === 2) {
      if (gcd_1_2(current)) {
        return
      }
    }
  }

  return chr
}

var chr = _chr()

function test (a,b) {
  chr.gcd(a).then(function () {
    return chr.gcd(b)
  }).then(function () {
    console.log('done')
  })
}

test(parseInt(process.argv[2]), parseInt(process.argv[3]))
