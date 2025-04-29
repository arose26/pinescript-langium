/**
 * Model for built-in functions in PineScript
 */

export interface ParameterInfo {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    defaultValue?: string;
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
            }
        ],
        examples: [
            'input.int(14, "Period")',
            'input.int(14, "Period", 1, 100, 1, false, "The period for the calculation")'
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
            }
        ],
        examples: [
            'input.float(1.5, "Multiplier")',
            'input.float(1.5, "Multiplier", 0.1, 10.0, 0.1, false, "The multiplier for the calculation")'
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
            }
        ],
        examples: [
            'input.source(close, "Source")',
            'input.source(hlc3, "Source", "The source for the calculation")'
        ],
        since: '4'
    }
];

// Combine all function namespaces
export const builtInFunctions: FunctionInfo[] = [
    ...taFunctions,
    ...mathFunctions,
    ...colorFunctions,
    ...inputFunctions
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
