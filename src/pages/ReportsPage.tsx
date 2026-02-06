import React from 'react';
import { Home, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Topbar from '@/components/Topbar';
import { useData } from '@/context/DataContext';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const ReportsPage: React.FC = () => {
  const { requests, residents } = useData();
  
  const approvedRequests = requests.filter(r => r.status === 'Approved');
  const totalHouseholds = Math.ceil(residents.filter(r => r.status === 'Active').length / 2); // Estimate
  const requestsYTD = approvedRequests.length;
  const totalResidents = residents.filter(r => r.status === 'Active').length;

  // Monthly data for chart
  const monthlyData = [
    { name: 'Jan', certificates: 5 },
    { name: 'Feb', certificates: 8 },
    { name: 'Mar', certificates: 12 },
    { name: 'Apr', certificates: 7 },
    { name: 'May', certificates: 10 },
    { name: 'Jun', certificates: 6 },
  ];

  return (
    <div>
      <Topbar searchPlaceholder="Search Reports..." />
      
      <h2 className="text-2xl font-bold text-foreground mb-6">Barangay Reports and Summaries</h2>

      {/* Stats Cards */}
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
              <p className="text-sm text-muted-foreground">Requests Issued (YTD)</p>
              <p className="text-3xl font-bold">{requestsYTD}</p>
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

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Monthly Certificate Issuance (2024)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="certificates" fill="#0ab59e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Detailed Certificate Issuance Log</CardTitle>
        </CardHeader>
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
                    {request.dateProcessed 
                      ? format(new Date(request.dateProcessed), 'MMM dd, yyyy')
                      : format(new Date(request.dateRequested), 'MMM dd, yyyy')
                    }
                  </TableCell>
                  <TableCell>{request.certificateType}</TableCell>
                  <TableCell>{request.residentName}</TableCell>
                  <TableCell>{request.purpose}</TableCell>
                </TableRow>
              ))}
              {approvedRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No certificates issued yet.
                  </TableCell>
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
