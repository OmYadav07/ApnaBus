import React from 'react';
import { User, Mail, Phone, MapPin, Edit2 } from 'lucide-react';

interface ProfileProps {
  profile?: any;
}

const Profile = ({ profile }: ProfileProps) => {
  const user = {
    name: profile?.name || "Guest User",
    email: profile?.email || "No email provided",
    phone: profile?.phone || "Not provided",
    address: profile?.address || "Not provided"
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
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
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>{user.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-4">Membership Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Total Trips</p>
                  <p className="text-xl font-bold text-blue-600">24</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-xl font-bold text-indigo-600">2023</p>
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
