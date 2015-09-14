import java.util.Collection;

public class Ram {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) printUsage();
        else try {
            final int i0 = Integer.parseInt(args[0]);

            if (i0 < 0) {
                printUsage();
                return;
            }

            // First we create a new JCHR constraint handler:
            RamHandler handler = new RamHandler();

            // Next we tell the JCHR handler the following two constraints:             
            handler.tellMem(1,1);
            handler.tellMem(2,i0);
            handler.tellMem(3,0);
            handler.tellProg(1,2,Instruction.ADD,1,3);
            handler.tellProg(2,3,Instruction.SUB,1,2);
            handler.tellProg(3,1,Instruction.CJUMP,2,4);
            handler.tellProg(4,0,Instruction.HALT,0,0);
            handler.tellProg_counter(1);

            // Afterwards we can lookup the constraints in the 
            // resulting constraint store: 
            Collection<RamHandler.MemConstraint> mems = handler.getMemConstraints();

            for (RamHandler.MemConstraint m : mems) {
                System.out.println("mem("+m.get$0()+","+m.get$1()+")");
            }
            System.out.println("ok!");
        } catch (NumberFormatException e) {
            System.err.println(e.getMessage());
            printUsage();
        }
    }

    public final static void printUsage() {
        System.out.println(
            "Usage: java Ram <positive int>"
        );
    }
}
