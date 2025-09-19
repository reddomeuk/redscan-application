// SecurityTrainingService.js
// Backend service for Security Training & Awareness

class SecurityTrainingService {
  constructor() {
    this.modules = [];
    this.users = [];
    this.phishingSimulations = [];
    this.compliance = [];
    this.leaderboard = [];
    this.cultureMetrics = [];
    this.events = [];
  }

  getTrainingModules() {
    // Return all training modules
    return this.modules;
  }

  getUserProgress(userId) {
    // Return user progress by ID
    return this.users.find(u => u.id === userId);
  }

  getPhishingSimulations() {
    return this.phishingSimulations;
  }

  getComplianceMetrics() {
    return this.compliance;
  }

  getLeaderboard() {
    return this.leaderboard;
  }

  getCultureMetrics() {
    return this.cultureMetrics;
  }

  getRecentEvents(limit = 50) {
    return this.events.slice(0, limit);
  }

  addModule(module) {
    this.modules.push(module);
  }

  addUser(user) {
    this.users.push(user);
  }

  addPhishingSimulation(sim) {
    this.phishingSimulations.push(sim);
  }

  addEvent(event) {
    this.events.unshift(event);
  }

  updateUserProgress(userId, update) {
    const user = this.users.find(u => u.id === userId);
    if (user) Object.assign(user, update);
  }

  assignTraining(userId, moduleId) {
    // Assign a training module to a user
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.assignedModules = user.assignedModules || [];
      user.assignedModules.push(moduleId);
    }
  }

  recordPhishingResult(userId, result) {
    // Record phishing simulation result for user
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.phishingResults = user.phishingResults || [];
      user.phishingResults.push(result);
    }
  }
}

const securityTrainingService = new SecurityTrainingService();
export default securityTrainingService;