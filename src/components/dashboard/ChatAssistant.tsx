import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StyleRecommendation } from '@/contexts/StyleContext';
import { chatWithStyleAdvisor, ChatMessage } from '@/services/geminiService';
import { toast } from 'sonner';

interface ChatAssistantProps {
    recommendation: StyleRecommendation;
    onUpdateRecommendation: (recommendation: StyleRecommendation) => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ recommendation, onUpdateRecommendation }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to state
        const newMessages: ChatMessage[] = [
            ...messages,
            { role: 'user', content: userMessage }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Call Gemini API
            const response = await chatWithStyleAdvisor(recommendation, messages, userMessage);

            // Add assistant response
            setMessages([
                ...newMessages,
                { role: 'assistant', content: response.text }
            ]);

            // Check for updates
            if (response.updatedRecommendation) {
                onUpdateRecommendation(response.updatedRecommendation);
                toast.success("Recommendation updated based on your feedback!");
            }
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get a response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className="w-full mt-6 shadow-sm border-2 border-primary/5 animate-fade-in">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Style Assistant</CardTitle>
                        <CardDescription>Ask questions or request changes to your recommendations</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-4" ref={scrollAreaRef}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            <Bot className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Hi! I'm your specific style advisor.</p>
                            <p className="text-xs mt-1">Ask me why I chose these items, or ask for changes like "I prefer darker colors" or "Show me casual options".</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-3 text-sm max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                                        msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-lg",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted rounded-tl-none border border-border"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 mr-auto max-w-[85%]">
                                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted rounded-tl-none border border-border flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-border/40 flex gap-2">
                    <Textarea
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[50px] max-h-[100px] resize-none focus-visible:ring-primary"
                    />
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="h-[50px] w-[50px] shrink-0"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatAssistant;
