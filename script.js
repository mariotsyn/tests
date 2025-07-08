const pdfCanvas = document.getElementById('pdfCanvas');
const ctx = pdfCanvas.getContext('2d');
const overlay = document.getElementById('overlay');
const linkLayer = document.getElementById('linkLayer');
const modeSelect = document.getElementById('mode');
const pdfUploader = document.getElementById('pdfUploader');
document.querySelectorAll('#palette button').forEach(btn => {
  btn.addEventListener('click', () => addIcon(btn.dataset.type));
});
let mode = modeSelect.value;
let startIcon = null;

modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
});

// Cargar PDF en el canvas
pdfUploader.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  pdfCanvas.width = vp.width;
  pdfCanvas.height = vp.height;
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
});

function addIcon(type) {
  if (mode !== 'add') return;
  const dev = document.createElement('div');
  dev.className = 'device';
  dev.style.left = '10px';
  dev.style.top = '10px';
  dev.draggable = true;

  const img = document.createElement('img');
  img.className = 'icon';
  img.src = getIcon(type);
  dev.appendChild(img);

  const label = document.createElement('div');
  label.className = 'label';
  dev.appendChild(label);

  overlay.appendChild(dev);
  dev.addEventListener('dragstart', dragStart);
  dev.addEventListener('dragend', dragEnd);
  dev.addEventListener('click', iconClick);
}

function getIcon(type) {
  switch (type) {
    case 'router':
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="lightblue" stroke="black"/></svg>';
    case 'switch':
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="20" width="48" height="24" fill="orange" stroke="black"/></svg>';
    case 'ap':
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 60,60 4,60" fill="lightgreen" stroke="black"/></svg>';
    case 'camera':
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="gray" stroke="black"/></svg>';
    case 'ctrl':
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="16" width="32" height="32" fill="pink" stroke="black"/></svg>';
    default:
      return '';
  }
}

function dragStart(e) {
  if (mode !== 'select') {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData('text/plain', '');
}

function dragEnd(e) {
  if (mode !== 'select') return;
  const rect = overlay.getBoundingClientRect();
  this.style.left = e.clientX - rect.left - 16 + 'px';
  this.style.top = e.clientY - rect.top - 16 + 'px';
}

function iconClick(e) {
  if (mode === 'select') {
    const name = prompt('Nombre', this.dataset.name || '');
    if (name !== null) {
      this.dataset.name = name;
      this.querySelector('.label').textContent = name;
    }
    const ip = prompt('IP', this.dataset.ip || '');
    if (ip !== null) this.dataset.ip = ip;
    const mac = prompt('MAC', this.dataset.mac || '');
    if (mac !== null) this.dataset.mac = mac;
    const inv = prompt('Inventario', this.dataset.inv || '');
    if (inv !== null) this.dataset.inv = inv;
  } else {
    if (startIcon === null) {
      startIcon = this;
      this.classList.add('selected');
    } else if (startIcon === this) {
      startIcon.classList.remove('selected');
      startIcon = null;
    } else {
      connect(startIcon, this);
      startIcon.classList.remove('selected');
      startIcon = null;
    }
  }
}

function connect(a, b) {
  const cable = document.getElementById('cableType').value;
  const colors = { utp: 'blue', fibra: 'red', coax: 'green' };
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', parseInt(a.style.left) + a.offsetWidth / 2);
  line.setAttribute('y1', parseInt(a.style.top) + a.offsetHeight / 2);
  line.setAttribute('x2', parseInt(b.style.left) + b.offsetWidth / 2);
  line.setAttribute('y2', parseInt(b.style.top) + b.offsetHeight / 2);
  line.setAttribute('stroke', colors[cable] || 'black');
  linkLayer.appendChild(line);
}
