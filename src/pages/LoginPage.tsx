import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import logo from '@/assets/logo.png';

type AuthView = 'role-selection' | 'official-login' | 'resident-login' | 'resident-signup';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerResident } = useAuth();
  const { addResident } = useData();
  const [view, setView] = useState<AuthView>('role-selection');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form states
  const [signupData, setSignupData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    address: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password, 'official')) {
      navigate('/dashboard');
    } else {
      setError('Incorrect email or password.');
    }
  };

  const handleResidentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password, 'resident')) {
      navigate('/portal');
    } else {
      setError('Account not found or pending approval. Please sign up or contact the barangay staff.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const success = registerResident({
      lastName: signupData.lastName,
      firstName: signupData.firstName,
      middleName: signupData.middleName || undefined,
      age: parseInt(signupData.age),
      address: signupData.address,
      contact: signupData.contact,
      email: signupData.email,
      password: signupData.password,
    });

    if (success) {
      // Also add to DataContext
      addResident({
        lastName: signupData.lastName,
        firstName: signupData.firstName,
        middleName: signupData.middleName || undefined,
        age: parseInt(signupData.age),
        address: signupData.address,
        contact: signupData.contact,
        email: signupData.email,
        password: signupData.password,
        status: 'Pending Approval',
      });
      
      setSuccess('Sign up successful! Please wait for approval from the barangay official.');
      setTimeout(() => {
        setView('resident-login');
        setSuccess('');
      }, 2000);
    } else {
      setError('An account with this email already exists.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setSignupData({
      lastName: '',
      firstName: '',
      middleName: '',
      age: '',
      address: '',
      contact: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const goBack = () => {
    resetForm();
    setView('role-selection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Role Selection */}
      {view === 'role-selection' && (
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Barangay Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            <h1 className="text-xl font-bold text-foreground">Barangay Palma-Urbano</h1>
            <p className="text-muted-foreground">Select Your Role</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => { resetForm(); setView('official-login'); }}
            >
              Login as Official
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => { resetForm(); setView('resident-login'); }}
            >
              Login as Resident
            </Button>
            <hr className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              For authorized personnel and residents only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Official Login */}
      {view === 'official-login' && (
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Barangay Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            <h1 className="text-xl font-bold text-foreground">Barangay Palma-Urbano</h1>
            <p className="text-muted-foreground">Official Login</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOfficialLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="official-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="official-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="official-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="official-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full">Login</Button>
            </form>
            
            <Button variant="link" className="w-full mt-4" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resident Login */}
      {view === 'resident-login' && (
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Barangay Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            <h1 className="text-xl font-bold text-foreground">Barangay Palma-Urbano</h1>
            <p className="text-muted-foreground">Resident Login</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResidentLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resident-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resident-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resident-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" variant="secondary" className="w-full">Login</Button>
            </form>
            
            <p className="text-center mt-4 text-sm">
              Don't have an account?{' '}
              <button 
                className="text-primary hover:underline font-medium"
                onClick={() => { resetForm(); setView('resident-signup'); }}
              >
                Sign Up
              </button>
            </p>
            
            <Button variant="link" className="w-full" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resident Signup */}
      {view === 'resident-signup' && (
        <Card className="w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Barangay Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            <h1 className="text-xl font-bold text-foreground">Barangay Palma-Urbano</h1>
            <p className="text-muted-foreground">Resident Sign Up</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Dela Cruz"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                <Input
                  id="middleName"
                  placeholder="Perez"
                  value={signupData.middleName}
                  onChange={(e) => setSignupData({ ...signupData, middleName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="age"
                    type="number"
                    placeholder="30"
                    min="1"
                    max="120"
                    value={signupData.age}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="123 Rizal St"
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact"
                    placeholder="09171234567"
                    value={signupData.contact}
                    onChange={(e) => setSignupData({ ...signupData, contact: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="juan@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-success/10 text-success border-success">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
            
            <p className="text-center mt-4 text-sm">
              Already have an account?{' '}
              <button 
                className="text-primary hover:underline font-medium"
                onClick={() => { resetForm(); setView('resident-login'); }}
              >
                Login
              </button>
            </p>
            
            <Button variant="link" className="w-full" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoginPage;
