import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;

const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;


// Cấu hình headers cho API request
const pinataHeaders = {
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_API_KEY,
  }
};

/**
 * Upload file lên Pinata IPFS
 * @param {File} file - File cần upload
 * @param {string} name - Tên file trên IPFS
 * @returns {Promise<string>} - IPFS URL của file
 */
export const uploadFileToPinata = async (file, name) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys are not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Metadata cho file
    const metadata = JSON.stringify({
      name: name || file.name,
    });
    formData.append('pinataMetadata', metadata);
    
    // Cấu hình options cho pinning
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    // Gửi request đến Pinata API
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          ...pinataHeaders.headers,
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        }
      }
    );

    // Trả về IPFS URI format
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error('Failed to upload file to IPFS: ' + (error.response?.data?.error || error.message));
  }
};

/**
 * Upload JSON metadata lên Pinata IPFS
 * @param {Object} jsonData - Dữ liệu JSON cần upload
 * @param {string} name - Tên cho metadata
 * @returns {Promise<string>} - IPFS URL của metadata
 */
export const uploadJSONToPinata = async (jsonData, name) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys are not configured');
    }

    const data = JSON.stringify({
      pinataOptions: {
        cidVersion: 0
      },
      pinataMetadata: {
        name: name || 'metadata.json',
      },
      pinataContent: jsonData
    });

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          ...pinataHeaders.headers,
          'Content-Type': 'application/json'
        }
      }
    );

    // Trả về IPFS URI format
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error('Failed to upload metadata to IPFS: ' + (error.response?.data?.error || error.message));
  }
};

/**
 * Tạo metadata cho collection và upload lên IPFS
 * @param {Object} collectionData - Dữ liệu collection
 * @param {string} bannerUrl - IPFS URL của banner
 * @param {string} logoUrl - IPFS URL của logo
 * @returns {Promise<string>} - IPFS URL của metadata
 */
export const createAndUploadCollectionMetadata = async (collectionData, bannerUrl, logoUrl) => {
  try {
    const metadata = {
      name: collectionData.name,
      symbol: collectionData.symbol,
      description: collectionData.description,
      image: logoUrl, // Logo URL
      banner: bannerUrl, // Banner URL
      category: collectionData.category,
      external_link: '',
      seller_fee_basis_points: 0, // Phí bán hàng, ví dụ: 250 = 2.5%
      fee_recipient: '',
      created_at: new Date().toISOString()
    };

    return await uploadJSONToPinata(metadata, `${collectionData.symbol}_metadata`);
  } catch (error) {
    console.error('Error creating collection metadata:', error);
    throw new Error('Failed to create collection metadata: ' + error.message);
  }
}; 