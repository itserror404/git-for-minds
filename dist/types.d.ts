export interface Decision {
    id: string;
    title: string;
    status: 'created' | 'merged' | 'forked';
    date: string;
    rationale: string;
    alternatives: string[];
    assumptions: string[];
    history: DecisionEvent[];
    parentId?: string;
}
export interface DecisionEvent {
    event: 'created' | 'merged' | 'forked';
    date: string;
    reason?: string;
}
export interface DecisionRelationship {
    id: string;
    parentId: string;
    childId: string;
    type: 'branch' | 'fork';
    reason?: string;
}
export interface CaptureResult {
    decision: Partial<Decision>;
    confidence: number;
}
//# sourceMappingURL=types.d.ts.map