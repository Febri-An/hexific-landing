"use client";

import { useState } from "react";
import { useSolana } from "@/components/solana-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Wallet, LogOut } from "lucide-react";
import { useConnect, useDisconnect, type UiWallet } from "@wallet-standard/react";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function WalletIcon({
  wallet,
  className,
}: {
  wallet: UiWallet;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {wallet.icon && <AvatarImage src={wallet.icon} alt={`${wallet.name} icon`} />}
      <AvatarFallback className="bg-black/20 text-lime-400 font-bold">
        {wallet.name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function WalletMenuItem({ wallet, onConnect }: { wallet: UiWallet; onConnect: () => void }) {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;

    try {
      const accounts = await connect();
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setWalletAndAccount(wallet, account);
        onConnect();
      }
    } catch (err) {
      console.error(`Failed to connect ${wallet.name}:`, err);
    }
  };

  return (
    <button
      className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-lime-400/10 focus:bg-lime-400/10 disabled:pointer-events-none disabled:opacity-50"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <div className="flex items-center gap-3">
        <WalletIcon wallet={wallet} className="h-7 w-7 border border-lime-400/20 bg-black/20" />
        <span className="font-medium">{wallet.name}</span>
      </div>
      {isConnecting ? <span className="text-xs text-lime-400">Connecting…</span> : null}
    </button>
  );
}

function DisconnectButton({ wallet, onDisconnect }: { wallet: UiWallet; onDisconnect: () => void }) {
  const { setWalletAndAccount } = useSolana();
  const [isDisconnecting, disconnect] = useDisconnect(wallet);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletAndAccount(null, null);
      onDisconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer focus:bg-red-500/10"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Disconnect
    </DropdownMenuItem>
  );
}

export function WalletConnectButton() {
  const { wallets, selectedWallet, selectedAccount, isConnected } = useSolana();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[190px] justify-between glass-effect bg-transparent border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400/50 hover:cursor-pointer transition-all"
        >
          {isConnected && selectedWallet && selectedAccount ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-lime-400" />
                <WalletIcon
                  wallet={selectedWallet}
                  className="h-4 w-4 border border-lime-400/20 bg-black/20"
                />
                <span className="font-mono text-sm text-lime-300">
                  {truncateAddress(selectedAccount.address)}
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 text-lime-400" />
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4 text-lime-400" />
              <span className="font-semibold">Connect Wallet</span>
              <ChevronDown className="ml-2 h-4 w-4 text-lime-400" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[320px] glass-effect bg-transparent border border-lime-400/20 rounded-xl p-2 text-white shadow-lg"
      >
        {wallets.length === 0 ? (
          <p className="text-sm text-gray-400 p-3 text-center">No wallets detected</p>
        ) : !isConnected ? (
          <>
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-lime-400">
              Available Wallets
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-lime-400/10" />
            <div className="space-y-1">
              {wallets.map((wallet, index) => (
                <WalletMenuItem
                  key={`${wallet.name}-${index}`}
                  wallet={wallet}
                  onConnect={() => setDropdownOpen(false)}
                />
              ))}
            </div>
          </>
        ) : (
          selectedWallet &&
          selectedAccount && (
            <>
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-lime-400">
                Connected Wallet
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-lime-400/10" />

              <div className="px-2 py-2">
                <div className="glass-effect border border-lime-400/10 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <WalletIcon
                      wallet={selectedWallet}
                      className="h-8 w-8 border border-lime-400/20 bg-black/20"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{selectedWallet.name}</span>
                      <span className="text-xs text-gray-300 font-mono">
                        {truncateAddress(selectedAccount.address)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-lime-400/10" />
              <DisconnectButton wallet={selectedWallet} onDisconnect={() => setDropdownOpen(false)} />
            </>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}