import { Decision, DecisionRelationship } from './types.js';
export declare class DecisionDatabase {
    private db;
    constructor(dbPath?: string);
    private initTables;
    createDecision(decision: Decision): void;
    getDecision(id: string): Decision | null;
    getAllDecisions(): Decision[];
    updateDecision(decision: Decision): void;
    createRelationship(relationship: DecisionRelationship): void;
    getChildDecisions(parentId: string): Decision[];
    close(): void;
}
//# sourceMappingURL=database.d.ts.map