// DecisionGraph renderer with modern styles (shadcn-like)
class DecisionGraph {
	constructor(canvasId, decisions) {
		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext('2d');
		this.decisions = decisions;
		this.nodes = [];
		this.edges = [];
		this.hoverNodeId = null;
		this.selectedNodeId = null;
		this.devicePixelRatio = window.devicePixelRatio || 1;
		this.layout = { padding: 32, colGap: 100, rowGap: 64, nodeWidth: 220, nodeMinHeight: 64 };
		this.totalHeight = 600;

		this.handleResize = this.handleResize.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleClick = this.handleClick.bind(this);

		window.addEventListener('resize', this.handleResize);
		this.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.canvas.addEventListener('click', this.handleClick);

		this.computeGraph();
		this.handleResize();
	}

	update(decisions) {
		this.decisions = decisions;
		this.computeGraph();
		this.render();
	}

	handleResize() {
		const parent = this.canvas.parentElement;
		const width = parent.clientWidth;
		const height = Math.max(parent.clientHeight, this.totalHeight, 600);
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this.canvas.width = Math.floor(width * this.devicePixelRatio);
		this.canvas.height = Math.floor(height * this.devicePixelRatio);
		this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
		this.render();
	}

	computeGraph() {
		// Simple layered layout: newest on top, older down
		const { padding, colGap, rowGap, nodeWidth, nodeMinHeight } = this.layout;
		this.nodes = [];
		this.edges = [];

		const columns = 2; // main line and forks
		const sorted = [...this.decisions].sort((a,b) => new Date(b.date) - new Date(a.date));
		let x0 = padding;
		let x1 = padding + nodeWidth + colGap;
		let y = padding;

		sorted.forEach((d, idx) => {
			const isFork = d.status === 'forked';
			const x = isFork ? x1 : x0;
			const title = d.title;
			const subtitle = d.status;
			const detail = d.rationale;

			// Typography metrics
			const PADDING_TOP = 14;
			const TITLE_FS = 14, TITLE_LH = 18;
			const CHIP_H = 16, GAP = 6;
			const DETAIL_FS = 11, DETAIL_LH = 14;
			const FOOTER_H = 14, PADDING_BOTTOM = 10;

			const titleLines = this.wrapText(title, nodeWidth - 24, TITLE_FS, '600');
			const detailLines = this.wrapText(detail, nodeWidth - 24, DETAIL_FS, '400', 2); // clamp to 2 lines
			const contentHeight = PADDING_TOP
				+ titleLines.length * TITLE_LH
				+ GAP + CHIP_H + GAP
				+ detailLines.length * DETAIL_LH
				+ GAP + FOOTER_H
				+ PADDING_BOTTOM;
			const height = Math.max(nodeMinHeight, Math.ceil(contentHeight));

			const node = {
				id: d.id,
				x, y,
				width: nodeWidth,
				height,
				status: d.status,
				titleLines,
				subtitle,
				detailLines,
				assumptions: d.assumptions?.length || 0,
				alternatives: d.alternatives?.length || 0
			};
			this.nodes.push(node);

			// edges: connect sequential items on same column; if forked, connect to previous main
			if (idx > 0) {
				const prev = this.nodes[idx - 1];
				if (node.x === prev.x) {
					this.edges.push({ from: prev, to: node, kind: 'progress' });
				} else {
					// diagonal fork from last main to this fork
					const lastMain = [...this.nodes].slice(0, idx).reverse().find(n => n.x === x0) || prev;
					this.edges.push({ from: lastMain, to: node, kind: 'fork' });
				}
			}

			y += height + rowGap;
		});

		// Update total height and parent container so nothing is cut off
		this.totalHeight = y + padding;
		const parent = this.canvas.parentElement;
		if (parent) parent.style.height = Math.max(this.totalHeight, 600) + 'px';
	}

	render() {
		const ctx = this.ctx;
		const { padding } = this.layout;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Background
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Edges first
		this.edges.forEach(edge => this.drawEdge(edge));
		// Nodes
		this.nodes.forEach(node => this.drawNode(node));
	}

	drawEdge(edge) {
		const ctx = this.ctx;
		const from = edge.from;
		const to = edge.to;
		const fromX = from.x + from.width / 2;
		const fromY = from.y + from.height;
		const toX = to.x + to.width / 2;
		const toY = to.y;

		ctx.save();
		if (edge.kind === 'fork') {
			ctx.strokeStyle = '#fb923c'; // orange-400
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 6]);
		} else {
			ctx.strokeStyle = '#94a3b8'; // slate-400
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
		}

		// Smooth curve
		ctx.beginPath();
		const cpY = (fromY + toY) / 2;
		ctx.moveTo(fromX, fromY);
		ctx.bezierCurveTo(fromX, cpY, toX, cpY, toX, toY);
		ctx.stroke();

		// Arrowhead
		this.drawArrow(toX, toY, Math.atan2(toY - cpY, 0));
		ctx.restore();
	}

	drawArrow(x, y, angle) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.fillStyle = '#94a3b8';
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-5, -8);
		ctx.lineTo(5, -8);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	drawNode(node) {
		const ctx = this.ctx;
		const radius = 10;
		const shadow = this.hoverNodeId === node.id ? 8 : 4;

		// Colors by status
		const palette = {
			merged: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', chipBg: '#d1fae5' }, // green
			forked: { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', chipBg: '#ffedd5' }, // orange
			created: { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a', chipBg: '#dbeafe' }  // blue
		};
		const scheme = palette[node.status] || palette.created;

		// Card
		ctx.save();
		ctx.shadowColor = 'rgba(2, 6, 23, 0.08)';
		ctx.shadowBlur = shadow;
		ctx.shadowOffsetY = 2;
		this.roundedRect(ctx, node.x, node.y, node.width, node.height, radius, scheme.bg, scheme.border);
		ctx.restore();

		// Content (clip to card to avoid overflow)
		ctx.save();
		ctx.beginPath();
		ctx.rect(node.x, node.y, node.width, node.height);
		ctx.clip();
		ctx.fillStyle = '#0f172a'; // slate-900
		ctx.font = '600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif';
		let cursorY = node.y + 14 + 14; // top padding + first baseline
		const paddingX = node.x + 12;

		// Title lines
		node.titleLines.forEach(line => {
			ctx.fillText(line, paddingX, cursorY);
			cursorY += 18; // line height
		});

		// Subtitle chip
		cursorY += 6;
		this.drawChip(paddingX, cursorY - 14, node.subtitle, scheme.chipBg, scheme.text);

		// Detail
		cursorY += 16;
		ctx.fillStyle = '#475569'; // slate-600
		ctx.font = '400 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif';
		node.detailLines.forEach(line => {
			ctx.fillText(line, paddingX, cursorY);
			cursorY += 14;
		});

		// Footer meta
		cursorY += 6;
		ctx.fillStyle = '#334155';
		ctx.font = '500 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif';
		ctx.fillText(`${node.assumptions} assumptions   ${node.alternatives} alternatives`, paddingX, cursorY + 12);
		ctx.restore();
	}

	roundedRect(ctx, x, y, w, h, r, fill, stroke) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
		ctx.fillStyle = fill;
		ctx.fill();
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 1.5;
		ctx.stroke();
	}

	drawChip(x, y, text, bg, color) {
		const ctx = this.ctx;
		ctx.save();
		ctx.font = '600 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif';
		const padX = 8, padY = 4;
		const width = ctx.measureText(text).width + padX * 2;
		const height = 18;
		this.roundedRect(ctx, x, y, width, height, 6, bg, bg);
		ctx.fillStyle = color;
		ctx.fillText(text, x + padX, y + 12);
		ctx.restore();
	}

	wrapText(text, maxWidth, fontSize = 14, weight = '400', maxLines = 0) {
		const ctx = this.ctx;
		ctx.font = `${weight} ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif`;
		const words = (text || '').split(' ');
		const lines = [];
		let line = '';
		for (let n = 0; n < words.length; n++) {
			const testLine = line ? line + ' ' + words[n] : words[n];
			const metrics = ctx.measureText(testLine);
			if (metrics.width > maxWidth && n > 0) {
				lines.push(line);
				line = words[n];
			} else {
				line = testLine;
			}
		}
		if (line) lines.push(line);
		if (maxLines && lines.length > maxLines) {
			const truncated = lines.slice(0, maxLines);
			const last = truncated[maxLines - 1];
			let ellip = last + '…';
			while (ctx.measureText(ellip).width > maxWidth && ellip.length > 1) {
				ellip = ellip.slice(0, -2) + '…';
			}
			truncated[maxLines - 1] = ellip;
			return truncated;
		}
		return lines;
	}

	hitTest(x, y) {
		return this.nodes.find(n => x >= n.x && x <= n.x + n.width && y >= n.y && y <= n.y + n.height);
	}

	handleMouseMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left);
		const y = (e.clientY - rect.top);
		const node = this.hitTest(x, y);
		const prev = this.hoverNodeId;
		this.hoverNodeId = node ? node.id : null;
		if (prev !== this.hoverNodeId) this.render();
	}

	handleClick(e) {
		const rect = this.canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left);
		const y = (e.clientY - rect.top);
		const node = this.hitTest(x, y);
		if (node) {
			this.selectedNodeId = node.id;
			if (window && typeof window.showDecisionDetails === 'function') {
				window.showDecisionDetails(node.id);
			}
		}
	}
}

// Export to global
window.DecisionGraph = DecisionGraph; 