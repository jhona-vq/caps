import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { CertificateType, Resident, RequestStatus } from '@/types/barangay';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';

const CERTIFICATE_TYPES: CertificateType[] = [
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Certificate of Low Income',
  'Oath of Undertaking',
  'Business Permit',
];

const ResidentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { addRequest, getResidentRequests } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateType, setCertificateType] = useState<CertificateType | ''>('');
  const [purpose, setPurpose] = useState('');
  const [validIdFile, setValidIdFile] = useState<File | null>(null);
  const [validIdPreview, setValidIdPreview] = useState<string>('');

  const resident = currentUser as Resident;
  const residentName = `${resident.firstName} ${resident.middleName || ''} ${resident.lastName}`.trim();
  const myRequests = getResidentRequests(resident.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValidIdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setValidIdPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setValidIdFile(null);
    setValidIdPreview('');
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateType) return;

    addRequest({
      residentId: resident.id,
      residentName,
      certificateType: certificateType as CertificateType,
      purpose,
      status: 'Pending',
      validIdFile: validIdFile?.name,
    });

    setCertificateType('');
    setPurpose('');
    setValidIdFile(null);
    setValidIdPreview('');
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      Pending: 'bg-warning text-warning-foreground',
      Approved: 'bg-success text-success-foreground',
      Denied: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navbar */}
      <nav className="bg-card shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Barangay Logo" className="w-8 h-8 rounded-full" />
          <span className="font-semibold text-lg text-primary">Palma-Urbano Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-foreground">{residentName}</p>
            <p className="text-sm text-muted-foreground">Resident</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Welcome Card */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {resident.firstName}!</h1>
              <p className="text-muted-foreground">Manage your certificate requests here.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>Apply for New Certificate</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Apply for a Certificate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Applicant Details</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={residentName} disabled />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input value={resident.address} disabled />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Age</Label>
                          <Input value={resident.age} disabled />
                        </div>
                        <div>
                          <Label>Contact Number</Label>
                          <Input value={resident.contact} disabled />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div>
                    <h4 className="font-semibold mb-3">Request Details</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Certificate Type</Label>
                        <Select value={certificateType} onValueChange={(v) => setCertificateType(v as CertificateType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select certificate type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CERTIFICATE_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Purpose</Label>
                        <Textarea
                          placeholder="e.g., For job application, medical assistance, etc."
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Upload Photo of Your Valid ID</Label>
                        {!validIdPreview ? (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mt-1">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload your valid ID</span>
                            <span className="text-xs text-muted-foreground">(Any valid ID accepted)</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                        ) : (
                          <div className="relative mt-1">
                            <img src={validIdPreview} alt="Valid ID Preview" className="w-full h-40 object-contain rounded-lg border" />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={removeFile}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">{validIdFile?.name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle className="text-secondary-foreground">My Certificate Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-secondary-foreground/20">
                  <TableHead className="text-secondary-foreground/70">#</TableHead>
                  <TableHead className="text-secondary-foreground/70">Certificate Type</TableHead>
                  <TableHead className="text-secondary-foreground/70">Date Requested</TableHead>
                  <TableHead className="text-secondary-foreground/70">Status</TableHead>
                  <TableHead className="text-secondary-foreground/70">Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.length > 0 ? (
                  myRequests.map((request, index) => (
                    <TableRow key={request.id} className="border-secondary-foreground/20">
                      <TableCell className="text-secondary-foreground">{index + 1}</TableCell>
                      <TableCell className="text-secondary-foreground">{request.certificateType}</TableCell>
                      <TableCell className="text-secondary-foreground">
                        {format(new Date(request.dateRequested), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-secondary-foreground">{request.purpose}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-secondary-foreground/70 py-8">
                      You have not made any requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResidentPortal;
