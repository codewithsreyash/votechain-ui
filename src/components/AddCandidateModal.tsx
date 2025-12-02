import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCandidates } from "@/hooks/useElections";

interface AddCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  electionId: string;
  electionName: string;
}

export function AddCandidateModal({
  open,
  onOpenChange,
  electionId,
  electionName
}: AddCandidateModalProps) {
  const { candidates, addCandidate, deleteCandidate } = useCandidates(electionId);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [position, setPosition] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCandidate = async () => {
    if (!name.trim()) {
      toast.error("Please enter candidate name");
      return;
    }

    setIsAdding(true);
    const { error } = await addCandidate(name.trim(), party.trim(), position.trim());
    setIsAdding(false);

    if (error) {
      toast.error("Failed to add candidate");
    } else {
      toast.success("Candidate added!");
      setName("");
      setParty("");
      setPosition("");
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    const { error } = await deleteCandidate(candidateId);
    if (error) {
      toast.error("Failed to remove candidate");
    } else {
      toast.success("Candidate removed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            Manage Candidates
          </DialogTitle>
          <DialogDescription>
            Add candidates for: {electionName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add candidate form */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name *</Label>
              <Input
                id="candidate-name"
                placeholder="e.g., John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidate-party">Party</Label>
                <Input
                  id="candidate-party"
                  placeholder="e.g., Progressive"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-position">Position</Label>
                <Input
                  id="candidate-position"
                  placeholder="e.g., President"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleAddCandidate}
              disabled={isAdding || !name.trim()}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Candidate
                </>
              )}
            </Button>
          </div>

          {/* Current candidates */}
          <div className="space-y-2">
            <Label>Current Candidates ({candidates.length})</Label>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No candidates added yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.party} {candidate.position && `• ${candidate.position}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
