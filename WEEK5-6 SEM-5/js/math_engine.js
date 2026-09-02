/**
 * NeuroMath Studio - Core Mathematical Engine
 * Built from First Principles (Vanilla JavaScript)
 * 
 * Includes:
 * 1. Vector2D (algebra, dot product, projection, angle)
 * 2. Matrix2x2 (multiplication, determinant, inverse, eigenvalues/eigenvectors)
 * 3. Calculus Engine (numerical gradients, loss functions, activation derivatives)
 * 4. Computational Node Engine (chain rule & backpropagation calculus)
 */

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    scale(s) {
        return new Vector2D(this.x * s, this.y * s);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    magnitude() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / mag, this.y / mag);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    angleWith(v) {
        const magProduct = this.magnitude() * v.magnitude();
        if (magProduct === 0) return 0;
        const cosTheta = Math.min(1, Math.max(-1, this.dot(v) / magProduct));
        return Math.acos(cosTheta);
    }

    projectOnto(v) {
        const vMagSq = v.dot(v);
        if (vMagSq === 0) return new Vector2D(0, 0);
        const scalar = this.dot(v) / vMagSq;
        return v.scale(scalar);
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }
}

class Matrix2x2 {
    // [[a, b], [c, d]]
    constructor(a = 1, b = 0, c = 0, d = 1) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    transform(v) {
        return new Vector2D(
            this.a * v.x + this.b * v.y,
            this.c * v.x + this.d * v.y
        );
    }

    multiply(m) {
        return new Matrix2x2(
            this.a * m.a + this.b * m.c,
            this.a * m.b + this.b * m.d,
            this.c * m.a + this.d * m.c,
            this.c * m.b + this.d * m.d
        );
    }

    determinant() {
        return this.a * this.d - this.b * this.c;
    }

    trace() {
        return this.a + this.d;
    }

    inverse() {
        const det = this.determinant();
        if (Math.abs(det) < 1e-10) return null;
        return new Matrix2x2(
            this.d / det,
            -this.b / det,
            -this.c / det,
            this.a / det
        );
    }

    /**
     * Solves characteristic equation det(A - lambda * I) = 0
     * lambda^2 - tr(A)*lambda + det(A) = 0
     */
    eigen() {
        const tr = this.trace();
        const det = this.determinant();
        const discriminant = tr * tr - 4 * det;

        if (discriminant < -1e-9) {
            // Complex eigenvalues (rotation dominant)
            return {
                isReal: false,
                values: [
                    { real: tr / 2, imag: Math.sqrt(-discriminant) / 2 },
                    { real: tr / 2, imag: -Math.sqrt(-discriminant) / 2 }
                ],
                vectors: []
            };
        }

        const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
        const l1 = (tr + sqrtDisc) / 2;
        const l2 = (tr - sqrtDisc) / 2;

        const getEigenVector = (lambda) => {
            // (A - lambda*I) * v = 0 => [[a-lambda, b], [c, d-lambda]] * [x, y]^T = 0
            const a1 = this.a - lambda;
            const b1 = this.b;
            const c1 = this.c;
            const d1 = this.d - lambda;

            let v;
            if (Math.abs(b1) > 1e-6) {
                v = new Vector2D(-b1, a1);
            } else if (Math.abs(c1) > 1e-6) {
                v = new Vector2D(d1, -c1);
            } else if (Math.abs(a1) < 1e-6 && Math.abs(d1) < 1e-6) {
                // Identity-like matrix
                v = new Vector2D(1, 0);
            } else if (Math.abs(a1) < 1e-6) {
                v = new Vector2D(1, 0);
            } else {
                v = new Vector2D(0, 1);
            }
            return v.normalize();
        };

        const v1 = getEigenVector(l1);
        let v2 = getEigenVector(l2);

        // If l1 == l2 and vectors align, pick orthogonal candidate
        if (Math.abs(l1 - l2) < 1e-6 && Math.abs(Math.abs(v1.dot(v2)) - 1) < 1e-3) {
            v2 = new Vector2D(-v1.y, v1.x);
        }

        return {
            isReal: true,
            values: [l1, l2],
            vectors: [v1, v2]
        };
    }
}

/**
 * Calculus & Loss Surface Engines
 */
const Surfaces = {
    bowl: {
        name: "Quadratic Bowl f(x,y) = 0.5(x² + y²)",
        fn: (x, y) => 0.5 * (x * x + y * y),
        grad: (x, y) => new Vector2D(x, y)
    },
    saddle: {
        name: "Saddle Point f(x,y) = 0.5(x² - y²)",
        fn: (x, y) => 0.5 * (x * x - y * y),
        grad: (x, y) => new Vector2D(x, -y)
    },
    rosenbrock: {
        name: "Valley / Rosenbrock f(x,y) = (1-x)² + 10(y-x²)²",
        fn: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2,
        grad: (x, y) => new Vector2D(
            -2 * (1 - x) - 40 * x * (y - x * x),
            20 * (y - x * x)
        )
    },
    multiPeak: {
        name: "Multi-Local Minima f(x,y) = sin(2x)cos(2y) + 0.1(x² + y²)",
        fn: (x, y) => Math.sin(2 * x) * Math.cos(2 * y) + 0.1 * (x * x + y * y),
        grad: (x, y) => new Vector2D(
            2 * Math.cos(2 * x) * Math.cos(2 * y) + 0.2 * x,
            -2 * Math.sin(2 * x) * Math.sin(2 * y) + 0.2 * y
        )
    }
};

/**
 * Activation Functions & Derivatives
 */
const Activations = {
    sigmoid: {
        name: "Sigmoid σ(z) = 1 / (1 + e⁻ᶻ)",
        fn: (z) => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z)))),
        derivative: (z) => {
            const s = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
            return s * (1 - s);
        }
    },
    relu: {
        name: "ReLU max(0, z)",
        fn: (z) => Math.max(0, z),
        derivative: (z) => (z > 0 ? 1 : 0)
    },
    tanh: {
        name: "Tanh tanh(z)",
        fn: (z) => Math.tanh(z),
        derivative: (z) => 1 - Math.tanh(z) ** 2
    },
    linear: {
        name: "Linear (Identity) z",
        fn: (z) => z,
        derivative: (z) => 1
    }
};

/**
 * Numerical Finite Differences Gradient Estimation
 */
function computeNumericalGradient(fn, x, y, h = 1e-4) {
    const dfdx = (fn(x + h, y) - fn(x - h, y)) / (2 * h);
    const dfdy = (fn(x, y + h) - fn(x, y - h)) / (2 * h);
    return new Vector2D(dfdx, dfdy);
}

// Global math engine export
window.NeuroMath = {
    Vector2D,
    Matrix2x2,
    Surfaces,
    Activations,
    computeNumericalGradient
};
