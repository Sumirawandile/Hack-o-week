/**
 * NeuroMath Studio - Module 2: Multivariable Calculus & Gradient Descent Studio
 * Surface Contour Maps, Gradient Vector Fields, and Optimization Simulation
 */

class GradientModule {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // State
        this.currentSurfaceKey = 'bowl';
        this.surface = NeuroMath.Surfaces[this.currentSurfaceKey];
        
        this.startPos = new NeuroMath.Vector2D(2.5, 2.5);
        this.currentPos = new NeuroMath.Vector2D(2.5, 2.5);
        this.velocity = new NeuroMath.Vector2D(0, 0);

        this.learningRate = 0.1;
        this.momentum = 0.5;
        this.history = [];
        this.isRunning = false;
        this.animationFrame = null;
        this.stepCount = 0;

        // View configuration
        this.gridScale = 50; // px per math unit
        this.range = 3.5;    // x and y from -3.5 to 3.5

        this.initEventListeners();
        this.resize();
        this.resetOptimizer();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const width = (parent && parent.clientWidth > 0) ? parent.clientWidth : 750;
        const height = (parent && parent.clientHeight > 0) ? parent.clientHeight : 450;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.originX = this.canvas.width / 2;
        this.originY = this.canvas.height / 2;
        this.draw();
    }

    toScreen(v) {
        return {
            x: this.originX + v.x * this.gridScale,
            y: this.originY - v.y * this.gridScale
        };
    }

    toMath(screenX, screenY) {
        return new NeuroMath.Vector2D(
            (screenX - this.originX) / this.gridScale,
            (this.originY - screenY) / this.gridScale
        );
    }

    setSurface(key) {
        if (!NeuroMath.Surfaces[key]) return;
        this.currentSurfaceKey = key;
        this.surface = NeuroMath.Surfaces[key];
        this.resetOptimizer();
    }

    setParams(lr, mom) {
        this.learningRate = lr;
        this.momentum = mom;
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.resize());

        // Click canvas to place initial position for gradient descent
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickMath = this.toMath(e.clientX - rect.left, e.clientY - rect.top);
            this.startPos = clickMath;
            this.resetOptimizer();
        });
    }

    resetOptimizer() {
        this.stop();
        this.currentPos = this.startPos.clone();
        this.velocity = new NeuroMath.Vector2D(0, 0);
        this.history = [this.currentPos.clone()];
        this.stepCount = 0;
        this.draw();
        this.updateStats();
    }

    step() {
        if (this.stepCount >= 300) {
            this.stop();
            return;
        }

        // Calculate analytical gradient grad = [df/dx, df/dy]
        const grad = this.surface.grad(this.currentPos.x, this.currentPos.y);

        // Gradient descent with momentum: v_new = gamma * v_old + lr * grad; pos_new = pos_old - v_new
        this.velocity = this.velocity.scale(this.momentum).add(grad.scale(this.learningRate));
        this.currentPos = this.currentPos.sub(this.velocity);

        this.history.push(this.currentPos.clone());
        this.stepCount++;

        // Stop if converged (grad magnitude < 1e-4)
        if (grad.magnitude() < 1e-4) {
            this.stop();
        }

        this.draw();
        this.updateStats();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const animate = () => {
            if (!this.isRunning) return;
            this.step();
            this.animationFrame = setTimeout(() => requestAnimationFrame(animate), 50);
        };
        animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) clearTimeout(this.animationFrame);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Contour heatmap lines
        this.drawContourMap();

        // Draw Gradient Vector Field arrows
        this.drawGradientField();

        // Draw Trajectory history path
        this.drawTrajectory();

        // Draw current optimization position point
        this.drawCurrentPoint();
    }

    drawContourMap() {
        const step = 6;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Render color gradient mapping f(x,y)
        const imgData = this.ctx.createImageData(width, height);
        const data = imgData.data;

        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                const mathPt = this.toMath(px, py);
                const z = this.surface.fn(mathPt.x, mathPt.y);

                // Map Z value to color palette
                const normalizedZ = Math.min(1, Math.max(0, Math.log(1 + Math.abs(z)) / 3));
                const r = Math.floor(normalizedZ * 200 + 20);
                const g = Math.floor((1 - normalizedZ) * 120 + 30);
                const b = Math.floor((1 - normalizedZ) * 220 + 50);

                for (let dx = 0; dx < step && px + dx < width; dx++) {
                    for (let dy = 0; dy < step && py + dy < height; dy++) {
                        const idx = ((py + dy) * width + (px + dx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = 160; // Semi-transparent overlay
                    }
                }
            }
        }
        this.ctx.putImageData(imgData, 0, 0);

        // Overlay Coordinate Grid
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.originY);
        this.ctx.lineTo(width, this.originY);
        this.ctx.moveTo(this.originX, 0);
        this.ctx.lineTo(this.originX, height);
        this.ctx.stroke();
    }

    drawGradientField() {
        const gridSpacing = 0.7; // Math units between arrows
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.lineWidth = 1.2;

        for (let x = -this.range; x <= this.range; x += gridSpacing) {
            for (let y = -this.range; y <= this.range; y += gridSpacing) {
                const pt = new NeuroMath.Vector2D(x, y);
                const grad = this.surface.grad(x, y);
                
                if (grad.magnitude() === 0) continue;

                // Steepest descent direction = -grad
                const descentDir = grad.normalize().scale(-0.25);
                const screenFrom = this.toScreen(pt);
                const screenTo = this.toScreen(pt.add(descentDir));

                this.ctx.beginPath();
                this.ctx.moveTo(screenFrom.x, screenFrom.y);
                this.ctx.lineTo(screenTo.x, screenTo.y);
                this.ctx.stroke();
            }
        }
    }

    drawTrajectory() {
        if (this.history.length < 2) return;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#f43f5e';
        this.ctx.beginPath();

        this.history.forEach((pt, i) => {
            const screenPt = this.toScreen(pt);
            if (i === 0) {
                this.ctx.moveTo(screenPt.x, screenPt.y);
            } else {
                this.ctx.lineTo(screenPt.x, screenPt.y);
            }
        });
        this.ctx.stroke();

        // Draw dots at step positions
        this.history.forEach((pt) => {
            const screenPt = this.toScreen(pt);
            this.ctx.fillStyle = '#fda4af';
            this.ctx.beginPath();
            this.ctx.arc(screenPt.x, screenPt.y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    drawCurrentPoint() {
        const screenPt = this.toScreen(this.currentPos);
        const grad = this.surface.grad(this.currentPos.x, this.currentPos.y);

        // Highlight rolling optimizer ball
        this.ctx.fillStyle = '#eab308';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPt.x, screenPt.y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        // Current Gradient Vector Arrow (-∇f)
        const descentDir = grad.normalize().scale(-0.8);
        const arrowTo = this.toScreen(this.currentPos.add(descentDir));

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.beginPath();
        this.ctx.moveTo(screenPt.x, screenPt.y);
        this.ctx.lineTo(arrowTo.x, arrowTo.y);
        this.ctx.stroke();
    }

    updateStats() {
        const z = this.surface.fn(this.currentPos.x, this.currentPos.y);
        const grad = this.surface.grad(this.currentPos.x, this.currentPos.y);
        const gradMag = grad.magnitude();

        const stepElem = document.getElementById('grad-step');
        const posElem = document.getElementById('grad-pos');
        const lossElem = document.getElementById('grad-loss');
        const magElem = document.getElementById('grad-mag');

        if (stepElem) stepElem.textContent = this.stepCount;
        if (posElem) posElem.textContent = `(${this.currentPos.x.toFixed(3)}, ${this.currentPos.y.toFixed(3)})`;
        if (lossElem) lossElem.textContent = z.toFixed(4);
        if (magElem) magElem.textContent = gradMag.toFixed(4);
    }
}

window.GradientModule = GradientModule;
