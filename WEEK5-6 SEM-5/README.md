# NeuroMath Studio ⚡

An interactive visual mathematics engine and playground designed for **3rd-year Computer Science & Engineering students** for the **Hack-O-Week (Week 5 & 6)** evaluation.

This project bridges **Linear Algebra** and **Multivariable Calculus** directly to **Neural Network Backpropagation** from first principles—without using any external machine learning or algebra libraries.

---

## 🎯 Syllabus Topic Coverage & Project Mapping

| Topic Requirement | Implementation in NeuroMath Studio |
| :--- | :--- |
| **Linear Algebra: Vectors & Dot Product** | Interactive 2D coordinate grid with drag-and-drop vectors \(\vec{u}\), \(\vec{v}\), real-time dot product \(\vec{u} \cdot \vec{v}\), geometric angle gauge \(\theta\), and vector projection shadow. |
| **Linear Algebra: Matrices & Transformations** | 2x2 matrix transformation engine \(\begin{bmatrix} a & b \\ c & d \end{bmatrix}\) with animated coordinate grid warping, unit square determinant area scaling \(\det(A)\), and singular matrix line-collapse. |
| **Linear Algebra: Eigenvalues & Eigenvectors** | Eigenvalue solver solving \(\det(A - \lambda I) = 0\), featuring real-time invariant eigenvector ray rendering showing vectors that change length (\(\lambda\)) but retain direction (\(A\vec{v} = \lambda\vec{v}\)). |
| **Calculus: Derivatives & Rates of Change** | Activation function derivatives (\(\sigma'(z)\), \(\tanh'(z)\), \(\text{ReLU}'(z)\)) and finite difference numerical derivative calculations. |
| **Calculus: Gradients & Optimization** | 2D/3D surface loss landscapes (Quadratic Bowl, Saddle Point, Rosenbrock, Multi-Peak) with gradient vector field arrows \(\nabla f(x, y)\) and animated Gradient Descent optimizer with learning rate \(\eta\) & momentum \(\gamma\). |
| **Calculus: Chain Rule & Backpropagation** | Visual computation graph debugger showing node-by-node Forward Pass, Backward Pass error propagation (\(\delta\)), explicit chain rule decomposition, weight update steps, and loss convergence tracking. |

---

## 🚀 How to Run Locally

You can launch NeuroMath Studio in any modern web browser without needing heavy build tools or npm dependencies!

### Option 1: Direct File Launch
Simply double click or open `index.html` in Chrome, Edge, Firefox, or Safari.

### Option 2: Local HTTP Server (Recommended)
Using Python or Node.js in the `WEEK5-6 SEM-5` directory:

```bash
# Python 3
python -m http.server 8000

# Node npx serve
npx serve .
```
Then open `http://localhost:8000` in your web browser.

---

## 🎓 Professor Viva & Presentation Guide

When demonstrating this project to your professor, follow this 4-step walkthrough:

1. **Module 1 (Linear Algebra)**:
   - Drag vector \(\vec{u}\) and show how dot product \(\vec{u} \cdot \vec{v}\) turns negative when angle \(\theta > 90^\circ\).
   - Select matrix preset **"Shear X"** or **"Rotation"** to show grid warping.
   - Point out the **dashed Eigenvector lines**: Explain that when a vector lies on an eigenvector line, multiplying by matrix \(A\) only scales its length by eigenvalue \(\lambda\), without changing its direction!

2. **Module 2 (Multivariable Calculus & Gradient Descent)**:
   - Choose the **Saddle Point** or **Rosenbrock Valley** loss surface.
   - Click anywhere on the contour map to drop a starting point \((x_0, y_0)\).
   - Click **Run Descent** and explain how the ball moves along the gradient vector field \(\nabla f = \begin{bmatrix}\frac{\partial f}{\partial x} \\ \frac{\partial f}{\partial y}\end{bmatrix}\) towards the minimum loss.

3. **Module 3 (Neural Network Chain Rule & Backpropagation)**:
   - Show the computation graph: Inputs \(x_1, x_2 \to z \to a \to \text{Loss}\).
   - Click **1. Run Forward Pass**, then **2. Run Backward Pass (Chain Rule)**.
   - Show the explicit formula breakdown at the bottom showing how partial derivatives are multiplied backwards:
     $$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w_1}$$
   - Click **Auto Train** to watch weights adapt and loss drop to near 0!

4. **Presentation Overview**:
   - Explain how all 3 modules link together: Linear Algebra (representation & transformation) \(\to\) Multivariable Calculus (optimization direction) \(\to\) Neural Chain Rule (learning parameters).

---

## 📁 File Architecture

```
WEEK5-6 SEM-5/
├── index.html               # Semantic HTML5 UI layout, navigation tabs, canvas containers
├── style.css                # Modern dark glassmorphism design system & typography
├── js/
│   ├── math_engine.js       # Vector2D, Matrix2x2, EigenSolver, Partial Derivatives from scratch
│   ├── vector_module.js     # Canvas renderer for vectors, matrix transformations, eigenvectors
│   ├── gradient_module.js   # Canvas renderer for surface contour maps, gradient fields, SGD
│   ├── backprop_module.js   # Computation graph node renderer, forward/backward chain rule pass
│   └── main.js              # Application lifecycle & tab event handlers
└── README.md                # Submission & presentation guide
```
