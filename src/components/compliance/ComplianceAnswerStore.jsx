// Centralized state management for compliance answers
class ComplianceAnswerStore {
  constructor() {
    this.answers = new Map();
    this.listeners = new Set();
    this.saveTimeouts = new Map();
  }

  getAnswer(framework, questionId) {
    const key = `${framework}-${questionId}`;
    return this.answers.get(key) || { value: '', note: '', saved: true };
  }

  setAnswer(framework, questionId, value, note = '') {
    const key = `${framework}-${questionId}`;
    const answer = { value, note, saved: false, updatedAt: new Date().toISOString() };
    
    this.answers.set(key, answer);
    this.notifyListeners();
    
    // Debounced auto-save
    if (this.saveTimeouts.has(key)) {
      clearTimeout(this.saveTimeouts.get(key));
    }
    
    const timeout = setTimeout(() => {
      this.saveAnswer(framework, questionId, value, note);
    }, 800);
    
    this.saveTimeouts.set(key, timeout);
  }

  async saveAnswer(framework, questionId, value, note) {
    const key = `${framework}-${questionId}`;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const answer = this.answers.get(key);
      if (answer) {
        answer.saved = true;
        this.answers.set(key, answer);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to save answer:', error);
      const answer = this.answers.get(key);
      if (answer) {
        answer.saveError = error.message;
        this.answers.set(key, answer);
        this.notifyListeners();
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  hasUnsavedChanges(framework) {
    for (const [key, answer] of this.answers.entries()) {
      if (key.startsWith(`${framework}-`) && !answer.saved) {
        return true;
      }
    }
    return false;
  }
}

export const complianceStore = new ComplianceAnswerStore();