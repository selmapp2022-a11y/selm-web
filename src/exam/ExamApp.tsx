import { Route, Routes } from 'react-router-dom';
import Chrome from './components/Chrome';
import GoalPage from './pages/GoalPage';
import TaskPage from './pages/TaskPage';
import ResultPage from './pages/ResultPage';

export default function ExamApp() {
  return (
    <Chrome>
      <Routes>
        <Route path="/" element={<GoalPage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<GoalPage />} />
      </Routes>
    </Chrome>
  );
}
