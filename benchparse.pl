#!/usr/bin/perl -w

use strict;

my %DATA;
my %PDATA;
my %ORDER;

my %LINESTYLES=(
  swi   => 'lc rgb "dark-violet"',
  jchr  => 'lc rgb "#009e73"',
  chrjs => 'lc rgb "#f4cb42" dt (10,6,2,6)',
  cchr  => 'lc rgb "#56b4e9"',
  c     => 'lc rgb "#e69f00"',
  js    => 'lc rgb "#0072b2" dt (46,6,2,6)'
);

open PIPE,"| gnuplot";

for my $file (@ARGV) {
  open FILE,"<$file";
  while (<FILE>) {
    chomp;
    if ($_ =~ /\A\s*(\w+)\/(\w+):(\d+)\s+\(([^,]+),([^\)]+)\)\*(\d+)\s+/) {
      my ($sys,$bench,$num,$val,$low,$mul)=($1,$2,$3,$4,$5,$6);
      my $emul=0;
      my $eval=0;
      if (defined($DATA{$bench}->{$sys}->{$num}->[0])) {
        $eval=$DATA{$bench}->{$sys}->{$num}->[0];
        $emul=$DATA{$bench}->{$sys}->{$num}->[1];
      }
      $emul += $mul;
      $eval += (($val+$low)*$mul);
      $DATA{$bench}->{$sys}->{$num}->[0]=$eval;
      $DATA{$bench}->{$sys}->{$num}->[1]=$emul;
    }
  }
  close FILE;
}

for my $bench (keys %DATA) {
  my $benchdata=$DATA{$bench};
  for my $sys (keys %{$benchdata}) {
    my $bsdata=$benchdata->{$sys};
    my $low=undef;
    my $lowp=undef;
    for my $size (keys %{$bsdata}) {
      my $val=($bsdata->{$size}->[0])/($bsdata->{$size}->[1]);
      if (!defined($low) || $low>$val) {
        $low=$val;
        $lowp=$size;
      }
    }
    print "# $bench/$sys low=$low, size>$lowp";
    for my $size (sort { $a<=>$b} (keys %{$bsdata})) {
      if ($size>$lowp) {
        $PDATA{$bench}->{$sys}->{$size}=($bsdata->{$size}->[0]/$bsdata->{$size}->[1])-$low;
#        printf " ,%i",$size;
      } 
    }
    print "\n";
  }
}

for my $bench (keys %PDATA) {
  my $benchdata=$PDATA{$bench};
  my $bsdata=$benchdata->{c};
  my @SYS=keys %{$benchdata};
  my %uvals;
  my $nuvals=0;
  for my $sys (@SYS) {
    $uvals{$sys}=1;
  }
  for my $size (keys %{$bsdata}) {
    my %vals;
    my $nvals=0;
    for my $sys (@SYS) {
      if (defined ($benchdata->{$sys}->{$size})) {
        $vals{$sys}=$benchdata->{$sys}->{$size};
#        $nvals++ if ($vals{$sys}>0.000025);
        $nvals++ if ($vals{$sys}>0.00000025);
      }
    }
    if ($nvals == $#SYS+1) {
      for my $sys (@SYS) {
        $uvals{$sys} += log($vals{$sys});
      }
      $nuvals++;
    }
  }
  print "AVG $bench\[$nuvals\] :";
  my $loww;
  for my $sys (@SYS) {
    my $lw=$uvals{$sys}/$nuvals if ($nuvals>0);
    $loww=$lw if (!defined($loww) || $lw<$loww);
  }
  for my $sys (sort { $uvals{$a}<=>$uvals{$b} } (@SYS)) {
    if ($nuvals>0) {
      print "\t$sys=".exp($uvals{$sys}/$nuvals-$loww)."";
    }
    unshift @{$ORDER{$bench}},$sys;
  }
  print "\n";
}

print PIPE "set xlabel \"problem size\"\n";
print PIPE "set ylabel \"time\"\n";
print PIPE "set yrange [0.0005:10]\n";
print PIPE "set xrange [1:10000000]\n";
print PIPE "set logscale xy\n";
print PIPE "set key bot right\n";

# my @syses = ("swi", "jchr", "chrjs", "js", "cchr");

for my $bench (keys %PDATA) {
  my $benchdata=$PDATA{$bench};
  print PIPE "set title \"Benchmark $bench\"\n";
  my @plots;
  for my $sys (@{$ORDER{$bench}}) {
# for my $sys (@syses) {
    my $data=$benchdata->{$sys};
    open FILE,">plots/bench-$bench-$sys.dat";
    for my $num (sort { $a <=> $b } (grep {/^\d/} (keys %{$data}))) {
      printf FILE ("%i %.16f\n",$num,$data->{$num});
    }
    close FILE;
    push @plots,"\"plots/bench-$bench-$sys.dat\" using 1:2 title \"$sys\" with line $LINESTYLES{$sys}";
  }
  print PIPE "set terminal postscript enhanced color\n";
  print PIPE "set output \"plots/bench-$bench.ps\"\n";
  print PIPE "plot ".join(', ',@plots)."\n";
#  system("ps2pdf14 bench-$bench.ps bench-$bench.pdf");
  print PIPE "set terminal pdf monochrome enhanced dashed\n";
  print PIPE "set output \"plots/bench-$bench.pdf\"\n";
  print PIPE "set terminal pdf enhanced font \"Helvetica,9\" linewidth 2 rounded color solid\n";
  print PIPE "set output \"plots/bench-$bench-col.pdf\"\n";
  print PIPE "replot\n";
}
close PIPE;
