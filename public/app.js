// GitHub-style Git for Minds Application (Demo mode)
let decisions = [];
let currentView = 'graph';
let selectedBranch = 'main';
let decisionGraph = null;

// Demo data for StartupX
defineDemoDecisions();

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
	initializeNavigation();
	// Use demo data immediately
	decisions = window.__DEMO_DECISIONS__;
	updateStats();
	renderLastCommit();
	initializeGraphView();
	renderDecisionsList();
});

function defineDemoDecisions() {
	window.__DEMO_DECISIONS__ = [
		{
			id: 'd-psql',
			title: 'PostgreSQL as Primary Database',
			status: 'created',
			rationale: 'ACID compliance needed for financial data, great ecosystem support',
			alternatives: [],
			assumptions: ['Financial data requires ACID', 'Team experienced with SQL'],
			date: new Date(Date.now() - 559 * 86400000).toISOString()
		},
		{
			id: 'd-reconsider-tiered',
			title: 'Reconsider: Tiered Pricing Model',
			status: 'forked',
			rationale: 'Major competitor dropped prices by 30%. Need to reassess our positioning.',
			alternatives: ['Keep tiers', 'Reduce prices', 'Introduce freemium'],
			assumptions: ['Competitor pricing impacts demand'],
			date: new Date(Date.now() - 568 * 86400000).toISOString()
		},
		{
			id: 'd-hire-senior',
			title: 'Hire Senior Full-Stack Engineers',
			status: 'merged',
			rationale: 'Need experienced developers who can work across the stack independently',
			alternatives: ['Hire mid-level', 'Contractors', 'Outsource'],
			assumptions: ['Budget available', 'Hiring pipeline active'],
			date: new Date(Date.now() - 578 * 86400000).toISOString()
		},
		{
			id: 'd-content',
			title: 'Content Marketing Strategy',
			status: 'merged',
			rationale: 'Build thought leadership and organic reach',
			alternatives: ['Paid ads', 'Events', 'Partnerships'],
			assumptions: ['SEO growth possible'],
			date: new Date(Date.now() - 588 * 86400000).toISOString()
		},
		{
			id: 'd-tiered',
			title: 'Tiered Pricing Model',
			status: 'merged',
			rationale: 'Allows us to capture different customer segments',
			alternatives: ['Single price', 'Usage-based'],
			assumptions: ['Different willingness to pay'],
			date: new Date(Date.now() - 597 * 86400000).toISOString()
		},
		{
			id: 'd-microservices',
			title: 'Microservices Architecture',
			status: 'merged',
			rationale: 'Scalability and team independence for rapid growth',
			alternatives: ['Monolith', 'Modular monolith', 'SOA'],
			assumptions: ['Team can handle complexity'],
			date: new Date(Date.now() - 604 * 86400000).toISOString()
		},
		{
			id: 'd-launch-b2b',
			title: 'Launch B2B SaaS Platform',
			status: 'merged',
			rationale: 'Market research shows strong demand for workflow automation tools',
			alternatives: ['B2C tool', 'Marketplace'],
			assumptions: ['B2B sales motion viable'],
			date: new Date(Date.now() - 614 * 86400000).toISOString()
		},
		{
			id: 'd-remote-first',
			title: 'Remote-First Team Structure',
			status: 'merged',
			rationale: 'Access to global talent pool, lower overhead costs',
			alternatives: ['Hybrid', 'Office-first'],
			assumptions: ['Remote processes effective'],
			date: new Date(Date.now() - 619 * 86400000).toISOString()
		}
	];
}

// Navigation handling
function initializeNavigation() {
	// Set up tab switching
	document.querySelectorAll('.nav-tab').forEach(tab => {
		tab.addEventListener('click', (e) => {
			e.preventDefault();
			switchTab(tab.dataset.tab);
		});
	});
}

// Switch between main tabs
function switchTab(tabName) {
	// Update nav tab states
	document.querySelectorAll('.nav-tab').forEach(tab => {
		if (tab.dataset.tab === tabName) {
			tab.classList.add('border-orange-400', 'text-gray-900');
			tab.classList.remove('border-transparent', 'text-gray-500');
		} else {
			tab.classList.remove('border-orange-400', 'text-gray-900');
			tab.classList.add('border-transparent', 'text-gray-500');
		}
	});

	// Hide all tab content
	document.querySelectorAll('.tab-content').forEach(content => {
		content.classList.add('hidden');
	});

	// Show selected tab content
	document.getElementById(`${tabName}-tab`).classList.remove('hidden');
	currentView = tabName;

	// Initialize specific tab content
	if (tabName === 'graph') {
		initializeGraphView();
	} else if (tabName === 'decisions') {
		renderDecisionsList();
	}
}

// Disable network calls; helper kept for later switch
async function loadDecisions() {
	decisions = window.__DEMO_DECISIONS__;
	updateStats();
	renderLastCommit();
	if (currentView === 'graph') initializeGraphView();
	if (currentView === 'decisions') renderDecisionsList();
}

// Update repository stats
function updateStats() {
	const stats = {
		total: decisions.length,
		merged: decisions.filter(d => d.status === 'merged').length,
		forked: decisions.filter(d => d.status === 'forked').length,
		assumptions: decisions.reduce((acc, d) => acc + (d.assumptions?.length || 0), 0)
	};
	
	document.getElementById('total-decisions').textContent = stats.total;
	document.getElementById('assumptions-count').textContent = stats.assumptions;
	const mergedCountEl = document.getElementById('merged-decisions-count');
	const forkedCountEl = document.getElementById('forked-decisions-count');
	if (mergedCountEl) mergedCountEl.textContent = stats.merged;
	if (forkedCountEl) forkedCountEl.textContent = stats.forked;
	['stats-total','stats-merged','stats-forked','stats-assumptions'].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.textContent = { 'stats-total': stats.total, 'stats-merged': stats.merged, 'stats-forked': stats.forked, 'stats-assumptions': stats.assumptions }[id];
	});
	['merged-count','forked-count','readme-forked-count'].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.textContent = id.includes('merged') ? stats.merged : stats.forked;
	});
}

// Render last commit info
function renderLastCommit() {
	if (decisions.length === 0) return;
	const latest = decisions.reduce((latest, d) => new Date(d.date) > new Date(latest.date) ? d : latest);
	const commitInfo = document.getElementById('last-commit-info');
	const timeAgo = getTimeAgo(new Date(latest.date));
	commitInfo.className = 'flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap overflow-hidden';
	commitInfo.innerHTML = `
		<div class="w-5 h-5 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">M</div>
		<span class="font-medium truncate max-w-[32ch]">${latest.title}</span>
		<span>•</span>
		<span class="text-blue-600">maize</span>
		<span>committed ${timeAgo}</span>
		<span>•</span>
		<span class="text-blue-600">${latest.id.slice(-6)}</span>
	`;
}

// Initialize graph view
function initializeGraphView() {
	setTimeout(() => {
		const container = document.getElementById('decision-graph');
		if (!container) return;
		if (!decisionGraph) {
			decisionGraph = new DecisionGraph('decision-graph', decisions);
		} else {
			decisionGraph.update(decisions);
		}
	}, 50);
}

// Render decisions list (Issues-style)
function renderDecisionsList() {
	const container = document.getElementById('decisions-list');
	if (!container) return;
	container.innerHTML = '';
	if (decisions.length === 0) {
		container.innerHTML = `
			<div class="text-center py-12">
				<div class="text-gray-400 text-6xl mb-4">📝</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No decisions yet</h3>
				<p class="text-gray-500 mb-4">Get started by creating your first strategic decision for StartupX.</p>
				<button onclick="showAddDecisionDialog()" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">New Decision</button>
			</div>
		`;
		return;
	}
	decisions.forEach(decision => {
		const item = document.createElement('div');
		item.className = 'border-b border-gray-200 py-4 hover:bg-gray-50';
		const statusIcon = getStatusIcon(decision.status);
		const statusColor = getStatusColor(decision.status);
		item.innerHTML = `
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0 mt-1">
					<span class="text-${statusColor}-600">${statusIcon}</span>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer" onclick="showDecisionDetails('${decision.id}')">${decision.title}</h3>
						<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">${decision.status}</span>
					</div>
					<p class="text-sm text-gray-600 mt-1">${decision.rationale}</p>
					<div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
						<span>${getTimeAgo(new Date(decision.date))}</span>
						<span>${decision.assumptions.length} assumptions</span>
						<span>${decision.alternatives.length} alternatives</span>
					</div>
				</div>
				<div class="flex-shrink-0 flex items-center gap-2">
					<button onclick="forkDecision('${decision.id}')" class="text-gray-400 hover:text-gray-600" title="Fork this decision">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2 1 1 0 000-2zM4 6a3 3 0 106 0v1h4a2 2 0 012 2v3.1l1.4-1.4a1 1 0 111.2 1.6l-3 3a1 1 0 01-1.6 0l-3-3a1 1 0 111.2-1.6l1.4 1.4V9a2 2 0 00-2-2H10V6a3 3 0 10-6 0z"/></svg>
					</button>
				</div>
			</div>`;
		container.appendChild(item);
	});
}

// Helpers
function getStatusIcon(status) {
	switch (status) {
		case 'merged': return '✅';
		case 'forked': return '🔀';
		default: return '⭕';
	}
}
function getStatusColor(status) {
	switch (status) {
		case 'merged': return 'green';
		case 'forked': return 'orange';
		default: return 'blue';
	}
}
function getTimeAgo(date) {
	const now = new Date();
	const diff = now - date;
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	return 'just now';
}

// Dialogs
function showAddDecisionDialog() { document.getElementById('add-decision-dialog').classList.remove('hidden'); }
function closeAddDecisionDialog() { document.getElementById('add-decision-dialog').classList.add('hidden'); document.getElementById('decision-form').reset(); }
function switchAddTab(tabName) {
	['manual-tab-btn','capture-tab-btn'].forEach(id => {
		const btn = document.getElementById(id);
		if (id.includes(tabName)) { btn.classList.remove('border-gray-300','text-gray-700'); btn.classList.add('border-orange-400','text-orange-600'); }
		else { btn.classList.add('border-gray-300','text-gray-700'); btn.classList.remove('border-orange-400','text-orange-600'); }
	});
	document.getElementById('manual-entry-tab').classList.toggle('hidden', tabName !== 'manual');
	document.getElementById('text-capture-tab').classList.toggle('hidden', tabName !== 'capture');
}

document.addEventListener('submit', async (e) => {
	if (e.target.id === 'decision-form') {
		e.preventDefault();
		const title = document.getElementById('decision-title').value;
		const rationale = document.getElementById('decision-rationale').value;
		const alternatives = document.getElementById('decision-alternatives').value.split('\n').map(s=>s.trim()).filter(Boolean);
		const assumptions = document.getElementById('decision-assumptions').value.split('\n').map(s=>s.trim()).filter(Boolean);
		const newDecision = { id: 'd-' + Math.random().toString(36).slice(2,8), title, rationale, alternatives, assumptions, status: 'created', date: new Date().toISOString() };
		decisions = [newDecision, ...decisions];
		window.__DEMO_DECISIONS__ = decisions;
		closeAddDecisionDialog();
		loadDecisions();
	}
});

async function captureDecision() {
	const rawText = document.getElementById('capture-text').value.trim();
	if (!rawText) { alert('Please enter some text to parse.'); return; }
	// Demo: fake capture result
	const newDecision = { id: 'd-' + Math.random().toString(36).slice(2,8), title: rawText.slice(0, 60), rationale: 'Captured via text', alternatives: [], assumptions: [], status: 'created', date: new Date().toISOString() };
	decisions = [newDecision, ...decisions];
	window.__DEMO_DECISIONS__ = decisions;
	alert('Decision captured with 92% confidence');
	closeAddDecisionDialog();
	loadDecisions();
}

async function forkDecision(decisionId) {
	const reason = prompt('Reason for forking this decision:');
	if (!reason) return;
	const base = decisions.find(d => d.id === decisionId);
	if (!base) return;
	const forked = { ...base, id: 'd-' + Math.random().toString(36).slice(2,8), title: `Reconsider: ${base.title}`, status: 'forked', rationale: reason, date: new Date().toISOString() };
	decisions = [forked, ...decisions];
	window.__DEMO_DECISIONS__ = decisions;
	loadDecisions();
}

function showDecisionDetails(decisionId) {
	const d = decisions.find(x => x.id === decisionId);
	if (!d) return;
	alert(`Decision: ${d.title}\n\nStatus: ${d.status}\nRationale: ${d.rationale}`);
} 