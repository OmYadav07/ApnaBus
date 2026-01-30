import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Search, MapPin, Calendar, Clock, IndianRupee, Users, Bus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SeatSelection } from './SeatSelection';

interface BusSearchProps {
  profile: any;
}

export function BusSearch({ profile }: BusSearchProps) {
  const [buses, setBuses] = useState<any[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedBus, setSelectedBus] = useState<any>(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/buses');
      setBuses(data.buses || []);
      setFilteredBuses(data.buses || []);
    } catch (error: any) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = buses.filter(bus => {
      const matchSource = !source || bus.source.toLowerCase().includes(source.toLowerCase());
      const matchDest = !destination || bus.destination.toLowerCase().includes(destination.toLowerCase());
      return matchSource && matchDest;
    });
    setFilteredBuses(filtered);
  };

  if (selectedBus) {
    return (
      <SeatSelection 
        bus={selectedBus} 
        profile={profile}
        onBack={() => setSelectedBus(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Buses</span>
          </CardTitle>
          <CardDescription>Find the perfect bus for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Source city"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Destination city"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Buses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading buses...</p>
        </div>
      ) : filteredBuses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No buses found. Try different search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBuses.map((bus) => (
            <Card key={bus.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bus.name}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <p className="text-xs text-gray-500">From</p>
                          <p className="font-medium">{bus.source}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <p className="text-xs text-gray-500">To</p>
                          <p className="font-medium">{bus.destination}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <div>
                          <p className="text-xs text-gray-500">Departure</p>
                          <p className="font-medium">{bus.departure_time || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <div>
                          <p className="text-xs text-gray-500">Seats</p>
                          <p className="font-medium">{bus.total_seats} seats</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-blue-600 flex items-center justify-end">
                        <IndianRupee className="w-5 h-5" />
                        {bus.price}
                      </p>
                      <p className="text-xs text-gray-500">per seat</p>
                    </div>
                    <Button 
                      onClick={() => setSelectedBus(bus)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Select Seats
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
