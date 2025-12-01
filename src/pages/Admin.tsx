import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Users, Settings, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [electionName, setElectionName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateElection = () => {
    if (!electionName || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Election created successfully!");
    setElectionName("");
    setDescription("");
  };

  const stats = [
    { label: "Active Elections", value: "3", icon: Calendar },
    { label: "Total Voters", value: "1,247", icon: Users },
    { label: "Completed Elections", value: "12", icon: FileDown },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage elections, candidates, and monitor voting activity
          </p>
        </div>

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
                  placeholder="Describe the election purpose and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="datetime-local" />
                </div>
              </div>

              <Button 
                variant="admin" 
                className="w-full"
                onClick={handleCreateElection}
              >
                Create Election
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Active Elections
              </CardTitle>
              <CardDescription>
                Manage ongoing elections and candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Student Council 2024", voters: 423, status: "Active" },
                { name: "Department Head Selection", voters: 87, status: "Active" },
                { name: "Budget Allocation Vote", voters: 156, status: "Pending" },
              ].map((election) => (
                <div
                  key={election.name}
                  className="p-4 rounded-lg border border-border hover:border-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{election.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      election.status === "Active" 
                        ? "bg-vote-success/10 text-vote-success" 
                        : "bg-vote-pending/10 text-vote-pending"
                    }`}>
                      {election.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {election.voters} votes cast
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Add Candidates
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
