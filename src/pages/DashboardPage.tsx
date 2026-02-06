import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  Users, 
  Award,
  FileText,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Topbar from '@/components/Topbar';
import { useData } from '@/context/DataContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const weeklyData = [
  { name: 'Mon', requests: 4 },
  { name: 'Tue', requests: 3 },
  { name: 'Wed', requests: 6 },
  { name: 'Thu', requests: 2 },
  { name: 'Fri', requests: 5 },
  { name: 'Sat', requests: 1 },
  { name: 'Sun', requests: 0 },
];

const pieData = [
  { name: 'Barangay Clearance', value: 40, color: '#1a4de8' },
  { name: 'Certificate of Indigency', value: 25, color: '#0ab59e' },
  { name: 'Certificate of Residency', value: 20, color: '#ffc107' },
  { name: 'Business Permit', value: 15, color: '#6f42c1' },
];

const DashboardPage: React.FC = () => {
  const { getPendingCount, getTotalResidents, requests, notifications } = useData();

  const pendingCount = getPendingCount();
  const totalResidents = getTotalResidents();
  const approvedToday = requests.filter(r => 
    r.status === 'Approved' && 
    r.dateProcessed && 
    new Date(r.dateProcessed).toDateString() === new Date().toDateString()
  ).length;
  const totalCertificates = requests.filter(r => r.status === 'Approved').length;

  const recentActivities = [
    {
      icon: FileText,
      name: 'New Certificate Request',
      description: 'Juan Dela Cruz requested Barangay Clearance',
      date: '2 hours ago',
    },
    {
      icon: CheckCircle,
      name: 'Request Approved',
      description: 'Certificate of Indigency for Maria Santos approved',
      date: '1 day ago',
    },
    {
      icon: UserPlus,
      name: 'New Resident Signup',
      description: 'Pedro Reyes signed up and is pending approval',
      date: '2 days ago',
    },
  ];

  return (
    <div>
      <Topbar searchPlaceholder="Search..." />
      
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h2>

      {/* Stats Cards */}
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
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
              <p className="text-3xl font-bold">{totalCertificates}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Weekly Request Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#1a4de8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Certificate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 py-4 border-b last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <activity.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
