import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Download, Copy, Eye, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { SearchInterface } from "./SearchInterface";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  query: string;
  onNewChat: () => void;
}

export function ChatInterface({ query, onNewChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleNewSearch = (newQuery: string) => {
    simulateResponse(newQuery);
  };

  // Simulate AI response
  const simulateResponse = async (userQuery: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userQuery,
      timestamp: new Date(),
    };

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Remove loading message and start typing
    setMessages(prev => prev.slice(0, -1));
    setIsTyping(true);

    // Simulate typing response
    const response = "Un RAG (Retrieval-Augmented Generation) es una técnica que combina modelos de lenguaje como ChatGPT con motores de búsqueda o bases de conocimiento externas. La idea es simple pero poderosa: en lugar de que el modelo intente 'recordar' toda la información en su memoria entrenada, primero busca datos relevantes en una base de datos o en la web y luego usa esos datos para generar una respuesta mucho más precisa y actualizada. Esto es especialmente útil para temas que cambian rápido o donde la precisión es clave, como noticias, información legal o investigación científica.";
    
    let typedContent = "";
    const words = response.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      typedContent += (i > 0 ? " " : "") + words[i];
      
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: typedContent,
        timestamp: new Date(),
      };

      setMessages(prev => {
        // Keep all messages except replace the last assistant message (if any)
        const messagesWithoutLastAssistant = prev.filter((msg, index) => 
          !(index === prev.length - 1 && msg.type === "assistant")
        );
        return [...messagesWithoutLastAssistant, assistantMessage];
      });
      
      // Random delay between words to simulate natural typing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }

    setIsTyping(false);
  };

  // Initialize with the query
  useEffect(() => {
    if (query) {
      simulateResponse(query);
    }
  }, [query]);

  const handleFeedback = (messageId: string, positive: boolean) => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${positive ? "positive" : "negative"} feedback!`,
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Response copied to clipboard",
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto px-6">
      <ScrollArea className="flex-1 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {message.type === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] space-y-2">
                    <div className="text-right text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    <Card className="bg-banking-primary text-white p-4 rounded-2xl rounded-tr-sm">
                      <p className="text-lg">{message.content}</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-4">
                  {message.isLoading ? (
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-banking-primary">
                        <Infinity className="w-4 h-4 text-white animate-infinity" />
                      </div>
                      <div className="text-muted-foreground">LexiMind is thinking...</div>
                    </div>
                  ) : (
                    <>
                      <Card className="bg-card border-banking-primary/20 p-6 rounded-2xl rounded-tl-sm">
                        <div className="prose prose-invert max-w-none">
                          <p className="text-base leading-relaxed text-card-foreground mb-0">
                            {message.content}
                            {isTyping && (
                              <span className="inline-block w-2 h-5 ml-1 bg-banking-primary animate-typing"></span>
                            )}
                          </p>
                        </div>
                      </Card>
                      
                      {/* Action buttons - only show after response is complete */}
                      {!isTyping && (
                        <>
                          <div className="flex items-center gap-2 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, true)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, false)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.content)}
                              className="h-8 w-8 p-0 hover:bg-banking-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm px-3 h-8 hover:bg-banking-primary/10 text-muted-foreground"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Referencias
                            </Button>
                          </div>
                          
                          {/* Continue searching - only show after response is complete */}
                          {message.id === messages[messages.length - 1]?.id && (
                            <div className="mt-6 px-2">
                              <SearchInterface onSearch={handleNewSearch} minimal={true} />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}