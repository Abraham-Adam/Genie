import React, { useState } from 'react';
import { Link2, Sparkles } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { OpenAIService } from './services/openai';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const openAIService = new OpenAIService();

  const addEventToCalendar = async (accessToken: string, eventDetails: any) => {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDetails)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add event to calendar');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        setUser(userInfo);

        // Fetch calendar events
        if (tokenResponse.scope?.includes('https://www.googleapis.com/auth/calendar')) {
          const events = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }).then(res => res.json());
          
          setCalendarEvents(events.items || []);
        }
      } catch (error) {
        console.error('Error fetching user info or calendar events:', error);
        setError('Failed to fetch user information or calendar events');
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setShowCompletion(false);
    setResponse(null);
    setError(null);
    
    try {
      const aiResponse = await openAIService.processMessage(message);
      setResponse(aiResponse);
      setIsLoading(false);
      setShowCompletion(true);
      
      setTimeout(() => {
        setShowCompletion(false);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get response from AI. Please try again.');
      setIsLoading(false);
    }
  };

  const templates = [
    "Send an email to Sara",
    "Add meeting with James at 2 pm to my calendar",
    "What song is this?",
    "Text Sara, let's meet for dinner.",
    "Doordash me zareen's Butter Chicken",
    "Find flights from SFO to Austin"
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-inter relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[#001233]/40 blur-[120px]" />
        <div className="absolute -top-[40%] left-[50%] -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-[#0066FF]/20 via-[#001233]/10 to-transparent opacity-60 blur-3xl" />
        <div className="absolute top-[20%] left-[30%] w-[1000px] h-[1000px] bg-gradient-radial from-[#00A3FF]/15 via-[#001233]/10 to-transparent opacity-50 blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 z-50">
        <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">genie AI</div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              <span className="text-white/70">{user.name}</span>
            </div>
          ) : (
            <button 
              onClick={() => login()} 
              className="text-white/70 hover:text-white font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" />
              </svg>
              Sign in with Google
            </button>
          )}
          <button 
            onClick={() => !user && login()} 
            className="bg-gradient-to-r from-[#0066FF] to-[#00A3FF] px-5 py-2 rounded-md hover:opacity-90 transition-all duration-200 font-medium glow-effect"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-48 px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-5 mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text tracking-tight">
            AI'll Master Your Tasks.
          </h1>
          <p className="text-white/60 text-lg">All in one Platform that deploys all the best agents</p>
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="mb-16">
          <div className="gradient-border rounded-xl">
            <div className="relative rounded-xl">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What would you like me to do?"
                className="w-full bg-[#0D0D0D] rounded-xl p-6 pr-14 resize-none h-[140px] focus:outline-none text-white/90 placeholder:text-white/40"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-3 text-white/30">
                <Link2 className="w-5 h-5 hover:text-white/60 cursor-pointer transition-colors" />
                <button 
                  type="submit" 
                  disabled={isLoading || !message.trim()} 
                  className={`hover:text-white/60 cursor-pointer transition-colors relative ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {showCompletion ? (
                    <div className="absolute inset-0 flex items-center justify-center text-green-500">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path className="checkmark" d="M20 6L9 17L4 12"/>
                      </svg>
                    </div>
                  ) : (
                    <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="mb-16 bg-[#141414] p-6 rounded-xl border border-white/5 response-enter">
            <p className="text-white/90 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Template Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => setMessage(template)}
              className="bg-[#141414] px-5 py-2.5 rounded-full text-sm text-white/60 hover:text-white hover:bg-[#1A1A1A] transition-all duration-200 border border-white/5"
            >
              {template}
            </button>
          ))}
        </div>

        {/* Calendar Events (if user is signed in) */}
        {user && calendarEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-semibold mb-4 text-white/90">Your Upcoming Events</h2>
            <div className="space-y-3">
              {calendarEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className="bg-[#141414] p-4 rounded-lg border border-white/5">
                  <h3 className="font-medium text-white/90">{event.summary}</h3>
                  <p className="text-sm text-white/60">{new Date(event.start.dateTime).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-6 py-4 bg-[#0D0D0D]/90 backdrop-blur-md border-t border-white/5 text-sm text-white/40 z-50">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
          <div className="flex items-center">
            <span className="font-medium">genie AI</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;