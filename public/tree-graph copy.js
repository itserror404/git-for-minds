// Tree Graph Visualization for Decision Nodes
class DecisionTreeGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        
        // Graph settings
        this.nodeWidth = 200;
        this.nodeHeight = 80;
        this.levelHeight = 120;
        this.nodeSpacing = 50;
        
        // Colors
        this.colors = {
            created: '#e3f2fd',
            merged: '#e8f5e8', 
            forked: '#fff3e0',
            border: {
                created: '#1976d2',
                merged: '#2e7d32',
                forked: '#f57c00'
            },
            text: '#333',
            edge: '#667eea',
            edgeFork: '#f57c00'
        };
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = 1200;
        this.canvas.height = 800;
        
        // Enable high DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedNode = this.getNodeAtPosition(x, y);
            if (clickedNode) {
                this.selectedNode = clickedNode;
                this.showNodeDetails(clickedNode);
                this.render();
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const hoveredNode = this.getNodeAtPosition(x, y);
            this.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        });
    }
    
    buildTree(decisions) {
        this.nodes = [];
        this.edges = [];
        
        // Build node hierarchy
        const nodeMap = new Map();
        const roots = [];
        
        // Create nodes
        decisions.forEach(decision => {
            const node = {
                id: decision.id,
                title: decision.title,
                status: decision.status,
                parentId: decision.parentId,
                children: [],
                x: 0,
                y: 0,
                level: 0
            };
            nodeMap.set(decision.id, node);
            
            if (!decision.parentId) {
                roots.push(node);
            }
        });
        
        // Build parent-child relationships
        decisions.forEach(decision => {
            if (decision.parentId) {
                const parent = nodeMap.get(decision.parentId);
                const child = nodeMap.get(decision.id);
                if (parent && child) {
                    parent.children.push(child);
                    child.level = parent.level + 1;
                }
            }
        });
        
        // Position nodes
        this.positionNodes(roots);
        
        // Create edges
        this.createEdges(nodeMap);
        
        this.nodes = Array.from(nodeMap.values());
    }
    
    positionNodes(roots) {
        let rootX = 100;
        
        roots.forEach(root => {
            this.positionSubtree(root, rootX, 50);
            rootX += this.getSubtreeWidth(root) + 100;
        });
    }
    
    positionSubtree(node, x, y) {
        node.x = x;
        node.y = y;
        
        if (node.children.length === 0) return this.nodeWidth;
        
        let childX = x;
        let totalWidth = 0;
        
        // Position children
        node.children.forEach(child => {
            const childWidth = this.positionSubtree(
                child, 
                childX, 
                y + this.levelHeight
            );
            childX += childWidth + this.nodeSpacing;
            totalWidth += childWidth + this.nodeSpacing;
        });
        
        totalWidth -= this.nodeSpacing; // Remove last spacing
        
        // Center parent over children
        if (totalWidth > this.nodeWidth) {
            node.x = x + (totalWidth - this.nodeWidth) / 2;
        }
        
        return Math.max(this.nodeWidth, totalWidth);
    }
    
    getSubtreeWidth(node) {
        if (node.children.length === 0) return this.nodeWidth;
        
        let totalWidth = 0;
        node.children.forEach(child => {
            totalWidth += this.getSubtreeWidth(child) + this.nodeSpacing;
        });
        
        return Math.max(this.nodeWidth, totalWidth - this.nodeSpacing);
    }
    
    createEdges(nodeMap) {
        nodeMap.forEach(node => {
            node.children.forEach(child => {
                this.edges.push({
                    from: node,
                    to: child,
                    type: child.status === 'forked' ? 'fork' : 'branch'
                });
            });
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9ff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw edges first
        this.edges.forEach(edge => this.drawEdge(edge));
        
        // Draw nodes
        this.nodes.forEach(node => this.drawNode(node));
    }
    
    drawEdge(edge) {
        const fromX = edge.from.x + this.nodeWidth / 2;
        const fromY = edge.from.y + this.nodeHeight;
        const toX = edge.to.x + this.nodeWidth / 2;
        const toY = edge.to.y;
        
        this.ctx.strokeStyle = edge.type === 'fork' ? this.colors.edgeFork : this.colors.edge;
        this.ctx.lineWidth = edge.type === 'fork' ? 3 : 2;
        this.ctx.setLineDash(edge.type === 'fork' ? [5, 5] : []);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        
        // Curved line
        const midY = (fromY + toY) / 2;
        this.ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY);
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw arrow
        this.drawArrow(toX, toY, edge.type === 'fork' ? this.colors.edgeFork : this.colors.edge);
    }
    
    drawArrow(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - 8, y - 15);
        this.ctx.lineTo(x + 8, y - 15);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawNode(node) {
        const isSelected = this.selectedNode && this.selectedNode.id === node.id;
        
        // Node background
        this.ctx.fillStyle = this.colors[node.status];
        this.ctx.fillRect(node.x, node.y, this.nodeWidth, this.nodeHeight);
        
        // Node border
        this.ctx.strokeStyle = this.colors.border[node.status];
        this.ctx.lineWidth = isSelected ? 4 : 2;
        this.ctx.strokeRect(node.x, node.y, this.nodeWidth, this.nodeHeight);
        
        // Status indicator
        const statusEmoji = {
            'created': '🆕',
            'merged': '✅',
            'forked': '🔀'
        };
        
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = this.colors.text;
        this.ctx.fillText(statusEmoji[node.status], node.x + 10, node.y + 25);
        
        // Node title (wrapped)
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = this.colors.text;
        this.wrapText(node.title, node.x + 35, node.y + 25, this.nodeWidth - 45, 14);
        
        // Selection glow
        if (isSelected) {
            this.ctx.shadowColor = this.colors.border[node.status];
            this.ctx.shadowBlur = 10;
            this.ctx.strokeRect(node.x - 2, node.y - 2, this.nodeWidth + 4, this.nodeHeight + 4);
            this.ctx.shadowBlur = 0;
        }
    }
    
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
    }
    
    getNodeAtPosition(x, y) {
        return this.nodes.find(node => 
            x >= node.x && x <= node.x + this.nodeWidth &&
            y >= node.y && y <= node.y + this.nodeHeight
        );
    }
    
    showNodeDetails(node) {
        // Find the full decision data
        const decision = decisions.find(d => d.id === node.id);
        if (!decision) return;
        
        // Update details panel
        const detailsPanel = document.getElementById('node-details');
        if (detailsPanel) {
            detailsPanel.innerHTML = `
                <h3>${decision.title}</h3>
                <p><strong>Status:</strong> ${decision.status}</p>
                <p><strong>Date:</strong> ${new Date(decision.date).toLocaleDateString()}</p>
                <p><strong>Rationale:</strong> ${decision.rationale}</p>
                ${decision.alternatives.length > 0 ? `
                    <p><strong>Alternatives:</strong></p>
                    <ul>${decision.alternatives.map(alt => `<li>${alt}</li>`).join('')}</ul>
                ` : ''}
                ${decision.assumptions.length > 0 ? `
                    <p><strong>Assumptions:</strong></p>
                    <ul>${decision.assumptions.map(assumption => `<li>${assumption}</li>`).join('')}</ul>
                ` : ''}
            `;
            detailsPanel.style.display = 'block';
        }
    }
} 