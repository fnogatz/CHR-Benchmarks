#!/usr/bin/perl -w

use strict;

my $BENCHER="./bench.sh";

my $FACTOR=1.09;
my $EFACTOR=1.09;
my $MINTIME=0.00000025;
my $MAXTIME=10;
my $RUNTIME=10;

my $AVGTIME=($MINTIME+$MAXTIME)/2;

my %BENCHERS=(
  gcd    => sub { (5,1000*$_[0]) },
  fib    => sub { ($_[0]) },
  leq    => sub { ($_[0]+1) },
  primes => sub { ($_[0]+1) },
  ram    => sub { ($_[0]) },
  tak    => sub { (int($_[0]/0.81),int($_[0]/0.9),int($_[0])) }
);

my %SYSTEMS=(
  swi  => sub { my ($prog,@args)=@_; return ('./swi/bench.sh',$prog,join(',',@args)); },
  jchr => sub { my ($prog,@args)=@_; return ('java','-classpath','jchr/KULeuven_JCHR.jar:jchr/_jchr-libs/jack-evaluator:jchr/'.(lc $prog),$prog,@args); },
  cchr => sub { my ($prog,@args)=@_; return ("cchr/$prog/$prog.out",@args); },
  c    => sub { my ($prog,@args)=@_; return ("c/$prog/$prog.out",@args); },
  node => sub { my ($prog,@args)=@_; return ("node chrjs/$prog/$prog.chr.js",@args); }
);

my %SYSTBL=(
  swi  => { gcd => "gcd", fib => "fib", leq => "leq", primes => "primes", ram => "ram", tak => "tak"},
  jchr => { gcd => "Gcd", fib => "Fib", leq => "Leq", primes => "Primes", ram => "Ram", tak => "Tak"},
  cchr => { gcd => "gcd", fib => "fib", leq => "leq", primes => "primes", ram => "ram", tak => "tak"},
  c    => { gcd => "gcd", fib => "fib", leq => "leq", primes => "primes", ram => "ram", tak => "tak"},
  node => { gcd => "gcd" }
);

my %MAX=(
  swi  => { gcd =>     6600, fib =>  150000, leq => 120, primes =>   31000, ram =>     110000, tak =>  1550},
  jchr => { gcd =>  3700000, fib =>   39000, leq => 490, primes =>   40000, ram =>    3400000, tak =>  2450},
  cchr => { gcd => 16000000, fib =>  400000, leq => 360, primes =>  260000, ram =>    8500000, tak =>  3100},
  c    => { gcd => 85000000, fib => 1600000, leq => 360, primes => 1120000, ram => 1200000000, tak => 65000},
  node => { gcd =>    30000 }
);

sub execBench {
  my ($bench,$sys,$num)=@_;
  my @nums=$BENCHERS{$bench}->($num);
  my $tbl=$SYSTBL{$sys}->{$bench};
  return (undef,undef) if (!defined $tbl);
  my @cmd=$SYSTEMS{$sys}->($tbl,@nums);
  my @val=split(/\s+/,qx($BENCHER $RUNTIME @cmd));
  return @val;
}

my $numArgs = $#ARGV + 1;
my @activeBenchers=(keys %BENCHERS);
my @activeSystems=(keys %SYSTEMS);
if ($numArgs > 0) {
  @activeSystems=(
    $ARGV[0]
  );
}
if ($numArgs > 1) {
  @activeBenchers=(
    $ARGV[1]
  );
}

for my $bench (@activeBenchers) {
  print "## bench=$bench\n";
  SYS: for my $sys (@activeSystems) {
    print "### sys=$sys\n";
    my $lim=$MAX{$sys}->{$bench};
    my $low=30500000; # a year should do as maximal 'low'
    my ($num,$val,$run)=(0,0,0);
    my ($min,$minv,$max,$maxv)=(1,0,0,0); 
    do {
      $num=int($num*$EFACTOR)+1 if ($val<=$AVGTIME);
      $num=$lim if ((defined $lim) && $num>$lim);
      ($val,$run)=execBench($bench,$sys,$num);
      next SYS if (!defined($val));
      $val-=$low;
      if ($val<0) {
        $low+=$val; $val=0;
      }
      print "$sys/$bench:$num (${val},${low})*${run} exp\n";
      if ($val>$minv && $val<$AVGTIME) {$min=$num; $minv=$val;};
      if ($val<$maxv && $val>$AVGTIME) {$max=$num; $maxv=$val;};
    } while($val<$MINTIME && (!defined($lim) || $num<$lim) );
    my ($avg,$avgv);
    if ($val>=$MINTIME && $val<=$MAXTIME || (defined($lim) && $num==$lim) || $max==0) {
      $avg=$min;
      $avgv=$minv;
    } else {
      do {
        $avg=int($max-($max-$min)/($maxv-$minv)*($maxv-$AVGTIME)+0.5);
        last if ($avg==$max || $avg==$min);
        ($avgv,$run)=execBench($bench,$sys,$avg);
        $avgv-=$low;
        if ($avgv<0) {
          $low+=$avgv;
          $avgv=0;
        }
        print "$sys/$bench:$num (${avgv},${low})*${run} rf[$min,$max]\n";
        if ($avgv>$AVGTIME) {
          $max=$avg;
          $maxv=$avgv;
        } else {
          $min=$avg;
          $minv=$avgv;
        }
      } while ($avgv<$MINTIME || $avgv>$MAXTIME);
    }
    $num=$avg;
    $val=$avgv;
    while ($val<$MAXTIME && (!defined($lim) || $num < $lim)) {
      $num=int($num*$FACTOR+1);
      $num=$lim if ((defined $lim) && $num>$lim);
      ($val,$run)=execBench($bench,$sys,$num);
      $val-=$low;
      if ($val<0) {
        $low+=$val; $val=0;
      }
      print "$sys/$bench:$num (${val},${low})*${run} up\n";
    }
    $num=$avg;
    $val=$avgv;
    while ($val>$MINTIME) {
      $num=int($num/$FACTOR);
      last if ($num<1);
      ($val,$run)=execBench($bench,$sys,$num);
      $val-=$low;
      if ($val<0) {
        $low+=$val; $val=0;
      }
      print "$sys/$bench:$num (${val},${low})*${run} dn\n";
    }
  }
}
