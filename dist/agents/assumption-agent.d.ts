import { Decision } from '../types.js';
import { DecisionDatabase } from '../database.js';
export declare class AssumptionAgent {
    private db;
    constructor(database: DecisionDatabase);
    checkAssumptions(newInformation: string): AssumptionViolation[];
    createForksForViolations(violations: AssumptionViolation[]): Promise<Decision[]>;
    private isAssumptionViolated;
    private extractKeyTerms;
    private extractValue;
    private calculateSeverity;
    processNewInput(input: string): Promise<{
        violations: AssumptionViolation[];
        forkedDecisions: Decision[];
    }>;
    private generateId;
}
export interface AssumptionViolation {
    decisionId: string;
    assumption: string;
    newInformation: string;
    severity: 'low' | 'medium' | 'high';
}
//# sourceMappingURL=assumption-agent.d.ts.map