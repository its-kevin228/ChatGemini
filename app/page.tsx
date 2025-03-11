/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async () => {
    try {
      if (!input.trim()) return;

      const userMessage = { text: input, user: 'Toi' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage = { user: 'Gemini', text: data.response };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setInput('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Chatbot Gemini</h1>
    <div className="w-full max-w-md bg-white shadow-lg p-4 rounded-lg">
        <div className="h-64 overflow-y-auto border-b pb-2">
            {messages.map((msg, index) => (
                <p key={index} className={msg.user === "Toi" ? "text-right text-blue-600" : "text-left text-gray-800"}>
                    <strong>{msg.user}:</strong> {msg.text}
                </p>
            ))}
        </div>
        <div className="flex mt-4">
            <input
                className="flex-1 border p-2 rounded-l-lg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris un message..."
            />
            <button className="bg-blue-500 text-white px-4 rounded-r-lg" onClick={sendMessage}>
                Envoyer
            </button>
        </div>
    </div>
</div>
  );
}
