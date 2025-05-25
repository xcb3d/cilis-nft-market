import { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import ProfileHeader from '../../components/profile/ProfileHeader';
import UserCollections from '../../components/profile/UserCollections';
import OwnedNFTs from '../../components/profile/OwnedNFTs';
import CreatedCollections from '../../components/profile/CreatedCollections';
import ActiveButton from '../../components/common/ActiveButton';

const Profile = () => {
  const { account, active } = useWeb3();
  const [activeTab, setActiveTab] = useState('collections'); // collections or nfts

  const mockProfileData = {
    name: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unnamed',
    address: account || '0x0',
    bio: 'NFT enthusiast and collector',
    banner: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=1600&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop",
    verified: true,
    stats: {
      nfts: 0,
      collections: 0,
      followers: 0,
      following: 0
    }
  };

  // Mock collections data
  const collections = [
    {
      id: 1,
      name: "Cosmic Dreams",
      creator: "Crypto Artist",
      verified: true,
      banner: "/collections/cosmic-banner.jpg",
      avatar: "/collections/cosmic-avatar.jpg",
      floor: 2.5,
      volume: 150.8,
      items: 100,
    },
    // Add more collections...
  ];

  const tabs = [
    { id: 'collections', name: 'Collections' },
    { id: 'nfts', name: 'NFTs' },
  ];

  if (!active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <ProfileHeader profile={mockProfileData} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel p-1 inline-flex rounded-xl">
            {tabs.map((tab) => (
              <ActiveButton key={tab.id} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.name}
              </ActiveButton>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'collections' ? (
            <UserCollections />
          ) : (
            <OwnedNFTs />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 