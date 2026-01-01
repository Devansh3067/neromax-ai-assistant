import React, { useState, useEffect } from "react";
import {
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import profile from "../../public/user.png";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function Sidebar({ open, setOpen, onSelectSession, selectedSessionId }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user._id) {
      const stored =
        JSON.parse(localStorage.getItem(`sessions_${user._id}`)) || [];
      setSessions(stored);
    }
  }, [user._id]);

  const handleNewChat = () => {
    const existingEmpty = sessions.find(
      (s) =>
        s.title === "New Chat" &&
        !localStorage.getItem(`promtHistory_${user._id}_${s.id}`)
    );

    if (existingEmpty) {
      onSelectSession(existingEmpty.id);
      setOpen(false);
      return;
    }

    const newId = `session_${Date.now()}`;
    const newTitle = "New Chat";
    const newSession = {
      id: newId,
      title: newTitle,
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem(
      `sessions_${user._id}`,
      JSON.stringify(updatedSessions)
    );
    onSelectSession(newId);
    setOpen(false);
  };

  const handleDeleteSession = (sessionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (!confirmDelete) return;

    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem(`sessions_${user._id}`, JSON.stringify(updated));
    localStorage.removeItem(`promtHistory_${user._id}_${sessionId}`);

    // 🔁 If the current chat is deleted, create and select a new chat
    if (sessionId === selectedSessionId) {
      const newId = `session_${Date.now()}`;
      const newSession = {
        id: newId,
        title: "New Chat",
        createdAt: new Date().toISOString(),
      };
      const newSessions = [newSession, ...updated];
      setSessions(newSessions);
      localStorage.setItem(`sessions_${user._id}`, JSON.stringify(newSessions));
      onSelectSession(newId);
    }
  };

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "https://neromax-ai-assistant-3.onrender.com/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(data.message);
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        />
      )}

      <div
        className={`fixed z-40 top-0 left-0 h-full bg-[#232327] transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${collapsed ? "md:w-20" : "md:w-64"} w-64`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!collapsed && (
            <div className="text-xl font-bold text-white">neromax</div>
          )}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block text-gray-300 hover:text-white"
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <button
              onClick={() => setOpen(false)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3">
          <button
            className="w-full flex items-center justify-center md:justify-start gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Chat Sessions */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-3">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="w-full flex items-center justify-between gap-2 group"
                >
                  <button
                    onClick={() => {
                      onSelectSession(session.id);
                      setOpen(false);
                    }}
                    className={`flex flex-col items-start text-left text-sm px-3 py-2 rounded-lg flex-grow overflow-hidden
                    ${
                      selectedSessionId === session.id
                        ? "bg-gray-700 shadow-inner"
                        : "hover:bg-gray-700"
                    } text-white`}
                  >
                    <div className="truncate max-w-[160px] w-full font-medium">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[160px] w-full">
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="text-gray-400 hover:text-red-500 p-2"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm mt-6 text-center">
                No Chat History Yet
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className={`mt-auto border-t border-gray-700 ${
            collapsed ? "h-[72px] flex items-center justify-center p-4" : "p-4"
          }`}
        >
          <div className="flex items-center gap-2">
            <img className="rounded-full w-10 h-10" src={profile} alt="User" />
            {!collapsed && (
              <span className="text-gray-300 text-sm">
                {user?.firstName || "My Profile"}
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="flex justify-center mt-3">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm gap-2 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
