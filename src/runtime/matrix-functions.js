/**
 * Runtime library for PineScript matrix operations
 * This file provides JavaScript implementations of matrix operations needed for PCA calculations
 */

// Create a matrix (2D array)
function matrix_new(rows, cols, initialValue = 0) {
    return Array(rows).fill().map(() => Array(cols).fill(initialValue));
}

// Get the number of rows in a matrix
function matrix_rows(matrix) {
    return matrix.length;
}

// Get the number of columns in a matrix
function matrix_cols(matrix) {
    if (matrix.length === 0) return 0;
    return matrix[0].length;
}

// Get a value from a matrix
function matrix_get(matrix, row, col) {
    if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
        return null;
    }
    return matrix[row][col];
}

// Set a value in a matrix
function matrix_set(matrix, row, col, value) {
    if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
        return matrix;
    }
    matrix[row][col] = value;
    return matrix;
}

// Matrix transpose
function matrix_transpose(matrix) {
    if (matrix.length === 0) return [];
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = matrix_new(cols, rows);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    
    return result;
}

// Matrix multiplication
function matrix_multiply(matrixA, matrixB) {
    if (matrixA.length === 0 || matrixB.length === 0) return [];
    
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;
    
    if (colsA !== rowsB) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }
    
    const result = matrix_new(rowsA, colsB);
    
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = sum;
        }
    }
    
    return result;
}

// Calculate the covariance matrix
function matrix_covariance(matrix) {
    if (matrix.length === 0) return [];
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = matrix_new(cols, cols);
    
    // Calculate means for each column
    const means = Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows; i++) {
            means[j] += matrix[i][j];
        }
        means[j] /= rows;
    }
    
    // Calculate covariance matrix
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
            let sum = 0;
            for (let k = 0; k < rows; k++) {
                sum += (matrix[k][i] - means[i]) * (matrix[k][j] - means[j]);
            }
            result[i][j] = sum / (rows - 1);
        }
    }
    
    return result;
}

// Calculate eigenvalues and eigenvectors using the power iteration method
function matrix_eigen(matrix, iterations = 100) {
    if (matrix.length === 0) return { eigenvalues: [], eigenvectors: [] };
    
    const n = matrix.length;
    const eigenvalues = [];
    const eigenvectors = [];
    
    // Make a copy of the matrix to work with
    let A = JSON.parse(JSON.stringify(matrix));
    
    for (let k = 0; k < n; k++) {
        // Initialize a random vector
        let v = Array(n).fill(0).map(() => Math.random());
        
        // Normalize the vector
        const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        v = v.map(val => val / norm);
        
        // Power iteration
        for (let i = 0; i < iterations; i++) {
            // Multiply matrix by vector
            const Av = Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    Av[i] += A[i][j] * v[j];
                }
            }
            
            // Find the largest value for normalization
            const maxVal = Math.max(...Av.map(Math.abs));
            
            // Normalize the vector
            v = Av.map(val => val / maxVal);
            
            // Compute the Rayleigh quotient (eigenvalue)
            let rayleigh = 0;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    rayleigh += v[i] * A[i][j] * v[j];
                }
            }
            
            // Normalize the eigenvector
            const vnorm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
            v = v.map(val => val / vnorm);
        }
        
        // Compute the eigenvalue using the Rayleigh quotient
        let eigenvalue = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                eigenvalue += v[i] * A[i][j] * v[j];
            }
        }
        
        // Store the eigenvalue and eigenvector
        eigenvalues.push(eigenvalue);
        eigenvectors.push(v);
        
        // Deflate the matrix to find the next eigenvalue/eigenvector
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                A[i][j] -= eigenvalue * v[i] * v[j];
            }
        }
    }
    
    return { eigenvalues, eigenvectors };
}

// Principal Component Analysis (PCA)
function matrix_pca(data, components = null) {
    if (data.length === 0) return { transformed: [], components: [], explained_variance: [] };
    
    const rows = data.length;
    const cols = data[0].length;
    
    // Center the data (subtract mean from each column)
    const means = Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows; i++) {
            means[j] += data[i][j];
        }
        means[j] /= rows;
    }
    
    const centered = matrix_new(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            centered[i][j] = data[i][j] - means[j];
        }
    }
    
    // Calculate the covariance matrix
    const covariance = matrix_covariance(centered);
    
    // Calculate eigenvalues and eigenvectors
    const { eigenvalues, eigenvectors } = matrix_eigen(covariance);
    
    // Sort eigenvalues and eigenvectors in descending order
    const indices = eigenvalues.map((val, idx) => ({ val, idx }))
        .sort((a, b) => b.val - a.val)
        .map(item => item.idx);
    
    const sortedEigenvalues = indices.map(idx => eigenvalues[idx]);
    const sortedEigenvectors = indices.map(idx => eigenvectors[idx]);
    
    // Determine the number of components to keep
    const numComponents = components || cols;
    
    // Calculate the explained variance ratio
    const totalVariance = sortedEigenvalues.reduce((sum, val) => sum + val, 0);
    const explainedVariance = sortedEigenvalues.slice(0, numComponents)
        .map(val => val / totalVariance);
    
    // Select the top eigenvectors
    const selectedComponents = sortedEigenvectors.slice(0, numComponents);
    
    // Project the data onto the principal components
    const transformed = matrix_new(rows, numComponents);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < numComponents; j++) {
            let sum = 0;
            for (let k = 0; k < cols; k++) {
                sum += centered[i][k] * selectedComponents[j][k];
            }
            transformed[i][j] = sum;
        }
    }
    
    return {
        transformed,
        components: selectedComponents,
        explained_variance: explainedVariance
    };
}

// Export all functions
module.exports = {
    matrix_new,
    matrix_rows,
    matrix_cols,
    matrix_get,
    matrix_set,
    matrix_transpose,
    matrix_multiply,
    matrix_covariance,
    matrix_eigen,
    matrix_pca
};
