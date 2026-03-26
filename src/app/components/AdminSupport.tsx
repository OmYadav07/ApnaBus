import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import {
  HelpCircle, CheckCircle, Clock, User, Mail, Phone,
  Bookmark, BookmarkCheck, MessageSquareReply, Send, TicketCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

type FilterType = 'all' | 'bookmarked' | 'resolved';

export function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const data = await apiCall('/support/tickets');
      setTickets(data.tickets || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId: number) => {
    try {
      await apiCall(`/support/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved', resolvedAt: new Date().toISOString() }),
      });
      toast.success('Ticket resolved');
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve ticket');
    }
  };

  const handleBookmark = async (ticket: any) => {
    try {
      await apiCall(`/support/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify({ bookmarked: !ticket.bookmarked }),
      });
      fetchTickets();
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleReply = async (ticketId: number) => {
    const reply = replyText[ticketId]?.trim();
    if (!reply) { toast.error('Reply cannot be empty'); return; }
    setSending(ticketId);
    try {
      await apiCall(`/support/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ adminReply: reply, repliedAt: new Date().toISOString() }),
      });
      toast.success('Reply sent');
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSending(null);
    }
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'bookmarked') return t.bookmarked;
    if (filter === 'resolved') return t.status === 'resolved';
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const bookmarkedCount = tickets.filter((t) => t.bookmarked).length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Users Support</span>
            </CardTitle>
            <div className="flex gap-2 text-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-semibold">
                <Clock className="w-3.5 h-3.5" />{openCount} Open
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                <BookmarkCheck className="w-3.5 h-3.5" />{bookmarkedCount} Bookmarked
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />{resolvedCount} Resolved
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'bookmarked', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'bookmarked' ? '🔖 Bookmarked' : f === 'resolved' ? '✓ Resolved' : 'All'}
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
              {filter === 'bookmarked' ? 'No bookmarked tickets.' : filter === 'resolved' ? 'No resolved tickets yet.' : 'No support tickets yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((ticket) => {
            const isExpanded = expandedId === ticket.id;
            const createdAt = ticket.createdAt || ticket.created_at;
            return (
              <Card key={ticket.id} className={ticket.bookmarked ? 'border-blue-300 shadow-blue-50 shadow-md' : ''}>
                <CardContent className="p-0">
                  {/* Header row */}
                  <div className="p-5 flex items-start gap-4">
                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(ticket)}
                      title={ticket.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                      className="mt-0.5 shrink-0"
                    >
                      {ticket.bookmarked
                        ? <BookmarkCheck className="w-5 h-5 text-blue-500" />
                        : <Bookmark className="w-5 h-5 text-gray-300 hover:text-blue-400 transition-colors" />
                      }
                    </button>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900">{ticket.subject}</h3>
                        <Badge
                          className={
                            ticket.status === 'open'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0'
                              : 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                          }
                        >
                          {ticket.status}
                        </Badge>
                        {ticket.adminReply && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                            <MessageSquareReply className="w-3 h-3" /> Replied
                          </span>
                        )}
                      </div>

                      {/* User info */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                        {ticket.user?.name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold text-gray-700">{ticket.user.name}</span>
                          </span>
                        )}
                        {ticket.user?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {ticket.user.email}
                          </span>
                        )}
                        {ticket.user?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {ticket.user.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {createdAt ? new Date(createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700">{ticket.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      {ticket.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(ticket.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        Reply
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Existing reply */}
                  {ticket.adminReply && (
                    <div className="mx-5 mb-4 bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquareReply className="w-3.5 h-3.5" /> Admin Reply
                      </p>
                      <p className="text-sm text-gray-800">{ticket.adminReply}</p>
                      {ticket.repliedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(ticket.repliedAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reply box */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 rounded-b-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {ticket.adminReply ? 'Update Reply' : 'Write a Reply'}
                      </p>
                      <Textarea
                        value={replyText[ticket.id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        placeholder="Type your response to the user..."
                        rows={3}
                        className="bg-white mb-3"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleReply(ticket.id)}
                          disabled={sending === ticket.id}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {sending === ticket.id ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
