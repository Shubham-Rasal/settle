import Image from 'next/image';
import Link from 'next/link';

const chains = [
  { name: 'Ethereum', logo: '/chains/ethereum.svg' },
  { name: 'Arbitrum', logo: '/chains/arbitrum.svg' },
  { name: 'Optimism', logo: '/chains/optimism.svg' },
  { name: 'Base', logo: '/chains/base.svg' },
  { name: 'Avalanche', logo: '/chains/avalanche.svg' },
];

const CCTPSteps = [
  {
    title: 'Accept',
    description: 'Customer pays USDC on any supported chain',
    icon: '💳'
  },
  {
    title: 'Transfer',
    description: 'Payment is automatically bridged via CCTP',
    icon: '🌉'
  },
  {
    title: 'Settle',
    description: 'Receive USDC on your preferred chain',
    icon: '💰'
  }
];

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-muted-foreground hover:text-foreground transition-colors"
  >
    {children}
  </Link>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-primary">
                Settle
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <NavLink href="/docs">Documentation</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/about">About</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NavLink href="/login">Sign In</NavLink>
              <Link 
                href="/register" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl font-bold text-primary">
              Universal USDC Payment Gateway for Merchants
            </h1>
            <p className="text-2xl text-muted-foreground mt-6">
              Accept USDC payments from any chain. Settle wherever you want.
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <p className="text-xl text-muted-foreground">
                ✨ Seamless cross-chain USDC payments
              </p>
              <p className="text-xl text-muted-foreground">
                🔄 Automatic rebalancing to your preferred chain
              </p>
              <p className="text-xl text-muted-foreground">
                🛡️ Powered by Circle's CCTP V2
              </p>
            </div>
            
            <div className="mt-12">
              <span className="px-6 py-3 bg-accent text-accent-foreground rounded-full border border-border">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Supported Chains */}
        <div className="bg-card py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12 text-card-foreground">
              Accept Payments Across Multiple Chains
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto">
              {chains.map((chain) => (
                <div key={chain.name} className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-popover hover:bg-accent transition-all border border-border">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={chain.logo}
                      alt={`${chain.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-popover-foreground">{chain.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CCTP Explainer */}
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-16 text-foreground">
              How Settle Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CCTPSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex flex-col items-center p-8 rounded-xl bg-card border border-border hover:border-primary transition-all">
                    <span className="text-4xl mb-4">{step.icon}</span>
                    <h3 className="text-xl font-medium mb-3 text-card-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-center">{step.description}</p>
                  </div>
                  {index < CCTPSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <span className="text-2xl text-muted-foreground">→</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-primary font-semibold">Settle</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <NavLink href="/docs">Docs</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/terms">Terms</NavLink>
              <NavLink href="/privacy">Privacy</NavLink>
              <a 
                href="https://twitter.com/settle" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
