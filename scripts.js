const canvas = document.getElementById('plane');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const centerX = W / 2;
const centerY = H /2;

function toX(x, scale) {
    return centerX + x * scale;
}

function toY(y, scale) {
    return centerY - y * scale;
}

function getScale(r) {
    const indentation = 0.7;
    return centerX * indentation / r;
}

function addText(r, scale) {
    const lineGap = 5;

    ctx.fillStyle = 'black';
    ctx.font = '12px Arial'

    ctx.fillText('R', toX(0, scale) + lineGap, toY(r, scale));
    ctx.fillText('R/2', toX(0, scale) + lineGap, toY(r / 2, scale));
    ctx.fillText('-R', toX(0, scale) + lineGap, toY(-r, scale));
    ctx.fillText('-R/2', toX(0, scale) + lineGap, toY(-r / 2, scale));

    ctx.fillText('R', toX(r, scale), toY(0, scale) - lineGap);
    ctx.fillText('R/2', toX(r / 2, scale), toY(0, scale) - lineGap);
    ctx.fillText('-R', toX(-r, scale), toY(0, scale) - lineGap);
    ctx.fillText('-R/2', toX(-r / 2, scale), toY(0, scale) - lineGap);
}

function drawTicks(r, scale) {
    const tickSize = 3;
    const values = [r, r/2, -r / 2, -r];

    ctx.beginPath();
    values.forEach(v => {
        const x = toX(v, scale);
        const y = toY(v, scale);

        ctx.moveTo(x, centerY - tickSize);
        ctx.lineTo(x, centerY + tickSize);
        ctx.moveTo(centerX - tickSize, y);
        ctx.lineTo(centerX + tickSize, y);
    });
    ctx.stroke();
}

function drawAxes(r) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, H);
    ctx.stroke();

    const size = 8;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(W, centerY);
    ctx.lineTo(W - size, centerY - size / 2);
    ctx.lineTo(W - size, centerY + size / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - size / 2, 0 + size);
    ctx.lineTo(centerX + size / 2, 0 + size);
    ctx.closePath();
    ctx.fill();

    const scale = getScale(r);
    addText(r, scale);
    drawTicks(r, scale);
}

function drawArea(r) {
    const scale = getScale(r);
    ctx.fillStyle = 'lightblue';

    ctx.beginPath();
    ctx.rect(toX(-r, scale), toY(r / 2, scale), r * scale, r * scale / 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toX(0, scale), toY(0, scale));
    ctx.arc(toX(0,scale), toY(0, scale), r / 2 * scale, Math.PI / 2, Math.PI, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toX(0, scale), toY(0, scale));
    ctx.lineTo(toX(r/2, scale), toY(0, scale));
    ctx.lineTo(toX(0,scale), toY(-r, scale));
    ctx.closePath();
    ctx.fill();
}

function isInsideTriangle(x, y, r) {
    return y >= 2 * x - r && x >= 0 && x <= r / 2 && y <= 0 && y >= -r;
}

function isInsideRect(x, y, r) {
    return y >= 0 && y <= r / 2 && x <= 0 && x >= -r;
}

function isInsideArc(x, y, r) {
    const insideBound = x <= 0 && y <= 0;
    if (!insideBound) return false;

    return (x * x + y * y) <= (r/ 2) * (r / 2); 
}

function isInside(x, y, r) {
    return isInsideTriangle(x, y, r) || isInsideArc(x, y, r) || isInsideRect(x, y, r);
}

const tbody = document.querySelector('#resultsTable tbody');
let results = JSON.parse(localStorage.getItem('results')) || [];

function addRow(res) {
    const row = tbody.insertRow(0);
    row.insertCell().textContent = res.x;
    row.insertCell().textContent = res.y;
    row.insertCell().textContent = res.r;
    row.insertCell().textContent = res.inside ? 'Попал' : 'Не попал';
    row.insertCell().textContent = new Date(res.time).toLocaleString('ru-RU');
}

results.forEach(addRow);
const tempR = 3;
drawArea(tempR);
drawAxes(tempR);

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const xRad = document.querySelector('input[name="x"]:checked');
    const y = parseFloat(document.getElementById('y').value);
    const r = parseFloat(document.getElementById('r').value);

    if (!xRad) {
        alert('Выберите значение X');
        return;
    }
    const x = parseFloat(xRad.value);

    if (!(y > - 3 && y < 3)) {
        alert('Неправильное значение дял Y');
        return;
    }

    if (!(r > 2 && r < 5)) {
        alert('Неправильное занчение для R');
        return;
    }

    const inside = isInside(x, y, r);
    const res = { x, y, r, inside, time: new Date().toISOString() };
    results.push(res);
    localStorage.setItem('results', JSON.stringify(results));
    addRow(res);
});