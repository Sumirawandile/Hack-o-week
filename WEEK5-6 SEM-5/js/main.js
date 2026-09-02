/**
 * NeuroMath Studio - Main Application Controller
 * Handles tab switching, event listeners, state coordination
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) targetContent.classList.add('active');

            // Trigger canvas resize & redrafts on active tab after DOM reflow
            requestAnimationFrame(() => {
                if (targetTab === 'tab-vector' && window.vectorApp) {
                    window.vectorApp.resize();
                } else if (targetTab === 'tab-gradient' && window.gradientApp) {
                    window.gradientApp.resize();
                } else if (targetTab === 'tab-backprop' && window.backpropApp) {
                    window.backpropApp.resize();
                }
            });
        });
    });

    // 2. Initialize Module 1: Vector & Matrix Transformation Space
    const vectorApp = new VectorModule('vector-canvas');
    window.vectorApp = vectorApp;

    // Vector Mode Switch
    const vecModeSelect = document.getElementById('vector-mode-select');
    if (vecModeSelect) {
        vecModeSelect.addEventListener('change', (e) => {
            vectorApp.activeMode = e.target.value;
            vectorApp.draw();
        });
    }

    // Matrix inputs (a, b, c, d)
    const matA = document.getElementById('mat-a');
    const matB = document.getElementById('mat-b');
    const matC = document.getElementById('mat-c');
    const matD = document.getElementById('mat-d');

    const updateMatrixFromInputs = () => {
        vectorApp.setMatrix(
            parseFloat(matA.value) || 0,
            parseFloat(matB.value) || 0,
            parseFloat(matC.value) || 0,
            parseFloat(matD.value) || 0
        );
    };

    [matA, matB, matC, matD].forEach(input => {
        if (input) input.addEventListener('input', updateMatrixFromInputs);
    });

    // Presets Select
    const presetSelect = document.getElementById('matrix-preset-select');
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            const preset = e.target.value;
            switch(preset) {
                case 'identity':
                    matA.value = 1; matB.value = 0; matC.value = 0; matD.value = 1;
                    break;
                case 'scale':
                    matA.value = 2; matB.value = 0; matC.value = 0; matD.value = 2;
                    break;
                case 'rot45':
                    matA.value = 0.71; matB.value = -0.71; matC.value = 0.71; matD.value = 0.71;
                    break;
                case 'shearX':
                    matA.value = 1; matB.value = 1.2; matC.value = 0; matD.value = 1;
                    break;
                case 'shearY':
                    matA.value = 1; matB.value = 0; matC.value = 0.8; matD.value = 1;
                    break;
                case 'singular':
                    matA.value = 1; matB.value = 2; matC.value = 0.5; matD.value = 1;
                    break;
                case 'reflection':
                    matA.value = 1; matB.value = 0; matC.value = 0; matD.value = -1;
                    break;
            }
            if (preset !== 'custom') updateMatrixFromInputs();
        });
    }

    // Checkboxes
    const chkGrid = document.getElementById('chk-grid');
    const chkEigen = document.getElementById('chk-eigen');
    const chkProj = document.getElementById('chk-proj');

    if (chkGrid) chkGrid.addEventListener('change', (e) => { vectorApp.showTransformedGrid = e.target.checked; vectorApp.draw(); });
    if (chkEigen) chkEigen.addEventListener('change', (e) => { vectorApp.showEigenlines = e.target.checked; vectorApp.draw(); });
    if (chkProj) chkProj.addEventListener('change', (e) => { vectorApp.showProjection = e.target.checked; vectorApp.draw(); });


    // 3. Initialize Module 2: Gradient Descent Studio
    const gradientApp = new GradientModule('gradient-canvas');
    window.gradientApp = gradientApp;

    const surfaceSelect = document.getElementById('surface-select');
    if (surfaceSelect) {
        surfaceSelect.addEventListener('change', (e) => {
            gradientApp.setSurface(e.target.value);
        });
    }

    const sliderLR = document.getElementById('slider-lr');
    const valLR = document.getElementById('val-lr');
    const sliderMom = document.getElementById('slider-mom');
    const valMom = document.getElementById('val-mom');

    const updateGradParams = () => {
        const lr = parseFloat(sliderLR.value);
        const mom = parseFloat(sliderMom.value);
        if (valLR) valLR.textContent = lr.toFixed(2);
        if (valMom) valMom.textContent = mom.toFixed(2);
        gradientApp.setParams(lr, mom);
    };

    if (sliderLR) sliderLR.addEventListener('input', updateGradParams);
    if (sliderMom) sliderMom.addEventListener('input', updateGradParams);

    const btnGradStart = document.getElementById('btn-grad-start');
    const btnGradStep = document.getElementById('btn-grad-step');
    const btnGradReset = document.getElementById('btn-grad-reset');

    if (btnGradStart) {
        btnGradStart.addEventListener('click', () => {
            if (gradientApp.isRunning) {
                gradientApp.stop();
                btnGradStart.textContent = '▶ Run Descent';
            } else {
                gradientApp.start();
                btnGradStart.textContent = '⏸ Pause';
            }
        });
    }
    if (btnGradStep) btnGradStep.addEventListener('click', () => gradientApp.step());
    if (btnGradReset) {
        btnGradReset.addEventListener('click', () => {
            gradientApp.resetOptimizer();
            if (btnGradStart) btnGradStart.textContent = '▶ Run Descent';
        });
    }


    // 4. Initialize Module 3: Neural Backpropagation Engine
    const backpropApp = new BackpropModule('backprop-canvas', 'loss-chart-canvas');
    window.backpropApp = backpropApp;

    const sliderX1 = document.getElementById('slider-x1');
    const sliderX2 = document.getElementById('slider-x2');
    const sliderTarget = document.getElementById('slider-target');
    const sliderBackpropLR = document.getElementById('slider-backprop-lr');
    const backpropActSelect = document.getElementById('backprop-act-select');

    const valX1 = document.getElementById('val-x1');
    const valX2 = document.getElementById('val-x2');
    const valTarget = document.getElementById('val-target');
    const valBackpropLR = document.getElementById('val-backprop-lr');

    const updateBackpropParams = () => {
        const x1 = parseFloat(sliderX1.value);
        const x2 = parseFloat(sliderX2.value);
        const target = parseFloat(sliderTarget.value);
        const lr = parseFloat(sliderBackpropLR.value);
        const actKey = backpropActSelect.value;

        if (valX1) valX1.textContent = x1.toFixed(2);
        if (valX2) valX2.textContent = x2.toFixed(2);
        if (valTarget) valTarget.textContent = target.toFixed(2);
        if (valBackpropLR) valBackpropLR.textContent = lr.toFixed(2);

        backpropApp.setParams(x1, x2, target, backpropApp.w1, backpropApp.w2, backpropApp.b, lr, actKey);
    };

    [sliderX1, sliderX2, sliderTarget, sliderBackpropLR].forEach(s => {
        if (s) s.addEventListener('input', updateBackpropParams);
    });
    if (backpropActSelect) backpropActSelect.addEventListener('change', updateBackpropParams);

    const btnForward = document.getElementById('btn-forward');
    const btnBackward = document.getElementById('btn-backward');
    const btnUpdate = document.getElementById('btn-update');
    const btnAutoTrain = document.getElementById('btn-autotrain');

    if (btnForward) btnForward.addEventListener('click', () => backpropApp.runForwardPass());
    if (btnBackward) btnBackward.addEventListener('click', () => backpropApp.runBackwardPass());
    if (btnUpdate) btnUpdate.addEventListener('click', () => backpropApp.updateWeights());
    if (btnAutoTrain) btnAutoTrain.addEventListener('click', () => backpropApp.autoTrain(20));

    // Force initial resize on loaded modules
    setTimeout(() => {
        if (window.vectorApp) window.vectorApp.resize();
        if (window.gradientApp) window.gradientApp.resize();
        if (window.backpropApp) window.backpropApp.resize();
    }, 50);
});
