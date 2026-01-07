import { useConnect, type UiWallet } from "@wallet-standard/react";
import { useSolana } from "@/components/solana-provider";

function WalletOption({ wallet, onConnect }: { wallet: UiWallet; onConnect: () => void }) {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;
    try {
      const accounts = await connect();
      if (accounts && accounts.length > 0) {
        setWalletAndAccount(wallet, accounts[0]);
        onConnect();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-lime-400/10 border border-transparent hover:border-lime-400/30 hover:cursor-pointer transition-all group"
    >
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
        {wallet.icon ? (
          <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lime-400 font-bold">{wallet.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="font-medium text-gray-200 group-hover:text-lime-400 transition-colors">
        {wallet.name}
      </span>
      {isConnecting && (
        <div className="ml-auto">
          <svg className="animate-spin h-4 w-4 text-lime-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </button>
  );
}

export { WalletOption };
// export type { DetailedFinding, AuditResult, VPSDetector, VPSResponse };