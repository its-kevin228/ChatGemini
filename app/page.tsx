/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; user: string; timestamp: string }[]>(() => {
    const savedMessages = typeof window !== 'undefined' ? localStorage.getItem('chatMessages') : null;
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setError('');
      setIsLoading(true);

      const userMessage = { text: input, user: 'You', timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const botMessage = { user: 'Gemini', text: data.response, timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while sending the message.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <Card className="w-full max-w-2xl shadow-xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
          <CardTitle className="text-center text-lg font-bold">Chatbot Gemini</CardTitle>
        </CardHeader>

        <CardContent className="h-[500px] flex flex-col">
          <ScrollArea className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-end space-x-2 max-w-[70%]">
                  {msg.user === 'Gemini' && (
                    <Avatar>
                      <AvatarImage src="/gemini-avatar.png" alt="Gemini" />
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-2xl px-4 py-2 shadow-md ${msg.user === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <span className="text-xs font-semibold block mb-1">{msg.user}</span>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-xs text-gray-500 block text-right mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2 animate-pulse flex space-x-2">
                  <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Gemini is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t bg-white flex items-center space-x-2">
            <Input
              className="flex-1 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              aria-label="Message input"
            />
            <Button
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-sm`}
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send'}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
