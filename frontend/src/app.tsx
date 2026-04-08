import { Routes, Route, Navigate } from 'react-router';
import { Layout } from '@/components/layout/layout';
import Dashboard from '@/routes/dashboard';
import Traces from '@/routes/traces';
import TraceDetail from '@/routes/trace-detail';
import Metrics from '@/routes/metrics';
import MetricDetail from '@/routes/metric-detail';
import Logs from '@/routes/logs';
import NotFound from '@/routes/not-found';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="traces" element={<Traces />} />
        <Route path="traces/:traceId" element={<TraceDetail />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="metrics/:name" element={<MetricDetail />} />
        <Route path="logs" element={<Logs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
