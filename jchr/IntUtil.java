/**
   Class IntUtil
   @version 1 (10/09/1999)
   @author Matthias Schmauß
*/

// this method provides methods for comparing and computing 
// java.lang.Integer objects. 
// In Java it is not possible work with java.lang.Integer objects
// directly; this is provided by this class.
public class IntUtil {

//     public static boolean test(ConstraintSystem cs, String var) {

// 	Object v = cs.getVariableObject(var);

// 	cs.setVarValue(v, new Integer(1));

// 	return true;

//     }

    // only methods, whoose arguments are bound, are executed in
    // JCHRCore. The execution of this method delivers true as a 
    // result. Thence an integer variable in JCHR is ground (i.e.
    // bound to a value, if the execution of this method returns 
    // true.
    public static boolean ground(java.lang.Integer i) {

	return true;

    }

    public static boolean eq(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.equals(i2);

    }

    // returns true, if i1 is less than i2, otherwise false.
    public static boolean lt(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.intValue() < i2.intValue();

    }

    // returns true, if i1 is greater than i2, otherwise false.
    public static boolean gt(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.intValue() > i2.intValue();       

    }

    // return true, if i1 is less or equal than i2, otherwise false.
    public static boolean le(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.intValue() <= i2.intValue();

    }

    // returns true, if i1 is greater or equal than i2, otherwise false.
    public static boolean ge(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.intValue() >= i2.intValue();

    }

    // return true, if i1 is not equal to i2, otherwise false.
    public static boolean ne(java.lang.Integer i1, java.lang.Integer i2) {

	return i1.intValue() != i2.intValue();

    }
    
    // returns the object with the larger integer value.
    public static java.lang.Integer max(java.lang.Integer i1, java.lang.Integer i2) {

	if (i1.intValue() > i2.intValue())
	    return i1;
	return i2;

    }

    // returns the object with the smaller integer value.
    public static java.lang.Integer min(java.lang.Integer i1, java.lang.Integer i2) {

	if (i1.intValue() > i2.intValue())
	    return i2;
	return i1;

    }

    ///////////////////////////////////////////////////////////////////////////////////
    // arithmetics

    // increases the value of the given integer object by one and returns it.
    public static java.lang.Integer inc(java.lang.Integer i) {

	return new Integer(i.intValue()+1);

    }

    // decreases the value of the given integer object by one and returns it.
    public static java.lang.Integer dec(java.lang.Integer i) {

	return new Integer(i.intValue()-1);

    }

    // adds the values of the given integer objects and returns the result.
    public static java.lang.Integer add(java.lang.Integer i1, java.lang.Integer i2) {

	return new java.lang.Integer(i1.intValue() + i2.intValue());

    }

    // substrates i2 from i1 and returns the result.
    public static java.lang.Integer sub(java.lang.Integer i1, java.lang.Integer i2) {

	return new java.lang.Integer(i1.intValue() - i2.intValue());

    }

    // multiplicates the values of the given integer objects and returns the result.
    public static java.lang.Integer mult(java.lang.Integer i1, java.lang.Integer i2) {

    return new java.lang.Integer(i1.intValue() * i2.intValue());

    }

    // multiplicates the values of the given integer objects and returns the result.
    public static java.lang.Integer div(java.lang.Integer i1, java.lang.Integer i2) {

    return new java.lang.Integer(i1.intValue() / i2.intValue());

    }
    

    public static boolean modNull(java.lang.Integer i, java.lang.Integer j) {

	return (i.intValue() % j.intValue()) == 0;


    }

}
