import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import { useNFTCollection } from '../../contracts/hooks/useNFTCollection';
import { useWeb3 } from '../../hooks/useWeb3';
import { uploadFileToPinata, uploadJSONToPinata } from '../../services/ipfs';
import { ethers } from 'ethers';
import NFTCollectionJSON from '../../contracts/abis/NFTCollection.json';
import { uploadToIPFS } from '../../utils/algorithm';

// Custom FileUpload component với tỷ lệ hình vuông
const SquareFileUpload = ({ onChange, previewUrl, inputRef }) => {
  const [localPreviewUrl, setLocalPreviewUrl] = useState(previewUrl);
  const localInputRef = useRef(null);
  
  // Use the provided ref or local ref
  const fileInputRef = inputRef || localInputRef;

  useEffect(() => {
    setLocalPreviewUrl(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (file) => {
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-[256px] h-[256px] flex-shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />
      
      {localPreviewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-full rounded-2xl overflow-hidden cursor-pointer group relative"
        >
          <img
            src={localPreviewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white">Change Image</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-full rounded-2xl border-2 border-dashed border-white/20 hover:border-neon-purple/50 transition-colors cursor-pointer relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-glass-card group-hover:bg-glass-white transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-glass-white flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4-4m0 0L20 4m-4 4l4-4m-4 4l-4 4m4-4l4 4m-12 4l4-4"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white">
                Click to upload
              </p>
              <p className="text-sm text-gray-400 mt-2">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MintNFT = ({ collections = [] }) => {
  const { active, account, library, chainId } = useWeb3();
  const [selectedCollection, setSelectedCollection] = useState('');
  const { mint } = useNFTCollection(selectedCollection);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mintingStatus, setMintingStatus] = useState('');
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [mintedTokenURI, setMintedTokenURI] = useState('');
  const [collectionsData, setCollectionsData] = useState(collections);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fileInputRef = useRef(null);

  // Update collectionsData when collections prop changes
  useEffect(() => {
    setCollectionsData(collections);
  }, [collections]);

  // Refresh collections data after minting
  useEffect(() => {
    const refreshCollectionsData = async () => {
      if (!active || !library || !chainId || refreshTrigger === 0) return;

      try {
        setMintingStatus('Refreshing collections data...');
        
        // Create updated collections array
        const updatedCollections = await Promise.all(
          collectionsData.map(async (collection) => {
            try {
              // Create contract instance
              const collectionContract = new ethers.Contract(
                collection.address,
                NFTCollectionJSON.abi,
                library.getSigner()
              );
              
              // Get updated collection info
              const info = await collectionContract.getCollectionInfo();
              
              return {
                ...collection,
                name: info.name,
                symbol: info.symbol,
                owner: info.owner,
                totalSupply: Number(info.totalSupply)
              };
            } catch (err) {
              console.error(`Error refreshing collection ${collection.address}:`, err);
              return collection;
            }
          })
        );
        
        setCollectionsData(updatedCollections);
        setMintingStatus('Collections data refreshed successfully');
      } catch (error) {
        console.error('Error refreshing collections data:', error);
        setMintingStatus('Failed to refresh collections data');
      }
    };
    
    refreshCollectionsData();
  }, [refreshTrigger, active, library, chainId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProperty = () => {
    setProperties([...properties, { trait_type: '', value: '' }]);
  };

  const updateProperty = (index, field, value) => {
    const updatedProperties = [...properties];
    updatedProperties[index][field] = value;
    setProperties(updatedProperties);
  };

  const removeProperty = (index) => {
    setProperties(properties.filter((_, i) => i !== index));
  };


  const createMetadata = async (imageUrl) => {
    try {
      setMintingStatus('Creating metadata...');
      
      // Validate và chuẩn hóa imageUrl
      const normalizedImageUrl = imageUrl.replace('ipfs://ipfs://', 'ipfs://');
      if (!normalizedImageUrl.startsWith('ipfs://')) {
        throw new Error('Image URL must be IPFS URI format');
      }

      // Create metadata object according to ERC721 Metadata standard
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: normalizedImageUrl,
        attributes: properties.filter(prop => prop.trait_type && prop.value)
      };

      console.log('Created metadata:', metadata);
      
      // Upload metadata to IPFS
      const metadataFileName = `${formData.name.replace(/\s+/g, '_')}_metadata_${Date.now()}`;
      const metadataUrl = await uploadJSONToPinata(metadata, metadataFileName);
      
      // Đảm bảo metadataUrl có đúng một prefix ipfs://
      const ipfsHash = metadataUrl.replace('ipfs://', '');
      const normalizedMetadataUrl = `ipfs://${ipfsHash}`;
      
      console.log('Metadata URL:', normalizedMetadataUrl);
      return normalizedMetadataUrl;
    } catch (error) {
      console.error('Error creating metadata:', error);
      throw error;
    }
  };

  const handleMintSuccess = async (tokenId, contractAddress) => {
    try {
      // Kiểm tra metadata trước
      const provider = library.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTCollectionJSON.abi, provider);
      const uri = await contract.tokenURI(tokenId);
      console.log("Token URI from contract:", uri);
      
      // Thử fetch metadata
      let metadata;
      try {
        // URI từ contract đã có prefix ipfs://, chỉ cần chuyển sang HTTP URL
        const ipfsHash = uri.replace('ipfs://', '');
        const url = `https://ipfs.io/ipfs/${ipfsHash}`;
        console.log("Fetching metadata from:", url);
        
        const response = await fetch(url);
        metadata = await response.json();
        console.log("Metadata:", metadata);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
      
      // Thêm vào Metamask
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contractAddress,
            tokenId: tokenId.toString()
          },
        },
      });
      
      toast.success('NFT added to MetaMask');
      
      // Log thêm thông tin debug
      console.log("NFT Details:", {
        contractAddress,
        tokenId: tokenId.toString(),
        uri,
        metadata
      });
    } catch (error) {
      console.error('Error adding NFT to MetaMask:', error);
      toast.error('Failed to add NFT to MetaMask');
    }
  };

  const mintNFT = async (collectionAddress, tokenURI) => {
    try {
      setMintingStatus('Minting NFT on blockchain...');
      
      console.log('Collection Address:', collectionAddress);
      console.log('Original Token URI:', tokenURI);
      
      // Create contract instance
      const signer = library.getSigner();
      const nftContract = new ethers.Contract(
        collectionAddress,
        NFTCollectionJSON.abi,
        signer
      );
      
      // Bỏ prefix ipfs:// vì baseURI trong contract đã có
      const normalizedURI = tokenURI.replace('ipfs://', '');
      console.log('URI to be minted (without prefix):', normalizedURI);
      
      // Call mint function với URI đã bỏ prefix
      const tx = await nftContract.mint(normalizedURI);
      console.log('Transaction submitted:', tx.hash);
      setMintingStatus('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Get the tokenId from the event
      const mintEvent = receipt.events?.find(e => e.event === 'NFTMinted');
      let tokenId;
      if (mintEvent && mintEvent.args) {
        tokenId = mintEvent.args.tokenId.toString();
        console.log('Minted token ID:', tokenId);
        setMintedTokenId(tokenId); // Cập nhật state
      } else {
        throw new Error('Could not get token ID from mint event');
      }
      
      setMintingStatus('NFT minted successfully!');
      
      // Sau khi mint thành công và có tokenId, gọi hàm debug
      await handleMintSuccess(tokenId, collectionAddress);
      
      return receipt;
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintingStatus('Error minting NFT: ' + error.message);
      throw error;
    }
  };

  const handleFileChange = (file) => {
    setFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!active) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedCollection) {
      toast.error('Please select a collection');
      return;
    }
    
    if (!file) {
      toast.error('Please upload an image for your NFT');
      return;
    }
    
    if (!formData.name) {
      toast.error('Please enter a name for your NFT');
      return;
    }
    
    try {
      setLoading(true);
      toast.loading('Creating your NFT...', { id: 'mint-nft' });
      
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(file);
      
      if (!imageUrl) {
        throw new Error('Failed to upload image to IPFS');
      }
      
      // Create metadata
      const metadataUrl = await createMetadata(imageUrl);

      if (!metadataUrl) {
        throw new Error('Failed to create metadata');
      }

      // Mint NFT
      const receipt = await mintNFT(selectedCollection, metadataUrl);

      toast.success('NFT minted successfully!', { id: 'mint-nft' });
      
      // Trigger refresh of collections data
      setRefreshTrigger(prev => prev + 1);
      
      // Reset form after successful mint
      setFormData({
        name: '',
        description: '',
      });
      setSelectedCollection('');
      setFile(null);
      setPreviewUrl(null);
      setProperties([]);
      
      // Make sure the SquareFileUpload component is reset
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Mint NFT error:', error);
      toast.error(`Failed to mint NFT: ${error.message}`, { id: 'mint-nft' });
    } finally {
      setLoading(false);
    }
  };

  // Find selected collection details from our local state
  const selectedCollectionDetails = collectionsData.find(c => c.address === selectedCollection);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-panel p-8 backdrop-blur-sm border border-white/5 rounded-xl">
            {/* Collection Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
                Collection
              </label>
              <div className="relative">
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 appearance-none"
                  required
                >
                  <option value="" disabled>Select a collection</option>
                  {collectionsData.map((collection) => (
                    <option key={collection.address} value={collection.address}>
                      {collection.name} ({collection.symbol}) - {collection.totalSupply} NFTs
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {selectedCollectionDetails && (
                <div className="mt-2 p-3 bg-dark-300/30 rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {selectedCollectionDetails.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{selectedCollectionDetails.name}</p>
                    <p className="text-xs text-gray-400">{selectedCollectionDetails.totalSupply} NFTs</p>
                  </div>
                </div>
              )}
            </div>

            {/* NFT Image Upload - Centered */}
            <div className="mb-8">
              <label className="block text-sm font-medium bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
                NFT Image
              </label>
              <div className="flex justify-center">
                <SquareFileUpload onChange={handleFileChange} previewUrl={previewUrl} inputRef={fileInputRef} />
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter NFT name"
                    required
                    className="w-full px-4 py-3 bg-dark-300/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 resize-none"
                  placeholder="Describe your NFT..."
                  required
                />
              </div>

              {/* Properties */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                    Properties
                  </label>
                  <button
                    type="button" 
                    onClick={addProperty}
                    className="relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 bg-glass-card backdrop-blur-xl border border-white/10text-white shadow-glass hover:bg-glass-white hover:shadow-lg hover:shadow-white/20 "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Property</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {properties.map((property, index) => (
                    <div key={index} className="flex gap-4 items-center p-3 bg-dark-300/30 rounded-lg border border-white/5 animate-fadeIn">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Property name"
                          value={property.trait_type}
                          onChange={(e) => updateProperty(index, 'trait_type', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-300/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Property value"
                          value={property.value}
                          onChange={(e) => updateProperty(index, 'value', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-300/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="glass"
                        onClick={() => removeProperty(index)}
                        className="flex-shrink-0 p-2 h-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  ))}

                  {properties.length === 0 && (
                    <div className="p-4 bg-dark-300/20 rounded-lg border border-dashed border-white/10 text-center">
                      <p className="text-gray-400 text-sm">Add properties to your NFT (optional)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !active || !selectedCollection || !file}
              className="min-w-[200px] py-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Minting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Mint NFT</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="lg:col-span-1">
        <div className="glass-panel p-8 backdrop-blur-sm border border-white/5 rounded-xl sticky top-8 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">NFT Preview</h3>

          {/* NFT Preview Image */}
          <div className="flex justify-center mb-8">
            <div className="w-[256px] h-[256px] flex-shrink-0 rounded-xl overflow-hidden bg-dark-300/50 border border-white/10">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="NFT Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-400">No image uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 px-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-white font-medium">{formData.name || 'Untitled NFT'}</p>
            </div>

            {formData.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-300 text-sm line-clamp-3">{formData.description}</p>
              </div>
            )}

            {properties.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Properties</p>
                <div className="grid grid-cols-2 gap-2">
                  {properties.filter(p => p.trait_type && p.value).map((prop, index) => (
                    <div key={index} className="bg-dark-300/30 p-2 rounded-lg border border-white/5 text-center">
                      <p className="text-xs text-neon-purple truncate">{prop.trait_type}</p>
                      <p className="text-sm text-white truncate">{prop.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCollectionDetails && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Collection</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {selectedCollectionDetails.symbol.charAt(0)}
                  </div>
                  <p className="text-white text-sm">{selectedCollectionDetails.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNFT; 