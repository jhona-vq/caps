import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Hash, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import logo from '@/assets/logo.png';
import barangayHall from '@/assets/barangay-hall.jpg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerResident } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Incorrect email or password.');
    }
    // Navigation is handled by auth state change in App.tsx
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!firstName || !lastName || !age || !address || !contact || !email || !password) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const result = await registerResident({
      firstName,
      lastName,
      middleName,
      age: parseInt(age),
      address,
      contact,
      email,
      password,
    });

    if (result.success) {
      setSuccess('Account created successfully! You can now log in.');
      setIsSignUp(false);
      setFirstName(''); setLastName(''); setMiddleName('');
      setAge(''); setAddress(''); setContact(''); setPassword('');
    } else {
      setError(result.error || 'Registration failed.');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setError(''); setSuccess(''); setEmail(''); setPassword('');
    setFirstName(''); setLastName(''); setMiddleName('');
    setAge(''); setAddress(''); setContact('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${barangayHall})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
      }}
    >
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm text-foreground hover:bg-card shadow-md">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Card className="w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-2">
          <img src={logo} alt="Barangay Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-foreground">Barangay Palma-Urbano</h1>
          <p className="text-muted-foreground">{isSignUp ? 'Create an Account' : 'Log In'}</p>
        </CardHeader>
        <CardContent>
          {!isSignUp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert><AlertDescription className="text-primary">{success}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" placeholder="Middle name (optional)" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="age">Age *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="age" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact">Contact # *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="contact" placeholder="09XX..." value={contact} onChange={(e) => setContact(e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="address" placeholder="Complete address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="signupEmail">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="signupEmail" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="signupPassword">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="signupPassword" type="password" placeholder="Create a password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          )}
          <hr className="my-4" />
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>Already have an account?{' '}<button type="button" className="text-primary font-medium hover:underline" onClick={() => { setIsSignUp(false); resetForm(); }}>Log In</button></>
            ) : (
              <>Don't have an account?{' '}<button type="button" className="text-primary font-medium hover:underline" onClick={() => { setIsSignUp(true); resetForm(); }}>Sign Up</button></>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
