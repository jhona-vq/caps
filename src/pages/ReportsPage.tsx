import React from 'react';
import { Home, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Topbar from '@/components/Topbar';
import { useData } from '@/context/DataContext';
import { format } from 'date-fns';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const certColors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#0ab59e'];

const ReportsPage: React.FC = () => {
  const { requests, residents } = useData();

  const approvedRequests = requests.filter(r => r.status === 'Approved');
  const totalHouseholds = Math.ceil(residents.filter(r => r.status === 'Active').length / 2);
  const totalResidents = residents.filter(r => r.status === 'Active').length;

  // Certificate type distribution from real data
  const certCounts: Record<string, number> = {};
  requests.forEach(r => { certCounts[r.certificate_type] = (certCounts[r.certificate_type] || 0) + 1; });
  const certificateTypeData = Object.entries(certCounts).map(([name, value], i) => ({
    name, value, color: certColors[i % certColors.length],
  }));

  return (
    <div>
      <Topbar searchPlaceholder="Search Reports..." />
      <h2 className="text-2xl font-bold text-foreground mb-6">Barangay Reports and Summaries</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Households</p>
              <p className="text-3xl font-bold">{totalHouseholds}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <Calendar className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requests Issued</p>
              <p className="text-3xl font-bold">{approvedRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center">
              <Users className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Population Count</p>
              <p className="text-3xl font-bold">{totalResidents}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {certificateTypeData.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base font-semibold">Certificate Types Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={certificateTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                    {certificateTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Log */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Detailed Certificate Issuance Log</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATE ISSUED</TableHead>
                <TableHead>CERTIFICATE TYPE</TableHead>
                <TableHead>RESIDENT</TableHead>
                <TableHead>PURPOSE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.date_processed
                      ? format(new Date(request.date_processed), 'MMM dd, yyyy')
                      : format(new Date(request.date_requested), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{request.certificate_type}</TableCell>
                  <TableCell>{request.resident_name}</TableCell>
                  <TableCell>{request.purpose}</TableCell>
                </TableRow>
              ))}
              {approvedRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No certificates issued yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
