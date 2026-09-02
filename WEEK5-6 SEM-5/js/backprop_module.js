/**
 * NeuroMath Studio - Module 3: Visual Chain Rule & Neural Backpropagation Engine
 * Step-by-step Computational Graph Debugger & Training Simulator
 */

class BackpropModule {
    constructor(canvasId, lossChartId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.lossCanvas = document.getElementById(lossChartId);
        this.lossCtx = this.lossCanvas ? this.lossCanvas.getContext('2d') : null;

        // Neural Network Parameters
        this.x1 = 1.0;
        this.x2 = -0.5;
        this.w1 = 0.8;
        this.w2 = -0.4;
        this.b = 0.2;
        this.targetY = 1.0;
        this.learningRate = 0.5;
        this.activationKey = 'sigmoid';

        // Computation Graph State
        this.forwardComputed = false;
        this.backwardComputed = false;
        this.activePhase = 'idle'; // 'forward', 'backward', 'updated'
        
        // Intermediate Math Variables
        this.z = 0;
        this.a = 0;
        this.loss = 0;
        
        // Derivatives
        this.dL_da = 0;
        this.da_dz = 0;
        this.dL_dz = 0; // Delta
        this.dL_dw1 = 0;
        this.dL_dw2 = 0;
        this.dL_db = 0;

        this.lossHistory = [];

        this.initEventListeners();
        this.resize();
        this.runForwardPass();
    }

    resize() {
        if (this.canvas) {
            const parent = this.canvas.parentElement;
            const width = (parent && parent.clientWidth > 0) ? parent.clientWidth : 750;
            this.canvas.width = width;
            this.canvas.height = Math.max(380, (parent && parent.clientHeight > 0) ? parent.clientHeight : 380);
        }
        if (this.lossCanvas) {
            const parent = this.lossCanvas.parentElement;
            const width = (parent && parent.clientWidth > 0) ? parent.clientWidth : 750;
            this.lossCanvas.width = width;
            this.lossCanvas.height = 160;
        }
        this.drawGraph();
        this.drawLossChart();
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }

    setParams(x1, x2, targetY, w1, w2, b, lr, actKey) {
        this.x1 = x1;
        this.x2 = x2;
        this.targetY = targetY;
        this.w1 = w1;
        this.w2 = w2;
        this.b = b;
        this.learningRate = lr;
        if (actKey) this.activationKey = actKey;

        this.runForwardPass();
    }

    runForwardPass() {
        const act = NeuroMath.Activations[this.activationKey];

        // 1. Linear combination: z = w1*x1 + w2*x2 + b
        this.z = this.w1 * this.x1 + this.w2 * this.x2 + this.b;

        // 2. Activation: a = act(z)
        this.a = act.fn(this.z);

        // 3. Loss (MSE): L = 0.5 * (y - a)^2
        this.loss = 0.5 * (this.targetY - this.a) ** 2;

        this.forwardComputed = true;
        this.backwardComputed = false;
        this.activePhase = 'forward';

        this.drawGraph();
        this.updateDOM();
    }

    runBackwardPass() {
        if (!this.forwardComputed) this.runForwardPass();

        const act = NeuroMath.Activations[this.activationKey];

        // Chain Rule Steps:
        // Step 1: dL/da = -(y - a) = (a - y)
        this.dL_da = this.a - this.targetY;

        // Step 2: da/dz = activation derivative
        this.da_dz = act.derivative(this.z);

        // Step 3: Delta (dL/dz) = dL/da * da/dz
        this.dL_dz = this.dL_da * this.da_dz;

        // Step 4: Parameter Gradients
        // dL/dw1 = dL/dz * dz/dw1 = dL/dz * x1
        this.dL_dw1 = this.dL_dz * this.x1;
        // dL/dw2 = dL/dz * dz/dw2 = dL/dz * x2
        this.dL_dw2 = this.dL_dz * this.x2;
        // dL/db = dL/dz * dz/db = dL/dz * 1
        this.dL_db = this.dL_dz * 1.0;

        this.backwardComputed = true;
        this.activePhase = 'backward';

        this.drawGraph();
        this.updateDOM();
    }

    updateWeights() {
        if (!this.backwardComputed) this.runBackwardPass();

        // Gradient Descent Step: w = w - lr * dL/dw
        this.w1 -= this.learningRate * this.dL_dw1;
        this.w2 -= this.learningRate * this.dL_dw2;
        this.b -= this.learningRate * this.dL_db;

        this.lossHistory.push(this.loss);
        if (this.lossHistory.length > 50) this.lossHistory.shift();

        this.activePhase = 'updated';
        this.runForwardPass();
        this.drawLossChart();
    }

    autoTrain(epochs = 20) {
        for (let i = 0; i < epochs; i++) {
            this.runForwardPass();
            this.runBackwardPass();
            this.updateWeights();
        }
    }

    drawGraph() {
        if (!this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Node Layout Coordinates
        const nodes = {
            x1: { x: w * 0.12, y: h * 0.25, label: `x₁ = ${this.x1.toFixed(2)}`, type: 'input' },
            x2: { x: w * 0.12, y: h * 0.75, label: `x₂ = ${this.x2.toFixed(2)}`, type: 'input' },
            z:  { x: w * 0.40, y: h * 0.50, label: `z = ${this.z.toFixed(3)}`, type: 'sum' },
            a:  { x: w * 0.65, y: h * 0.50, label: `a = ${this.a.toFixed(3)}`, type: 'act' },
            L:  { x: w * 0.88, y: h * 0.50, label: `Loss = ${this.loss.toFixed(4)}`, type: 'loss' }
        };

        // Draw Connections & Weights
        this.drawConnection(ctx, nodes.x1, nodes.z, `w₁ = ${this.w1.toFixed(3)}`, this.dL_dw1, '#38bdf8');
        this.drawConnection(ctx, nodes.x2, nodes.z, `w₂ = ${this.w2.toFixed(3)}`, this.dL_dw2, '#38bdf8');
        this.drawConnection(ctx, nodes.z, nodes.a, `σ(z)`, this.da_dz, '#a855f7');
        this.drawConnection(ctx, nodes.a, nodes.L, `L(a,y)`, this.dL_da, '#f43f5e');

        // Draw Bias indicator
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`Bias b = ${this.b.toFixed(3)} (dL/db = ${this.dL_db.toFixed(3)})`, nodes.z.x - 45, nodes.z.y + 55);

        // Draw Nodes
        Object.keys(nodes).forEach(key => {
            const node = nodes[key];
            let color = '#334155';
            let strokeColor = '#64748b';

            if (this.activePhase === 'forward') {
                strokeColor = '#10b981';
            } else if (this.activePhase === 'backward') {
                strokeColor = '#f43f5e';
            }

            ctx.fillStyle = color;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(node.x, node.y, 35, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Label text inside node
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y);
        });

        // Reset alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    drawConnection(ctx, from, to, weightLabel, gradValue, color) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.moveTo(from.x + 35, from.y);
        ctx.lineTo(to.x - 35, to.y);
        ctx.stroke();

        // Weight / Forward Label
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '500 11px Fira Code, monospace';
        ctx.fillText(weightLabel, midX - 20, midY - 10);

        // Gradient Derivative Label (Backward Pass)
        if (this.backwardComputed) {
            ctx.fillStyle = '#fb7185';
            ctx.font = 'bold 11px Fira Code, monospace';
            ctx.fillText(`∂L/∂ = ${gradValue.toFixed(3)}`, midX - 25, midY + 18);
        }
    }

    drawLossChart() {
        if (!this.lossCtx) return;
        const ctx = this.lossCtx;
        const w = this.lossCanvas.width;
        const h = this.lossCanvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);

        if (this.lossHistory.length < 2) {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText('Loss Convergence History (Click Train / Auto Train)', 15, h / 2);
            return;
        }

        const maxLoss = Math.max(0.5, ...this.lossHistory);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.lossHistory.forEach((loss, i) => {
            const x = (i / (this.lossHistory.length - 1)) * (w - 30) + 15;
            const y = h - 15 - (loss / maxLoss) * (h - 30);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    }

    updateDOM() {
        const formulaElem = document.getElementById('chain-formula-breakdown');
        if (formulaElem) {
            formulaElem.innerHTML = `
                <div class="formula-card">
                    <span class="step-title">Forward Pass:</span>
                    <code>z = (${this.w1.toFixed(2)} × ${this.x1.toFixed(2)}) + (${this.w2.toFixed(2)} × ${this.x2.toFixed(2)}) + ${this.b.toFixed(2)} = <strong>${this.z.toFixed(4)}</strong></code><br/>
                    <code>a = ${this.activationKey}(${this.z.toFixed(4)}) = <strong>${this.a.toFixed(4)}</strong></code><br/>
                    <code>Loss = ½(${this.targetY.toFixed(2)} - ${this.a.toFixed(4)})² = <strong>${this.loss.toFixed(6)}</strong></code>
                </div>
                <div class="formula-card">
                    <span class="step-title">Backward Chain Rule Pass:</span>
                    <code>∂L/∂a = (a - y) = ${this.dL_da.toFixed(4)}</code><br/>
                    <code>∂a/∂z = σ'(z) = ${this.da_dz.toFixed(4)}</code><br/>
                    <code>δ = ∂L/∂z = (∂L/∂a) × (∂a/∂z) = <strong>${this.dL_dz.toFixed(4)}</strong></code><br/>
                    <code>∂L/∂w₁ = δ × x₁ = ${this.dL_dw1.toFixed(4)} | ∂L/∂w₂ = δ × x₂ = ${this.dL_dw2.toFixed(4)}</code>
                </div>
            `;
        }
    }
}

window.BackpropModule = BackpropModule;
