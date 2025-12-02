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
  const { user, isAdmin, signOut, grantAdminRole } = useAuth();
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
  const [adminCheckResult, setAdminCheckResult] = useState<{ checking: boolean; result: string | null }>({ checking: false, result: null });

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
    console.log("Create election clicked", { electionName, description, startDate, endDate, user: user?.id, isAdmin });
    
    if (!electionName || !description || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!isAdmin) {
      console.warn("User does not have admin role. User ID:", user.id);
      toast.error("You need admin privileges to create elections. Please ensure your account has the admin role in the database.");
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    if (end <= start) {
      toast.error("End date must be after start date");
      return;
    }

    setIsCreating(true);
    try {
      console.log("Calling createElection with:", {
        name: electionName,
        description,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        userId: user.id
      });
      
      const { data, error } = await createElection(
        electionName,
        description,
        start.toISOString(),
        end.toISOString(),
        user.id
      );
      
      console.log("Create election response:", { data, error });
      
      if (error) {
        console.error("Create election error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        let errorMessage = "Failed to create election.";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        }
        
        // Provide helpful messages for common errors
        if (errorMessage.includes("permission") || errorMessage.includes("policy") || errorMessage.includes("RLS")) {
          errorMessage = "Permission denied. Please ensure your account has admin role in the user_roles table.";
        }
        
        toast.error(errorMessage);
      } else {
        toast.success("Election created successfully!");
        setElectionName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
      }
    } catch (err) {
      console.error("Unexpected error creating election:", err);
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCreating(false);
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

  const checkAdminStatus = async () => {
    if (!user) {
      setAdminCheckResult({ checking: false, result: "No user logged in" });
      return;
    }

    setAdminCheckResult({ checking: true, result: null });
    
    try {
      // Check user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, user_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      // Also check auth.users to verify user exists
      const { data: { user: authUser } } = await supabase.auth.getUser();

      let result = `User ID: ${user.id}\n`;
      result += `Email: ${user.email}\n`;
      result += `Auth User: ${authUser ? 'Found' : 'Not found'}\n\n`;
      
      if (roleError) {
        result += `❌ Error checking roles: ${roleError.message}\n`;
        result += `Details: ${JSON.stringify(roleError, null, 2)}`;
      } else if (roleData) {
        result += `✅ Admin role found in database!\n`;
        result += `Role: ${roleData.role}\n`;
        result += `User ID in roles table: ${roleData.user_id}`;
      } else {
        result += `❌ No admin role found in user_roles table.\n`;
        result += `\nClick "Grant Admin Role" button below to automatically fix this!`;
      }

      setAdminCheckResult({ checking: false, result });
      console.log("Admin check result:", result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setAdminCheckResult({ checking: false, result: `Error: ${errorMsg}` });
      console.error("Error checking admin status:", err);
    }
  };

  const handleGrantAdmin = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setAdminCheckResult({ checking: true, result: null });
    
    try {
      const { success, error } = await grantAdminRole();
      
      if (success) {
        toast.success("Admin role granted successfully! Please refresh the page.");
        setAdminCheckResult({ 
          checking: false, 
          result: "✅ Admin role granted! Please refresh the page to see changes." 
        });
        // Refresh admin status after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to grant admin role: ${errorMsg}`);
        setAdminCheckResult({ 
          checking: false, 
          result: `❌ Error: ${errorMsg}\n\nYou may need to run the SQL migration in Supabase.` 
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Error: ${errorMsg}`);
      setAdminCheckResult({ checking: false, result: `Error: ${errorMsg}` });
    }
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
                disabled={isCreating}
                title={!isAdmin ? "You need admin role to create elections" : ""}
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
            {!isAdmin && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-destructive">
                  ⚠️ Admin role required. Click below to automatically grant admin access.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGrantAdmin}
                    disabled={adminCheckResult.checking}
                    className="flex-1"
                  >
                    {adminCheckResult.checking ? "Granting..." : "🔑 Grant Admin Role"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAdminStatus}
                    disabled={adminCheckResult.checking}
                    className="flex-1"
                  >
                    {adminCheckResult.checking ? "Checking..." : "Check Status"}
                  </Button>
                </div>
                {adminCheckResult.result && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {adminCheckResult.result}
                  </div>
                )}
              </div>
            )}
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
