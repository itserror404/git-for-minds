"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class DecisionDatabase {
    constructor(dbPath = 'decisions.db') {
        this.db = new better_sqlite3_1.default(dbPath);
        this.initTables();
    }
    initTables() {
        // Decisions table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL,
        rationale TEXT NOT NULL,
        alternatives TEXT NOT NULL, -- JSON array
        assumptions TEXT NOT NULL,  -- JSON array
        history TEXT NOT NULL,      -- JSON array
        parent_id TEXT,
        FOREIGN KEY (parent_id) REFERENCES decisions(id)
      )
    `);
        // Decision relationships table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_relationships (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        child_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (parent_id) REFERENCES decisions(id),
        FOREIGN KEY (child_id) REFERENCES decisions(id)
      )
    `);
    }
    createDecision(decision) {
        const stmt = this.db.prepare(`
      INSERT INTO decisions (id, title, status, date, rationale, alternatives, assumptions, history, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(decision.id, decision.title, decision.status, decision.date, decision.rationale, JSON.stringify(decision.alternatives), JSON.stringify(decision.assumptions), JSON.stringify(decision.history), decision.parentId || null);
    }
    getDecision(id) {
        const stmt = this.db.prepare('SELECT * FROM decisions WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return {
            id: row.id,
            title: row.title,
            status: row.status,
            date: row.date,
            rationale: row.rationale,
            alternatives: JSON.parse(row.alternatives),
            assumptions: JSON.parse(row.assumptions),
            history: JSON.parse(row.history),
            parentId: row.parent_id
        };
    }
    getAllDecisions() {
        const stmt = this.db.prepare('SELECT * FROM decisions ORDER BY date DESC');
        const rows = stmt.all();
        return rows.map(row => ({
            id: row.id,
            title: row.title,
            status: row.status,
            date: row.date,
            rationale: row.rationale,
            alternatives: JSON.parse(row.alternatives),
            assumptions: JSON.parse(row.assumptions),
            history: JSON.parse(row.history),
            parentId: row.parent_id
        }));
    }
    updateDecision(decision) {
        const stmt = this.db.prepare(`
      UPDATE decisions 
      SET title = ?, status = ?, rationale = ?, alternatives = ?, assumptions = ?, history = ?
      WHERE id = ?
    `);
        stmt.run(decision.title, decision.status, decision.rationale, JSON.stringify(decision.alternatives), JSON.stringify(decision.assumptions), JSON.stringify(decision.history), decision.id);
    }
    createRelationship(relationship) {
        const stmt = this.db.prepare(`
      INSERT INTO decision_relationships (id, parent_id, child_id, type, reason)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(relationship.id, relationship.parentId, relationship.childId, relationship.type, relationship.reason || null);
    }
    getChildDecisions(parentId) {
        const stmt = this.db.prepare(`
      SELECT d.* FROM decisions d
      JOIN decision_relationships r ON d.id = r.child_id
      WHERE r.parent_id = ?
    `);
        const rows = stmt.all(parentId);
        return rows.map(row => ({
            id: row.id,
            title: row.title,
            status: row.status,
            date: row.date,
            rationale: row.rationale,
            alternatives: JSON.parse(row.alternatives),
            assumptions: JSON.parse(row.assumptions),
            history: JSON.parse(row.history),
            parentId: row.parent_id
        }));
    }
    close() {
        this.db.close();
    }
}
exports.DecisionDatabase = DecisionDatabase;
//# sourceMappingURL=database.js.map