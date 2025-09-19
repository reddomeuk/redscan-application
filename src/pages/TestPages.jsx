import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function TestDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Dashboard</h1>
      <p>This is a simple dashboard to test routing</p>
    </div>
  );
}

function PagesContent() {
  return (
    <Routes>
      <Route path="/" element={<TestDashboard />} />
      <Route path="/dashboard" element={<TestDashboard />} />
    </Routes>
  );
}

export default function TestPages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
