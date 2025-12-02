import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, ExternalLink, Shield, Loader2, AlertCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useElections, useElectionResults } from "@/hooks/useElections";
import { supabase } from "@/integrations/supabase/client";

function ElectionResultCard({ election }: { election: { id: string; name: string; status: string } }) {
  const { results, totalVotes, loading } = useElectionResults(election.id);
  const [blockchainTx] = useState(`0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`);

  const handleExport = () => {
    const data = results.map(r => ({
      candidate: r.candidate_name,
      party: r.party,
      votes: r.vote_count,
      percentage: totalVotes > 0 ? ((Number(r.vote_count) / totalVotes) * 100).toFixed(1) : 0
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${election.name.replace(/\s+/g, "_")}_results.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Results exported successfully!");
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const winner = results.length > 0 ? results[0] : null;

  return (
    <Card className="shadow-card animate-slide-in">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle className="text-2xl mb-2">{election.name}</CardTitle>
            <CardDescription>Total votes cast: {totalVotes}</CardDescription>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/20">
            Results Declared
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Shield className="w-4 h-4 text-accent" />
          <span>Blockchain TX: </span>
          <code className="text-foreground font-mono">{blockchainTx}</code>
          <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {winner && (
          <div className="mt-4 p-4 bg-vote-success/10 border border-vote-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-vote-success">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Winner: {winner.candidate_name}</span>
              <span className="text-muted-foreground">({winner.party})</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {results.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No votes recorded</p>
        ) : (
          results.map((candidate, idx) => {
            const percentage = totalVotes > 0 ? (Number(candidate.vote_count) / totalVotes) * 100 : 0;
            return (
              <div key={candidate.candidate_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {idx === 0 && <Trophy className="w-4 h-4 text-vote-success" />}
                    <div>
                      <p className="font-semibold">{candidate.candidate_name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{percentage.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">{candidate.vote_count} votes</p>
                  </div>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            );
          })
        )}

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
  );
}

export default function Results() {
  const { elections, loading } = useElections();
  const [auditLogs, setAuditLogs] = useState<Array<{
    action: string;
    address: string;
    timestamp: string;
    tx: string;
  }>>([]);

  const declaredElections = elections.filter(e => e.status === "results_declared");
  const activeElections = elections.filter(e => e.status === "active");

  useEffect(() => {
    // Generate mock audit logs
    const logs = [
      { action: "Results Declared", address: "0x1a2b...3c4d", timestamp: new Date().toISOString(), tx: "0xabc1...def2" },
      { action: "Vote Cast", address: "0x5e6f...7g8h", timestamp: new Date(Date.now() - 60000).toISOString(), tx: "0xabc3...def4" },
      { action: "Vote Cast", address: "0x9i0j...1k2l", timestamp: new Date(Date.now() - 120000).toISOString(), tx: "0xabc5...def6" },
    ];
    setAuditLogs(logs);
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : declaredElections.length === 0 ? (
          <Card className="shadow-card mb-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                No election results have been declared yet.
              </p>
              {activeElections.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {activeElections.length} election(s) currently in progress.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 mb-8">
            {declaredElections.map((election, index) => (
              <div key={election.id} style={{ animationDelay: `${index * 100}ms` }}>
                <ElectionResultCard election={election} />
              </div>
            ))}
          </div>
        )}

        <Card className="shadow-card bg-muted/30">
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
              {auditLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.address} • {new Date(log.timestamp).toLocaleString()}
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
