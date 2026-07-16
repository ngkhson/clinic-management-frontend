import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Share2, Heart } from 'lucide-react';

const MOCK_ARTICLES: Record<string, any> = {
  '1': {
    title: '7 Thói Quen Nhỏ Giúp Bạn Khỏe Mạnh Hơn Mỗi Ngày',
    category: 'Thể chất',
    readTime: '5 phút đọc',
    date: '15/07/2026',
    author: 'BS. Nguyễn Văn A',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Cuộc sống bận rộn khiến chúng ta thường bỏ quên việc chăm sóc bản thân. Tuy nhiên, chỉ với những thói quen nhỏ mỗi ngày, bạn hoàn toàn có thể cải thiện sức khỏe thể chất và tinh thần một cách đáng kể.</p>
      
      <h3>1. Uống đủ nước ngay khi thức dậy</h3>
      <p>Sau một đêm dài cơ thể bị mất nước, việc bổ sung ngay 300-500ml nước ấm vào buổi sáng sẽ giúp đánh thức các cơ quan nội tạng, tăng cường trao đổi chất và thanh lọc cơ thể.</p>
      
      <h3>2. Vận động nhẹ nhàng 15 phút</h3>
      <p>Không nhất thiết phải đến phòng gym, những bài tập giãn cơ cơ bản, đi bộ quanh nhà hay yoga nhẹ nhàng cũng đủ để giúp máu huyết lưu thông và bắt đầu ngày mới tràn đầy năng lượng.</p>

      <h3>3. Ăn sáng đầy đủ dinh dưỡng</h3>
      <p>Bữa sáng là bữa quan trọng nhất. Hãy đảm bảo bữa sáng của bạn có đủ protein, chất xơ và vitamin để duy trì mức năng lượng ổn định cho đến trưa.</p>

      <h3>4. Thực hành hít thở sâu</h3>
      <p>Mỗi khi cảm thấy căng thẳng, hãy dành ra 2 phút để hít thở sâu. Nhịp thở chậm và đều sẽ gửi tín hiệu thư giãn đến não bộ, làm giảm nhịp tim và ổn định huyết áp.</p>

      <h3>5. Giảm thời gian nhìn màn hình trước khi ngủ</h3>
      <p>Ánh sáng xanh từ điện thoại và máy tính làm giảm tiết melatonin (hormone giấc ngủ). Hãy tắt thiết bị điện tử ít nhất 30 phút trước khi lên giường để có giấc ngủ sâu hơn.</p>
    `
  },
  '2': {
    title: 'Hiểu Đúng Về Chế Độ Ăn Eat Clean Dành Cho Người Mới',
    category: 'Dinh dưỡng',
    readTime: '7 phút đọc',
    date: '10/07/2026',
    author: 'Chuyên gia Dinh dưỡng Trần Thị B',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Eat Clean không phải là một chế độ ăn kiêng khắt khe, mà là một lối sống ưu tiên sử dụng thực phẩm toàn phần, tự nhiên và ít qua chế biến nhất có thể.</p>
      
      <h3>Nguyên tắc cơ bản của Eat Clean</h3>
      <p>1. <strong>Ăn thực phẩm nguyên bản:</strong> Ưu tiên rau củ quả tươi, ngũ cốc nguyên cám, thịt tươi sống thay vì đồ hộp, xúc xích, thực phẩm chế biến sẵn.</p>
      <p>2. <strong>Cắt giảm đường tinh luyện:</strong> Thay thế đường kính bằng các loại đường tự nhiên từ trái cây, mật ong (với lượng vừa phải).</p>
      <p>3. <strong>Uống đủ nước:</strong> Nước là yếu tố quan trọng trong quá trình chuyển hóa dinh dưỡng.</p>
      
      <h3>Lợi ích của Eat Clean</h3>
      <p>Việc áp dụng Eat Clean giúp cải thiện làn da, hỗ trợ giảm cân một cách lành mạnh và phòng ngừa các bệnh lý về tim mạch, tiểu đường.</p>
    `
  },
  '3': {
    title: 'Cách Nhận Biết Sớm Các Dấu Hiệu Về Tim Mạch',
    category: 'Tim mạch',
    readTime: '6 phút đọc',
    date: '05/07/2026',
    author: 'BS. Lê C',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Bệnh tim mạch là một trong những nguyên nhân gây tử vong hàng đầu thế giới. Tuy nhiên, nếu phát hiện sớm, chúng ta hoàn toàn có thể kiểm soát và điều trị hiệu quả.</p>
      
      <h3>Các dấu hiệu cảnh báo không nên bỏ qua:</h3>
      <p><strong>1. Đau thắt ngực:</strong> Cảm giác bị đè nặng, bóp nghẹt ở vùng ngực, có thể lan ra cánh tay, vai, cổ hoặc hàm.</p>
      <p><strong>2. Khó thở:</strong> Xuất hiện ngay cả khi vận động nhẹ hoặc khi nằm nghỉ.</p>
      <p><strong>3. Nhịp tim không đều:</strong> Tim đập nhanh, đánh trống ngực hoặc bỏ nhịp.</p>
      <p><strong>4. Phù nề:</strong> Sưng ở mắt cá chân, bàn chân hoặc bụng do tim bơm máu kém khiến dịch ứ đọng.</p>
      
      <h3>Khi nào cần gặp bác sĩ?</h3>
      <p>Nếu bạn gặp phải cơn đau ngực kéo dài trên 5 phút kèm theo khó thở, đổ mồ hôi lạnh, hãy gọi cấp cứu ngay lập tức. Đừng chủ quan với bất kỳ dấu hiệu bất thường nào của cơ thể.</p>
    `
  },
  '4': {
    title: 'Phòng Tránh Cảm Cúm Hiệu Quả Trong Mùa Giao Mùa',
    category: 'Bệnh thường gặp',
    readTime: '4 phút đọc',
    date: '01/07/2026',
    author: 'BS. Phạm D',
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Mùa giao mùa với sự thay đổi thời tiết thất thường là điều kiện lý tưởng cho các loại virus cúm phát triển. Dưới đây là những biện pháp đơn giản nhưng vô cùng hiệu quả để bảo vệ sức khỏe của bạn và gia đình.</p>
      
      <h3>1. Rửa tay thường xuyên</h3>
      <p>Bàn tay là nơi tiếp xúc nhiều nhất với vi khuẩn, virus. Rửa tay bằng xà phòng hoặc dung dịch sát khuẩn giúp loại bỏ 90% nguy cơ lây nhiễm mầm bệnh từ môi trường.</p>
      
      <h3>2. Bổ sung Vitamin C tự nhiên</h3>
      <p>Cam, chanh, ổi và các loại rau xanh là nguồn cung cấp Vitamin C dồi dào, giúp tăng cường hệ miễn dịch, tạo ra "lá chắn" tự nhiên chống lại virus cúm.</p>
      
      <h3>3. Tiêm phòng vaccine cúm hằng năm</h3>
      <p>Đặc biệt đối với người già, trẻ nhỏ và những người có hệ miễn dịch yếu, việc tiêm phòng là vô cùng quan trọng để ngăn chặn các chủng cúm nguy hiểm.</p>
    `
  },
  '5': {
    title: 'Tầm Quan Trọng Của Giấc Ngủ Đối Với Sức Khỏe Tinh Thần',
    category: 'Thể chất',
    readTime: '5 phút đọc',
    date: '28/06/2026',
    author: 'Chuyên gia Tâm lý Hoàng E',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Giấc ngủ không chỉ là thời gian để cơ thể nghỉ ngơi, phục hồi thể chất mà còn là "khoảng thời gian vàng" để não bộ dọn dẹp, lưu trữ thông tin và tái tạo năng lượng tinh thần.</p>
      
      <h3>Hậu quả của việc thiếu ngủ kéo dài</h3>
      <p>Rối loạn lo âu, trầm cảm, giảm trí nhớ, mất khả năng tập trung là những biểu hiện rõ rệt nhất khi bạn ngủ không đủ 7-8 tiếng mỗi đêm.</p>
      
      <h3>Làm thế nào để cải thiện chất lượng giấc ngủ?</h3>
      <p>- Tránh xa các thiết bị điện tử ít nhất 1 giờ trước khi ngủ.<br/>- Đảm bảo phòng ngủ tối, mát mẻ và yên tĩnh.<br/>- Tránh sử dụng caffeine vào buổi chiều muộn.<br/>- Thiết lập một khung giờ đi ngủ và thức dậy cố định.</p>
    `
  },
  '6': {
    title: 'Các Loại Siêu Thực Phẩm Chống Lão Hóa Dành Cho Phụ Nữ',
    category: 'Dinh dưỡng',
    readTime: '8 phút đọc',
    date: '20/06/2026',
    author: 'BS. Lê Minh T',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Lão hóa là quy luật tự nhiên, tuy nhiên chúng ta hoàn toàn có thể làm chậm quá trình này thông qua chế độ dinh dưỡng hàng ngày. Những "siêu thực phẩm" dưới đây là chìa khóa cho một làn da tươi trẻ và một cơ thể khỏe mạnh.</p>
      
      <h3>1. Quả bơ</h3>
      <p>Chứa nhiều chất béo không bão hòa đơn, vitamin E và C, quả bơ không chỉ tốt cho tim mạch mà còn cấp ẩm, làm tăng độ đàn hồi cho da.</p>
      
      <h3>2. Quả mọng (Berries)</h3>
      <p>Việt quất, dâu tây, mâm xôi chứa hàm lượng chất chống oxy hóa (anthocyanin) cực cao, giúp bảo vệ tế bào khỏi sự tổn thương của các gốc tự do.</p>
      
      <h3>3. Cá hồi</h3>
      <p>Nguồn axit béo Omega-3 dồi dào trong cá hồi có tác dụng kháng viêm rất tốt, đồng thời hỗ trợ màng tế bào, giúp da luôn căng bóng, mịn màng.</p>
    `
  },
  '7': {
    title: 'Chế Độ Dinh Dưỡng Dành Riêng Cho Người Cao Huyết Áp',
    category: 'Dinh dưỡng',
    readTime: '6 phút đọc',
    date: '10/06/2026',
    author: 'TS. BS. Nguyễn Thị K',
    image: 'https://images.unsplash.com/photo-1490818387583-1b5ba4098493?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Tăng huyết áp được mệnh danh là "kẻ giết người thầm lặng". Tuy nhiên, chế độ ăn DASH (Dietary Approaches to Stop Hypertension) đã được chứng minh là có thể giúp kiểm soát huyết áp hiệu quả mà không cần lạm dụng thuốc.</p>
      
      <h3>1. Giảm lượng muối (Natri)</h3>
      <p>Nguyên tắc sống còn đối với người cao huyết áp là hạn chế ăn mặn. Không nên dùng quá 1 muỗng cà phê muối mỗi ngày (bao gồm cả muối trong nước mắm, xì dầu và thức ăn nhanh).</p>
      
      <h3>2. Tăng cường Kali</h3>
      <p>Kali giúp giảm bớt tác động của muối lên huyết áp. Chuối, khoai lang, rau chân vịt và cà chua là những thực phẩm giàu Kali bạn nên bổ sung vào thực đơn hàng ngày.</p>
      
      <h3>3. Hạn chế chất béo bão hòa</h3>
      <p>Tránh xa mỡ động vật, bơ, và các loại thịt đỏ để giảm lượng mỡ máu, bảo vệ thành mạch khỏi bị xơ vữa.</p>
    `
  },
  '8': {
    title: 'Bài Tập Yoga Giảm Đau Lưng Cổ Cho Dân Văn Phòng',
    category: 'Thể chất',
    readTime: '5 phút đọc',
    date: '02/06/2026',
    author: 'HLV Yoga Thanh T',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Ngồi liên tục 8 tiếng mỗi ngày trước màn hình máy tính khiến cột sống và các nhóm cơ vùng cổ vai gáy chịu áp lực lớn. Hãy dành ra 10 phút mỗi tối để thực hiện các tư thế Yoga đơn giản này.</p>
      
      <h3>1. Tư thế Con Mèo - Con Bò (Cat-Cow Pose)</h3>
      <p>Giúp massage toàn bộ cột sống, tăng độ linh hoạt cho lưng và giải tỏa áp lực ở đốt sống cổ.</p>
      
      <h3>2. Tư thế Em Bé (Child's Pose)</h3>
      <p>Đây là tư thế phục hồi tuyệt vời. Kéo giãn vùng thắt lưng, thư giãn tâm trí và giảm mệt mỏi hiệu quả sau một ngày làm việc dài.</p>
      
      <h3>3. Tư thế Rắn Hổ Mang (Cobra Pose)</h3>
      <p>Giúp mở rộng lồng ngực, kéo căng cơ bụng và giảm đau mỏi vùng lưng trên.</p>
    `
  },
  '9': {
    title: 'Sơ Cứu Đúng Cách Khi Trẻ Bị Sốt Cao Co Giật',
    category: 'Bệnh thường gặp',
    readTime: '7 phút đọc',
    date: '15/05/2026',
    author: 'BS. Nhi Khoa Trần V',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Sốt cao co giật là tình trạng thường gặp ở trẻ từ 6 tháng đến 5 tuổi. Mặc dù trông có vẻ đáng sợ, nhưng hầu hết các cơn co giật này đều lành tính nếu bố mẹ biết cách xử trí bình tĩnh và đúng khoa học.</p>
      
      <h3>1. Đặt trẻ nằm ở nơi an toàn</h3>
      <p>Đặt trẻ nằm nghiêng sang một bên trên mặt phẳng mềm (như giường hoặc thảm) để tránh đờm dãi làm nghẹt đường thở. Di chuyển các vật sắc nhọn hoặc cứng ra xa trẻ.</p>
      
      <h3>2. Tuyệt đối không cạy miệng trẻ</h3>
      <p>Một sai lầm phổ biến là cố gắng vắt chanh hoặc nhét vật cứng vào miệng trẻ để tránh cắn phải lưỡi. Điều này rất nguy hiểm, có thể làm gãy răng hoặc tắc nghẽn đường thở của trẻ.</p>
      
      <h3>3. Nới lỏng quần áo và hạ sốt</h3>
      <p>Cởi bớt quần áo, lau mát bằng nước ấm (không dùng nước đá lạnh). Khi cơn co giật qua đi (thường sau 1-3 phút), hãy đưa trẻ đến ngay cơ sở y tế gần nhất để bác sĩ thăm khám và tìm nguyên nhân gây sốt.</p>
    `
  }
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const article = MOCK_ARTICLES[id || ''];

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy bài viết!</h2>
        <button onClick={() => navigate('/health-guide')} className="mt-4 text-blue-600 hover:underline">
          Quay lại Cẩm nang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Header Image */}
      <div className="relative w-full h-80 md:h-96">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
          <button onClick={() => navigate('/health-guide')} className="text-white/80 hover:text-white flex items-center mb-6 w-fit font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại Cẩm nang
          </button>
          <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit mb-4 uppercase tracking-wider">
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center text-white/80 text-sm gap-4">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {article.date}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {article.readTime}</span>
            <span className="flex items-center font-medium bg-white/20 px-3 py-1 rounded-full">{article.author}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col md:flex-row gap-10">
        
        {/* Content */}
        <div className="flex-1 bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div 
            className="prose prose-lg prose-blue max-w-none 
                       prose-h3:text-2xl prose-h3:font-bold prose-h3:text-gray-900 prose-h3:mt-8 prose-h3:mb-4
                       prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                       prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

      </div>
    </div>
  );
}
