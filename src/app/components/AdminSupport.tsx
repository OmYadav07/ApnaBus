import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { HelpCircle, CheckCircle, Clock, User, TicketCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await apiCall('/support/tickets');
      setTickets(data.tickets || []);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (ticketId: number) => {
    try {
      await apiCall(`/support/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });
      toast.success('Ticket marked as resolved');
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve ticket');
    }
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'resolved') return t.status === 'resolved';
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Support Tickets</span>
            </CardTitle>
            <div className="flex gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {openCount} Open
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                {resolvedCount} Resolved
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {(['all', 'open', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <TicketCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tickets found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'open' ? 'All tickets are resolved!' : 'No support tickets yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((ticket) => {
            const createdAt = ticket.createdAt || ticket.created_at;
            return (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-base font-bold text-gray-900 truncate">{ticket.subject}</h3>
                        <Badge
                          variant={ticket.status === 'open' ? 'default' : 'secondary'}
                          className={ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{ticket.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        {ticket.user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {ticket.user.name || ticket.user.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {createdAt ? new Date(createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {ticket.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClose(ticket.id)}
                        className="shrink-0 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
