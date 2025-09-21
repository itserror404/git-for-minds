import express from 'express';
import cors from 'cors';
import { DecisionDatabase } from './database.js';
import { Decision } from './types.js';
import { CaptureAgent } from './agents/capture-agent.js';
import { AssumptionAgent } from './agents/assumption-agent.js';

const app = express();
const port = 3000;
const db = new DecisionDatabase();
const captureAgent = new CaptureAgent();
const assumptionAgent = new AssumptionAgent(db);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Generate unique ID
function generateId(): string {
  return 'decision-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Check assumptions against new information
app.post('/api/check-assumptions', async (req, res) => {
  try {
    const { information } = req.body;
    
    if (!information) {
      return res.status(400).json({ error: 'Information is required' });
    }

    const result = await assumptionAgent.processNewInput(information);
    
    res.json({
      violations: result.violations,
      forkedDecisions: result.forkedDecisions,
      message: result.violations.length > 0 
        ? `Found ${result.violations.length} assumption violations, created ${result.forkedDecisions.length} forks`
        : 'No assumption violations detected'
    });
  } catch (error) {
    console.error('Assumption check error:', error);
    res.status(500).json({ error: 'Failed to check assumptions' });
  }
});

// Manual fork creation
app.post('/api/decisions/:id/fork', async (req, res) => {
  try {
    const originalDecision = db.getDecision(req.params.id);
    if (!originalDecision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    const { reason } = req.body;
    const forkId = generateId();
    
    const forkedDecision: Decision = {
      id: forkId,
      title: `Fork: ${originalDecision.title}`,
      status: 'forked',
      date: new Date().toISOString(),
      rationale: reason || 'Manual fork for reconsideration',
      alternatives: [...originalDecision.alternatives],
      assumptions: [...originalDecision.assumptions],
      history: [{
        event: 'forked',
        date: new Date().toISOString(),
        reason: reason || 'Manual fork'
      }],
      parentId: originalDecision.id
    };

    db.createDecision(forkedDecision);
    
    // Create relationship
    db.createRelationship({
      id: generateId(),
      parentId: originalDecision.id,
      childId: forkId,
      type: 'fork',
      reason
    });

    res.json(forkedDecision);
  } catch (error) {
    console.error('Fork creation error:', error);
    res.status(500).json({ error: 'Failed to create fork' });
  }
});

// Parse text into decision using Capture Agent
app.post('/api/capture', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await captureAgent.parseDecision(text);
    
    // Create full decision object
    const decision: Decision = {
      id: generateId(),
      title: result.decision.title || 'Untitled Decision',
      status: 'created',
      date: new Date().toISOString(),
      rationale: result.decision.rationale || text,
      alternatives: result.decision.alternatives || [],
      assumptions: result.decision.assumptions || [],
      history: [{
        event: 'created',
        date: new Date().toISOString()
      }]
    };

    db.createDecision(decision);
    
    res.json({
      decision,
      confidence: result.confidence,
      message: result.confidence > 0.6 ? 'High confidence parse' : 'Low confidence - please review'
    });
  } catch (error) {
    console.error('Capture error:', error);
    res.status(500).json({ error: 'Failed to parse decision' });
  }
});

// Create decision
app.post('/api/decisions', (req, res) => {
  try {
    const { title, rationale, alternatives = [], assumptions = [] } = req.body;
    
    if (!title || !rationale) {
      return res.status(400).json({ error: 'Title and rationale are required' });
    }

    const decision: Decision = {
      id: generateId(),
      title,
      status: 'created',
      date: new Date().toISOString(),
      rationale,
      alternatives,
      assumptions,
      history: [{
        event: 'created',
        date: new Date().toISOString()
      }]
    };

    db.createDecision(decision);
    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

// Get all decisions
app.get('/api/decisions', (req, res) => {
  try {
    const decisions = db.getAllDecisions();
    res.json(decisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

// Get single decision
app.get('/api/decisions/:id', (req, res) => {
  try {
    const decision = db.getDecision(req.params.id);
    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }
    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision' });
  }
});

// Get decision tree (parent with children)
app.get('/api/decisions/:id/tree', (req, res) => {
  try {
    const decision = db.getDecision(req.params.id);
    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }
    
    const children = db.getChildDecisions(req.params.id);
    res.json({ ...decision, children });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decision tree' });
  }
});

// Update decision status
app.patch('/api/decisions/:id', (req, res) => {
  try {
    const decision = db.getDecision(req.params.id);
    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    const { status, reason } = req.body;
    if (status) {
      decision.status = status;
      decision.history.push({
        event: status,
        date: new Date().toISOString(),
        reason
      });
      db.updateDecision(decision);
    }

    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
}); 