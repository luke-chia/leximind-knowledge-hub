import { MainLayout } from "@/components/layout/MainLayout";
import { SearchInterface } from "@/components/chat/SearchInterface";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useState } from "react";

const Search = () => {
  const [currentQuery, setCurrentQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    setShowChat(true);
  };

  const handleNewChat = () => {
    setShowChat(false);
    setCurrentQuery("");
  };

  return (
    <MainLayout onNewChat={handleNewChat}>
      {showChat ? (
        <ChatInterface query={currentQuery} onNewChat={handleNewChat} />
      ) : (
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Search</h1>
            <p className="text-muted-foreground">Search through all your banking documents and knowledge base</p>
          </div>
          <SearchInterface onSearch={handleSearch} />
        </div>
      )}
    </MainLayout>
  );
};

export default Search;