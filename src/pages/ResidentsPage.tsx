import React, { useState } from 'react';
import { Edit, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Topbar from '@/components/Topbar';
import { useData, DBProfile } from '@/context/DataContext';
import { cn } from '@/lib/utils';

const ResidentsPage: React.FC = () => {
  const { residents, updateProfile, deleteResident, approveResident } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResident, setEditingResident] = useState<DBProfile | null>(null);

  const [formData, setFormData] = useState({
    last_name: '', first_name: '', middle_name: '',
    age: '', address: '', contact: '',
  });

  const filteredResidents = residents.filter(
    (r) =>
      r.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (resident: DBProfile) => {
    setFormData({
      last_name: resident.last_name,
      first_name: resident.first_name,
      middle_name: resident.middle_name || '',
      age: resident.age?.toString() || '',
      address: resident.address || '',
      contact: resident.contact || '',
    });
    setEditingResident(resident);
  };

  const handleEditResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;
    await updateProfile(editingResident.user_id, {
      last_name: formData.last_name,
      first_name: formData.first_name,
      middle_name: formData.middle_name || null,
      age: parseInt(formData.age) || null,
      address: formData.address || null,
      contact: formData.contact || null,
    } as any);
    setEditingResident(null);
  };

  return (
    <div>
      <Topbar searchPlaceholder="Search residents..." onSearch={setSearchTerm} />

      <Card>
        <CardHeader>
          <CardTitle>Registered Residents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NAME</TableHead>
                <TableHead>AGE</TableHead>
                <TableHead>ADDRESS</TableHead>
                <TableHead>CONTACT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow
                  key={resident.id}
                  className={cn(resident.status === 'Pending Approval' && 'bg-warning/10 border-l-4 border-l-warning')}
                >
                  <TableCell className="font-medium">
                    {resident.first_name} {resident.middle_name || ''} {resident.last_name}
                  </TableCell>
                  <TableCell>{resident.age || '-'}</TableCell>
                  <TableCell>{resident.address || '-'}</TableCell>
                  <TableCell>{resident.contact || '-'}</TableCell>
                  <TableCell>
                    <Badge className={
                      resident.status === 'Active' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
                    }>{resident.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {resident.status === 'Pending Approval' && (
                        <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approveResident(resident.user_id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditModal(resident)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteResident(resident.user_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No residents found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>Showing {filteredResidents.length} of {residents.length} Results</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingResident} onOpenChange={(open) => !open && setEditingResident(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Resident</DialogTitle></DialogHeader>
          <form onSubmit={handleEditResident} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Last Name</Label><Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required /></div>
              <div><Label>First Name</Label><Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required /></div>
            </div>
            <div><Label>Middle Name</Label><Input value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
              <div><Label>Contact</Label><Input value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingResident(null)}>Cancel</Button>
              <Button type="submit">Update Resident</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidentsPage;
