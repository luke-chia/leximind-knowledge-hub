import { useState } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchInterface({ onSearch, isLoading = false }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery("");
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Main greeting */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          What do you want to consult today?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask me about regulatory laws, compliance manuals, operational procedures, or any banking documentation you need help with.
        </p>
      </div>

      {/* Search interface */}
      <Card className="card-banking p-6 animate-slide-in">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me what you need..."
              className="input-banking h-14 text-lg pr-24 pl-6 rounded-xl"
              disabled={isLoading}
            />
            
            {/* Voice input button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-banking-primary"
              onClick={handleVoiceInput}
              disabled={isLoading || isListening}
            >
              {isListening ? (
                <div className="h-5 w-5 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 btn-banking-primary rounded-lg"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Quick action suggestions */}
          <div className="flex flex-wrap gap-2 justify-center pt-4">
            {[
              "CNBV regulations",
              "Compliance manual",
              "IT policies",
              "Accounting procedures",
              "Risk management",
              "Customer onboarding",
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="btn-banking-ghost text-sm"
                onClick={() => setQuery(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </form>
      </Card>

      {/* Recent activity hint */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Your recent chats and documents are available in the sidebar</p>
      </div>
    </div>
  );
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}