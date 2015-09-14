#ifndef _CCHR_OUTPUT_H
#define _CCHR_OUTPUT_H

#include "cchr_csm.h"

#include "logical.h"

typedef struct {
  CSM_IDX_DEFINE(leq_2_arg1);
  CSM_IDX_DEFINE(leq_2_ra);
  CSM_IDX_DEFINE(leq_2_arg2);
} log_int_t_tag_t;

logical_header(int,log_int_t_tag_t,log_int_t)

#endif

