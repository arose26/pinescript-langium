# Arrow Function Support in PineScript Transpiler

## Current Status

We've made progress in supporting arrow functions in the PineScript transpiler:

1. **Simple Arrow Functions with Expressions**: We can now parse and transpile simple arrow functions with a single expression.
   ```pinescript
   f(x) => x * 2
   ```

2. **Simple Arrow Functions with Blocks**: We can now parse and transpile simple arrow functions with a block of statements.
   ```pinescript
   f(x) =>
       y = x * 2
       y
   ```

## Remaining Issues

1. **Complex Arrow Functions**: We still have issues with more complex arrow functions, especially those with multiple parameters and complex blocks.
   ```pinescript
   isInBullDivergence(indicator, price=close, length=100, confirm=true, confLength=1) =>
       isDiv = 0
       confirmOffset = confirm ? confLength : 0
       LL = indicator[0+confirmOffset]
       if (indicator < 50)
           for i = 1+confirmOffset to length+confirmOffset
               if (LL > indicator[i] and indicator[i] < indicator[i+1])
                   LL := indicator[i]
                   if (price[i] > price[confirmOffset])
                       isDiv := i
       isDiv
   ```

2. **Array Destructuring in PCA Example**: The PCA example has an ambiguous alternatives error related to array destructuring.
   ```
   Ambiguous Alternatives Detected: <0, 3> in <OR1> inside <SimpleAssignment​> Rule,
   <LSQB, NAME, ,, NAME, ,, NAME, RSQB, =, ta, ., NAME, LPAR, NAME, ,, NAME, ,, NAME, RPAR, NEWLINE, NAME> may appears as a prefix path in all these alternatives.
   ```

## Next Steps

1. Improve the grammar to handle complex arrow functions with multiple parameters.
2. Fix the ambiguous alternatives error in the array destructuring syntax.
3. Test with more complex examples to ensure robustness.
