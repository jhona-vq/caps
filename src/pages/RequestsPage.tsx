import React, { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import Topbar from '@/components/Topbar';
import { useData, DBRequest } from '@/context/DataContext';
import { format } from 'date-fns';

const RequestsPage: React.FC = () => {
  const { requests, updateRequestStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DBRequest | null>(null);

  const filteredRequests = requests.filter(
    (r) =>
      r.resident_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.certificate_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: 'bg-warning text-warning-foreground',
      Approved: 'bg-success text-success-foreground',
      Denied: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  return (
    <div>
      <Topbar searchPlaceholder="Search requests..." onSearch={setSearchTerm} />

      <Card>
        <CardHeader>
          <CardTitle>Certificate Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>REQUEST ID</TableHead>
                <TableHead>RESIDENT</TableHead>
                <TableHead>CERTIFICATE TYPE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">REQ-{request.id.slice(0, 6).toUpperCase()}</TableCell>
                  <TableCell>{request.resident_name}</TableCell>
                  <TableCell>{request.certificate_type}</TableCell>
                  <TableCell>{format(new Date(request.date_requested), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Request Details</DialogTitle></DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Request ID</p>
                                  <p className="font-medium">REQ-{selectedRequest.id.slice(0, 6).toUpperCase()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Resident Name</p>
                                  <p className="font-medium">{selectedRequest.resident_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Certificate Type</p>
                                  <p className="font-medium">{selectedRequest.certificate_type}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Purpose</p>
                                  <p className="font-medium">{selectedRequest.purpose}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Date Requested</p>
                                  <p className="font-medium">{format(new Date(selectedRequest.date_requested), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  {getStatusBadge(selectedRequest.status)}
                                </div>
                              </div>
                              {selectedRequest.status === 'Pending' && (
                                <div className="flex justify-center gap-4 pt-4">
                                  <Button
                                    onClick={async () => {
                                      await updateRequestStatus(selectedRequest.id, 'Approved');
                                      setSelectedRequest({ ...selectedRequest, status: 'Approved' });
                                    }}
                                    className="bg-success hover:bg-success/90"
                                  >
                                    <Check className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      await updateRequestStatus(selectedRequest.id, 'Denied');
                                      setSelectedRequest({ ...selectedRequest, status: 'Denied' });
                                    }}
                                  >
                                    <X className="mr-2 h-4 w-4" /> Deny
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {request.status === 'Pending' && (
                        <>
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => updateRequestStatus(request.id, 'Approved')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(request.id, 'Denied')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestsPage;
