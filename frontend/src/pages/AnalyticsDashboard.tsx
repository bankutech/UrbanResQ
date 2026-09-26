import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sevRes, catRes, zoneRes, trendRes] = await Promise.all([
          api.get('/analytics/requests-by-severity'),
          api.get('/analytics/requests-by-category'),
          api.get('/analytics/requests-by-zone'),
          api.get('/analytics/resource-consumption-trend')
        ]);
        
        setSeverityData(sevRes.data);
        setCategoryData(catRes.data);
        setZoneData(zoneRes.data);
        
        // Map trend data to numerical values
        const mappedTrend = trendRes.data.map((item: any) => ({
          date: item.day,
          allocated: Number(item.consumed)
        }));
        setTrendData(mappedTrend);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-eoc-muted">Loading Analytics...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-eoc-text">Analytics & Reporting Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Severity Pie Chart */}
        <div className="bg-[#111] border border-white/[0.1] p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-eoc-text">Requests by Severity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="count"
                nameKey="urgency"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#3b82f6"
                label
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#f3f4f6' }} />
              <Legend wrapperStyle={{ color: '#f3f4f6' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-[#111] border border-white/[0.1] p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-eoc-text">Requests by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#22c55e"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#f3f4f6' }} />
              <Legend wrapperStyle={{ color: '#f3f4f6' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Zone Bar Chart */}
        <div className="bg-[#111] border border-white/[0.1] p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-eoc-text">Requests by Zone</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="zone_name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#f3f4f6' }} />
              <Legend wrapperStyle={{ color: '#f3f4f6' }} />
              <Bar dataKey="unresolved_count" fill="#3b82f6" name="Request Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consumption Trend Line Chart */}
        <div className="bg-[#111] border border-white/[0.1] p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-eoc-text">Resource Allocation Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#f3f4f6' }} />
              <Legend wrapperStyle={{ color: '#f3f4f6' }} />
              <Line type="monotone" dataKey="allocated" stroke="#22c55e" name="Units Allocated" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
