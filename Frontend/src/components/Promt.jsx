import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

function Promt({ selectedSessionId, onNewSessionCreated, collapsed }) {
  const [inputValue, setInputValue] = useState("");
  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(!selectedSessionId);
  const promtEndRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const sessionId = selectedSessionId || `session_${Date.now()}`;

  useEffect(() => {
    const stored = localStorage.getItem(`promtHistory_${userId}_${sessionId}`);
    setPromt(stored ? JSON.parse(stored) : []);
    setShowGreeting(!stored);
  }, [selectedSessionId]);

  useEffect(() => {
    if (promt.length > 0) {
      localStorage.setItem(`promtHistory_${userId}_${sessionId}`, JSON.stringify(promt));
      updateSessionList();
    }
  }, [promt]);

  const updateSessionList = () => {
    const title = promt.find((p) => p.role === "user")?.content.slice(0, 30) || "New Chat";
    const sessions = JSON.parse(localStorage.getItem(`sessions_${userId}`)) || [];
    const existing = sessions.find((s) => s.id === sessionId);

    if (!existing) {
      sessions.unshift({
        id: sessionId,
        title,
        createdAt: new Date().toISOString(),
      });
    } else {
      existing.title = title;
    }

    localStorage.setItem(`sessions_${userId}`, JSON.stringify(sessions));
    if (!selectedSessionId) onNewSessionCreated(sessionId);
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputValue("");
    setPromt((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);
    setShowGreeting(false);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "https://neromax-ai-assistant-3.onrender.com/api/v1/neromaxai/promt",
        { content: trimmed },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setPromt((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setPromt((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong with AI response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);

  if (collapsed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a1a] text-gray-500 text-sm">
        Expand the sidebar to view chats.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full px-4 py-4 bg-gradient-to-br from-[#1a1a1a] to-[#101010] text-white">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mb-4 px-1 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-4">
          {showGreeting && (
            <div className="text-center mt-6 md:mt-12">
              <h1 className="text-2xl md:text-4xl font-bold">Hi, NeroMax Here</h1>
              <p className="text-gray-400 mt-2 text-sm md:text-base">Ask Anything</p>
            </div>
          )}

          {promt.map((msg, index) => {
            const isUser = msg.role === "user";
            const isLongAssistantResponse = !isUser && msg.content.length > 300;

            return (
              <div
                key={index}
                className={`w-full flex ${
                  isUser
                    ? "justify-end"
                    : isLongAssistantResponse
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                <div
                  className={`${
                    isUser ? "bg-blue-700" : "bg-[#232323]"
                  } px-4 py-3 rounded-2xl text-sm text-white shadow-md max-w-[85%] md:max-w-[70%] break-words whitespace-pre-wrap break-all`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="overflow-auto max-w-full">
                            <SyntaxHighlighter
                              style={codeTheme}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-gray-800 px-1 py-0.5 rounded break-words">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#232323] px-4 py-2 rounded-2xl text-sm animate-pulse">
                Loading...
              </div>
            </div>
          )}

          <div ref={promtEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="w-full sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center bg-[#2f2f2f] rounded-full px-4 py-4 gap-3 shadow-md">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NeroMax"
            className="flex-1 bg-transparent text-white text-base placeholder-gray-400 outline-none"
          />

          {/* Hidden file input */}
          <input
            type="file"
            ref={(ref) => (window.__fileInputRef = ref)}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                console.log("File selected:", file);
                // You can add file upload logic here if needed
              }
            }}
          />

          {/* Attachment button triggers file input */}
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => window.__fileInputRef?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={handleSend}
            className="bg-blue-700 hover:bg-blue-800 p-2 rounded-full text-white"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}

export default Promt;
