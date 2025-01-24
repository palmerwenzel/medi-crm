'use client';

/**
 * Medical intake chatbot component for gathering patient information.
 */
import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatbot } from '@/hooks/use-chatbot';

export function MedicalIntakeChatbot() {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage } = useChatbot();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`p-2 rounded-lg max-w-[80%] ${
              message.sender === 'user' 
                ? 'bg-blue-100 ml-auto' 
                : 'bg-gray-100 mr-auto'
            }`}
          >
            {message.content}
          </div>
        ))}
        
        {isLoading && <div>Loading...</div>}

        <div className="flex space-x-2">
          <Input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your medical concern..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <Send className="mr-2" size={16} /> Send
          </Button>
        </div>

        <Button variant="outline" className="w-full">
          <FileText className="mr-2" size={16} /> Upload Medical Documents
        </Button>
      </div>
    </div>
  );
}