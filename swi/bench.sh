#!/bin/bash

echo "$1:test($2)." | swipl -x swi/$1/$1.pl.qlf -L0 -G0 -T0 --nodebug --quiet &>/dev/null
