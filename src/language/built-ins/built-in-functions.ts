/**
 * Model for built-in functions in PineScript
 */

export interface ParameterInfo {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    defaultValue?: string;
    // Additional parameters for PineScript v5
    group?: boolean;
}

export interface FunctionInfo {
    name: string;
    namespace: string;
    description: string;
    returnType: string;
    parameters: ParameterInfo[];
    examples?: string[];
    since?: string; // Version since this function is available
}

// Technical Analysis (ta) namespace functions
const taFunctions: FunctionInfo[] = [
    {
        name: 'sma',
        namespace: 'ta',
        description: 'Simple Moving Average',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the moving average calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the moving average',
                defaultValue: '9'
            }
        ],
        examples: [
            'ta.sma(close, 14)',
            'ta.sma(high + low / 2, 20)'
        ],
        since: '1'
    },
    {
        name: 'ema',
        namespace: 'ta',
        description: 'Exponential Moving Average',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the moving average calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the moving average',
                defaultValue: '9'
            }
        ],
        examples: [
            'ta.ema(close, 14)',
            'ta.ema(high + low / 2, 20)'
        ],
        since: '1'
    },
    {
        name: 'rsi',
        namespace: 'ta',
        description: 'Relative Strength Index',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the RSI calculation',
                defaultValue: 'close'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the RSI',
                defaultValue: '14'
            }
        ],
        examples: [
            'ta.rsi(close, 14)',
            'ta.rsi(high, 20)'
        ],
        since: '1'
    },
    {
        name: 'wma',
        namespace: 'ta',
        description: 'Weighted Moving Average',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the moving average calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the moving average',
                defaultValue: '9'
            }
        ],
        examples: [
            'ta.wma(close, 14)',
            'ta.wma(high + low / 2, 20)'
        ],
        since: '1'
    },
    {
        name: 'vwma',
        namespace: 'ta',
        description: 'Volume Weighted Moving Average',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the moving average calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the moving average',
                defaultValue: '20'
            }
        ],
        examples: [
            'ta.vwma(close, 14)',
            'ta.vwma(high + low / 2, 20)'
        ],
        since: '1'
    },
    {
        name: 'macd',
        namespace: 'ta',
        description: 'Moving Average Convergence/Divergence',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the MACD calculation',
                defaultValue: 'close'
            },
            {
                name: 'fastLength',
                type: 'simple int',
                description: 'Fast EMA length',
                defaultValue: '12'
            },
            {
                name: 'slowLength',
                type: 'simple int',
                description: 'Slow EMA length',
                defaultValue: '26'
            },
            {
                name: 'signalLength',
                type: 'simple int',
                description: 'Signal EMA length',
                defaultValue: '9'
            }
        ],
        examples: [
            'ta.macd(close, 12, 26, 9)',
            'ta.macd(high, 24, 52, 18)'
        ],
        since: '1'
    },
    {
        name: 'bb',
        namespace: 'ta',
        description: 'Bollinger Bands',
        returnType: '[series float, series float, series float]',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the Bollinger Bands calculation',
                defaultValue: 'close'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the moving average',
                defaultValue: '20'
            },
            {
                name: 'multiplier',
                type: 'simple float',
                description: 'Standard deviation multiplier',
                defaultValue: '2.0'
            }
        ],
        examples: [
            '[middle, upper, lower] = ta.bb(close, 20, 2.0)',
            'ta.bb(high, 50, 1.5)'
        ],
        since: '1'
    },
    {
        name: 'pivotlow',
        namespace: 'ta',
        description: 'Finds pivot lows in a series',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find pivot lows',
                defaultValue: 'low'
            },
            {
                name: 'leftbars',
                type: 'simple int',
                description: 'Number of bars to the left to check',
                defaultValue: '5'
            },
            {
                name: 'rightbars',
                type: 'simple int',
                description: 'Number of bars to the right to check',
                defaultValue: '5'
            }
        ],
        examples: [
            'ta.pivotlow(low, 5, 5)',
            'ta.pivotlow(close, 3, 2)'
        ],
        since: '1'
    },
    {
        name: 'pivothigh',
        namespace: 'ta',
        description: 'Finds pivot highs in a series',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find pivot highs',
                defaultValue: 'high'
            },
            {
                name: 'leftbars',
                type: 'simple int',
                description: 'Number of bars to the left to check',
                defaultValue: '5'
            },
            {
                name: 'rightbars',
                type: 'simple int',
                description: 'Number of bars to the right to check',
                defaultValue: '5'
            }
        ],
        examples: [
            'ta.pivothigh(high, 5, 5)',
            'ta.pivothigh(close, 3, 2)'
        ],
        since: '1'
    },
    {
        name: 'linreg',
        namespace: 'ta',
        description: 'Linear Regression',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the linear regression'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the linear regression',
                defaultValue: '9'
            },
            {
                name: 'offset',
                type: 'simple int',
                description: 'Offset of the linear regression',
                defaultValue: '0'
            }
        ],
        examples: [
            'ta.linreg(close, 20, 0)',
            'ta.linreg(high, 50, 5)'
        ],
        since: '1'
    },
    {
        name: 'stdev',
        namespace: 'ta',
        description: 'Standard Deviation',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the standard deviation calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the standard deviation',
                defaultValue: '20'
            }
        ],
        examples: [
            'ta.stdev(close, 20)',
            'ta.stdev(high, 50)'
        ],
        since: '1'
    },
    {
        name: 'stoch',
        namespace: 'ta',
        description: 'Stochastic',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series for the stochastic calculation'
            },
            {
                name: 'high',
                type: 'series float',
                description: 'High series for the stochastic calculation'
            },
            {
                name: 'low',
                type: 'series float',
                description: 'Low series for the stochastic calculation'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Length of the stochastic',
                defaultValue: '14'
            }
        ],
        examples: [
            'ta.stoch(close, high, low, 14)',
            'ta.stoch(rsi, rsi, rsi, 14)'
        ],
        since: '1'
    },
    {
        name: 'highest',
        namespace: 'ta',
        description: 'Highest value in a series over a specified length',
        returnType: 'series float',
        parameters: [
            {
                name: 'length',
                type: 'simple int',
                description: 'Number of bars to check',
                defaultValue: '14'
            },
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find the highest value',
                defaultValue: 'high',
                optional: true
            }
        ],
        examples: [
            'ta.highest(14)',
            'ta.highest(14, high)',
            'ta.highest(50, close)'
        ],
        since: '1'
    },
    {
        name: 'lowest',
        namespace: 'ta',
        description: 'Lowest value in a series over a specified length',
        returnType: 'series float',
        parameters: [
            {
                name: 'length',
                type: 'simple int',
                description: 'Number of bars to check',
                defaultValue: '14'
            },
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find the lowest value',
                defaultValue: 'low',
                optional: true
            }
        ],
        examples: [
            'ta.lowest(14)',
            'ta.lowest(14, low)',
            'ta.lowest(50, close)'
        ],
        since: '1'
    },
    {
        name: 'highestbars',
        namespace: 'ta',
        description: 'Returns the number of bars since the highest value',
        returnType: 'series int',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find the highest value',
                defaultValue: 'high'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Number of bars to check',
                defaultValue: '14'
            }
        ],
        examples: [
            'ta.highestbars(high, 14)',
            'ta.highestbars(close, 50)'
        ],
        since: '1'
    },
    {
        name: 'lowestbars',
        namespace: 'ta',
        description: 'Returns the number of bars since the lowest value',
        returnType: 'series int',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to find the lowest value',
                defaultValue: 'low'
            },
            {
                name: 'length',
                type: 'simple int',
                description: 'Number of bars to check',
                defaultValue: '14'
            }
        ],
        examples: [
            'ta.lowestbars(low, 14)',
            'ta.lowestbars(close, 50)'
        ],
        since: '1'
    },
    {
        name: 'change',
        namespace: 'ta',
        description: 'Returns the difference between current value and previous value',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to calculate the change'
            }
        ],
        examples: [
            'ta.change(close)',
            'ta.change(high)'
        ],
        since: '1'
    }
];

// Math namespace functions
const mathFunctions: FunctionInfo[] = [
    {
        name: 'max',
        namespace: 'math',
        description: 'Returns the maximum of two values',
        returnType: 'series float',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'First value'
            },
            {
                name: 'y',
                type: 'series float',
                description: 'Second value'
            }
        ],
        examples: [
            'math.max(close, open)',
            'math.max(high, low)'
        ],
        since: '1'
    },
    {
        name: 'min',
        namespace: 'math',
        description: 'Returns the minimum of two values',
        returnType: 'series float',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'First value'
            },
            {
                name: 'y',
                type: 'series float',
                description: 'Second value'
            }
        ],
        examples: [
            'math.min(close, open)',
            'math.min(high, low)'
        ],
        since: '1'
    },
    {
        name: 'abs',
        namespace: 'math',
        description: 'Returns the absolute value',
        returnType: 'series float',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'Input value'
            }
        ],
        examples: [
            'math.abs(close - open)',
            'math.abs(-5)'
        ],
        since: '1'
    },
    {
        name: 'pow',
        namespace: 'math',
        description: 'Returns the base raised to the exponent power',
        returnType: 'series float',
        parameters: [
            {
                name: 'base',
                type: 'series float',
                description: 'Base value'
            },
            {
                name: 'exponent',
                type: 'series float',
                description: 'Exponent value'
            }
        ],
        examples: [
            'math.pow(2, 3)',
            'math.pow(close, 2)'
        ],
        since: '1'
    },
    {
        name: 'sqrt',
        namespace: 'math',
        description: 'Returns the square root of a value',
        returnType: 'series float',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'Input value'
            }
        ],
        examples: [
            'math.sqrt(25)',
            'math.sqrt(close)'
        ],
        since: '1'
    },
    {
        name: 'round',
        namespace: 'math',
        description: 'Rounds a value to the nearest integer or to a specified number of decimal places',
        returnType: 'series float',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'Input value'
            },
            {
                name: 'precision',
                type: 'simple int',
                description: 'Number of decimal places',
                defaultValue: '0'
            }
        ],
        examples: [
            'math.round(3.14)',
            'math.round(close, 2)'
        ],
        since: '1'
    }
];

// Color namespace functions
const colorFunctions: FunctionInfo[] = [
    {
        name: 'new',
        namespace: 'color',
        description: 'Creates a color with the specified transparency',
        returnType: 'simple color',
        parameters: [
            {
                name: 'color',
                type: 'simple color',
                description: 'Base color'
            },
            {
                name: 'transp',
                type: 'simple int',
                description: 'Transparency (0-100)',
                defaultValue: '0'
            }
        ],
        examples: [
            'color.new(color.red, 50)',
            'color.new(#FF00FF, 70)'
        ],
        since: '4'
    },
    {
        name: 'rgb',
        namespace: 'color',
        description: 'Creates a color from RGB components',
        returnType: 'simple color',
        parameters: [
            {
                name: 'red',
                type: 'simple int',
                description: 'Red component (0-255)'
            },
            {
                name: 'green',
                type: 'simple int',
                description: 'Green component (0-255)'
            },
            {
                name: 'blue',
                type: 'simple int',
                description: 'Blue component (0-255)'
            },
            {
                name: 'transp',
                type: 'simple int',
                description: 'Transparency (0-100)',
                optional: true,
                defaultValue: '0'
            }
        ],
        examples: [
            'color.rgb(255, 0, 0)',
            'color.rgb(0, 255, 0, 50)'
        ],
        since: '4'
    }
];

// Input namespace functions
const inputFunctions: FunctionInfo[] = [
    {
        name: 'int',
        namespace: 'input',
        description: 'Creates an integer input',
        returnType: 'input int',
        parameters: [
            {
                name: 'defval',
                type: 'simple int',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'minval',
                type: 'simple int',
                description: 'Minimum value',
                optional: true
            },
            {
                name: 'maxval',
                type: 'simple int',
                description: 'Maximum value',
                optional: true
            },
            {
                name: 'step',
                type: 'simple int',
                description: 'Step value',
                optional: true,
                defaultValue: '1'
            },
            {
                name: 'confirm',
                type: 'simple bool',
                description: 'Whether to show a confirmation dialog',
                optional: true,
                defaultValue: 'false'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.int(14, "Period")',
            'input.int(14, "Period", 1, 100, 1, false, "The period for the calculation")',
            'input.int(14, "Period", group="Settings")'
        ],
        since: '4'
    },
    {
        name: 'float',
        namespace: 'input',
        description: 'Creates a float input',
        returnType: 'input float',
        parameters: [
            {
                name: 'defval',
                type: 'simple float',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'minval',
                type: 'simple float',
                description: 'Minimum value',
                optional: true
            },
            {
                name: 'maxval',
                type: 'simple float',
                description: 'Maximum value',
                optional: true
            },
            {
                name: 'step',
                type: 'simple float',
                description: 'Step value',
                optional: true,
                defaultValue: '0.1'
            },
            {
                name: 'confirm',
                type: 'simple bool',
                description: 'Whether to show a confirmation dialog',
                optional: true,
                defaultValue: 'false'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.float(1.5, "Multiplier")',
            'input.float(1.5, "Multiplier", 0.1, 10.0, 0.1, false, "The multiplier for the calculation")',
            'input.float(1.5, "Multiplier", group="Settings")'
        ],
        since: '4'
    },
    {
        name: 'source',
        namespace: 'input',
        description: 'Creates a source input',
        returnType: 'input source',
        parameters: [
            {
                name: 'defval',
                type: 'series float',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.source(close, "Source")',
            'input.source(hlc3, "Source", "The source for the calculation")',
            'input.source(close, "Source", group="Settings")'
        ],
        since: '4'
    },
    {
        name: 'bool',
        namespace: 'input',
        description: 'Creates a boolean input',
        returnType: 'input bool',
        parameters: [
            {
                name: 'defval',
                type: 'simple bool',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.bool(true, "Enable")',
            'input.bool(true, "Enable", "Enable this feature")',
            'input.bool(true, "Enable", group="Settings")'
        ],
        since: '4'
    },
    {
        name: 'string',
        namespace: 'input',
        description: 'Creates a string input',
        returnType: 'input string',
        parameters: [
            {
                name: 'defval',
                type: 'simple string',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'options',
                type: 'simple array',
                description: 'Array of options for the dropdown',
                optional: true
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.string("BTC", "Symbol")',
            'input.string("BTC", "Symbol", "The symbol to use")',
            'input.string("BTC", "Symbol", options=["BTC", "ETH", "LTC"])',
            'input.string("BTC", "Symbol", group="Settings")'
        ],
        since: '4'
    },
    {
        name: 'timeframe',
        namespace: 'input',
        description: 'Creates a timeframe input',
        returnType: 'input string',
        parameters: [
            {
                name: 'defval',
                type: 'simple string',
                description: 'Default value'
            },
            {
                name: 'title',
                type: 'simple string',
                description: 'Title of the input',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'tooltip',
                type: 'simple string',
                description: 'Tooltip text',
                optional: true,
                defaultValue: '""'
            },
            {
                name: 'group',
                type: 'simple string',
                description: 'Group name for the input',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'input.timeframe("D", "Timeframe")',
            'input.timeframe("D", "Timeframe", "The timeframe to use")',
            'input.timeframe("D", "Timeframe", group="Settings")'
        ],
        since: '4'
    }
];

// String namespace functions
const strFunctions: FunctionInfo[] = [
    {
        name: 'tostring',
        namespace: 'str',
        description: 'Converts a value to a string',
        returnType: 'simple string',
        parameters: [
            {
                name: 'value',
                type: 'series float',
                description: 'Value to convert to string'
            },
            {
                name: 'format',
                type: 'simple string',
                description: 'Format string (e.g., "#.##" for 2 decimal places)',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'str.tostring(close)',
            'str.tostring(close, "#.##")'
        ],
        since: '3'
    },
    {
        name: 'format',
        namespace: 'str',
        description: 'Formats a string with placeholders',
        returnType: 'simple string',
        parameters: [
            {
                name: 'formatString',
                type: 'simple string',
                description: 'Format string with placeholders (e.g., "Value: {0}")'
            },
            {
                name: 'arg0',
                type: 'series float',
                description: 'First argument to replace {0}'
            },
            {
                name: 'arg1',
                type: 'series float',
                description: 'Second argument to replace {1}',
                optional: true
            },
            {
                name: 'arg2',
                type: 'series float',
                description: 'Third argument to replace {2}',
                optional: true
            },
            {
                name: 'arg3',
                type: 'series float',
                description: 'Fourth argument to replace {3}',
                optional: true
            }
        ],
        examples: [
            'str.format("Close: {0}", close)',
            'str.format("O: {0}, H: {1}, L: {2}, C: {3}", open, high, low, close)'
        ],
        since: '3'
    },
    {
        name: 'length',
        namespace: 'str',
        description: 'Returns the length of a string',
        returnType: 'simple int',
        parameters: [
            {
                name: 'string',
                type: 'simple string',
                description: 'Input string'
            }
        ],
        examples: [
            'str.length("Hello")',
            'str.length(syminfo.ticker)'
        ],
        since: '3'
    },
    {
        name: 'substring',
        namespace: 'str',
        description: 'Returns a substring of a string',
        returnType: 'simple string',
        parameters: [
            {
                name: 'string',
                type: 'simple string',
                description: 'Input string'
            },
            {
                name: 'startIndex',
                type: 'simple int',
                description: 'Start index (0-based)'
            },
            {
                name: 'endIndex',
                type: 'simple int',
                description: 'End index (exclusive)',
                optional: true
            }
        ],
        examples: [
            'str.substring("Hello", 1, 3)',
            'str.substring(syminfo.ticker, 0, 3)'
        ],
        since: '3'
    }
];

// Array namespace functions
const arrayFunctions: FunctionInfo[] = [
    {
        name: 'new_float',
        namespace: 'array',
        description: 'Creates a new float array',
        returnType: 'array<float>',
        parameters: [
            {
                name: 'size',
                type: 'simple int',
                description: 'Initial size of the array',
                defaultValue: '0'
            },
            {
                name: 'initial_value',
                type: 'simple float',
                description: 'Initial value for all elements',
                optional: true,
                defaultValue: '0.0'
            }
        ],
        examples: [
            'array.new_float(0)',
            'array.new_float(5, 1.0)'
        ],
        since: '4'
    },
    {
        name: 'new_int',
        namespace: 'array',
        description: 'Creates a new integer array',
        returnType: 'array<int>',
        parameters: [
            {
                name: 'size',
                type: 'simple int',
                description: 'Initial size of the array',
                defaultValue: '0'
            },
            {
                name: 'initial_value',
                type: 'simple int',
                description: 'Initial value for all elements',
                optional: true,
                defaultValue: '0'
            }
        ],
        examples: [
            'array.new_int(0)',
            'array.new_int(5, 1)'
        ],
        since: '4'
    },
    {
        name: 'new_string',
        namespace: 'array',
        description: 'Creates a new string array',
        returnType: 'array<string>',
        parameters: [
            {
                name: 'size',
                type: 'simple int',
                description: 'Initial size of the array',
                defaultValue: '0'
            },
            {
                name: 'initial_value',
                type: 'simple string',
                description: 'Initial value for all elements',
                optional: true,
                defaultValue: '""'
            }
        ],
        examples: [
            'array.new_string(0)',
            'array.new_string(5, "empty")'
        ],
        since: '4'
    },
    {
        name: 'new_bool',
        namespace: 'array',
        description: 'Creates a new boolean array',
        returnType: 'array<bool>',
        parameters: [
            {
                name: 'size',
                type: 'simple int',
                description: 'Initial size of the array',
                defaultValue: '0'
            },
            {
                name: 'initial_value',
                type: 'simple bool',
                description: 'Initial value for all elements',
                optional: true,
                defaultValue: 'false'
            }
        ],
        examples: [
            'array.new_bool(0)',
            'array.new_bool(5, true)'
        ],
        since: '4'
    },
    {
        name: 'push',
        namespace: 'array',
        description: 'Adds an element to the end of the array',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to modify'
            },
            {
                name: 'value',
                type: 'simple T',
                description: 'Value to add'
            }
        ],
        examples: [
            'array.push(prices, close)',
            'array.push(labels, "Label 1")'
        ],
        since: '4'
    },
    {
        name: 'pop',
        namespace: 'array',
        description: 'Removes and returns the last element of the array',
        returnType: 'simple T',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to modify'
            }
        ],
        examples: [
            'array.pop(prices)',
            'array.pop(labels)'
        ],
        since: '4'
    },
    {
        name: 'get',
        namespace: 'array',
        description: 'Gets an element at the specified index',
        returnType: 'simple T',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            },
            {
                name: 'index',
                type: 'simple int',
                description: 'Index of the element'
            }
        ],
        examples: [
            'array.get(prices, 0)',
            'array.get(labels, i)'
        ],
        since: '4'
    },
    {
        name: 'set',
        namespace: 'array',
        description: 'Sets an element at the specified index',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to modify'
            },
            {
                name: 'index',
                type: 'simple int',
                description: 'Index of the element'
            },
            {
                name: 'value',
                type: 'simple T',
                description: 'New value'
            }
        ],
        examples: [
            'array.set(prices, 0, close)',
            'array.set(labels, i, "New Label")'
        ],
        since: '4'
    },
    {
        name: 'size',
        namespace: 'array',
        description: 'Returns the size of the array',
        returnType: 'simple int',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            }
        ],
        examples: [
            'array.size(prices)',
            'array.size(labels)'
        ],
        since: '4'
    },
    {
        name: 'clear',
        namespace: 'array',
        description: 'Removes all elements from the array',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to clear'
            }
        ],
        examples: [
            'array.clear(prices)',
            'array.clear(labels)'
        ],
        since: '4'
    },
    {
        name: 'slice',
        namespace: 'array',
        description: 'Returns a slice of the array',
        returnType: 'array<T>',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            },
            {
                name: 'from',
                type: 'simple int',
                description: 'Start index (inclusive)'
            },
            {
                name: 'to',
                type: 'simple int',
                description: 'End index (exclusive)',
                optional: true
            }
        ],
        examples: [
            'array.slice(prices, 0, 3)',
            'array.slice(labels, 1)'
        ],
        since: '4'
    },
    {
        name: 'join',
        namespace: 'array',
        description: 'Joins array elements into a string',
        returnType: 'simple string',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            },
            {
                name: 'separator',
                type: 'simple string',
                description: 'Separator string',
                defaultValue: '","'
            }
        ],
        examples: [
            'array.join(labels, ", ")',
            'array.join(prices, "|")'
        ],
        since: '4'
    },
    {
        name: 'includes',
        namespace: 'array',
        description: 'Checks if array includes a value',
        returnType: 'simple bool',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            },
            {
                name: 'value',
                type: 'simple T',
                description: 'Value to check'
            }
        ],
        examples: [
            'array.includes(prices, 100.5)',
            'array.includes(labels, "Label 1")'
        ],
        since: '4'
    },
    {
        name: 'indexOf',
        namespace: 'array',
        description: 'Returns the index of a value in the array',
        returnType: 'simple int',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Source array'
            },
            {
                name: 'value',
                type: 'simple T',
                description: 'Value to find'
            }
        ],
        examples: [
            'array.indexOf(prices, 100.5)',
            'array.indexOf(labels, "Label 1")'
        ],
        since: '4'
    },
    {
        name: 'sort',
        namespace: 'array',
        description: 'Sorts the array in place',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to sort'
            },
            {
                name: 'order',
                type: 'simple string',
                description: 'Sort order ("asc" or "desc")',
                optional: true,
                defaultValue: '"asc"'
            }
        ],
        examples: [
            'array.sort(prices)',
            'array.sort(prices, "desc")'
        ],
        since: '4'
    },
    {
        name: 'min',
        namespace: 'array',
        description: 'Returns the minimum value in the array',
        returnType: 'simple T',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to find the minimum value in'
            }
        ],
        examples: [
            'array.min(prices)',
            'array.min(values)'
        ],
        since: '4'
    },
    {
        name: 'max',
        namespace: 'array',
        description: 'Returns the maximum value in the array',
        returnType: 'simple T',
        parameters: [
            {
                name: 'id',
                type: 'array<T>',
                description: 'Array to find the maximum value in'
            }
        ],
        examples: [
            'array.max(prices)',
            'array.max(values)'
        ],
        since: '4'
    },
    {
        name: 'avg',
        namespace: 'array',
        description: 'Returns the average value in the array',
        returnType: 'simple float',
        parameters: [
            {
                name: 'id',
                type: 'array<float>',
                description: 'Array to find the average value in'
            }
        ],
        examples: [
            'array.avg(prices)',
            'array.avg(values)'
        ],
        since: '4'
    },
    {
        name: 'stdev',
        namespace: 'array',
        description: 'Returns the standard deviation of the array',
        returnType: 'simple float',
        parameters: [
            {
                name: 'id',
                type: 'array<float>',
                description: 'Array to calculate the standard deviation of'
            }
        ],
        examples: [
            'array.stdev(prices)',
            'array.stdev(values)'
        ],
        since: '4'
    },
    {
        name: 'variance',
        namespace: 'array',
        description: 'Returns the variance of the array',
        returnType: 'simple float',
        parameters: [
            {
                name: 'id',
                type: 'array<float>',
                description: 'Array to calculate the variance of'
            }
        ],
        examples: [
            'array.variance(prices)',
            'array.variance(values)'
        ],
        since: '4'
    },
    {
        name: 'covariance',
        namespace: 'array',
        description: 'Returns the covariance between two arrays',
        returnType: 'simple float',
        parameters: [
            {
                name: 'id1',
                type: 'array<float>',
                description: 'First array'
            },
            {
                name: 'id2',
                type: 'array<float>',
                description: 'Second array'
            }
        ],
        examples: [
            'array.covariance(prices1, prices2)',
            'array.covariance(x, y)'
        ],
        since: '4'
    }
];

// Map namespace functions
const mapFunctions: FunctionInfo[] = [
    {
        name: 'new',
        namespace: 'map',
        description: 'Creates a new map',
        returnType: 'map<K, V>',
        parameters: [],
        examples: [
            'map.new<string, float>()',
            'map.new<string, array<float>>()'
        ],
        since: '4'
    },
    {
        name: 'put',
        namespace: 'map',
        description: 'Adds or updates a key-value pair in the map',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Map to modify'
            },
            {
                name: 'key',
                type: 'simple K',
                description: 'Key'
            },
            {
                name: 'value',
                type: 'simple V',
                description: 'Value'
            }
        ],
        examples: [
            'map.put(settings, "stopLoss", 0.02)',
            'map.put(settings, "takeProfit", 0.05)'
        ],
        since: '4'
    },
    {
        name: 'get',
        namespace: 'map',
        description: 'Gets a value from the map by key',
        returnType: 'simple V',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Source map'
            },
            {
                name: 'key',
                type: 'simple K',
                description: 'Key'
            },
            {
                name: 'default',
                type: 'simple V',
                description: 'Default value if key not found',
                optional: true
            }
        ],
        examples: [
            'map.get(settings, "stopLoss")',
            'map.get(settings, "takeProfit", 0.03)'
        ],
        since: '4'
    },
    {
        name: 'remove',
        namespace: 'map',
        description: 'Removes a key-value pair from the map',
        returnType: 'simple bool',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Map to modify'
            },
            {
                name: 'key',
                type: 'simple K',
                description: 'Key to remove'
            }
        ],
        examples: [
            'map.remove(settings, "stopLoss")',
            'map.remove(settings, "takeProfit")'
        ],
        since: '4'
    },
    {
        name: 'keys',
        namespace: 'map',
        description: 'Returns an array of all keys in the map',
        returnType: 'array<K>',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Source map'
            }
        ],
        examples: [
            'map.keys(settings)',
            'var allKeys = map.keys(settings)'
        ],
        since: '4'
    },
    {
        name: 'values',
        namespace: 'map',
        description: 'Returns an array of all values in the map',
        returnType: 'array<V>',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Source map'
            }
        ],
        examples: [
            'map.values(settings)',
            'var allValues = map.values(settings)'
        ],
        since: '4'
    },
    {
        name: 'size',
        namespace: 'map',
        description: 'Returns the number of key-value pairs in the map',
        returnType: 'simple int',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Source map'
            }
        ],
        examples: [
            'map.size(settings)',
            'var count = map.size(settings)'
        ],
        since: '4'
    },
    {
        name: 'clear',
        namespace: 'map',
        description: 'Removes all key-value pairs from the map',
        returnType: 'void',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Map to clear'
            }
        ],
        examples: [
            'map.clear(settings)',
            'map.clear(tradeData)'
        ],
        since: '4'
    },
    {
        name: 'contains',
        namespace: 'map',
        description: 'Checks if the map contains a key',
        returnType: 'simple bool',
        parameters: [
            {
                name: 'id',
                type: 'map<K, V>',
                description: 'Source map'
            },
            {
                name: 'key',
                type: 'simple K',
                description: 'Key to check'
            }
        ],
        examples: [
            'map.contains(settings, "stopLoss")',
            'map.contains(settings, "takeProfit")'
        ],
        since: '4'
    }
];

// Request namespace functions
const requestFunctions: FunctionInfo[] = [
    {
        name: 'security',
        namespace: 'request',
        description: 'Requests data from another symbol and/or timeframe',
        returnType: 'series float',
        parameters: [
            {
                name: 'symbol',
                type: 'simple string',
                description: 'Symbol to request data from'
            },
            {
                name: 'timeframe',
                type: 'simple string',
                description: 'Timeframe to request data from'
            },
            {
                name: 'expression',
                type: 'series float',
                description: 'Expression to evaluate on the requested data'
            },
            {
                name: 'gaps',
                type: 'simple bool',
                description: 'Whether to fill gaps in the data',
                defaultValue: 'true',
                optional: true
            },
            {
                name: 'lookahead',
                type: 'simple bool',
                description: 'Whether to use lookahead',
                defaultValue: 'false',
                optional: true
            }
        ],
        examples: [
            'request.security(syminfo.tickerid, "D", close)',
            'request.security("AAPL", "1H", ta.sma(close, 14), gaps=true, lookahead=false)'
        ],
        since: '4'
    }
];

// Ticker namespace functions
const tickerFunctions: FunctionInfo[] = [
    {
        name: 'heikinashi',
        namespace: 'ticker',
        description: 'Returns the Heikin-Ashi version of the specified symbol',
        returnType: 'simple string',
        parameters: [
            {
                name: 'symbol',
                type: 'simple string',
                description: 'Symbol to get Heikin-Ashi version of'
            }
        ],
        examples: [
            'ticker.heikinashi(syminfo.tickerid)',
            'ticker.heikinashi("AAPL")'
        ],
        since: '4'
    }
];

// Symbol info namespace
const syminfoFunctions: FunctionInfo[] = [
    {
        name: 'tickerid',
        namespace: 'syminfo',
        description: 'Current symbol ticker ID',
        returnType: 'simple string',
        parameters: [],
        examples: [
            'syminfo.tickerid'
        ],
        since: '1'
    }
];

// Bar state namespace
const barstateProperties: FunctionInfo[] = [
    {
        name: 'isfirst',
        namespace: 'barstate',
        description: 'Returns true if the current bar is the first bar in the dataset',
        returnType: 'series bool',
        parameters: [],
        examples: [
            'if barstate.isfirst\n    // Initialize variables'
        ],
        since: '3'
    },
    {
        name: 'islast',
        namespace: 'barstate',
        description: 'Returns true if the current bar is the last bar in the dataset',
        returnType: 'series bool',
        parameters: [],
        examples: [
            'if barstate.islast\n    label.new(bar_index, high, "Last Bar")'
        ],
        since: '3'
    },
    {
        name: 'isrealtime',
        namespace: 'barstate',
        description: 'Returns true if the current bar is a real-time bar',
        returnType: 'series bool',
        parameters: [],
        examples: [
            'if barstate.isrealtime\n    // Only execute in real-time'
        ],
        since: '3'
    },
    {
        name: 'ishistorical',
        namespace: 'barstate',
        description: 'Returns true if the current bar is a historical bar',
        returnType: 'series bool',
        parameters: [],
        examples: [
            'if barstate.ishistorical\n    // Only execute on historical bars'
        ],
        since: '3'
    }
];

// Global functions (not in a namespace)
const globalFunctions: FunctionInfo[] = [
    {
        name: 'fixnan',
        namespace: '',
        description: 'Replaces NaN values with the previous non-NaN value',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to fix NaN values in'
            }
        ],
        examples: [
            'fixnan(close)',
            'fixnan(ta.sma(close, 14))'
        ],
        since: '1'
    },
    {
        name: 'nz',
        namespace: '',
        description: 'Replaces NaN values with zero or a specified value',
        returnType: 'series float',
        parameters: [
            {
                name: 'source',
                type: 'series float',
                description: 'Source series to replace NaN values in'
            },
            {
                name: 'replacement',
                type: 'series float',
                description: 'Value to replace NaN with',
                optional: true,
                defaultValue: '0'
            }
        ],
        examples: [
            'nz(close)',
            'nz(close, close[1])'
        ],
        since: '1'
    },
    {
        name: 'na',
        namespace: '',
        description: 'Checks if a value is NaN (Not a Number)',
        returnType: 'series bool',
        parameters: [
            {
                name: 'x',
                type: 'series float',
                description: 'Value to check'
            }
        ],
        examples: [
            'na(close)',
            'if not na(close) then close else 0'
        ],
        since: '1'
    }
];

// Matrix namespace functions
const matrixFunctions: FunctionInfo[] = [
    {
        name: 'new',
        namespace: 'matrix',
        description: 'Creates a new matrix (2D array)',
        returnType: 'matrix<float>',
        parameters: [
            {
                name: 'rows',
                type: 'simple int',
                description: 'Number of rows in the matrix'
            },
            {
                name: 'cols',
                type: 'simple int',
                description: 'Number of columns in the matrix'
            },
            {
                name: 'initial_value',
                type: 'simple float',
                description: 'Initial value for all elements',
                optional: true,
                defaultValue: '0.0'
            }
        ],
        examples: [
            'matrix.new(3, 3, 0)',
            'matrix.new(5, 2, 1.0)'
        ],
        since: '5'
    },
    {
        name: 'rows',
        namespace: 'matrix',
        description: 'Returns the number of rows in a matrix',
        returnType: 'simple int',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to get the number of rows from'
            }
        ],
        examples: [
            'matrix.rows(mat)'
        ],
        since: '5'
    },
    {
        name: 'cols',
        namespace: 'matrix',
        description: 'Returns the number of columns in a matrix',
        returnType: 'simple int',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to get the number of columns from'
            }
        ],
        examples: [
            'matrix.cols(mat)'
        ],
        since: '5'
    },
    {
        name: 'get',
        namespace: 'matrix',
        description: 'Gets a value from a matrix at the specified row and column',
        returnType: 'series float',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to get the value from'
            },
            {
                name: 'row',
                type: 'simple int',
                description: 'Row index (0-based)'
            },
            {
                name: 'col',
                type: 'simple int',
                description: 'Column index (0-based)'
            }
        ],
        examples: [
            'matrix.get(mat, 0, 0)',
            'matrix.get(mat, i, j)'
        ],
        since: '5'
    },
    {
        name: 'set',
        namespace: 'matrix',
        description: 'Sets a value in a matrix at the specified row and column',
        returnType: 'void',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to set the value in'
            },
            {
                name: 'row',
                type: 'simple int',
                description: 'Row index (0-based)'
            },
            {
                name: 'col',
                type: 'simple int',
                description: 'Column index (0-based)'
            },
            {
                name: 'value',
                type: 'series float',
                description: 'Value to set'
            }
        ],
        examples: [
            'matrix.set(mat, 0, 0, 1.0)',
            'matrix.set(mat, i, j, close)'
        ],
        since: '5'
    },
    {
        name: 'transpose',
        namespace: 'matrix',
        description: 'Transposes a matrix (swaps rows and columns)',
        returnType: 'matrix<float>',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to transpose'
            }
        ],
        examples: [
            'matrix.transpose(mat)'
        ],
        since: '5'
    },
    {
        name: 'multiply',
        namespace: 'matrix',
        description: 'Multiplies two matrices',
        returnType: 'matrix<float>',
        parameters: [
            {
                name: 'matrix1',
                type: 'matrix<float>',
                description: 'First matrix'
            },
            {
                name: 'matrix2',
                type: 'matrix<float>',
                description: 'Second matrix'
            }
        ],
        examples: [
            'matrix.multiply(mat1, mat2)'
        ],
        since: '5'
    },
    {
        name: 'pca',
        namespace: 'matrix',
        description: 'Performs Principal Component Analysis (PCA) on a matrix',
        returnType: 'matrix<float>',
        parameters: [
            {
                name: 'matrix',
                type: 'matrix<float>',
                description: 'Matrix to perform PCA on'
            },
            {
                name: 'components',
                type: 'simple int',
                description: 'Number of principal components to keep',
                optional: true
            }
        ],
        examples: [
            'matrix.pca(mat, 2)'
        ],
        since: '5'
    }
];

// Combine all function namespaces
export const builtInFunctions: FunctionInfo[] = [
    ...taFunctions,
    ...mathFunctions,
    ...colorFunctions,
    ...inputFunctions,
    ...strFunctions,
    ...arrayFunctions,
    ...matrixFunctions,
    ...mapFunctions,
    ...requestFunctions,
    ...tickerFunctions,
    ...syminfoFunctions,
    ...barstateProperties,
    ...globalFunctions
];

// Function to find a built-in function by namespace and name
export function findBuiltInFunction(namespace: string, name: string): FunctionInfo | undefined {
    return builtInFunctions.find(func => func.namespace === namespace && func.name === name);
}

// Function to get all functions in a namespace
export function getFunctionsInNamespace(namespace: string): FunctionInfo[] {
    return builtInFunctions.filter(func => func.namespace === namespace);
}

// Function to get all available namespaces
export function getAvailableNamespaces(): string[] {
    return [...new Set(builtInFunctions.map(func => func.namespace))];
}
