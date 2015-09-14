import java.util.Collection;

public class Gcd {

    public static void main(String[] args) throws Exception {
        if (args.length != 2) printUsage();
        else try {
            final long i0 = Long.parseLong(args[0]),
                       i1 = Long.parseLong(args[1]);
        
            if (i0 < 0 || i1 < 0) {                
                printUsage();
                return;
            }
            
            // First we create a new JCHR constraint handler:
            GcdHandler handler = new GcdHandler();
            
            // Next we tell the JCHR handler the following two constraints:             
            handler.tellGcd(i0);
            handler.tellGcd(i1);
/*            
            // Afterwards we can lookup the constraints in the 
            // resulting constraint store: 
            Collection<GcdHandler.GcdConstraint> gcds = handler.getGcdConstraints();
            long gcd;
            
            // There should be exactly one constraint, containing
            // the greatest common divider:
            assert gcds.size() == 1;
            
            gcd = gcds.toArray(new GcdHandler.GcdConstraint[1])[0].get$0();
            
            // Simply print out the result:
            System.out.printf(" ==>  gcd(%d, %d) == %d", i0, i1, gcd);
*/
        } catch (NumberFormatException e) {
            System.err.println(e.getMessage());
            printUsage();
        }
    }
    
    public final static void printUsage() {
        System.out.println(
            "Usage: java Gcd <positive int> <positive int>"
        );
    }
}
