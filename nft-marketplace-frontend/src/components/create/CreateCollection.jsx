import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import Button from '../common/Button';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import { useCollectionFactory } from '../../contracts/hooks/useCollectionFactory';
import { useWeb3 } from '../../hooks/useWeb3';
import { useNavigate } from 'react-router-dom';
import { uploadFileToPinata, createAndUploadCollectionMetadata } from '../../services/ipfs';
import { uploadToIPFS } from '../../utils/algorithm';
import axios from 'axios';


const CreateCollection = ({ onCollectionCreated }) => {
  const navigate = useNavigate();
  const { active, account } = useWeb3();
  const { createCollection, getCollectionsByOwner, contract } = useCollectionFactory();
  const [loading, setLoading] = useState(false);
  const [createdCollection, setCreatedCollection] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    banner: null,
    logo: null,
    category: ''
  });
  
  // Track input values separately for immediate UI updates
  const [inputValues, setInputValues] = useState({
    name: '',
    symbol: '',
    description: '',
    category: ''
  });

  // Debounced function for expensive operations (if needed)
  const debouncedOperation = useCallback(
    debounce((updatedFormData) => {
      // Perform any expensive operations here if needed
      console.log('Debounced operation with:', updatedFormData);
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update input values immediately for responsive UI
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update form data immediately as well
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only use debounce for expensive operations if needed
    debouncedOperation({...formData, [name]: value});
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOperation.cancel();
    };
  }, [debouncedOperation]);

  const handleFileChange = (type, file) => {
    setFormData(prev => ({
      ...prev,
      [type]: file
    }));
  };

  // Hàm reset form
  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      description: '',
      banner: null,
      logo: null,
      category: ''
    });
  };


  // Thêm useEffect để kiểm tra collections của user
  useEffect(() => {
    const checkUserCollections = async () => {
      if (account && contract) {
        try {
          console.log('Checking collections for account:', account);
          const collections = await getCollectionsByOwner(account);
          console.log('User collections:', collections);
          setUserCollections(collections);
        } catch (error) {
          console.error('Error checking collections:', error);
          toast.error('Failed to load your collections');
        }
      }
    };

    if (active && account) {
      checkUserCollections();
    }
  }, [account, getCollectionsByOwner, active, contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!active) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.banner || !formData.logo) {
      toast.error('Please upload both banner and logo images');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Creating collection...', { id: 'create-collection' });

      // Upload files to IPFS using Pinata
      const bannerUrl = await uploadToIPFS(formData.banner);
      const logoUrl = await uploadToIPFS(formData.logo);

      if (!bannerUrl || !logoUrl) {
        throw new Error('Failed to upload images to IPFS');
      }

      // Validate IPFS URIs
      if (!bannerUrl.startsWith('ipfs://') || !logoUrl.startsWith('ipfs://')) {
        throw new Error('Invalid IPFS URI format');
      }

      // Create collection metadata and upload to IPFS
      const metadataUrl = await createAndUploadCollectionMetadata(formData, bannerUrl, logoUrl);
      
      // Extract base URI from metadata URL
      const baseURI = 'ipfs://';

      // Create collection
      const collectionAddress = await createCollection(
        formData.name,
        formData.symbol,
        baseURI,
        metadataUrl
      );

      // Verify collection creation
      const collections = await getCollectionsByOwner(account);
      const isCreated = collections.includes(collectionAddress);

      if (isCreated) {
        // Tạo metadata object

        const apiData = {
          address: collectionAddress,
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          bannerUrl: bannerUrl,
          logoUrl: logoUrl,
          metadataUrl: metadataUrl,
          category: formData.category,
          owner: account,
          createdAt: new Date().toISOString()
        };

        // Notify parent component about new collection
        if (onCollectionCreated) {
          onCollectionCreated(apiData);
        }
        
        setCreatedCollection({
          address: collectionAddress,
          name: formData.name,
          symbol: formData.symbol,
          banner: bannerUrl,
          logo: logoUrl,
          metadata: metadataUrl
        });

        toast.success('Collection created successfully!', { id: 'create-collection' });
        
        // Reset form sau khi tạo collection thành công
        resetForm();
        
        // Optional: Navigate to collection page after creation
        // navigate(`/collection/${collectionAddress}`);
      } else {
        toast.error('Collection creation could not be verified', { id: 'create-collection' });
      }

    } catch (error) {
      console.error('Create collection error:', error);
      toast.error(`Failed to create collection: ${error.message}`, { id: 'create-collection' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-panel p-8 space-y-8 relative overflow-hidden bg-dark-200/20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple-pastel/10 via-neon-blue-pastel/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Content */}
        <div className="relative space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-bold">
              <span className="heading-gradient-pastel">
                Create Collection
              </span>
            </h3>
            <p className="text-gray-400 text-lg">
              Create your own NFT collection to start minting NFTs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner Upload */}
            <div className="glass-panel p-6 rounded-2xl space-y-6 bg-dark-200/30 backdrop-blur-xl border border-white/5">
              <h3 className="text-xl font-semibold heading-gradient">Collection Banner</h3>
              <div className="w-full">
                <FileUpload
                  label="Banner Image"
                  accept="image/*"
                  onChange={(file) => handleFileChange('banner', file)}
                  preview={true}
                  value={formData.banner}
                />
                <p className="mt-2 text-sm text-gray-500">
                  This image will appear at the top of your collection page. Recommended size: 1400 x 400px.
                </p>
              </div>
            </div>

            {/* Logo Upload and Collection Details */}
            <div className="glass-panel p-6 rounded-2xl space-y-6 bg-dark-200/30 backdrop-blur-xl border border-white/5">
              <h3 className="text-xl font-semibold heading-gradient">Collection Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div>
                  <FileUpload
                    label="Logo Image"
                    accept="image/*"
                    onChange={(file) => handleFileChange('logo', file)}
                    preview={true}
                    value={formData.logo}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This image will be used for navigation. Recommended size: 400 x 400px.
                  </p>
                </div>

                {/* Collection Details Form */}
                <div className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue-light to-neon-purple-light bg-clip-text text-transparent">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inputValues.name}
                      onChange={handleInputChange}
                      className="input w-full bg-dark-300/50"
                      placeholder="Enter collection name"
                      required
                    />
                  </div>

                  {/* Symbol */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue-light to-neon-purple-light bg-clip-text text-transparent">
                      Collection Symbol
                    </label>
                    <input
                      type="text"
                      name="symbol"
                      value={inputValues.symbol}
                      onChange={handleInputChange}
                      className="input w-full bg-dark-300/50"
                      placeholder="Enter collection symbol (e.g., BAYC)"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue-light to-neon-purple-light bg-clip-text text-transparent">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={inputValues.description}
                      onChange={handleInputChange}
                      className="input w-full h-32 resize-none bg-dark-300/50"
                      placeholder="Describe your collection"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue-light to-neon-purple-light bg-clip-text text-transparent">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={inputValues.category}
                        onChange={handleInputChange}
                        className="input w-full bg-dark-300/50 text-white border border-white/10 hover:border-white/20 focus:border-neon-blue-light transition-colors appearance-none cursor-pointer pr-10"
                        required
                      >
                        <option value="" className="bg-dark-300">Select a category</option>
                        <option value="art" className="bg-dark-300">Art</option>
                        <option value="collectibles" className="bg-dark-300">Collectibles</option>
                        <option value="gaming" className="bg-dark-300">Gaming</option>
                        <option value="music" className="bg-dark-300">Music</option>
                        <option value="photography" className="bg-dark-300">Photography</option>
                        <option value="sports" className="bg-dark-300">Sports</option>
                        <option value="virtual-worlds" className="bg-dark-300">Virtual Worlds</option>
                        <option value="other" className="bg-dark-300">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="px-8 btn-gradient"
                disabled={loading || !active}
              >
                {loading ? 'Creating...' : 'Create Collection'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Thêm phần hiển thị thông tin collection đã tạo */}
      {createdCollection && (
        <div className="mt-8 glass-panel p-6 bg-dark-200/30">
          <h3 className="text-xl font-semibold heading-gradient mb-4">
            Collection Created Successfully!
          </h3>
          <div className="space-y-2">
            <p><span className="text-gray-400">Address:</span> {createdCollection.address}</p>
            <p><span className="text-gray-400">Name:</span> {createdCollection.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {createdCollection.symbol}</p>
          </div>
          <div className="mt-4 flex gap-4">
            <Button
              variant="glass"
              onClick={() => navigate(`/collection/${createdCollection.address}`)}
            >
              View Collection
            </Button>
            <Button
              variant="glass"
              onClick={() => setCreatedCollection(null)}
            >
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCollection; 