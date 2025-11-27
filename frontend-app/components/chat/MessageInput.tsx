'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@heroui/react';
import { Textarea } from '@heroui/react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask me anything about this document...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown as any}
        placeholder={placeholder}
        disabled={disabled}
        minRows={1}
        maxRows={4}
        variant="bordered"
        className="flex-1"
        classNames={{
          input: 'resize-none',
        }}
      />
      <Button
        color="primary"
        onPress={handleSend}
        isDisabled={!message.trim() || disabled}
        isLoading={disabled}
        className="self-end"
      >
        {disabled ? 'Sending...' : 'Send'}
      </Button>
    </div>
  );
}
