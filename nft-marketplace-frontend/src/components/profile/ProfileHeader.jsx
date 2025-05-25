import { formatAddress } from '../../utils/algorithm';
import Button from '../common/Button';

const ProfileHeader = ({ profile }) => {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-64 overflow-hidden">
        <img
          src={profile.banner}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-dark-100 shadow-xl">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4">
                <p className="text-gray-400">
                  <span className="text-white font-medium">{formatAddress(profile.address)}</span>
                </p>
                {profile.verified && (
                  <span className="text-neon-blue">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-400 max-w-2xl">{profile.bio}</p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button variant="primary">Edit Profile</Button>
              <Button variant="glass">Share</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold heading-gradient">{profile.stats.nfts}</p>
              <p className="text-gray-400">NFTs Owned</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold heading-gradient">{profile.stats.collections}</p>
              <p className="text-gray-400">Collections</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold heading-gradient">{profile.stats.followers}</p>
              <p className="text-gray-400">Followers</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold heading-gradient">{profile.stats.following}</p>
              <p className="text-gray-400">Following</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 