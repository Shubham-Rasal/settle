import Image from 'next/image';
import Link from 'next/link';
import { ChainFlow } from '@/components/ui/chain-flow';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2 text-sm"
  >
    {children}
  </Link>
);

const features = [
  {
    title: "Cross-Chain USDC Payments",
    description: "Accept USDC payments on Ethereum or Arbitrum. Customers pay on their preferred chain, you receive funds where you need them.",
    figure: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                <Image src="/chains/ethereum.svg" alt="Ethereum" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base">Customer Payment</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Ethereum USDC</span>
              </div>
            </div>
            <span className="font-mono text-sm sm:text-base">100 USDC</span>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                <Image src="/chains/arbitrum.svg" alt="Arbitrum" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base">Settlement</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Arbitrum USDC</span>
              </div>
            </div>
            <span className="font-mono text-sm sm:text-base text-primary">+100 USDC</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-2 sm:p-4">
          <div className="text-center space-y-2">
            <div className="text-3xl sm:text-4xl">🌉</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Circle CCTP V2<br/>Fast Transfer</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Real-Time Payment Tracking",
    description: "Monitor all USDC transactions across chains with detailed status updates, timestamps, and on-chain verification.",
    figure: (
      <div className="p-4 sm:p-6">
        <div className="rounded-lg border bg-card">
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-sm sm:text-base font-medium">Recent Payments</h4>
              <span className="text-xs sm:text-sm text-muted-foreground">Last 24h</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                    <Image src="/chains/ethereum.svg" alt="Ethereum" fill className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium">pay_123...abc</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">2 mins ago</span>
                  </div>
                </div>
                <span className="font-mono text-xs sm:text-sm">+50 USDC</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                    <Image src="/chains/arbitrum.svg" alt="Arbitrum" fill className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium">pay_456...def</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">15 mins ago</span>
                  </div>
                </div>
                <span className="font-mono text-xs sm:text-sm">+100 USDC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Treasury Management",
    description: "Automated rebalancing between chains using Circle's CCTP V2. Move USDC instantly with Fast Transfer support.",
    figure: (
      <div className="p-4 sm:p-8 space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-accent/50 border border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
              <Image src="/chains/ethereum.svg" alt="Ethereum" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base">Ethereum Balance</span>
              <span className="text-xs sm:text-sm text-muted-foreground">1,234 USDC Available</span>
            </div>
          </div>
          <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-primary/20 text-primary rounded-full">
            Transfer
          </button>
        </div>
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-accent/50 border border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
              <Image src="/chains/arbitrum.svg" alt="Arbitrum" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base">Arbitrum Balance</span>
              <span className="text-xs sm:text-sm text-muted-foreground">5,678 USDC Available</span>
            </div>
          </div>
          <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-primary/20 text-primary rounded-full">
            Transfer
          </button>
        </div>
      </div>
    )
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-xl font-bold text-primary">
                Settle
              </Link>
              {/* <div className="hidden md:flex items-center space-x-1">
                <NavLink href="/blog">[B] BLOG</NavLink>
                <NavLink href="/docs">[D] DOCS</NavLink>
                <NavLink href="/youtube">[Y] YOUTUBE</NavLink>
                <NavLink href="/github">[G] GITHUB</NavLink>
                <NavLink href="/meetups">[M] MEETUPS</NavLink>
              </div> */}
            </div>
            <div className="flex items-center">
              <NavLink href="/login">[C] CONSOLE</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-14">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="py-16 sm:py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tight leading-none">
                Welcome to<br />
                <span className="text-primary">Settle</span>
              </h1>
              <p className="mt-8 sm:mt-12 text-[clamp(1.125rem,2.5vw,2rem)] leading-tight max-w-xl text-muted-foreground">
                Universal USDC payment gateway for merchants. Accept on any chain, settle wherever you want.
              </p>
            </div>
            <div className="h-[400px] sm:h-[500px] md:h-[600px] relative">
              <ChainFlow />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-border py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-base sm:text-lg font-medium mb-6 sm:mb-8">/ FEATURES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="mt-3 sm:mt-4 mb-0">
                    <h3 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title} →
                    </h3>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <div className="aspect-[4/3] bg-card rounded-lg border border-border overflow-hidden mt-3">
                    {feature.figure}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-primary font-semibold">Settle</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">© 2025</span>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {/* <NavLink href="/docs">Docs</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/terms">Terms</NavLink>
              <NavLink href="/privacy">Privacy</NavLink> */}
              {/* <a 
                href="https://twitter.com/settle" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
