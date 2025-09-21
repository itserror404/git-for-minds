"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = require("./database.js");
// Initialize database with rich sample data for tree visualization
function setupDatabase() {
    console.log('Setting up database with sample decision tree...');
    const db = new database_js_1.DecisionDatabase();
    // Root decision: Product Strategy
    const productStrategy = {
        id: 'decision-product-001',
        title: 'Launch B2B SaaS Platform',
        status: 'merged',
        date: '2024-01-15T10:00:00Z',
        rationale: 'Market research shows strong demand for workflow automation tools',
        alternatives: ['B2C Mobile App', 'Consulting Services', 'White-label Solution'],
        assumptions: ['Enterprise market size $50B', 'Competition limited to 3 major players'],
        history: [
            { event: 'created', date: '2024-01-15T10:00:00Z' },
            { event: 'merged', date: '2024-01-20T14:30:00Z', reason: 'Board approval received' }
        ]
    };
    // Pricing branch from product strategy
    const pricingDecision = {
        id: 'decision-pricing-001',
        title: 'Tiered Pricing Model',
        status: 'merged',
        date: '2024-02-01T09:00:00Z',
        rationale: 'Allows us to capture different customer segments',
        alternatives: ['Flat rate $50/month', 'Usage-based pricing', 'Enterprise-only'],
        assumptions: ['Customers prefer predictable costs', 'Upselling to higher tiers is feasible'],
        history: [
            { event: 'created', date: '2024-02-01T09:00:00Z' },
            { event: 'merged', date: '2024-02-05T16:00:00Z', reason: 'A/B test results positive' }
        ],
        parentId: 'decision-product-001'
    };
    // Marketing branch from product strategy
    const marketingDecision = {
        id: 'decision-marketing-001',
        title: 'Content Marketing Strategy',
        status: 'merged',
        date: '2024-02-10T11:00:00Z',
        rationale: 'Build thought leadership and organic reach',
        alternatives: ['Paid ads only', 'Conference sponsorships', 'Influencer partnerships'],
        assumptions: ['Blog content drives 40% of leads', 'SEO takes 6 months to show results'],
        history: [
            { event: 'created', date: '2024-02-10T11:00:00Z' },
            { event: 'merged', date: '2024-02-15T13:00:00Z', reason: 'Marketing team capacity confirmed' }
        ],
        parentId: 'decision-product-001'
    };
    // Fork from pricing due to competitive pressure
    const pricingFork = {
        id: 'decision-pricing-fork-001',
        title: 'Reconsider: Tiered Pricing Model',
        status: 'forked',
        date: '2024-03-01T14:00:00Z',
        rationale: 'Major competitor dropped prices by 30%. Need to reassess our positioning.',
        alternatives: ['Match competitor prices', 'Add more value at current price', 'Focus on premium segment'],
        assumptions: ['Price war will hurt margins industry-wide', 'Customers will switch for 20%+ savings'],
        history: [
            { event: 'forked', date: '2024-03-01T14:00:00Z', reason: 'Competitive pricing pressure' }
        ],
        parentId: 'decision-pricing-001'
    };
    // Technology decision branch
    const techDecision = {
        id: 'decision-tech-001',
        title: 'Microservices Architecture',
        status: 'merged',
        date: '2024-01-25T08:00:00Z',
        rationale: 'Scalability and team independence for rapid growth',
        alternatives: ['Monolithic architecture', 'Serverless functions', 'Hybrid approach'],
        assumptions: ['Team can handle distributed system complexity', 'Kubernetes expertise available'],
        history: [
            { event: 'created', date: '2024-01-25T08:00:00Z' },
            { event: 'merged', date: '2024-01-30T17:00:00Z', reason: 'CTO recommendation' }
        ],
        parentId: 'decision-product-001'
    };
    // Database choice from tech decision
    const dbDecision = {
        id: 'decision-db-001',
        title: 'PostgreSQL as Primary Database',
        status: 'created',
        date: '2024-03-10T10:00:00Z',
        rationale: 'ACID compliance needed for financial data, great ecosystem support',
        alternatives: ['MongoDB for flexibility', 'MySQL for simplicity', 'Multi-database approach'],
        assumptions: ['Relational data model fits our use case', 'Team familiar with SQL'],
        history: [
            { event: 'created', date: '2024-03-10T10:00:00Z' }
        ],
        parentId: 'decision-tech-001'
    };
    // Hiring decision - separate root
    const hiringDecision = {
        id: 'decision-hiring-001',
        title: 'Remote-First Team Structure',
        status: 'merged',
        date: '2024-01-10T12:00:00Z',
        rationale: 'Access to global talent pool, lower overhead costs',
        alternatives: ['Office-based team', 'Hybrid model', 'Distributed but time-zone aligned'],
        assumptions: ['Remote work productivity equals office work', 'Communication tools sufficient'],
        history: [
            { event: 'created', date: '2024-01-10T12:00:00Z' },
            { event: 'merged', date: '2024-01-12T15:00:00Z', reason: 'Unanimous team vote' }
        ]
    };
    // Engineering hiring from remote decision
    const engineeringHiring = {
        id: 'decision-eng-hiring-001',
        title: 'Hire Senior Full-Stack Engineers',
        status: 'merged',
        date: '2024-02-20T09:00:00Z',
        rationale: 'Need experienced developers who can work across the stack independently',
        alternatives: ['Separate frontend/backend specialists', 'Junior developers with mentoring', 'Contractors only'],
        assumptions: ['Full-stack engineers more efficient for small team', 'Senior talent available remotely'],
        history: [
            { event: 'created', date: '2024-02-20T09:00:00Z' },
            { event: 'merged', date: '2024-02-25T11:00:00Z', reason: 'Budget approved' }
        ],
        parentId: 'decision-hiring-001'
    };
    // Create all decisions
    const decisions = [
        productStrategy, pricingDecision, marketingDecision, pricingFork,
        techDecision, dbDecision, hiringDecision, engineeringHiring
    ];
    decisions.forEach(decision => {
        db.createDecision(decision);
    });
    // Create relationships
    const relationships = [
        { id: 'rel-001', parentId: 'decision-product-001', childId: 'decision-pricing-001', type: 'branch' },
        { id: 'rel-002', parentId: 'decision-product-001', childId: 'decision-marketing-001', type: 'branch' },
        { id: 'rel-003', parentId: 'decision-product-001', childId: 'decision-tech-001', type: 'branch' },
        { id: 'rel-004', parentId: 'decision-pricing-001', childId: 'decision-pricing-fork-001', type: 'fork', reason: 'Competitive pressure' },
        { id: 'rel-005', parentId: 'decision-tech-001', childId: 'decision-db-001', type: 'branch' },
        { id: 'rel-006', parentId: 'decision-hiring-001', childId: 'decision-eng-hiring-001', type: 'branch' }
    ];
    relationships.forEach(rel => {
        db.createRelationship(rel);
    });
    console.log('Database setup complete!');
    console.log(`Created ${decisions.length} decisions with ${relationships.length} relationships`);
    console.log('Sample decision tree includes: Product Strategy → Pricing/Marketing/Tech branches');
    db.close();
}
setupDatabase();
//# sourceMappingURL=setup-db.js.map