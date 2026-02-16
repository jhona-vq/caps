import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, X, FileText, Sun, Moon, Clock, CheckCircle, XCircle } from 'lucide-react';
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
import { useData, DBStatusHistory } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';

const CERTIFICATE_TYPES = [
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Certificate of Low Income',
  'Oath of Undertaking',
  'Business Permit',
];

const CERTIFICATE_DESCRIPTIONS: Record<string, string> = {
  'Barangay Clearance': 'Official document certifying that a resident has no derogatory record in the barangay.',
  'Certificate of Indigency': 'Certifies that a resident belongs to an indigent family.',
  'Certificate of Residency': 'Confirms that a person is a bonafide resident of the barangay.',
  'Certificate of Low Income': 'Certifies that a resident belongs to a low-income household.',
  'Oath of Undertaking': 'A sworn statement by a resident undertaking responsibility for a specific matter.',
  'Business Permit': 'Authorization to operate a business within the barangay.',
};

const ResidentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addRequest, getResidentRequests, getRequestHistory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateType, setCertificateType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [validIdFile, setValidIdFile] = useState<File | null>(null);
  const [validIdPreview, setValidIdPreview] = useState('');
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timelineRequestId, setTimelineRequestId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<DBStatusHistory[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const residentName = profile ? `${profile.first_name} ${profile.middle_name || ''} ${profile.last_name}`.trim() : '';
  const myRequests = user ? getResidentRequests(user.id) : [];

  const handleLogout = async () => {
    await logout();
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

  const removeFile = () => { setValidIdFile(null); setValidIdPreview(''); };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateType || !user) return;
    setIsSubmitting(true);

    await addRequest({
      residentId: user.id,
      residentName,
      certificateType,
      purpose,
    });

    setCertificateType(''); setPurpose('');
    setValidIdFile(null); setValidIdPreview('');
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const openTimeline = async (requestId: string) => {
    setTimelineRequestId(requestId);
    setTimelineLoading(true);
    const history = await getRequestHistory(requestId);
    setTimeline(history);
    setTimelineLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: 'bg-warning text-warning-foreground',
      Approved: 'bg-success text-success-foreground',
      Denied: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Denied': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="bg-card shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center">
            <img src={logo} alt="Barangay Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-lg text-primary">Palma-Urbano Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="text-right">
            <p className="font-semibold text-foreground">{residentName}</p>
            <p className="text-sm text-muted-foreground">Resident</p>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {profile?.first_name || 'Resident'}!</h1>
              <p className="text-muted-foreground">Manage your certificate requests here.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild><Button>Apply for New Certificate</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Apply for a Certificate</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <Label>Certificate Type</Label>
                    <Select value={certificateType} onValueChange={setCertificateType}>
                      <SelectTrigger><SelectValue placeholder="Select certificate type" /></SelectTrigger>
                      <SelectContent>
                        {CERTIFICATE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {certificateType && (
                    <>
                      <div className="rounded-lg border bg-muted/50 p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => setIsSampleOpen(true)}>
                        <div className="w-16 h-20 rounded-md bg-primary/10 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0">
                          <FileText className="h-8 w-8 text-primary" />
                          <span className="text-[8px] text-primary font-semibold mt-1">SAMPLE</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{certificateType}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{CERTIFICATE_DESCRIPTIONS[certificateType]}</p>
                          <p className="text-xs text-primary mt-2 font-medium">Click to view sample →</p>
                        </div>
                      </div>

                      <Dialog open={isSampleOpen} onOpenChange={setIsSampleOpen}>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>{certificateType} — Sample Preview</DialogTitle></DialogHeader>
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-full aspect-[8.5/11] rounded-lg border-2 border-primary/20 bg-card p-6 flex flex-col items-center text-center">
                              <div className="w-16 h-16 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center mb-3">
                                <img src={logo} alt="Barangay Logo" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Republic of the Philippines</p>
                              <p className="text-[10px] text-muted-foreground">Province / City / Municipality</p>
                              <p className="text-xs font-bold text-primary mt-1">Barangay Palma-Urbano</p>
                              <div className="w-16 border-t border-primary/30 my-3" />
                              <p className="text-sm font-bold text-foreground uppercase tracking-wide">{certificateType}</p>
                              <div className="mt-4 text-left w-full space-y-2 text-xs text-muted-foreground">
                                <p>TO WHOM IT MAY CONCERN:</p>
                                <p className="leading-relaxed">This is to certify that <span className="font-semibold text-foreground">JUAN DELA CRUZ</span>, of legal age, Filipino, and a resident of Barangay Palma-Urbano...</p>
                                <p className="leading-relaxed">{CERTIFICATE_DESCRIPTIONS[certificateType]}</p>
                              </div>
                              <div className="mt-auto pt-6 w-full flex justify-end">
                                <div className="text-center">
                                  <div className="w-32 border-t border-foreground/50 mb-1" />
                                  <p className="text-[10px] text-muted-foreground">Barangay Captain</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic">This is a sample preview only.</p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <hr />
                      <div>
                        <h4 className="font-semibold mb-3">Applicant Details</h4>
                        <div className="space-y-3">
                          <div><Label>Full Name</Label><Input value={residentName} disabled /></div>
                          <div><Label>Address</Label><Input value={profile?.address || ''} disabled /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>Age</Label><Input value={profile?.age || ''} disabled /></div>
                            <div><Label>Contact Number</Label><Input value={profile?.contact || ''} disabled /></div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div>
                        <h4 className="font-semibold mb-3">Additional Details</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Purpose</Label>
                            <Textarea placeholder="e.g., For job application..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
                          </div>
                          <div>
                            <Label>Upload Photo of Your Valid ID</Label>
                            {!validIdPreview ? (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mt-1">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">Click to upload your valid ID</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              </label>
                            ) : (
                              <div className="relative mt-1">
                                <img src={validIdPreview} alt="Valid ID Preview" className="w-full h-40 object-contain rounded-lg border" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={removeFile}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader><CardTitle>My Certificate Requests</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Certificate Type</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.length > 0 ? (
                  myRequests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{request.certificate_type}</TableCell>
                      <TableCell>{format(new Date(request.date_requested), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.purpose}</TableCell>
                      <TableCell>
                        <Dialog open={timelineRequestId === request.id} onOpenChange={(open) => !open && setTimelineRequestId(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openTimeline(request.id)}>
                              <Clock className="h-3 w-3 mr-1" /> Track
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader><DialogTitle>Request Timeline</DialogTitle></DialogHeader>
                            <div className="space-y-1">
                              {/* Initial submitted status */}
                              <div className="flex items-start gap-3 py-2">
                                <div className="mt-0.5"><Clock className="h-4 w-4 text-primary" /></div>
                                <div>
                                  <p className="text-sm font-medium">Submitted</p>
                                  <p className="text-xs text-muted-foreground">{format(new Date(request.date_requested), 'MMM dd, yyyy h:mm a')}</p>
                                </div>
                              </div>
                              {timelineLoading ? (
                                <p className="text-sm text-muted-foreground py-2">Loading...</p>
                              ) : (
                                timeline.map((entry) => (
                                  <div key={entry.id} className="flex items-start gap-3 py-2 border-t">
                                    <div className="mt-0.5">{getTimelineIcon(entry.status)}</div>
                                    <div>
                                      <p className="text-sm font-medium">{entry.status}</p>
                                      <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), 'MMM dd, yyyy h:mm a')}</p>
                                      {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                                    </div>
                                  </div>
                                ))
                              )}
                              {!timelineLoading && timeline.length === 0 && request.status !== 'Pending' && (
                                <div className="flex items-start gap-3 py-2 border-t">
                                  <div className="mt-0.5">{getTimelineIcon(request.status)}</div>
                                  <div>
                                    <p className="text-sm font-medium">{request.status}</p>
                                    {request.date_processed && (
                                      <p className="text-xs text-muted-foreground">{format(new Date(request.date_processed), 'MMM dd, yyyy h:mm a')}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
