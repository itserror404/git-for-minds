import { Decision, DecisionRelationship } from '../types.js';
import { DecisionDatabase } from '../database.js';

export class AssumptionAgent {
  private db: DecisionDatabase;

  constructor(database: DecisionDatabase) {
    this.db = database;
  }

  // Check if new information contradicts existing assumptions
  checkAssumptions(newInformation: string): AssumptionViolation[] {
    const violations: AssumptionViolation[] = [];
    const decisions = this.db.getAllDecisions();

    for (const decision of decisions) {
      if (decision.status !== 'merged') continue; // Only check active decisions

      for (const assumption of decision.assumptions) {
        if (this.isAssumptionViolated(assumption, newInformation)) {
          violations.push({
            decisionId: decision.id,
            assumption,
            newInformation,
            severity: this.calculateSeverity(assumption, newInformation)
          });
        }
      }
    }

    return violations;
  }

  // Create fork decisions for violated assumptions
  async createForksForViolations(violations: AssumptionViolation[]): Promise<Decision[]> {
    const forkedDecisions: Decision[] = [];

    for (const violation of violations) {
      const originalDecision = this.db.getDecision(violation.decisionId);
      if (!originalDecision) continue;

      const forkId = this.generateId();
      const forkedDecision: Decision = {
        id: forkId,
        title: `Reconsider: ${originalDecision.title}`,
        status: 'forked',
        date: new Date().toISOString(),
        rationale: `Original assumption "${violation.assumption}" may no longer be valid. New information: "${violation.newInformation}"`,
        alternatives: [...originalDecision.alternatives],
        assumptions: [violation.newInformation], // New assumption based on updated info
        history: [
          {
            event: 'forked',
            date: new Date().toISOString(),
            reason: `Assumption violated: ${violation.assumption}`
          }
        ],
        parentId: originalDecision.id
      };

      // Create the forked decision
      this.db.createDecision(forkedDecision);

      // Create relationship
      const relationship: DecisionRelationship = {
        id: this.generateId(),
        parentId: originalDecision.id,
        childId: forkId,
        type: 'fork',
        reason: `Assumption violated: ${violation.assumption}`
      };

      this.db.createRelationship(relationship);
      forkedDecisions.push(forkedDecision);
    }

    return forkedDecisions;
  }

  // Check if an assumption is violated by new information
  private isAssumptionViolated(assumption: string, newInfo: string): boolean {
    // Extract key terms from assumption and new information
    const assumptionTerms = this.extractKeyTerms(assumption);
    const newInfoTerms = this.extractKeyTerms(newInfo);

    // Look for contradictory information about the same entity
    for (const term of assumptionTerms) {
      if (newInfoTerms.includes(term)) {
        // Same entity mentioned - check for conflicting values
        const assumptionValue = this.extractValue(assumption, term);
        const newInfoValue = this.extractValue(newInfo, term);

        if (assumptionValue && newInfoValue && assumptionValue !== newInfoValue) {
          return true;
        }
      }
    }

    return false;
  }

  // Extract key terms (company names, product names, etc.)
  private extractKeyTerms(text: string): string[] {
    // Simple extraction - look for capitalized words (company names)
    const terms = text.match(/[A-Z][a-zA-Z]+/g) || [];
    return terms.map(term => term.toLowerCase());
  }

  // Extract monetary or numeric values associated with a term
  private extractValue(text: string, term: string): string | null {
    const termRegex = new RegExp(`${term}[^\\d]*([\\$\\d\\.]+)`, 'i');
    const match = text.match(termRegex);
    return match ? match[1] : null;
  }

  // Calculate severity of assumption violation
  private calculateSeverity(assumption: string, newInfo: string): 'low' | 'medium' | 'high' {
    // Simple heuristic based on presence of monetary values
    if (assumption.includes('$') || newInfo.includes('$')) {
      return 'high'; // Financial assumptions are critical
    }
    
    if (assumption.includes('competitor') || assumption.includes('market')) {
      return 'medium'; // Market assumptions are important
    }

    return 'low';
  }

  // Process new input and automatically create forks if needed
  async processNewInput(input: string): Promise<{
    violations: AssumptionViolation[],
    forkedDecisions: Decision[]
  }> {
    const violations = this.checkAssumptions(input);
    const forkedDecisions = await this.createForksForViolations(violations);

    return { violations, forkedDecisions };
  }

  private generateId(): string {
    return 'assumption-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export interface AssumptionViolation {
  decisionId: string;
  assumption: string;
  newInformation: string;
  severity: 'low' | 'medium' | 'high';
} 