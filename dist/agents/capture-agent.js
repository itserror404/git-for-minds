"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureAgent = void 0;
class CaptureAgent {
    constructor(apiKey) {
        this.openaiApiKey = apiKey || process.env.OPENAI_API_KEY || '';
    }
    // Parse text into a decision structure
    async parseDecision(rawText) {
        // Simple regex-based parsing for now
        const regexResult = this.parseWithRegex(rawText);
        // If we have an API key, enhance with LLM
        if (this.openaiApiKey) {
            try {
                return await this.parseWithLLM(rawText);
            }
            catch (error) {
                console.warn('LLM parsing failed, falling back to regex:', error);
                return regexResult;
            }
        }
        return regexResult;
    }
    // Simple regex-based parsing
    parseWithRegex(text) {
        const decision = {
            title: '',
            rationale: text,
            alternatives: [],
            assumptions: []
        };
        // Extract pricing decisions
        const pricingMatch = text.match(/(?:set|price|pricing).*?(\$\d+(?:\.\d{2})?)/i);
        if (pricingMatch) {
            decision.title = `Set pricing at ${pricingMatch[1]}`;
        }
        // Extract alternatives
        const alternativesMatch = text.match(/alternatives?(?:\s+are)?:?\s*([^.]+)/i);
        if (alternativesMatch) {
            decision.alternatives = alternativesMatch[1]
                .split(/,|\sor\s/)
                .map(alt => alt.trim())
                .filter(alt => alt);
        }
        // Extract assumptions (look for competitor references)
        const competitorMatch = text.match(/(\w+)\s*(?:=|\$|costs?)\s*(\$?\d+)/gi);
        if (competitorMatch) {
            decision.assumptions = competitorMatch.map(match => match.trim());
        }
        // Generic title extraction if no specific pattern found
        if (!decision.title) {
            const firstSentence = text.split(/[.!?]/)[0];
            decision.title = firstSentence.length > 50
                ? firstSentence.substring(0, 47) + '...'
                : firstSentence;
        }
        return {
            decision,
            confidence: this.calculateConfidence(decision, text)
        };
    }
    // Enhanced LLM-based parsing
    async parseWithLLM(text) {
        const prompt = `
Extract a structured decision from this text. Return JSON with:
- title: Short decision title
- rationale: Why this decision was made
- alternatives: Array of alternative options mentioned
- assumptions: Array of assumptions or facts mentioned

Text: "${text}"

Return only valid JSON.`;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 500
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content in OpenAI response');
        }
        try {
            const parsed = JSON.parse(content);
            return {
                decision: {
                    title: parsed.title || 'Untitled Decision',
                    rationale: parsed.rationale || text,
                    alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
                    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : []
                },
                confidence: 0.8
            };
        }
        catch (error) {
            throw new Error('Failed to parse LLM response as JSON');
        }
    }
    // Calculate confidence score based on extracted information
    calculateConfidence(decision, originalText) {
        let confidence = 0.3; // Base confidence
        if (decision.title && decision.title.length > 5)
            confidence += 0.2;
        if (decision.alternatives && decision.alternatives.length > 0)
            confidence += 0.2;
        if (decision.assumptions && decision.assumptions.length > 0)
            confidence += 0.2;
        if (originalText.length > 20)
            confidence += 0.1;
        return Math.min(confidence, 1.0);
    }
    // Detect if text contains a decision
    isDecisionText(text) {
        const decisionKeywords = [
            'decide', 'decision', 'choose', 'set', 'price', 'pricing',
            'go with', 'pick', 'select', 'opt for', 'alternatives'
        ];
        return decisionKeywords.some(keyword => text.toLowerCase().includes(keyword));
    }
}
exports.CaptureAgent = CaptureAgent;
//# sourceMappingURL=capture-agent.js.map