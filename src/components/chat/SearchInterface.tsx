import { useState, useEffect } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
}

export function SearchInterface({ onSearch, isLoading = false, minimal = false }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const placeholderTexts = [
    "Ask me what you need...",
    "¿Qué normativas de la CNBV aplican?",
    "Explícame los procedimientos de compliance",
    "¿Cómo funciona la gestión de riesgos?",
    "Políticas de onboarding de clientes",
    "Procedimientos contables y financieros",
    "Regulaciones de prevención de lavado",
    "Manuales operativos internos",
  ];

  // Cycle through placeholder texts
  useEffect(() => {
    if (!query) { // Only animate when input is empty
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [query, placeholderTexts.length]);

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

  // If minimal mode, show only the input
  if (minimal) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderTexts[currentPlaceholder]}
            className="input-banking h-12 text-base pr-24 pl-4 rounded-xl placeholder:transition-all placeholder:duration-500"
            disabled={isLoading}
          />
          
          {/* Voice input button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-banking-primary"
            onClick={handleVoiceInput}
            disabled={isLoading || isListening}
          >
            {isListening ? (
              <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 btn-banking-primary rounded-lg"
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    );
  }

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
              placeholder={placeholderTexts[currentPlaceholder]}
              className="input-banking h-14 text-lg pr-24 pl-6 rounded-xl placeholder:transition-all placeholder:duration-500"
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