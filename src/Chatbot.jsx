import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi là chatbot tư vấn tuyển sinh của Đại học Giao thông Vận tải TP.HCM (UTH). Hãy để tôi hỗ trợ bạn nhé!" }
  ]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sender: "user", message: input })
      });

      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((msg) => {
          if (msg.text) {
            const botReply = {
              sender: "bot",
              text: msg.text
            };
            setMessages(prev => [...prev, botReply]);
          }
        });
      } else {
        const botReply = {
          sender: "bot",
          text: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi lại không?"
        };
        setMessages(prev => [...prev, botReply]);
      }
    } catch (error) {
      const botReply = {
        sender: "bot",
        text: "Đã xảy ra lỗi khi kết nối với máy chủ Rasa."
      };
      setMessages(prev => [...prev, botReply]);
      console.error("Error:", error);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {!showChat && (
        <button className="chat-toggle" onClick={() => setShowChat(true)}>
          💬
        </button>
      )}

      {showChat && (
        <div className="chatbot-wrapper">
          <div className="chatbot-container">
            <div className="chat-header">
                <span className="highlight">UTH</span>
                <button className="close-btn" onClick={() => setShowChat(false)}>×</button>
            </div>
            <div className="chat-body">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
              />
              <button onClick={handleSend}>&gt;</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
