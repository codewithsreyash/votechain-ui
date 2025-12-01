import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Vote as VoteIcon, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Vote() {
  const [selectedCandidate, setSelectedCandidate] = useState("");

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }
    toast.success("Vote cast successfully! Transaction recorded on blockchain.");
    setSelectedCandidate("");
  };

  const elections = [
    {
      id: "1",
      name: "Student Council 2024",
      description: "Vote for your student council representatives",
      status: "Active",
      endDate: "2024-12-15",
      totalVoters: 423,
      candidates: [
        { id: "1", name: "Alice Johnson", party: "Progressive Students", votes: 156 },
        { id: "2", name: "Bob Smith", party: "United Campus", votes: 143 },
        { id: "3", name: "Carol Williams", party: "Independent", votes: 124 },
      ],
    },
    {
      id: "2",
      name: "Department Head Selection",
      description: "Choose the next Computer Science department head",
      status: "Active",
      endDate: "2024-12-10",
      totalVoters: 87,
      candidates: [
        { id: "4", name: "Dr. David Brown", party: "Innovation First", votes: 45 },
        { id: "5", name: "Prof. Emma Davis", party: "Academic Excellence", votes: 42 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Cast Your Vote
          </h1>
          <p className="text-muted-foreground">
            Participate in active elections securely on the blockchain
          </p>
        </div>

        <div className="grid gap-6">
          {elections.map((election, index) => (
            <Card 
              key={election.id} 
              className="shadow-card hover:shadow-elevated transition-all animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{election.name}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </div>
                  <Badge className="bg-vote-success/10 text-vote-success border-vote-success/20">
                    <Clock className="w-3 h-3 mr-1" />
                    {election.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                  <span>Ends: {election.endDate}</span>
                  <span>•</span>
                  <span>{election.totalVoters} votes cast</span>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <div className="space-y-3">
                    {election.candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={candidate.id} id={candidate.id} />
                        <Label
                          htmlFor={candidate.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{candidate.name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.party}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{candidate.votes} votes</p>
                              <p className="text-xs text-muted-foreground">
                                {((candidate.votes / election.totalVoters) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Button 
                  variant="vote" 
                  className="w-full mt-6 gap-2"
                  onClick={handleVote}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Cast Vote on Blockchain
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
