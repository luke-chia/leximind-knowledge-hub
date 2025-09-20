import { MainLayout } from '@/components/layout/MainLayout'
import { SearchInterface } from '@/components/chat/SearchInterface'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useState } from 'react'

const Search = () => {
  const [currentQuery, setCurrentQuery] = useState('')
  const [showChat, setShowChat] = useState(false)

  const handleSearch = (searchParams: {
    query: string
    filters?: {
      area: string[]
      categoria: string[]
      fuente: string[]
      anio: string[]
      tags: string[]
    }
  }) => {
    setCurrentQuery(searchParams.query)
    setShowChat(true)
  }

  const handleNewChat = () => {
    setShowChat(false)
    setCurrentQuery('')
  }

  return (
    <MainLayout onNewChat={handleNewChat}>
      {showChat ? (
        <ChatInterface query={currentQuery} onNewChat={handleNewChat} />
      ) : (
        <div className="w-full max-w-6xl">
          <SearchInterface onSearch={handleSearch} />
        </div>
      )}
    </MainLayout>
  )
}

export default Search
