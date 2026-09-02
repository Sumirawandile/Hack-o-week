/**
 * NeuroMath Studio - Module 1: Linear Algebra Visualizer
 * Vectors, Dot Product, Matrix Transformations & Eigenvectors
 */

class VectorModule {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // State
        this.u = new NeuroMath.Vector2D(3, 2);
        this.v = new NeuroMath.Vector2D(1, 3);
        this.matrix = new NeuroMath.Matrix2x2(1.5, 0.5, 0.5, 1.2);
        
        // Options
        this.showProjection = true;
        this.showTransformedGrid = true;
        this.showEigenlines = true;
        this.activeMode = 'matrix'; // 'dot' or 'matrix'
        this.dragTarget = null;

        // View settings
        this.gridScale = 40; // 40px per 1 math unit
        
        this.initEventListeners();
        this.resize();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const width = (parent && parent.clientWidth > 0) ? parent.clientWidth : 750;
        const height = Math.max(450, (parent && parent.clientHeight > 0) ? parent.clientHeight : 450);

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

    setMatrix(a, b, c, d) {
        this.matrix = new NeuroMath.Matrix2x2(a, b, c, d);
        this.draw();
        this.updateStats();
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.resize());

        // Dragging vectors on canvas
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseMath = this.toMath(e.clientX - rect.left, e.clientY - rect.top);
            
            const distU = mouseMath.sub(this.u).magnitude();
            const distV = mouseMath.sub(this.v).magnitude();

            if (distU < 0.4) {
                this.dragTarget = 'u';
            } else if (distV < 0.4) {
                this.dragTarget = 'v';
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.dragTarget) return;
            const rect = this.canvas.getBoundingClientRect();
            const mouseMath = this.toMath(e.clientX - rect.left, e.clientY - rect.top);

            // Snap to 0.1 increments
            const snapped = new NeuroMath.Vector2D(
                Math.round(mouseMath.x * 10) / 10,
                Math.round(mouseMath.y * 10) / 10
            );

            if (this.dragTarget === 'u') this.u = snapped;
            if (this.dragTarget === 'v') this.v = snapped;

            this.draw();
            this.updateStats();
        });

        window.addEventListener('mouseup', () => {
            this.dragTarget = null;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw coordinate grid
        this.drawGrid();

        if (this.activeMode === 'matrix' && this.showTransformedGrid) {
            this.drawTransformedGrid();
        }

        // Draw Eigenlines if enabled
        if (this.showEigenlines && this.activeMode === 'matrix') {
            this.drawEigenlines();
        }

        // Mode specific draws
        if (this.activeMode === 'dot') {
            this.drawDotProductVisuals();
        } else {
            this.drawMatrixTransformVisuals();
        }
    }

    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#2d3748';

        // Minor grid lines
        for (let x = this.originX % this.gridScale; x < width; x += this.gridScale) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        for (let y = this.originY % this.gridScale; y < height; y += this.gridScale) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Main Axes X & Y
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.originY);
        this.ctx.lineTo(width, this.originY);
        this.ctx.moveTo(this.originX, 0);
        this.ctx.lineTo(this.originX, height);
        this.ctx.stroke();
    }

    drawTransformedGrid() {
        const range = 8;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';

        for (let i = -range; i <= range; i++) {
            // Constant X lines transformed
            const p1 = this.matrix.transform(new NeuroMath.Vector2D(i, -range));
            const p2 = this.matrix.transform(new NeuroMath.Vector2D(i, range));
            const s1 = this.toScreen(p1);
            const s2 = this.toScreen(p2);

            this.ctx.beginPath();
            this.ctx.moveTo(s1.x, s1.y);
            this.ctx.lineTo(s2.x, s2.y);
            this.ctx.stroke();

            // Constant Y lines transformed
            const q1 = this.matrix.transform(new NeuroMath.Vector2D(-range, i));
            const q2 = this.matrix.transform(new NeuroMath.Vector2D(range, i));
            const t1 = this.toScreen(q1);
            const t2 = this.toScreen(q2);

            this.ctx.beginPath();
            this.ctx.moveTo(t1.x, t1.y);
            this.ctx.lineTo(t2.x, t2.y);
            this.ctx.stroke();
        }

        // Unit Parallelogram (Determinant Area Visualizer)
        const p0 = this.toScreen(new NeuroMath.Vector2D(0, 0));
        const pI = this.toScreen(this.matrix.transform(new NeuroMath.Vector2D(1, 0)));
        const pJ = this.toScreen(this.matrix.transform(new NeuroMath.Vector2D(0, 1)));
        const pIJ = this.toScreen(this.matrix.transform(new NeuroMath.Vector2D(1, 1)));

        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p0.x, p0.y);
        this.ctx.lineTo(pI.x, pI.y);
        this.ctx.lineTo(pIJ.x, pIJ.y);
        this.ctx.lineTo(pJ.x, pJ.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawEigenlines() {
        const eigen = this.matrix.eigen();
        if (!eigen.isReal) return;

        const colors = ['#f43f5e', '#10b981'];

        eigen.vectors.forEach((vec, idx) => {
            if (vec.magnitude() === 0) return;
            const p1 = this.matrix.transform(vec.scale(-10));
            const p2 = this.matrix.transform(vec.scale(10));

            const s1 = this.toScreen(vec.scale(-10));
            const s2 = this.toScreen(vec.scale(10));

            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([6, 4]);
            this.ctx.strokeStyle = colors[idx];
            this.ctx.beginPath();
            this.ctx.moveTo(s1.x, s1.y);
            this.ctx.lineTo(s2.x, s2.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Label Eigenvector line
            const labelPos = this.toScreen(vec.scale(4));
            this.ctx.fillStyle = colors[idx];
            this.ctx.font = 'bold 13px Inter, sans-serif';
            this.ctx.fillText(`v${idx+1} (λ${idx+1}=${eigen.values[idx].toFixed(2)})`, labelPos.x + 8, labelPos.y - 8);
        });
    }

    drawDotProductVisuals() {
        // Draw Vector U (Cyan)
        this.drawArrow(new NeuroMath.Vector2D(0,0), this.u, '#06b6d4', 'u (Input)');
        
        // Draw Vector V (Purple)
        this.drawArrow(new NeuroMath.Vector2D(0,0), this.v, '#a855f7', 'v (Reference)');

        if (this.showProjection) {
            // Projection of U onto V
            const proj = this.u.projectOnto(this.v);
            const sU = this.toScreen(this.u);
            const sProj = this.toScreen(proj);

            // Dotted line from u to projection point
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#eab308';
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(sU.x, sU.y);
            this.ctx.lineTo(sProj.x, sProj.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw Projection Vector (Amber)
            this.drawArrow(new NeuroMath.Vector2D(0,0), proj, '#eab308', 'proj_v(u)');
        }

        // Angle Arc
        const angleU = this.u.angle();
        const angleV = this.v.angle();
        const startAngle = Math.min(angleU, angleV);
        const endAngle = Math.max(angleU, angleV);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.beginPath();
        this.ctx.arc(this.originX, this.originY, 35, -endAngle, -startAngle);
        this.ctx.stroke();
    }

    drawMatrixTransformVisuals() {
        // Draw original input vector u (Cyan)
        this.drawArrow(new NeuroMath.Vector2D(0,0), this.u, '#06b6d4', 'u (Original)');

        // Draw transformed vector A * u (Rose/Red)
        const transformedU = this.matrix.transform(this.u);
        this.drawArrow(new NeuroMath.Vector2D(0,0), transformedU, '#f43f5e', 'A·u (Transformed)');

        // Basis vectors i_hat and j_hat transformed
        const iHatTrans = this.matrix.transform(new NeuroMath.Vector2D(1, 0));
        const jHatTrans = this.matrix.transform(new NeuroMath.Vector2D(0, 1));

        this.drawArrow(new NeuroMath.Vector2D(0,0), iHatTrans, '#10b981', 'T(î)');
        this.drawArrow(new NeuroMath.Vector2D(0,0), jHatTrans, '#3b82f6', 'T(ĵ)');
    }

    drawArrow(fromMath, toMath, color, label) {
        const from = this.toScreen(fromMath);
        const to = this.toScreen(toMath);
        const headlen = 12;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;

        // Line body
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();

        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(to.x, to.y);
        this.ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();

        // Circle handle at target point
        this.ctx.beginPath();
        this.ctx.arc(to.x, to.y, 5, 0, 2 * Math.PI);
        this.ctx.fill();

        // Label
        if (label) {
            this.ctx.font = '600 12px Inter, sans-serif';
            this.ctx.fillText(label, to.x + 8, to.y - 8);
        }
    }

    updateStats() {
        const dotVal = this.u.dot(this.v);
        const magU = this.u.magnitude();
        const magV = this.v.magnitude();
        const angleRad = this.u.angleWith(this.v);
        const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);

        const det = this.matrix.determinant();
        const eigen = this.matrix.eigen();
        const transformedU = this.matrix.transform(this.u);

        // Update DOM elements if available
        const dotElem = document.getElementById('stat-dot');
        const angleElem = document.getElementById('stat-angle');
        const detElem = document.getElementById('stat-det');
        const eigenElem = document.getElementById('stat-eigen');
        const coordsElem = document.getElementById('stat-coords');

        if (dotElem) dotElem.textContent = dotVal.toFixed(2);
        if (angleElem) angleElem.textContent = `${angleDeg}° (${angleRad.toFixed(2)} rad)`;
        if (detElem) detElem.textContent = det.toFixed(2);
        if (coordsElem) coordsElem.textContent = `u=(${this.u.x.toFixed(1)}, ${this.u.y.toFixed(1)}) | A·u=(${transformedU.x.toFixed(1)}, ${transformedU.y.toFixed(1)})`;

        if (eigenElem) {
            if (eigen.isReal) {
                eigenElem.textContent = `λ₁ = ${eigen.values[0].toFixed(2)}, λ₂ = ${eigen.values[1].toFixed(2)}`;
            } else {
                eigenElem.textContent = `Complex (λ = ${eigen.values[0].real.toFixed(2)} ± ${eigen.values[0].imag.toFixed(2)}i)`;
            }
        }
    }
}

window.VectorModule = VectorModule;
