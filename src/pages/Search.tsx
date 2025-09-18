import { MainLayout } from "@/components/layout/MainLayout";
import { SearchInterface } from "@/components/chat/SearchInterface";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Search = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Search completed",
        description: `Found relevant information for: "${query}"`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">Search through all your banking documents and knowledge base</p>
        </div>
        <SearchInterface onSearch={handleSearch} isLoading={isSearching} />
      </div>
    </MainLayout>
  );
};

export default Search;