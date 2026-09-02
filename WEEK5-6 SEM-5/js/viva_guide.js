/**
 * NeuroMath Studio - Module 4: Professor Viva & Defense Guide
 * Interactive Math Proofs, Viva Questions & Step-by-Step Defense Scripts
 */

const VivaData = {
    topics: [
        {
            title: "1. Linear Algebra: Vectors & Dot Product",
            math: "u · v = ||u|| ||v|| cos(θ) = u₁v₁ + u₂v₂",
            intuition: "The dot product measures how much two vectors point in the same direction. It is the length of vector u projected onto vector v, scaled by the length of v.",
            vivaQ: "Why is the dot product so fundamental in machine learning?",
            vivaA: "In ML, high-dimensional data (e.g. word embeddings or feature vectors) are compared using cosine similarity, which is simply the normalized dot product. Furthermore, every linear layer neuron computes a dot product z = w · x + b between weight vector w and input vector x."
        },
        {
            title: "2. Matrices & Linear Transformations",
            math: "T(v) = A · v,  det(A) = ad - bc",
            intuition: "A 2x2 matrix isn't just a grid of numbers; it's a dynamic function that stretches, rotates, or shears the entire coordinate space. The determinant det(A) represents how much area changes under transformation.",
            vivaQ: "What does a zero determinant (det(A) = 0) mean geometrically?",
            vivaA: "A zero determinant means the transformation collapses 2D space onto a 1D line or a 0D point. Information is permanently lost because the matrix is non-invertible (singular)."
        },
        {
            title: "3. Eigenvalues & Eigenvectors",
            math: "A · v = λ · v  =>  det(A - λI) = 0",
            intuition: "When a matrix transforms space, most vectors get knocked off their line. Eigenvectors are the special invariant directions that DO NOT rotate—they only scale in length by the factor λ (eigenvalue).",
            vivaQ: "How are Eigenvalues used in 3rd-year topics like PCA?",
            vivaA: "In Principal Component Analysis (PCA), we compute the eigenvectors of the covariance matrix. The eigenvector corresponding to the largest eigenvalue gives the direction of maximum variance in the dataset, allowing us to drop less important dimensions."
        },
        {
            title: "4. Derivatives & Gradient Vectors",
            math: "∇f(x, y) = [ ∂f/∂x, ∂f/∂y ]ᵀ",
            intuition: "The gradient vector ∇f points in the direction of steepest increase of a multivariable loss surface f(x, y). Its magnitude ||∇f|| tells us how steep the slope is.",
            vivaQ: "Why do we subtract the gradient in Gradient Descent (w_new = w - η ∇f)?",
            vivaA: "Because ∇f points uphill (steepest ascent). To minimize loss and find the valley, we move in the opposite direction (-∇f), scaled by learning rate η."
        },
        {
            title: "5. Chain Rule & Backpropagation",
            math: "∂L/∂w₁ = (∂L/∂a) · (∂a/∂z) · (∂z/∂w₁)",
            intuition: "Backpropagation is just the multivariable calculus chain rule applied systematically to a computation graph. We calculate local derivatives at each node during forward pass, and multiply them backwards.",
            vivaQ: "What is the computational benefit of Backpropagation over calculating derivatives manually?",
            vivaA: "Backprop uses dynamic programming to cache intermediate node derivatives (error delta δ). Instead of recomputing derivatives from scratch for every weight (O(W²)), backprop calculates gradients for all weights in a single backward pass in O(W) linear time."
        }
    ]
};

class VivaGuideModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        if (!this.container) return;

        let html = `
            <div class="viva-dashboard">
                <div class="viva-header">
                    <h2>🎓 Professor Viva & Defense Masterclass</h2>
                    <p>Use these structured mathematical explanations and defense questions to present your Hack-O-Week project confidently.</p>
                </div>
                <div class="viva-cards-grid">
        `;

        VivaData.topics.forEach((topic, idx) => {
            html += `
                <div class="viva-card">
                    <div class="viva-card-header">
                        <h3>${topic.title}</h3>
                        <span class="math-badge">${topic.math}</span>
                    </div>
                    <div class="viva-card-body">
                        <p><strong>Intuition:</strong> ${topic.intuition}</p>
                        <div class="viva-qa">
                            <button class="toggle-qa-btn" onclick="VivaGuideModule.toggleQA(${idx})">
                                💬 Sample Viva Question & Answer
                            </button>
                            <div class="qa-content" id="qa-${idx}" style="display: none;">
                                <p class="viva-q"><strong>Q:</strong> ${topic.vivaQ}</p>
                                <p class="viva-a"><strong>A:</strong> ${topic.vivaA}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    static toggleQA(idx) {
        const el = document.getElementById(`qa-${idx}`);
        if (el) {
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
        }
    }
}

window.VivaGuideModule = VivaGuideModule;
