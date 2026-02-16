import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface DBProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  age: number | null;
  address: string | null;
  contact: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DBRequest {
  id: string;
  resident_id: string;
  resident_name: string;
  certificate_type: string;
  purpose: string;
  notes: string | null;
  status: string;
  valid_id_url: string | null;
  date_requested: string;
  date_processed: string | null;
  created_at: string;
}

export interface DBStatusHistory {
  id: string;
  request_id: string;
  status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

interface DataContextType {
  residents: DBProfile[];
  requests: DBRequest[];
  loading: boolean;
  addRequest: (req: { certificateType: string; purpose: string; residentName: string; residentId: string }) => Promise<void>;
  updateRequestStatus: (id: string, status: string) => Promise<void>;
  getResidentRequests: (residentId: string) => DBRequest[];
  getRequestHistory: (requestId: string) => Promise<DBStatusHistory[]>;
  getPendingCount: () => number;
  getTotalResidents: () => number;
  updateProfile: (userId: string, data: Partial<DBProfile>) => Promise<void>;
  approveResident: (userId: string) => Promise<void>;
  deleteResident: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [residents, setResidents] = useState<DBProfile[]>([]);
  const [requests, setRequests] = useState<DBRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    const [profilesRes, requestsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('certificate_requests').select('*').order('date_requested', { ascending: false }),
    ]);

    if (profilesRes.data) setResidents(profilesRes.data as DBProfile[]);
    if (requestsRes.data) setRequests(requestsRes.data as DBRequest[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for certificate_requests
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificate_requests' }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  const addRequest = async (req: { certificateType: string; purpose: string; residentName: string; residentId: string }) => {
    await supabase.from('certificate_requests').insert({
      resident_id: req.residentId,
      resident_name: req.residentName,
      certificate_type: req.certificateType as any,
      purpose: req.purpose,
      status: 'Pending' as const,
    });
    await fetchData();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await supabase.from('certificate_requests').update({
      status: status as any,
      date_processed: new Date().toISOString(),
    }).eq('id', id);
    await fetchData();
  };

  const getResidentRequests = (residentId: string) => {
    return requests.filter(r => r.resident_id === residentId);
  };

  const getRequestHistory = async (requestId: string): Promise<DBStatusHistory[]> => {
    const { data } = await supabase
      .from('request_status_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    return (data || []) as DBStatusHistory[];
  };

  const getPendingCount = () => requests.filter(r => r.status === 'Pending').length;
  const getTotalResidents = () => residents.filter(r => r.status === 'Active').length;

  const updateProfile = async (userId: string, data: Partial<DBProfile>) => {
    await supabase.from('profiles').update(data).eq('user_id', userId);
    await fetchData();
  };

  const approveResident = async (userId: string) => {
    await supabase.from('profiles').update({ status: 'Active' }).eq('user_id', userId);
    await fetchData();
  };

  const deleteResident = async (userId: string) => {
    await supabase.from('profiles').delete().eq('user_id', userId);
    await fetchData();
  };

  return (
    <DataContext.Provider value={{
      residents, requests, loading, addRequest, updateRequestStatus,
      getResidentRequests, getRequestHistory, getPendingCount, getTotalResidents,
      updateProfile, approveResident, deleteResident, refreshData: fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
