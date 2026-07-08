import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronLeft, Circle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ⚠️ LƯU Ý QUAN TRỌNG KHI COPY VỀ MÁY CỦA BẠN (VS CODE):
// 1. Hãy BỎ COMMENT dòng import dưới đây để sử dụng thư viện STOMP thật:
import { Client } from '@stomp/stompjs';
// 2. XÓA BỎ đoạn "CLASS GIẢ LẬP" (từ dòng 11 đến 28) đi nhé!

// --- CLASS GIẢ LẬP ĐỂ MÔI TRƯỜNG XEM TRƯỚC (CANVAS) KHÔNG BỊ LỖI ---
// class Client {
//   isMock: boolean = true;
//   brokerURL: string = '';
//   reconnectDelay: number = 0;
//   debug: (str: string) => void = () => {};
//   onConnect: () => void = () => {};
//   onStompError: (frame: any) => void = () => {};
//   constructor(options: any) {
//     if (options) Object.assign(this, options);
//   }
//   activate() {
//     console.log("Đang giả lập kết nối STOMP trên Canvas...");
//     setTimeout(() => this.onConnect(), 1000);
//   }
//   deactivate() {}
//   subscribe(topic: string, callback: any) {}
//   publish(params: any) {
//     console.log("Giả lập gửi tin nhắn STOMP:", params);
//   }
// }
// --- KẾT THÚC CLASS GIẢ LẬP ---

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface ChatMessage {
  senderEmail: string;
  receiverEmail?: string;
  content: string;
  timestamp: string;
  type?: 'CHAT' | 'JOIN' | 'LEAVE';
}

interface ChatContact {
  email: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
}

export default function ChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // 1. Quản lý trạng thái Auth động
  const [authInfo, setAuthInfo] = useState({
    email: localStorage.getItem('userEmail') || '',
    role: localStorage.getItem('role') || ''
  });

  const isGuest = !authInfo.email;
  // Bác sĩ và Admin đều là Staff
  const isStaff = authInfo.role === 'ADMIN' || authInfo.role === 'DOCTOR';

  const [view, setView] = useState<'LIST' | 'CHAT'>(isStaff ? 'LIST' : 'CHAT');
  // Bệnh nhân luôn nhắn cho STAFF, Nhân viên thì cần chọn khách hàng cụ thể
  const [activeContact, setActiveContact] = useState<string | null>(isStaff ? null : 'STAFF');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Lắng nghe đăng nhập/đăng xuất
  useEffect(() => {
    const handleAuthChange = () => {
      const email = localStorage.getItem('userEmail') || '';
      const role = localStorage.getItem('role') || '';
      setAuthInfo({ email, role });
      
      if (!email) {
        setIsOpen(false);
        if (stompClient) {
          stompClient.deactivate();
          setStompClient(null);
          setIsConnected(false);
        }
        setMessages([]);
        setContacts([]);
      } else {
        setView(role === 'ADMIN' || role === 'DOCTOR' ? 'LIST' : 'CHAT');
        setActiveContact(role === 'ADMIN' || role === 'DOCTOR' ? null : 'STAFF');
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [stompClient]);

  // 3. Logic mở Chat & Tải dữ liệu ban đầu
  useEffect(() => {
    if (isOpen && !isGuest) {
      if (isStaff && view === 'LIST') {
        fetchActiveRooms();
      } else if (!isStaff) {
        fetchChatHistory(authInfo.email);
      }
      
      if (!stompClient) {
        connectToChat();
      }
    }
  }, [isOpen, authInfo.email, view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view, isOpen, isLoadingHistory]);

  const fetchActiveRooms = async () => {
    try {
      const res = await apiClient.get('/chat/rooms');
      const formattedContacts = (res.data.result || res.data).map((room: any) => ({
        email: room.patientEmail,
        name: room.patientName,
        lastMessage: room.lastMessage,
        unreadCount: 0 
      }));
      setContacts(formattedContacts);
    } catch (e) { console.error("Lỗi tải danh sách phòng", e); }
  };

  const fetchChatHistory = async (patientEmail: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await apiClient.get(`/chat/history?patientEmail=${patientEmail}`);
      setMessages(res.data.result || res.data);
    } catch (e) { console.error("Lỗi tải lịch sử chat", e); } finally {
      setIsLoadingHistory(false);
    }
  };

  // --- HÀM XỬ LÝ TIN NHẮN ĐẾN (DÙNG CHUNG CHO CẢ STAFF VÀ PATIENT) ---
  const handleIncomingMessage = (receivedMessage: ChatMessage) => {
    setMessages((prev) => [...prev, receivedMessage]);

    if (isStaff) {
       // Xác định ai là Khách hàng trong cuộc hội thoại này
       // Nếu gửi cho STAFF -> Khách là người gửi. Nếu STAFF trả lời -> Khách là người nhận.
       const contactEmail = receivedMessage.receiverEmail === 'STAFF' 
              ? receivedMessage.senderEmail 
              : receivedMessage.receiverEmail!;
       
       setContacts(prev => {
          const existing = prev.find(c => c.email === contactEmail);
          if (existing) {
              return prev.map(c => c.email === contactEmail ? {
                  ...c,
                  lastMessage: receivedMessage.content,
                  unreadCount: (activeContact === contactEmail && view === 'CHAT') ? 0 : c.unreadCount + 1
              } : c);
          } else {
              return [{
                  email: contactEmail,
                  name: contactEmail.split('@')[0],
                  lastMessage: receivedMessage.content,
                  unreadCount: (activeContact === contactEmail && view === 'CHAT') ? 0 : 1
              }, ...prev];
          }
       });
    }
  };

  // --- KẾT NỐI WEBSOCKET ---
  const connectToChat = () => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      debug: (str: string) => console.log(str),
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log("Đã kết nối STOMP thành công!");
      
      if (isStaff) {
        // NHÂN VIÊN LẮNG NGHE KÊNH CHUNG
        client.subscribe(`/topic/staff`, (msg: any) => {
          handleIncomingMessage(JSON.parse(msg.body));
        });
      } else {
        // BỆNH NHÂN LẮNG NGHE KÊNH RIÊNG
        client.subscribe(`/queue/messages/${authInfo.email}`, (msg: any) => {
          handleIncomingMessage(JSON.parse(msg.body));
        });
      }
    };

    client.activate();
    setStompClient(client);
  };

  const disconnectChat = () => {
    setIsOpen(false);
    if (isStaff) {
      setView('LIST');
      setActiveContact(null);
    }
  };

  const handleContactClick = (contactEmail: string) => {
    setActiveContact(contactEmail);
    setView('CHAT');
    fetchChatHistory(contactEmail);
    setContacts(prev => prev.map(c => c.email === contactEmail ? { ...c, unreadCount: 0 } : c));
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && isConnected && stompClient) {
      const receiver = isStaff ? activeContact : 'STAFF';
      if (!receiver) return;

      const chatMessage = {
        senderEmail: authInfo.email,
        receiverEmail: receiver,
        content: messageInput.trim(),
        type: 'CHAT',
        timestamp: new Date().toISOString()
      };

      stompClient.publish({
        destination: '/app/chat.sendPrivateMessage',
        body: JSON.stringify(chatMessage)
      });

      // Nếu đang dùng class Mock (Canvas), giả lập tự hiển thị tin nhắn
      if ((stompClient as any).isMock) {
        setMessages(prev => [...prev, chatMessage as ChatMessage]);
      }

      setMessageInput('');
    }
  };

  // --- BỘ LỌC HIỂN THỊ TIN NHẮN (QUAN TRỌNG) ---
  // Nhân viên thấy tin nhắn nếu Khách hàng là người gửi HOẶC Khách hàng là người nhận
  const visibleMessages = isStaff 
    ? messages.filter(m => m.senderEmail === activeContact || m.receiverEmail === activeContact)
    : messages;

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition flex items-center justify-center z-50">
          <MessageSquare className="w-6 h-6" />
          {isStaff && contacts.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[32rem] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          
          {/* MÀN HÌNH KHÁCH (CHƯA ĐĂNG NHẬP) */}
          {isGuest && (
            <div className="flex flex-col h-full">
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> Hỗ trợ trực tuyến</h3>
                <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Xin chào!</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Vui lòng đăng nhập vào hệ thống để trò chuyện trực tiếp với Bác sĩ và đội ngũ hỗ trợ của chúng tôi.
                </p>
                <button 
                  onClick={() => { setIsOpen(false); navigate('/login'); }}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                >
                  <LogIn className="w-4 h-4 mr-2" /> Đăng nhập ngay
                </button>
              </div>
            </div>
          )}

          {/* MÀN HÌNH DANH SÁCH BỆNH NHÂN (DÀNH CHO STAFF) */}
          {!isGuest && view === 'LIST' && (
            <div className="flex flex-col h-full">
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> Hỗ trợ khách hàng</h3>
                <button onClick={disconnectChat}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100">
                {contacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Chưa có khách hàng nào.</div>
                ) : contacts.map((c, i) => (
                  <div key={i} onClick={() => handleContactClick(c.email)} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center transition">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 shrink-0 relative">
                      {c.name.charAt(0).toUpperCase()}
                      {c.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{c.email}</h4>
                      <p className={`text-xs truncate ${c.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{c.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MÀN HÌNH KHUNG CHAT CHI TIẾT */}
          {!isGuest && view === 'CHAT' && (
            <div className="flex flex-col h-full">
              <div className="bg-blue-600 p-3 flex justify-between items-center text-white shadow-sm z-10">
                <div className="flex items-center">
                  {isStaff && (
                    <button onClick={() => setView('LIST')} className="mr-2 p-1 hover:bg-blue-700 rounded"><ChevronLeft className="w-5 h-5" /></button>
                  )}
                  <div>
                    <h3 className="font-bold text-sm">{isStaff ? activeContact : 'Phòng khám MediCare'}</h3>
                    <p className="text-[10px] text-blue-100 flex items-center mt-0.5">
                      <Circle className={`w-2 h-2 mr-1 ${isConnected ? 'fill-green-400 text-green-400' : 'fill-gray-400 text-gray-400'}`} /> 
                      {isConnected ? 'Trực tuyến' : 'Đang kết nối...'}
                    </p>
                  </div>
                </div>
                <button onClick={disconnectChat}><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
                {isLoadingHistory ? (
                  <div className="text-center text-gray-500 text-sm my-auto">Đang tải lịch sử tin nhắn...</div>
                ) : visibleMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs my-auto bg-white p-3 rounded-lg border border-gray-100">
                    Bắt đầu cuộc trò chuyện.
                  </div>
                ) : (
                  visibleMessages.map((msg, index) => {
                    const isMe = msg.senderEmail === authInfo.email;
                    return (
                      <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Hiển thị email của người gửi nếu đó không phải là mình (Hữu ích khi nhiều bác sĩ cùng support) */}
                        {!isMe && isStaff && (
                           <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.senderEmail}</span>
                        )}
                        <div className={`px-4 py-2 max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'}`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !isConnected}
                  className={`ml-2 p-2.5 rounded-full flex items-center justify-center transition ${!messageInput.trim() || !isConnected ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}