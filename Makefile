CC := gcc -Wall -Wno-unused -pipe -std=gnu99 -march=nocona
DEFS :=
CFLAGS := -O3 -g0 -fomit-frame-pointer -frename-registers $(DEFS)
LDFLAGS := -Wl,-O2 -Wl,--enable-new-dtags -Wl,--sort-common -Wl,--strip-all


all: install prepare

install: swi.install jchr.install cchr.install c.install

prepare: swi.prepare jchr.prepare cchr.prepare c.prepare

clean: swi.clean jchr.clean cchr.clean c.clean

bench:
	./bench.pl

test: swi.test jchr.test cchr.test c.test


# SWI-Prolog

swi: swi.install swi.prepare

swi.install:
	apt-get install swi-prolog

swi.prepare:
	find swi/* -type f -name '*.pl' -exec swipl -O -L0 -G0 -T0 --nodebug --quiet -o "{}".qlf -c "{}" ";"

swi.clean:
	find swi/* -type f -name '*.qlf' -delete

swi.bench:
	./bench.pl swi

swi.test: swi.test.gcd swi.test.fib swi.test.leq swi.test.primes swi.test.ram swi.test.tak

swi.test.gcd:
	echo "gcd:test(5,10)." | swipl -x swi/gcd/gcd.pl.qlf
swi.test.fib:
	echo "fib:test(10)." | swipl -x swi/fib/fib.pl.qlf
swi.test.leq:
	echo "leq:test(10)." | swipl -x swi/leq/leq.pl.qlf
swi.test.primes:
	echo "primes:test(10)." | swipl -x swi/primes/primes.pl.qlf
swi.test.ram:
	echo "ram:test(10)." | swipl -x swi/ram/ram.pl.qlf
swi.test.tak:
	echo "tak:test(5,3,2)." | swipl -x swi/tak/tak.pl.qlf


# JCHR

jchr: jchr.install jchr.prepare

jchr.preinstall: jchr.preinstall.mkdir jchr.preinstall.antlr jchr.preinstall.freemarker jchr.preinstall.args4j jchr.preinstall.jack

jchr.preinstall.mkdir:
	mkdir -p jchr/_jchr-libs
jchr.preinstall.antlr: jchr.preinstall.mkdir
	cd jchr/_jchr-libs && wget -O antlr.jar http://www.antlr2.org/download/antlr-2.7.5.jar
jchr.preinstall.freemarker: jchr.preinstall.mkdir
	cd jchr/_jchr-libs && mkdir -p freemarker && cd freemarker && wget -O freemarker.tar.gz http://downloads.sourceforge.net/project/freemarker/freemarker/2.3.23/freemarker-2.3.23.tar.gz\?r\=http%3A%2F%2Ffreemarker.org%2Ffreemarkerdownload.html\&ts\=1441824314\&use_mirror\=vorboss && tar -zxvf freemarker.tar.gz && mv freemarker.jar .. && cd .. && rm -r --interactive=never freemarker
jchr.preinstall.args4j: jchr.preinstall.mkdir
	cd jchr/_jchr-libs && wget -O args4j.jar http://search.maven.org/remotecontent\?filepath\=args4j/args4j/2.0.4/args4j-2.0.4.jar
jchr.preinstall.jack: jchr.preinstall.jack.download jchr.preinstall.jack.utf8
	cd jchr/_jchr-libs/jack-evaluator && cp ../../IntUtil.java . && cp ../../LongUtil.java . && make
jchr.preinstall.jack.download: jchr.preinstall.mkdir
	cd jchr/_jchr-libs && wget -O jack.tar.gz http://www.pms.ifi.lmu.de/software/jack/resources/jack_2001_03_04.tar.gz && tar -zxvf jack.tar.gz && cd jack && cp -r evaluator ../jack-evaluator && cd .. && rm -r --interactive=never jack jack.tar.gz
jchr.preinstall.jack.utf8:
	cd jchr/_jchr-libs/jack-evaluator && for file in *.java; do iconv -f windows-1252 -t utf-8 "$$file" -o "$$file"; done

jchr.install: jchr.preinstall
	cd jchr && wget https://dtai.cs.kuleuven.be/CHR/JCHR/downloads/KULeuven_JCHR.jar

jchr.prepare: jchr.prepare.fib jchr.prepare.leq jchr.prepare.primes jchr.prepare.ram

jchr.prepare.gcd:
	cd jchr/gcd && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar compiler.Main gcd.jchr && sed -i 's/package ;//g' GcdHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator GcdHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Gcd.java
jchr.prepare.fib:
	cd jchr/fib && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar compiler.Main fib.jchr && sed -i 's/package ;//g' FibBoAllHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator FibBoAllHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Fib.java
jchr.prepare.leq:
	cd jchr/leq && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar compiler.Main leq.jchr && sed -i 's/package ;//g' LeqHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator LeqHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Leq.java
jchr.prepare.primes:
	cd jchr/primes && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar compiler.Main primes.jchr && sed -i 's/package ;//g' PrimesHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator PrimesHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Primes.java
jchr.prepare.ram:
	cd jchr/ram && javac Instruction.java && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar:. compiler.Main ram.jchr && sed -i 's/package ;//g' RamHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. RamHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Ram.java
jchr.prepare.tak:
	cd jchr/tak && java -classpath ../_jchr-libs/antlr.jar:../_jchr-libs/args4j.jar:../_jchr-libs/freemarker.jar:../_jchr-libs/jack-evaluator:../KULeuven_JCHR.jar:. compiler.Main tak.jchr && sed -i 's/package ;//g' TakTabHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. TakTabHandler.java && javac -classpath ../KULeuven_JCHR.jar:../_jchr-libs/jack-evaluator:. Tak.java

jchr.clean:
	rm -r --interactive=never jchr/_jchr-libs jchr/KULeuven_JCHR.jar 2> /dev/null

jchr.bench:
	./bench.pl jchr

jchr.test: jchr.test.gcd jchr.test.fib jchr.test.leq jchr.test.primes jchr.test.ram jchr.test.tak

jchr.test.gcd:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/gcd Gcd 5 10
jchr.test.fib:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/fib Fib 10
jchr.test.leq:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/leq Leq 10
jchr.test.primes:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/primes Primes 10
jchr.test.ram:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/ram Ram 10
jchr.test.tak:
	java -classpath jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/tak Tak 5 3 2


# CCHR

cchr: cchr.install cchr.prepare

cchr.preinstall: cchr.preinstall.apt cchr.preinstall.mkdir cchr.preinstall.bison

cchr.preinstall.apt:
	apt-get install m4 gcc-multilib g++-multilib flex
cchr.preinstall.mkdir:
	mkdir -p cchr/_cchr-libs
cchr.preinstall.bison: cchr.preinstall.mkdir
	cd cchr/_cchr-libs && wget http://ftp.gnu.org/gnu/bison/bison-2.3.tar.gz && tar -zxvf bison-2.3.tar.gz && rm bison-2.3.tar.gz && cd bison-2.3 && ./configure --prefix=$$PWD/exc && make && make install

cchr.install: cchr.preinstall
	cd cchr/_cchr && make

cchr.clean:
	rm -r --interactive=never cchr/_cchr-libs 2> /dev/null && find cchr/*/ -type f -name '*.c' -not -path cchr/_cchr/* -delete	

cchr.prepare: cchr.prepare.gcd cchr.prepare.fib cchr.prepare.leq cchr.prepare.primes cchr.prepare.ram cchr.prepare.tak

cchr.prepare.gcd:
	cchr/_cchr/bin/cchr cchr/gcd/gcd.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/gcd/gcd.out cchr/gcd/gcd.c -Icchr/_cchr
cchr.prepare.fib:
	cchr/_cchr/bin/cchr cchr/fib/fib.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/fib/fib.out cchr/fib/fib.c -Icchr/_cchr -lgmp
cchr.prepare.leq:
	cchr/_cchr/bin/cchr cchr/leq/leq.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/leq/leq.out cchr/leq/leq.c -Icchr/_cchr
cchr.prepare.primes:
	cchr/_cchr/bin/cchr cchr/primes/primes.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/primes/primes.out cchr/primes/primes.c -Icchr/_cchr
cchr.prepare.ram:
	cchr/_cchr/bin/cchr cchr/ram/ram.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/ram/ram.out cchr/ram/ram.c -Icchr/_cchr
cchr.prepare.tak:
	cchr/_cchr/bin/cchr cchr/tak/tak.cchr && $(CC) $(CFLAGS) $(LDFLAGS) -o cchr/tak/tak.out cchr/tak/tak.c -Icchr/_cchr

cchr.bench:
	./bench.pl cchr

cchr.test: cchr.test.gcd cchr.test.fib cchr.test.leq cchr.test.primes cchr.test.ram cchr.test.tak

cchr.test.gcd:
	cchr/gcd/gcd.out 10
cchr.test.fib:
	cchr/fib/fib.out 10
cchr.test.leq:
	cchr/leq/leq.out 10
cchr.test.primes:
	cchr/primes/primes.out 10
cchr.test.ram:
	cchr/ram/ram.out 10
cchr.test.tak:
	cchr/tak/tak.out 5 3 2


# C Native

c: c.install c.prepare

c.install:
	apt-get install libgmp3-dev

c.prepare:
	find c/* -type f -name '*.c' | while read file; do $(CC) $(CFLAGS) $(LDFLAGS) -lgmp -o "$${file%.c}.out" $$file -lgmp -lm; done

c.clean:
	find c/* -type f -name '*.out' -delete

c.bench:
	./bench.pl c

c.test: c.test.gcd c.test.fib c.test.leq c.test.primes c.test.ram c.test.tak

c.test.gcd:
	c/gcd/gcd.out 10
c.test.fib:
	c/fib/fib.out 10
c.test.leq:
	c/leq/leq.out 10
c.test.primes:
	c/primes/primes.out 10
c.test.ram:
	c/ram/ram.out 10
c.test.tak:
	c/tak/tak.out 5 3 2
