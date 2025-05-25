import { useWeb3 } from '../../hooks/useWeb3';
import { formatAddress } from '../../utils/algorithm';
import Button from './Button';

const WalletButton = () => {
  const { connectWallet, disconnectWallet, isLoading, active, account } = useWeb3();

  console.log("Wallet State:", { active, account, isLoading });

  if (active && account) {
    return (
      <Button
        variant="glass"
        onClick={disconnectWallet}
        className="flex items-center space-x-2"
      >
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>
            {formatAddress(account)}
          </span>
        </div>
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button
        variant="glass"
        disabled
        className="flex items-center space-x-2"
      >
        <span>Connecting...</span>
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={connectWallet}
      className="flex items-center space-x-2"
    >
      <span>Connect Wallet</span>
    </Button>
  );
};

export default WalletButton;
