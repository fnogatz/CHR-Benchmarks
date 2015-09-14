#!/bin/bash

echo "$1:test($2)." | swipl -x $1/$1.pl.qlf -L0 -G0 -T0 --nodebug --quiet 2>&1
