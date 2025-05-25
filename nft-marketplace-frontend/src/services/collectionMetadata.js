import axios from 'axios';

const API_ENDPOINT = 'http://localhost:3000/api';

/**
 * Fetch metadata của collection từ IPFS
 * @param {string} metadataUrl - URL metadata trên IPFS
 * @returns {Promise<Object|null>} - Metadata của collection hoặc null nếu có lỗi
 */
export const fetchCollectionMetadata = async (metadataUrl) => {
  if (!metadataUrl) return null;
  
  try {
    const response = await axios.get(metadataUrl, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error fetching collection metadata:', error);
    return null;
  }
};

/**
 * Lấy metadata của collection từ địa chỉ
 * @param {string} collectionAddress - Địa chỉ của collection
 * @returns {Promise<Object|null>} - Metadata của collection hoặc null nếu có lỗi
 */
export const getCollectionMetadata = async (collectionAddress) => {
  if (!collectionAddress) return null;
  
  try {
    // Lấy metadata URL từ API
    const response = await axios.get(`${API_ENDPOINT}/collections/${collectionAddress}`);
    const { data } = response;
    
    if (!data || !data.data || !data.data.metadataUrl) return null;
    
    // Fetch metadata từ IPFS
    return await fetchCollectionMetadata(data.data.metadataUrl);
  } catch (error) {
    console.error('Error getting collection metadata:', error);
    return null;
  }
}; 