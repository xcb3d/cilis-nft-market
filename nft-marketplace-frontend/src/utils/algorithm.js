import { uploadFileToPinata } from "../services/ipfs";

const IPFS_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY_URL;

export const normalizeIPFSUrl = (url) => {
  if (!url) return '';

  // Thay thế 'ipfs://ipfs://' thành gateway
  if (url.includes('ipfs://ipfs://')) {
    url = url.replace('ipfs://ipfs://', IPFS_GATEWAY);
  }

  // Thay thế 'ipfs://' thành gateway
  url = url.replace('ipfs://', IPFS_GATEWAY);

  // Kiểm tra xem URL có bắt đầu bằng 'ipfs://' không
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', IPFS_GATEWAY);
  }

  // Xử lý các URL có gateway kép
  if (url.includes('/ipfs/ipfs/') || url.includes('/ipfs/https')) {
    // Trích xuất hash IPFS
    const ipfsHashMatch = url.match(/ipfs\/([a-zA-Z0-9]{46}|[a-zA-Z0-9]{59})/);
    if (ipfsHashMatch && ipfsHashMatch[1]) {
      return `${IPFS_GATEWAY}${ipfsHashMatch[1]}`;
    }
  }

  return url;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatAddress = (address) => {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const uploadToIPFS = async (file, formData) => {
  if (!file) return null;
  
  try {
    // Tự động xác định loại file dựa trên so sánh với formData
    let fileName;
    if (file === formData?.banner) {
      fileName = `${formData?.symbol}_banner`;
    } else if (file === formData?.logo) {
      fileName = `${formData?.symbol}_logo`;
    } else {
      // Sử dụng cách đặt tên từ hàm thứ hai cho các file khác
      fileName = `${formData?.name.replace(/\s+/g, '_')}_${Date.now()}`;
    }
    
    // Upload file lên Pinata
    const result = await uploadFileToPinata(file, fileName);
    
    // Đảm bảo kết quả có đúng một prefix ipfs://
    const ipfsHash = result.replace('ipfs://', '');
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
