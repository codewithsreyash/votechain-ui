import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, ExternalLink, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Results() {
  const handleExport = () => {
    toast.success("Results exported successfully!");
  };

  const elections = [
    {
      id: "1",
      name: "Student Council 2024",
      status: "Active",
      totalVotes: 423,
      blockchainTx: "0x1234...5678",
      candidates: [
        { name: "Alice Johnson", party: "Progressive Students", votes: 156, percentage: 36.9 },
        { name: "Bob Smith", party: "United Campus", votes: 143, percentage: 33.8 },
        { name: "Carol Williams", party: "Independent", votes: 124, percentage: 29.3 },
      ],
    },
    {
      id: "2",
      name: "Department Head Selection",
      status: "Completed",
      totalVotes: 87,
      blockchainTx: "0xabcd...efgh",
      candidates: [
        { name: "Dr. David Brown", party: "Innovation First", votes: 45, percentage: 51.7 },
        { name: "Prof. Emma Davis", party: "Academic Excellence", votes: 42, percentage: 48.3 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Election Results
          </h1>
          <p className="text-muted-foreground">
            Real-time voting results with blockchain verification
          </p>
        </div>

        <div className="grid gap-6">
          {elections.map((election, index) => (
            <Card 
              key={election.id} 
              className="shadow-card animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{election.name}</CardTitle>
                    <CardDescription>Total votes cast: {election.totalVotes}</CardDescription>
                  </div>
                  <Badge 
                    className={
                      election.status === "Active"
                        ? "bg-vote-success/10 text-vote-success border-vote-success/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {election.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Blockchain TX: </span>
                  <code className="text-foreground font-mono">{election.blockchainTx}</code>
                  <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {election.candidates.map((candidate, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.party}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{candidate.percentage}%</p>
                        <p className="text-sm text-muted-foreground">{candidate.votes} votes</p>
                      </div>
                    </div>
                    <Progress value={candidate.percentage} className="h-3" />
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleExport}>
                    <Download className="w-4 h-4" />
                    Export Results
                  </Button>
                  <Button variant="blockchain" className="flex-1 gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 shadow-card bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Blockchain Audit Trail
            </CardTitle>
            <CardDescription>
              All voting transactions are permanently recorded and publicly verifiable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Vote Cast", voter: "0x1a2b...3c4d", timestamp: "2024-12-01 14:23:15", tx: "0xabc1...def2" },
                { action: "Vote Cast", voter: "0x5e6f...7g8h", timestamp: "2024-12-01 14:22:48", tx: "0xabc3...def4" },
                { action: "Election Created", admin: "0x9i0j...1k2l", timestamp: "2024-12-01 09:00:00", tx: "0xabc5...def6" },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.voter || log.admin} • {log.timestamp}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    <code className="text-xs">{log.tx}</code>
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
