import { Route, Routes } from 'react-router-dom';
import ExamLayout from './components/ExamLayout';
import ExamGate from './components/ExamGate';
import GoalPage from './pages/GoalPage';
import TaskPage from './pages/TaskPage';
import ResultPage from './pages/ResultPage';
import SectionPage from './pages/SectionPage';
import SittingResultPage from './pages/SittingResultPage';
import HistoryPage from './pages/HistoryPage';
import AttestationPage from './pages/AttestationPage';

export default function ExamApp() {
  return (
    <ExamLayout>
      <ExamGate>
      <Routes>
        <Route path="/" element={<GoalPage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/section" element={<SectionPage />} />
        <Route path="/sitting-result" element={<SittingResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/attestation" element={<AttestationPage />} />
        <Route path="*" element={<GoalPage />} />
      </Routes>
      </ExamGate>
    </ExamLayout>
  );
}
