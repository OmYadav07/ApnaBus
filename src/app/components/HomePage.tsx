import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, MapPin, Calendar, Shield, Clock, Headphones, Star, Users, CheckCircle, Menu, X, User, LogOut, ChevronDown, Wallet, History, XCircle, RefreshCw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SettingsModal } from './SettingsModal';

interface HomePageProps {
  isLoggedIn: boolean;
  profile: any;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function HomePage({ isLoggedIn, profile, onLogout }: HomePageProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: ''
  });

  const handleBookTicket = () => {
    if (!isLoggedIn) {
      toast.error('Please login to book tickets', {
        description: 'You need to be logged in to access the booking system',
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleSearchBuses = () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      toast.error('Please fill in all search fields');
      return;
    }

    if (!isLoggedIn) {
      toast.error('Please login to search buses', {
        description: 'You need to be logged in to search and book buses',
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
    } else {
      navigate('/dashboard');
    }
  };

  const navLinks = [
    { to: "/account/profile", icon: User, label: "Profile", color: "text-blue-600", bg: "hover:bg-blue-50" },
    { to: "/account/wallet", icon: Wallet, label: "Wallet", color: "text-green-600", bg: "hover:bg-green-50" },
    { to: "/account/bookings", icon: History, label: "Booking History", color: "text-purple-600", bg: "hover:bg-purple-50" },
    { to: "/account/cancel", icon: XCircle, label: "Cancel Ticket", color: "text-orange-600", bg: "hover:bg-orange-50" },
    { to: "/account/reschedule", icon: RefreshCw, label: "Reschedule Ticket", color: "text-indigo-600", bg: "hover:bg-indigo-50" },
  ];

  const features = [
    {
      icon: Bus,
      title: 'Wide Bus Network',
      description: 'Access to thousands of buses across multiple cities and routes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing with instant confirmation',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your bus location and get live updates on schedule changes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with any queries',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Happy Travelers', icon: Users },
    { number: '500+', label: 'Bus Partners', icon: Bus },
    { number: '1000+', label: 'Routes Covered', icon: MapPin },
    { number: '4.8/5', label: 'Average Rating', icon: Star }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Search Buses',
      description: 'Enter your source, destination, and travel date',
      icon: MapPin
    },
    {
      step: '2',
      title: 'Select Seats',
      description: 'Choose your preferred seat from the interactive seat map',
      icon: Bus
    },
    {
      step: '3',
      title: 'Make Payment',
      description: 'Complete your booking with secure payment options',
      icon: CheckCircle
    },
    {
      step: '4',
      title: 'Get Ticket',
      description: 'Receive your e-ticket instantly via email and SMS',
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ApnaBus
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                How It Works
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>My Account</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                          <p className="font-bold text-gray-900 leading-tight">{profile?.name || 'Guest User'}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{profile?.email}</p>
                        </div>
                        
                        <div className="py-2">
                          {navLinks.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setUserMenuOpen(false)}
                              className={`w-full px-5 py-3 text-left ${link.bg} transition-colors flex items-center space-x-3 text-gray-700 font-medium`}
                            >
                              <link.icon className={`w-4 h-4 ${link.color}`} />
                              <span className="text-sm">{link.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-gray-50 py-2">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setSettingsOpen(true);
                            }}
                            className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-600 font-medium"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full px-5 py-3 text-left hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600 font-bold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all font-bold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 border-t"
            >
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Home
                </a>
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  How It Works
                </a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  About
                </a>
                
                {isLoggedIn ? (
                  <>
                    <div className="pt-4 border-t">
                      <p className="font-semibold text-gray-900 mb-1">{profile?.name}</p>
                      <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
                    </div>
                    <button
                      onClick={onNavigateToDashboard}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-medium text-left"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={onLogout}
                      className="text-red-600 hover:text-red-700 transition-colors font-medium text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onNavigateToLogin}
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={onNavigateToSignup}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Journey,
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {' '}Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Book bus tickets instantly with the most trusted and reliable bus booking platform. 
                Experience comfort, safety, and convenience on every journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleBookTicket}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
                >
                  Book Your Ticket
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg"
                >
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <input
                      type="text"
                      placeholder="From: Delhi"
                      value={searchData.from}
                      onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-gray-700 font-medium"
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    <input
                      type="text"
                      placeholder="To: Mumbai"
                      value={searchData.to}
                      onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-gray-700 font-medium"
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-gray-700 font-medium cursor-pointer"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <button
                    onClick={handleSearchBuses}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
                  >
                    Search Buses
                  </button>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ApnaBus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best-in-class features that make your bus booking seamless and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group"
              >
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book your bus ticket in just 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4 ml-auto">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About ApnaBus
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                ApnaBus is India's leading online bus ticket booking platform, committed to making 
                travel convenient, comfortable, and affordable for millions of passengers.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With our extensive network of bus operators, real-time seat availability, and 
                secure payment options, we ensure a hassle-free booking experience every time.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Trusted by Millions</h4>
                    <p className="text-gray-600">Over 10 million satisfied customers across India</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Best Price Guarantee</h4>
                    <p className="text-gray-600">Get the best deals and offers on all routes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Customer Support</h4>
                    <p className="text-gray-600">Always here to help with your queries</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h3>
                <p className="text-lg mb-8 opacity-90">
                  Join millions of travelers who trust ApnaBus for their bus booking needs.
                </p>
                <div className="space-y-4">
                  {isLoggedIn ? (
                    <button
                      onClick={onNavigateToDashboard}
                      className="w-full bg-white text-blue-600 py-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onNavigateToSignup}
                        className="w-full bg-white text-blue-600 py-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
                      >
                        Create Free Account
                      </button>
                      <button
                        onClick={onNavigateToLogin}
                        className="w-full border-2 border-white text-white py-4 rounded-lg hover:bg-white/10 transition-all font-semibold text-lg"
                      >
                        Login to Continue
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ApnaBus</span>
              </div>
              <p className="text-sm leading-relaxed">
                Your trusted partner for comfortable and affordable bus travel across India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@apnabus.com</li>
                <li>Phone: 1800-XXX-XXXX</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ApnaBus. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}