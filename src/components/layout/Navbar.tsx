"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wallet,
  Trophy,
  Compass,
  PlusCircle,
  LayoutDashboard,
  Zap,           // Changed from Lightbulb
  Menu,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useWallet } from '@/lib/genlayer/wallet';
import Modal from '../ui/modal';
import { HashLoader } from 'react-spinners';
import { useCheckIfProfileExists } from '@/lib/hooks/useTruthDuel';
import { toast } from 'sonner';
import ProfileSetupModal from '../ui/ProfileSetupModal';
import HowItWorksModal from '../ui/HowItWorks';
import { getAddress } from 'viem';
import { success, error, userRejected } from "@/lib/utils/toast";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
   const [connectionError, setConnectionError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const [isNewUser, setIsNewUser] = useState(false);
 
  const navLinks = [
    { name: 'Explore', href: '/explore', icon: Compass },
    // { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    // { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'How it Works', href: '#', icon: Zap, onClick: () => setHowItWorksOpen(true) },
  ];
   const {
    address: lowercaseAddress,
    isConnected,
    isMetaMaskInstalled,
    isOnCorrectNetwork,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  } = useWallet();
  const address = lowercaseAddress ? getAddress(lowercaseAddress) : null;
  console.log(address)
    const { isLoading: IsCheckingProfile, data: profileExists } = useCheckIfProfileExists(address);

    const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionError("");
      await connectWallet();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      setConnectionError(err.message || "Failed to connect to MetaMask");

      if (err.message?.includes("rejected")) {
        userRejected("Connection cancelled");
      } else {
        error("Failed to connect wallet", {
          description: err.message || "Check your MetaMask and try again."
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const NavItems = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <div className={cn("flex items-center gap-1", className)}>
      {navLinks.map((link) => (
        <Button
          key={link.name}
          variant="ghost"
          className={cn(
            "gap-2 w-full justify-start md:w-auto",
            pathname === link.href && "bg-primary/10 text-primary"
          )}
          onClick={() => {
            if (link.onClick) {
              link.onClick();
            } else {
              router.push(link.href);
            }

            onClick?.();
          }}
        >
          <link.icon className="w-4 h-4" />
          {link.name}
        </Button>
      ))}
    </div>
  );


  useEffect(() => {
    if (!address) {
      setShowSetupModal(false);
      setIsNewUser(false); // Reset on disconnect
      return;
    }

    if (isLoading || profileExists === undefined) return;

    if (profileExists === false) {
      setShowSetupModal(true);
    } else if (profileExists === true) {
      setShowSetupModal(false);
      
      // 2. Only show "Welcome back" if they DID NOT just create an account right now
      // if (!isNewUser) {
      //   toast.success("Welcome back!", {
      //     description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      //   });
      // }
    }
  }, [address, isLoading, profileExists, isNewUser]);


  return (
    <>
      {/* Loading Modal */}
      <Modal
        isOpen={!!address && isLoading}
        onClose={() => { }}
        showCloseButton={false}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <HashLoader size={40} color="#3C83F6" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-white">Checking your profile</p>
            <p className="text-xs text-muted-foreground">Connecting to GenLayer...</p>
          </div>
        </div>
      </Modal>

      {/* How it Works Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

      {/* Profile Setup Modal */}
      {isLoading === false && (
        <ProfileSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          address={address || ""}
          onProfileCreated={() => {
            console.log("Profile created callback triggered");
            toast.success("Profile created!", {
              description: "Welcome to TruthDuel!",
            });
            setShowSetupModal(false);
          }}
        />
      )}

      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">
                    Truth<span className="text-primary">Duel</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <NavItems onClick={() => setIsOpen(false)} className="flex-col" />

                  <Link href="/create" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                      <PlusCircle className="w-5 h-5" />
                      Create Bet
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                Truth<span className="text-primary">Duel</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavItems />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {address ? (
              <>
                <Link href="/create" className="hidden sm:block">
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <PlusCircle className="w-4 h-4" />
                    Create Bet
                  </Button>
                </Link>

                <Button variant="outline" className="hidden lg:flex gap-2">
                  <Wallet className="w-4 h-4" />
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Button>
              </>
            ) : (
              // <LoginButton />
              <Button
                  onClick={handleConnect}
                  variant="gradient"
                  className="w-full h-14 text-lg"
                  disabled={isConnecting}
                >
                  <User className="w-5 h-5 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}