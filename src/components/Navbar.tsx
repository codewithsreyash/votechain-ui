import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Vote, BarChart3, FileText } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              BlockVote
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/admin" className="text-sm font-medium hover:text-accent transition-colors">
              Admin
            </Link>
            <Link to="/vote" className="text-sm font-medium hover:text-accent transition-colors">
              Vote
            </Link>
            <Link to="/results" className="text-sm font-medium hover:text-accent transition-colors">
              Results
            </Link>
          </div>

          <Button variant="blockchain" size="sm" className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    </nav>
  );
};
