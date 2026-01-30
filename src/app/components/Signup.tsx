import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bus, Mail, Lock, User, Phone, ArrowLeft, Sparkles, CheckCircle, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authService } from '../../utils/supabase';

interface SignupProps {
  onSwitch?: () => void;
  onBack?: () => void;
  onSignupSuccess?: (user: any) => void;
}

export function Signup({ onSwitch, onBack, onSignupSuccess }: SignupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password || !formData.name || !formData.phone) {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const data = await authService.signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      if (data.success) {
        toast.success('Account created successfully!');
        if (onSignupSuccess) {
          onSignupSuccess(data.user);
        }
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        toast.error('An account with this email already exists. Please login instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, text: 'Instant Booking' },
    { icon: Shield, text: 'Secure Payments' },
    { icon: CheckCircle, text: 'Easy Cancellation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [-90, 0, -90],
          }}
          transition={{
            duration: 27,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 60, 0],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <button
              onClick={() => navigate('/')}
              className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>

            <div className="space-y-6">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-full">
                  <Bus className="w-8 h-8 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ApnaBus
                </span>
              </div>

              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Start Your Journey
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  With Us Today
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Create your free account and unlock exclusive benefits, wallet rewards, and seamless travel experiences.
              </p>

              <div className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-lg">
                      <benefit.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Welcome Offer!</h3>
                </div>
                <p className="text-gray-600">
                  Get <span className="font-bold text-purple-600">100 bonus</span> in your wallet on first signup!
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => navigate('/')}
              className="md:hidden mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
              <div className="md:hidden text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-3">
                  <Bus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">ApnaBus</h2>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Join thousands of happy travelers today</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all rounded-xl"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all rounded-xl"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all rounded-xl"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all rounded-xl"
                      placeholder="********"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Create Account</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500"
              >
                <Shield className="w-4 h-4 text-green-600" />
                <span>Your data is secure and encrypted</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
