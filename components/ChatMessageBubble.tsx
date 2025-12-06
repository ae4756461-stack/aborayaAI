import React from 'react';
import { ChatMessage, Role } from '../types.ts';
import { User } from 'lucide-react';
import Logo from './Logo.tsx';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-slide-up`}>
      
      {/* Custom Logo for Bot */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <Logo />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-md transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-indigo-500/20'
            : message.isError 
              ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-bl-sm'
              : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-sm backdrop-blur-md hover:bg-white/10'
        }`}
        dir="auto"
      >
        {message.text}
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <User size={18} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;