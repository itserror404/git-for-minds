import { CaptureResult } from '../types.js';
export declare class CaptureAgent {
    private openaiApiKey;
    constructor(apiKey?: string);
    parseDecision(rawText: string): Promise<CaptureResult>;
    private parseWithRegex;
    private parseWithLLM;
    private calculateConfidence;
    isDecisionText(text: string): boolean;
}
//# sourceMappingURL=capture-agent.d.ts.map