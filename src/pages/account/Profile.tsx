import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '../../utils/supabase';

interface ProfileProps {
  profile?: any;
  onProfileUpdate?: () => void;
}

const Profile = ({ profile, onProfileUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
  });
  const [loading, setLoading] = useState(false);

  const user = {
    name: profile?.name || "Guest User",
    email: profile?.email || "No email provided",
    phone: profile?.phone || "Not provided",
    memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear() : "2024",
    totalTrips: profile?.total_trips || 0
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="p-1 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => {
                  setFormData({
                    name: profile?.name || "",
                    phone: profile?.phone || "",
                  });
                  setIsEditing(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border border-blue-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-gray-500">Premium Member</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-5 h-5 text-green-500" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-4">Membership Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Total Trips</p>
                  <p className="text-xl font-bold text-blue-600">{user.totalTrips}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-xl font-bold text-indigo-600">{user.memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
