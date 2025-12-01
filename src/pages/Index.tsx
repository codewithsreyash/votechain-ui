import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-blockchain.jpg";
import voteIcon from "@/assets/vote-icon.png";
import securityIcon from "@/assets/security-icon.png";
import transparencyIcon from "@/assets/transparency-icon.png";

const Index = () => {
  const features = [
    {
      icon: securityIcon,
      title: "Immutable Security",
      description: "Every vote is cryptographically secured and recorded on the blockchain, making tampering impossible.",
    },
    {
      icon: transparencyIcon,
      title: "Complete Transparency",
      description: "All transactions are publicly auditable while maintaining voter anonymity and privacy.",
    },
    {
      icon: voteIcon,
      title: "Verified Authenticity",
      description: "Blockchain verification ensures each voter can only cast one vote per election.",
    },
  ];

  const steps = [
    { title: "Connect Wallet", description: "Link your blockchain wallet to authenticate" },
    { title: "Verify Identity", description: "Complete secure identity verification" },
    { title: "Cast Your Vote", description: "Select your candidate and submit on-chain" },
    { title: "Track & Verify", description: "Monitor your vote transaction on the blockchain" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-slide-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent animate-glow" />
              <span className="text-sm font-medium text-accent">Blockchain-Powered Democracy</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Secure, Transparent Voting on the Blockchain
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of democratic elections with immutable, verifiable, and transparent voting powered by blockchain technology.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild variant="blockchain" size="lg" className="gap-2">
                <Link to="/vote">
                  Start Voting
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/results">
                  View Results
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Blockchain Voting?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combining the trust of blockchain with the power of democracy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="shadow-card hover:shadow-elevated transition-all animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-accent p-3 shadow-glow">
                    <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to cast your secure blockchain vote
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-accent transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-accent-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Experience Secure Voting?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of voters using blockchain technology for transparent and secure elections
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/admin">
                <Lock className="w-4 h-4" />
                Admin Dashboard
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2">
              <Link to="/vote">
                <CheckCircle2 className="w-4 h-4" />
                Cast Your Vote
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 BlockVote. Secured by blockchain technology.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accent transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
