import { DecisionDatabase } from './database.js';

// Initialize database with sample data
function setupDatabase() {
  console.log('Setting up database...');
  
  const db = new DecisionDatabase();
  
  // Create a sample decision to test the system
  const sampleDecision = {
    id: 'decision-sample-001',
    title: 'Set pricing at $12/month',
    status: 'merged' as const,
    date: new Date().toISOString(),
    rationale: 'Competitive vs StartupX, 40% margin target',
    alternatives: ['Freemium', '$15/month'],
    assumptions: ['StartupX = $10/month', 'Market will grow 20% annually'],
    history: [
      {
        event: 'created' as const,
        date: new Date().toISOString()
      },
      {
        event: 'merged' as const,
        date: new Date().toISOString(),
        reason: 'Team consensus reached'
      }
    ]
  };

  db.createDecision(sampleDecision);
  
  console.log('Database setup complete!');
  console.log('Sample decision created:', sampleDecision.title);
  
  db.close();
}

setupDatabase(); 