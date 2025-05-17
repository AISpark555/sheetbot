"use client"
import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Menu, X, Settings, LogOut, Moon, Sun, Loader2, ChevronDown } from 'lucide-react';

export default function ChatGPTClone() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: "React component help", date: "Today" },
    { id: 2, title: "CSS animations question", date: "Today" },
    { id: 3, title: "JavaScript debugging", date: "Yesterday" },
  ]);
  const [currentModel, setCurrentModel] = useState("GPT-4");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const startNewConversation = () => {
    const newId = conversations.length + 1;
    setConversations([
      { id: newId, title: "New conversation", date: "Today" },
      ...conversations,
    ]);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
    setIsLoading(true);

    try {
      // Simulating API call with a timeout
      setTimeout(() => {
        const responses = [
          "I can help with that! Here's what you need to know...",
          "That's an interesting question. Let me explain...",
          "Based on my understanding, I would suggest...",
          "There are several approaches to this problem...",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const assistantMessage = { 
          id: Date.now() + 1, 
          role: 'assistant', 
          content: randomResponse,
          model: currentModel
        };

        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-0'} ${sidebarOpen ? 'sidebar-open' : ''} transition-all duration-300 overflow-hidden flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={startNewConversation}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
          <button 
            className="md:hidden ml-2 p-1 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-sm font-medium text-gray-500">Today</div>
          {conversations.filter(c => c.date === "Today").map(conversation => (
            <div 
              key={conversation.id} 
              className={`m-2 p-3 rounded-md cursor-pointer ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <div className="text-sm font-medium truncate">{conversation.title}</div>
            </div>
          ))}
          
          <div className="px-3 py-2 text-sm font-medium text-gray-500">Yesterday</div>
          {conversations.filter(c => c.date === "Yesterday").map(conversation => (
            <div 
              key={conversation.id} 
              className={`m-2 p-3 rounded-md cursor-pointer ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <div className="text-sm font-medium truncate">{conversation.title}</div>
            </div>
          ))}
        </div>
        
        <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`p-3 rounded-md flex items-center gap-3 cursor-pointer ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
              U
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">User</div>
            </div>
            <LogOut size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className={`flex items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-2">
            <Menu size={20} />
          </button>
          <div className="flex-1 text-center font-medium">ChatGPT</div>
          <button onClick={() => setDarkMode(!darkMode)} className="ml-2">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="ml-4">
            <Settings size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className={`text-center p-8 max-w-2xl`}>
                <h1 className="text-3xl font-bold mb-6">ChatGPT</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Explain quantum computing", desc: "in simple terms" },
                    { title: "Got any creative ideas", desc: "for a 10 year old's birthday?" },
                    { title: "How do I make an HTTP request", desc: "in Javascript?" },
                    { title: "Write a poem", desc: "about a happy robot" }
                  ].map((example, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-lg cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{example.title}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{example.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-6">
                  {msg.role === 'user' ? (
                    // User message - right aligned, no avatar
                    <div className="flex justify-end mb-1">
                      <div className={`max-w-[80%] p-3 rounded-lg ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                        <div className="whitespace-pre-wrap message-content">{msg.content}</div>
                      </div>
                    </div>
                  ) : (
                    // Assistant message with avatar
                    <div className="flex items-start mb-1">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-2 flex-shrink-0 text-white">
                        C
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>ChatGPT</div>
                        <div className={`whitespace-pre-wrap mt-1 message-content ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{msg.content}</div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          Model: {msg.model}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="mb-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-2 flex-shrink-0">
                      C
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">ChatGPT</div>
                      <div className="flex items-center mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Model selector and Input area */}
        <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-2 flex justify-center">
              <div className={`flex items-center gap-1 text-sm py-1 px-3 rounded-md cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                <span>Model: {currentModel}</span>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className={`relative rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}>
              <textarea
                ref={textareaRef}
                className={`w-full auto-resize-textarea p-3 pr-12 focus:outline-none rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Send a message"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
              <button
                className={`absolute bottom-2 right-2 p-1 rounded-lg ${
                  !input.trim() || isLoading
                    ? 'text-gray-400 cursor-not-allowed'
                    : `${darkMode ? 'text-white hover:bg-gray-600' : 'text-black hover:bg-gray-100'}`
                }`}
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className={`text-center mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              ChatGPT can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}