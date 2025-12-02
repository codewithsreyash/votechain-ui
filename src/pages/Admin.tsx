import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, FileDown, Settings, LogOut, Trophy, Play, Pause, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useElections } from "@/hooks/useElections";
import { AddCandidateModal } from "@/components/AddCandidateModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";

function AdminContent() {
  const { user, isAdmin, signOut } = useAuth();
  const { elections, loading, createElection, updateElectionStatus, getVoteCount } = useElections();
  
  const [electionName, setElectionName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const [selectedElection, setSelectedElection] = useState<{ id: string; name: string } | null>(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVoters, setTotalVoters] = useState(0);

  useEffect(() => {
    // Fetch vote counts for all elections
    const fetchVoteCounts = async () => {
      const counts: Record<string, number> = {};
      let total = 0;
      
      for (const election of elections) {
        const { count } = await getVoteCount(election.id);
        counts[election.id] = count;
        total += count;
      }
      
      setVoteCounts(counts);
      setTotalVoters(total);
    };

    if (elections.length > 0) {
      fetchVoteCounts();
    }

    // Subscribe to realtime vote updates
    const channel = supabase
      .channel("admin-votes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        () => fetchVoteCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [elections]);

  const handleCreateElection = async () => {
    if (!electionName || !description || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsCreating(true);
    const { error } = await createElection(
      electionName,
      description,
      new Date(startDate).toISOString(),
      new Date(endDate).toISOString(),
      user.id
    );
    setIsCreating(false);

    if (error) {
      toast.error("Failed to create election");
    } else {
      toast.success("Election created successfully!");
      setElectionName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    }
  };

  const handleStatusChange = async (electionId: string, newStatus: string) => {
    const { error } = await updateElectionStatus(electionId, newStatus);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Election ${newStatus === "results_declared" ? "results declared" : "status updated"}!`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const activeElections = elections.filter(e => e.status === "active");
  const completedElections = elections.filter(e => e.status === "completed" || e.status === "results_declared");

  const stats = [
    { label: "Active Elections", value: activeElections.length.toString(), icon: Calendar },
    { label: "Total Votes", value: totalVoters.toString(), icon: Users },
    { label: "Completed", value: completedElections.length.toString(), icon: FileDown },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-vote-success/10 text-vote-success border-vote-success/20">Active</Badge>;
      case "pending":
        return <Badge className="bg-vote-pending/10 text-vote-pending border-vote-pending/20">Pending</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
      case "results_declared":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Results Declared</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 animate-slide-in">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage elections, candidates, and declare results
            </p>
            {!isAdmin && (
              <p className="text-sm text-vote-pending mt-2">
                Note: You need admin role to create/modify elections
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="shadow-card hover:shadow-elevated transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Election */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Create New Election
              </CardTitle>
              <CardDescription>
                Set up a new blockchain-based election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="election-name">Election Name</Label>
                <Input
                  id="election-name"
                  placeholder="e.g., Student Council 2024"
                  value={electionName}
                  onChange={(e) => setElectionName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the election purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                variant="admin" 
                className="w-full"
                onClick={handleCreateElection}
                disabled={isCreating || !isAdmin}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Election"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Elections List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Manage Elections
              </CardTitle>
              <CardDescription>
                Control election status and declare results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : elections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No elections yet. Create one to get started!
                </p>
              ) : (
                elections.map((election) => (
                  <div
                    key={election.id}
                    className="p-4 rounded-lg border border-border hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{election.name}</h3>
                      {getStatusBadge(election.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {voteCounts[election.id] ?? 0} votes cast
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedElection({ id: election.id, name: election.name });
                          setCandidateModalOpen(true);
                        }}
                        disabled={!isAdmin}
                      >
                        Add Candidates
                      </Button>
                      
                      {election.status === "pending" && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStatusChange(election.id, "active")}
                          disabled={!isAdmin}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {election.status === "active" && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleStatusChange(election.id, "completed")}
                          disabled={!isAdmin}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          End Voting
                        </Button>
                      )}
                      
                      {election.status === "completed" && (
                        <Button 
                          variant="blockchain" 
                          size="sm"
                          onClick={() => handleStatusChange(election.id, "results_declared")}
                          disabled={!isAdmin}
                        >
                          <Trophy className="w-3 h-3 mr-1" />
                          Declare Results
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Candidate Modal */}
      {selectedElection && (
        <AddCandidateModal
          open={candidateModalOpen}
          onOpenChange={setCandidateModalOpen}
          electionId={selectedElection.id}
          electionName={selectedElection.name}
        />
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
