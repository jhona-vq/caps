import React from 'react';
import { Clock, CheckCircle, Users, Award, FileText, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Topbar from '@/components/Topbar';
import { useData } from '@/context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const pieColors = ['#1a4de8', '#0ab59e', '#ffc107', '#6f42c1', '#ef4444', '#22c55e'];

const DashboardPage: React.FC = () => {
  const { getPendingCount, getTotalResidents, requests, residents } = useData();

  const pendingCount = getPendingCount();
  const totalResidents = getTotalResidents();
  const approvedToday = requests.filter(r =>
    r.status === 'Approved' && r.date_processed &&
    new Date(r.date_processed).toDateString() === new Date().toDateString()
  ).length;
  const totalCertificates = requests.filter(r => r.status === 'Approved').length;

  // Build certificate distribution from real data
  const certCounts: Record<string, number> = {};
  requests.forEach(r => { certCounts[r.certificate_type] = (certCounts[r.certificate_type] || 0) + 1; });
  const pieData = Object.entries(certCounts).map(([name, value], i) => ({
    name, value, color: pieColors[i % pieColors.length],
  }));

  // Recent activities from real data
  const recentRequests = requests.slice(0, 5);

  return (
    <div>
      <Topbar searchPlaceholder="Search..." />
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issued Today</p>
              <p className="text-3xl font-bold">{approvedToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Residents</p>
              <p className="text-3xl font-bold">{totalResidents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Award className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
              <p className="text-3xl font-bold">{totalCertificates}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base font-semibold">Certificate Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Recent Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.length > 0 ? recentRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{req.certificate_type}</p>
                  <p className="text-sm text-muted-foreground">{req.resident_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{format(new Date(req.date_requested), 'MMM dd, yyyy')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    req.status === 'Pending' ? 'bg-warning/20 text-warning' :
                    req.status === 'Approved' ? 'bg-success/20 text-success' :
                    'bg-destructive/20 text-destructive'
                  }`}>{req.status}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8">No requests yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
