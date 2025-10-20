import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [phone_no, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(phone_no, password);
    
    if (result.success) {
      onClose();
      setPhoneNo('');
      setPassword('');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');
    const result = await register(phone_no, password);
    if (result.success) {
      setIsRegister(false);
      setPhoneNo('');
      setPassword('');
      setRegisterSuccess('Registration successful! Use your phone number and password to login.');
    } else {
      setRegisterError(result.error || 'Registration failed');
    }
    setRegisterLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isRegister ? 'Register for PartyKart' : 'Login to PartyKart'}
        </h2>

        <form onSubmit={isRegister ? handleRegister : handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone_no}
              onChange={e => setPhoneNo(e.target.value)}
              maxLength={10}
              pattern="\d{10}"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {error && !isRegister && (
            <div className="text-red-500 text-xs">{error}</div>
          )}
          {registerError && isRegister && (
            <div className="text-red-500 text-xs">{registerError}</div>
          )}
          {registerSuccess && !isRegister && (
            <div className="text-green-600 text-xs mb-2">{registerSuccess}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            disabled={isLoading || registerLoading}
          >
            {isRegister
              ? registerLoading
                ? 'Registering...'
                : 'Register'
              : isLoading
              ? 'Logging in...'
              : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-pink-600 hover:underline text-sm"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setRegisterError('');
            }}
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
