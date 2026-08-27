import { Route, Routes } from 'react-router-dom';
import Chrome from './components/Chrome';
import GoalPage from './pages/GoalPage';
import TaskPage from './pages/TaskPage';
import ResultPage from './pages/ResultPage';
import SectionPage from './pages/SectionPage';
import SittingResultPage from './pages/SittingResultPage';
import HistoryPage from './pages/HistoryPage';

export default function ExamApp() {
  return (
    <Chrome>
      <Routes>
        <Route path="/" element={<GoalPage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/section" element={<SectionPage />} />
        <Route path="/sitting-result" element={<SittingResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<GoalPage />} />
      </Routes>
    </Chrome>
  );
}
