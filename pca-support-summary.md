# PCA.pine Support Summary

## Current Support Level: ~75-80%

We've made significant progress in supporting the features needed for the PCA.pine example. Here's a summary of what we've implemented and what still needs improvement:

### Implemented Features:

1. **Array Destructuring Assignment**
   - Grammar rule: `ArrayDestructuringAssignment: {infer ArrayDestructuringAssignment} LSQB variables+=NameStore (',' variables+=NameStore)* RSQB '=' expression=Expression;`
   - ESTree converter: Converts to JavaScript array patterns
   - Example: `[middle, upper, lower] = ta.bb(source, length, mult)`

2. **Variable Reassignment with := Operator**
   - Grammar rule: `SimpleReassignment: target=AssignmentTarget ':=' expression=Expression;`
   - ESTree converter: Converts to JavaScript assignment expressions
   - Example: `stc := math.max(math.min(stc, 100), 0)`

3. **Ternary Operator in Complex Expressions**
   - Grammar rule: `ConditionalExpression infers Expression: DisjunctionExpression ({infer ConditionalExpressionRule.condition=current} '?' thenExpr=Expression ':' elseExpr=Expression)?;`
   - ESTree converter: Converts to JavaScript conditional expressions
   - Example: `upper = ta.ema(ta.change(source) <= 0 ? 0 : stddev, lengthEma)`

4. **Request.security and Ticker Functions**
   - Added 'ticker' and 'syminfo' to the list of built-in library namespaces
   - Leverages existing namespace support in the grammar
   - Example: `request.security(ticker.heikinashi(syminfo.tickerid), mtf, [close,open])`

5. **Input Functions with Named Parameters**
   - Grammar rule: `ArgumentDefinition: ((name=NameStore '=') expression=Expression) | expression=Expression;`
   - ESTree converter: Converts named parameters to JavaScript object properties
   - Example: `input.source(defval=close, title='Source', group='General setting')`

### Features Still Needing Improvement:

1. **Complex For Loops with Dynamic Conditions**
   - Basic for loop structure is already in place
   - Need to ensure proper handling of nested conditions and variable reassignments within loops
   - Example: Lines 106-110 in PCA.pine

2. **Advanced Array Functions**
   - Need to ensure proper support for array.new, array.push, array.get, etc.
   - Example: Lines 85-90 in PCA.pine

3. **Matrix Operations**
   - Need to implement support for matrix operations used in PCA calculations
   - Example: Matrix multiplication and eigenvalue calculations

## Implementation Details

### Array Destructuring Assignment
```pine
// Grammar rule
ArrayDestructuringAssignment:
    {infer ArrayDestructuringAssignment} LSQB variables+=NameStore (',' variables+=NameStore)* RSQB '=' expression=Expression;
```

### Request.security and Ticker Functions
```pine
// Added to built-in library namespaces
'ta' | 'math' | 'color' | 'str' | 'array' | 'map' | 'barstate' | 'request' | 'input' | 'ticker' | 'syminfo';
```

## Next Steps

1. Test the current implementation with the full PCA.pine example
2. Enhance the for loop implementation to better handle complex cases
3. Ensure proper support for advanced array functions
4. Add any missing built-in functions needed for the PCA calculations
