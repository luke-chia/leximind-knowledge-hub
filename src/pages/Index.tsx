import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { SearchInterface } from '@/components/chat/SearchInterface'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (searchParams: {
    query: string
    filters?: {
      area: string
      categoria: string[]
      fuente: string[]
      tags: string[]
    }
  }) => {
    setIsSearching(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: 'Search completed',
        description: `Found relevant information for: "${searchParams.query}"`,
      })
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <MainLayout>
      <SearchInterface onSearch={handleSearch} isLoading={isSearching} />
    </MainLayout>
  )
}

export default Index
