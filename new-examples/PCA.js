
// Math functions
const math = {
    max: Math.max,
    min: Math.min,
    abs: Math.abs,
    sum: (arr) => arr.reduce((a, b) => a + b, 0)
};

// Technical analysis functions
const ta = {
    pivotlow: (src, left, right) => {
        // Implementation of pivotlow
        const len = src.length;
        const idx = len - 1; // Current bar index
        if (idx < left || idx >= len - right) return null;
        
        const val = src[idx];
        for (let i = idx - left; i <= idx + right; i++) {
            if (i === idx) continue;
            if (i >= 0 && i < len && src[i] <= val) return null;
        }
        return val;
    },
    pivothigh: (src, left, right) => {
        // Implementation of pivothigh
        const len = src.length;
        const idx = len - 1; // Current bar index
        if (idx < left || idx >= len - right) return null;
        
        const val = src[idx];
        for (let i = idx - left; i <= idx + right; i++) {
            if (i === idx) continue;
            if (i >= 0 && i < len && src[i] >= val) return null;
        }
        return val;
    },
    ema: (src, length) => {
        // Simple EMA implementation
        if (Array.isArray(src)) {
            const result = [];
            const alpha = 2 / (length + 1);
            let ema = src[0];
            
            for (let i = 0; i < src.length; i++) {
                ema = src[i] * alpha + ema * (1 - alpha);
                result.push(ema);
            }
            
            return result[result.length - 1];
        } else {
            // Handle single value
            return src;
        }
    },
    sma: (src, length) => {
        // Simple SMA implementation
        if (Array.isArray(src)) {
            if (src.length < length) return src[src.length - 1];
            
            let sum = 0;
            for (let i = src.length - length; i < src.length; i++) {
                sum += src[i];
            }
            
            return sum / length;
        } else {
            // Handle single value
            return src;
        }
    },
    stdev: (src, length) => {
        // Standard deviation implementation
        if (Array.isArray(src)) {
            if (src.length < length) return 0;
            
            const mean = ta.sma(src, length);
            let sum = 0;
            
            for (let i = src.length - length; i < src.length; i++) {
                sum += Math.pow(src[i] - mean, 2);
            }
            
            return Math.sqrt(sum / length);
        } else {
            // Handle single value
            return 0;
        }
    },
    change: (src) => {
        // Calculate change between current and previous value
        if (Array.isArray(src)) {
            if (src.length < 2) return 0;
            return src[src.length - 1] - src[src.length - 2];
        } else {
            // Handle single value
            return 0;
        }
    },
    stoch: (src1, src2, src3, length) => {
        // Stochastic implementation
        if (Array.isArray(src1) && Array.isArray(src2) && Array.isArray(src3)) {
            if (src1.length < length) return 0;
            
            let highest = -Infinity;
            let lowest = Infinity;
            
            for (let i = src1.length - length; i < src1.length; i++) {
                highest = Math.max(highest, src2[i]);
                lowest = Math.min(lowest, src3[i]);
            }
            
            const current = src1[src1.length - 1];
            if (highest === lowest) return 100;
            
            return 100 * (current - lowest) / (highest - lowest);
        } else {
            // Handle single values
            return 0;
        }
    },
    bb: (src, length, mult) => {
        // Bollinger Bands implementation
        const middle = ta.sma(src, length);
        const stdDev = ta.stdev(src, length);
        const upper = middle + mult * stdDev;
        const lower = middle - mult * stdDev;
        
        return [middle, upper, lower];
    },
    highestbars: (src, length) => {
        // Find the offset of the highest value
        if (Array.isArray(src)) {
            if (src.length < length) return 0;
            
            let highestIdx = src.length - length;
            let highestVal = src[highestIdx];
            
            for (let i = src.length - length + 1; i < src.length; i++) {
                if (src[i] > highestVal) {
                    highestVal = src[i];
                    highestIdx = i;
                }
            }
            
            return highestIdx - (src.length - 1);
        } else {
            // Handle single value
            return 0;
        }
    },
    lowestbars: (src, length) => {
        // Find the offset of the lowest value
        if (Array.isArray(src)) {
            if (src.length < length) return 0;
            
            let lowestIdx = src.length - length;
            let lowestVal = src[lowestIdx];
            
            for (let i = src.length - length + 1; i < src.length; i++) {
                if (src[i] < lowestVal) {
                    lowestVal = src[i];
                    lowestIdx = i;
                }
            }
            
            return lowestIdx - (src.length - 1);
        } else {
            // Handle single value
            return 0;
        }
    },
    highest: (src, length) => {
        // Find the highest value
        if (Array.isArray(src)) {
            if (src.length < length) return src[src.length - 1];
            
            let highest = -Infinity;
            
            for (let i = src.length - length; i < src.length; i++) {
                highest = Math.max(highest, src[i]);
            }
            
            return highest;
        } else {
            // Handle single value
            return src;
        }
    },
    lowest: (src, length) => {
        // Find the lowest value
        if (Array.isArray(src)) {
            if (src.length < length) return src[src.length - 1];
            
            let lowest = Infinity;
            
            for (let i = src.length - length; i < src.length; i++) {
                lowest = Math.min(lowest, src[i]);
            }
            
            return lowest;
        } else {
            // Handle single value
            return src;
        }
    }
};

// Input functions
const input = {
    source: (options) => options.defval,
    timeframe: (options) => options.defval,
    bool: (defval, options) => defval,
    int: (options) => options.defval,
    string: (defval, title, options) => defval
};

// Request functions
const request = {
    security: (symbol, timeframe, expression) => {
        // In a real implementation, this would fetch data for the symbol
        // For now, we'll just return the expression
        return expression;
    }
};

// Ticker functions
const ticker = {
    heikinashi: (symbol) => symbol
};

// Symbol information
const syminfo = {
    tickerid: 'BTCUSD'
};

// Bar state
const barstate = {
    isfirst: false
};

// Helper functions
function nz(value, defval = 0) {
    return value === null || value === undefined || isNaN(value) ? defval : value;
}

function fixnan(value) {
    return isNaN(value) ? 0 : value;
}

// Global variables
let close = 0;
let open = 0;
let high = 0;
let low = 0;
let volume = 0;
let hlc3 = 0;

// Color constants
const color = {
    blue: 'blue',
    red: 'red',
    green: 'green',
    yellow: 'yellow',
    purple: 'purple',
    orange: 'orange',
    white: 'white',
    black: 'black'
};

// Indicator function
function indicator(options) {
    console.log('Indicator:', options);
    return options;
}

// Plot function
function plot(series, title, options) {
    console.log('Plot:', title, series, options);
    return series;
}


indicator({
    title: 'PCA Risk Indicator',
    shorttitle: 'PCA-RI',
    overlay: false
});
var source = input.source({
    defval: close,
    title: 'Source',
    group: 'General setting'
});
var mtf = input.timeframe({
    defval: '',
    title: 'Timeframe',
    group: 'General setting'
});
var display_input = input.bool(false, {
    title: 'Display raw input indicators ?',
    group: 'Display'
});
var offsetDisplay = input.int({
    defval: -100,
    title: 'Offset raw input indicators',
    group: 'Display'
});
var display_output = input.bool(true, {
    title: 'Display output indicators ?',
    group: 'Display'
});
var ncPCA = input.string('Centered Reduced', {
    title: 'How to display all PCA indicators ?',
    options: [
        'Centered Reduced',
        'Original'
    ],
    group: 'Display'
});
function MaxMinNz(value, max = 100, min = 0, def = 50) {
    return nz(math.max(math.min(value, max), min), def);
}
function isPL(src = close, left = 3, right = 0) {
    return ta.pivotlow(src, left, right);
}
function isPH(src = close, left = 3, right = 0) {
    return ta.pivothigh(src, left, right);
}
function wtMethod(l1, l2, ampl = 0.5, offset = 50) {
    var esa = ta.ema(hlc3, l1);
    var ci = (hlc3 - esa) / (0.015 * ta.ema(math.abs(hlc3 - esa), l1));
    var wt1 = MaxMinNz(ta.ema(ci, l2) * ampl + offset);
    var wt2 = nz(ta.sma(wt1, 3), 50);
    return [
        wt1,
        wt2
    ];
}
function distanceSMA(l, ampl, offset) {
    var sma = ta.sma(source, l);
    return MaxMinNz((source - sma) / sma * ampl + offset);
}
function williamsRangeMethod(length) {
    return (source - ta.lowest(length)) / (ta.highest(length) - ta.lowest(length)) * 100;
}
function momentumMethod(length, ampl = 100, offset = 50) {
    return MaxMinNz((source / source[length] - 1) * ampl + offset);
}
function stochasticRsiMethod(rsi, rsiLength, smoothK, smoothD, offset = 50) {
    var k = ta.sma(ta.stoch(rsi, rsi, rsi, rsiLength), smoothK);
    var d = ta.sma(k, smoothD);
    var kdDelta = MaxMinNz(k - d + offset);
    return [
        k,
        d,
        kdDelta
    ];
}
function rviMethod(lengthStDev, lengthEma) {
    var stddev = ta.stdev(source, lengthStDev);
    var upper = ta.ema(ta.change(source) <= 0 ? 0 : stddev, lengthEma);
    var lower = ta.ema(ta.change(source) > 0 ? 0 : stddev, lengthEma);
    var rvi = upper / (upper + lower) * 100;
}
function double_smoothEMA(src, long, short) {
    return ta.ema(ta.ema(src, long), short);
}
function tsiMethod(long, short, ampl = 60, offset = 50) {
    var dsTSI = double_smoothEMA(ta.change(source), long, short);
    var dsAbsTSI = double_smoothEMA(math.abs(ta.change(source)), long, short);
    var tsi = MaxMinNz(ampl * (dsTSI / dsAbsTSI) + offset);
}
function bbMethod(length, mult) {
    var [middle, upper, lower] = ta.bb(source, length, mult);
    return MaxMinNz((source - lower) / (upper - lower) * 100);
}
function stcMethod(length, fastLength, slowLength) {
    var m = ta.ema(source, fastLength) - ta.ema(source, slowLength);
    var Kstc = nz(fixnan(ta.stoch(m, m, m, length)));
    var Dstc = ta.ema(Kstc, 3);
    var KDstc = nz(fixnan(ta.stoch(Dstc, Dstc, Dstc, 3)));
    var stc = ta.ema(KDstc, 3);
    return stc = math.max(math.min(stc, 100), 0);
}
function aroonMethod(lengthUp, lengthDown) {
    var up = 100 * (ta.highestbars(high, lengthUp + 1) + lengthUp) / lengthUp;
    var down = -100 * (ta.lowestbars(low, lengthDown + 1) + lengthDown) / lengthDown + 100;
    return [
        up,
        down
    ];
}
function haCountMethod(length) {
    var [haclose, haopen] = request.security(ticker.heikinashi(syminfo.tickerid), mtf, [
        close,
        open
    ]);
    var hac = 50;
    if (haclose < haopen) {
        return hac = hac[1] / length;
    } else {
        return hac = hac[1];
    }
}
function cmfMethod(length, ampl = 150, offset = 50) {
    var mfv = math.sum((high == low ? 0 : (close - low - (high - close)) / (high - low)) * volume, length) / math.sum(volume, length);
    return MaxMinNz(mfv * ampl + offset);
}
function TDSMethod(length = 4, maxTD = 13) {
    var TDSUp = 0;
    TDSUp = source > source[length] ? nz(TDSUp[1]) + 1 : 0;
    var TDSDown = 0;
    TDSDown = source < source[length] ? nz(TDSDown[1]) - 1 : 0;
    return [
        MaxMinNz(((TDSUp + TDSDown) / maxTD + 1) * 50),
        TDSUp,
        TDSDown
    ];
}
isInBullDivergence(indicator, {
    price: close,
    length: 100,
    confirm: true,
    confLength: 1
});