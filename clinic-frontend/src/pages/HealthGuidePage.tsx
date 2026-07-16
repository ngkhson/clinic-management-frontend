import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, HeartPulse, Apple, Activity, Thermometer, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HealthGuidePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Dinh dưỡng', icon: <Apple className="w-6 h-6 text-green-500" />, color: 'bg-green-50' },
    { name: 'Tim mạch', icon: <HeartPulse className="w-6 h-6 text-red-500" />, color: 'bg-red-50' },
    { name: 'Thể chất', icon: <Activity className="w-6 h-6 text-blue-500" />, color: 'bg-blue-50' },
    { name: 'Bệnh thường gặp', icon: <Thermometer className="w-6 h-6 text-orange-500" />, color: 'bg-orange-50' },
  ];

  const articles = [
    {
      id: 1,
      title: '7 Thói Quen Nhỏ Giúp Bạn Khỏe Mạnh Hơn Mỗi Ngày',
      category: 'Thể chất',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: 'Hiểu Đúng Về Chế Độ Ăn Eat Clean Dành Cho Người Mới',
      category: 'Dinh dưỡng',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'Cách Nhận Biết Sớm Các Dấu Hiệu Về Tim Mạch',
      category: 'Tim mạch',
      readTime: '6 phút đọc',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 4,
      title: 'Phòng Tránh Cảm Cúm Hiệu Quả Trong Mùa Giao Mùa',
      category: 'Bệnh thường gặp',
      readTime: '4 phút đọc',
      image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 5,
      title: 'Tầm Quan Trọng Của Giấc Ngủ Đối Với Sức Khỏe Tinh Thần',
      category: 'Thể chất',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 6,
      title: 'Các Loại Siêu Thực Phẩm Chống Lão Hóa Dành Cho Phụ Nữ',
      category: 'Dinh dưỡng',
      readTime: '8 phút đọc',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 7,
      title: 'Chế Độ Dinh Dưỡng Dành Riêng Cho Người Cao Huyết Áp',
      category: 'Dinh dưỡng',
      readTime: '6 phút đọc',
      image: 'https://nmni-usa.com/wp-content/uploads/2024/02/che-do-an-dash-diet.png'
    },
    {
      id: 8,
      title: 'Bài Tập Yoga Giảm Đau Lưng Cổ Cho Dân Văn Phòng',
      category: 'Thể chất',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 9,
      title: 'Sơ Cứu Đúng Cách Khi Trẻ Bị Sốt Cao Co Giật',
      category: 'Bệnh thường gặp',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchCategory = selectedCategory ? article.category === selectedCategory : true;
    const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Cẩm Nang Sức Khỏe</h1>
          <p className="text-lg text-gray-600">
            Nơi chia sẻ những kiến thức y khoa hữu ích, bí quyết sống khỏe và các thông tin phòng bệnh từ các chuyên gia y tế hàng đầu.
          </p>
        </div>

        {/* Danh mục */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                  className={`${cat.color} rounded-2xl p-6 text-center cursor-pointer hover:-translate-y-1 transition-transform border ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-white/50 shadow-sm'}`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    {cat.icon}
                  </div>
                  <h3 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{cat.name}</h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `Danh mục: ${selectedCategory}` : 'Bài viết mới nhất'}
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center text-sm"
              >
                Xóa bộ lọc <X className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
              <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="mt-4 text-blue-600 font-semibold hover:underline">Xóa bộ lọc</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => navigate(`/health-guide/article/${article.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {article.category}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2 font-medium">{article.readTime}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <button className="text-blue-600 font-semibold text-sm flex items-center group-hover:underline">
                    Đọc tiếp <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

      </div>
    </div>
  );
}
