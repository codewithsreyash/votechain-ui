import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Vote, 
  CheckCircle2, 
  Fingerprint, 
  QrCode, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useElections, useCandidates, type Election, type Candidate } from "@/hooks/useElections";

type Screen = "welcome" | "select-election" | "auth" | "ballot" | "review" | "success";

export default function KioskVoting() {
  const { elections, loading: electionsLoading } = useElections();
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [voterId, setVoterId] = useState("");
  const [votingToken, setVotingToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { candidates, loading: candidatesLoading } = useCandidates(selectedElection?.id);

  const activeElections = elections.filter(e => e.status === "active");

  const handleVerify = async () => {
    if (!voterId || !votingToken || !selectedElection) return;
    
    setIsVerifying(true);
    setVerificationStatus("Checking your eligibility…");
    
    try {
      // Check if voter already voted in this election
      const { data: existingVoter } = await supabase
        .from("voters")
        .select("has_voted")
        .eq("voter_id", voterId)
        .eq("election_id", selectedElection.id)
        .maybeSingle();

      if (existingVoter?.has_voted) {
        setIsVerifying(false);
        setVerificationStatus("");
        toast.error("You have already voted in this election");
        return;
      }

      setVerificationStatus("Verifying credentials on blockchain…");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Register voter if not exists
      if (!existingVoter) {
        await supabase.from("voters").insert({
          voter_id: voterId,
          election_id: selectedElection.id,
          has_voted: false
        });
      }
      
      setIsVerifying(false);
      setCurrentScreen("ballot");
    } catch (error) {
      setIsVerifying(false);
      setVerificationStatus("");
      toast.error("Verification failed. Please try again.");
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate || !selectedElection) return;

    setIsSubmitting(true);
    
    // Generate receipt code
    const code = `BLK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    try {
      // Insert anonymous vote
      const { error: voteError } = await supabase.from("votes").insert({
        election_id: selectedElection.id,
        candidate_id: selectedCandidate.id,
        receipt_code: code
      });

      if (voteError) throw voteError;

      // Mark voter as having voted
      const { error: voterError } = await supabase
        .from("voters")
        .update({ 
          has_voted: true, 
          voted_at: new Date().toISOString(),
          receipt_code: code
        })
        .eq("voter_id", voterId)
        .eq("election_id", selectedElection.id);

      if (voterError) throw voterError;

      setReceiptCode(code);
      setIsSubmitting(false);
      setCurrentScreen("success");
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to submit vote. Please try again.");
    }
  };

  const handleFinish = () => {
    setCurrentScreen("welcome");
    setSelectedElection(null);
    setVoterId("");
    setVotingToken("");
    setSelectedCandidate(null);
    setReceiptCode("");
    setVerificationStatus("");
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gov-blue to-primary p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gov-white/10 backdrop-blur-sm border-4 border-gov-gold flex items-center justify-center">
            <Shield className="w-16 h-16 text-gov-gold" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gov-white tracking-tight">
          Official Voting Center
        </h1>
        <p className="text-2xl md:text-3xl text-gov-gold font-medium">
          Blockchain Election
        </p>
        
        <div className="flex items-center justify-center gap-4 text-gov-white/80 text-lg mt-8">
          <span className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Secure
          </span>
          <span className="text-gov-gold">•</span>
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Private
          </span>
          <span className="text-gov-gold">•</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Verified
          </span>
        </div>

        <Button 
          onClick={() => setCurrentScreen("select-election")}
          className="mt-12 h-20 px-16 text-2xl font-semibold bg-gov-gold hover:bg-gov-gold/90 text-gov-blue rounded-xl shadow-elevated transition-all hover:scale-105"
        >
          Start Voting
          <ArrowRight className="w-8 h-8 ml-3" />
        </Button>
      </div>
    </div>
  );

  // Election Selection Screen
  const ElectionSelectScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gov-white p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gov-blue/10 flex items-center justify-center">
              <Vote className="w-10 h-10 text-gov-blue" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gov-blue">Select Election</h2>
          <p className="text-lg text-muted-foreground">Choose the election you want to vote in</p>
        </div>

        {electionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gov-blue" />
          </div>
        ) : activeElections.length === 0 ? (
          <Card className="border-2 border-vote-pending/30">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-vote-pending mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No active elections at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeElections.map((election) => (
              <Card
                key={election.id}
                onClick={() => {
                  setSelectedElection(election);
                  setCurrentScreen("auth");
                }}
                className="cursor-pointer transition-all border-2 border-gov-blue/20 hover:border-gov-gold hover:shadow-elevated"
              >
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{election.name}</h3>
                  <p className="text-muted-foreground">{election.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen("welcome")}
          className="w-full h-14 text-lg text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Welcome
        </Button>
      </div>
    </div>
  );

  // Authentication Screen
  const AuthScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gov-white p-8">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gov-blue/10 flex items-center justify-center">
              <Fingerprint className="w-10 h-10 text-gov-blue" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gov-blue">Voter Authentication</h2>
          <p className="text-lg text-muted-foreground">
            Voting for: <span className="font-semibold text-foreground">{selectedElection?.name}</span>
          </p>
        </div>

        <Card className="border-2 border-gov-blue/20 shadow-card">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-lg font-medium text-foreground">Voter ID Number</label>
              <Input
                type="text"
                placeholder="Enter your Voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="h-16 text-xl px-6 border-2 border-gov-blue/30 focus:border-gov-blue"
              />
            </div>

            <div className="space-y-3">
              <label className="text-lg font-medium text-foreground flex items-center gap-2">
                Secure Voting Token
                <QrCode className="w-5 h-5 text-gov-blue" />
              </label>
              <Input
                type="text"
                placeholder="Enter token or scan QR code"
                value={votingToken}
                onChange={(e) => setVotingToken(e.target.value)}
                className="h-16 text-xl px-6 border-2 border-gov-blue/30 focus:border-gov-blue"
              />
            </div>

            {verificationStatus && (
              <div className="flex items-center gap-3 p-4 bg-gov-blue/5 rounded-lg border border-gov-blue/20">
                <Loader2 className="w-6 h-6 text-gov-blue animate-spin" />
                <span className="text-lg text-gov-blue font-medium">{verificationStatus}</span>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={!voterId || !votingToken || isVerifying}
              className="w-full h-16 text-xl font-semibold bg-gov-blue hover:bg-gov-blue/90 text-white rounded-xl"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Verify Eligibility
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen("select-election")}
          className="w-full h-14 text-lg text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Elections
        </Button>
      </div>
    </div>
  );

  // Ballot Selection Screen
  const BallotScreen = () => (
    <div className="flex flex-col min-h-screen bg-gov-white p-8">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gov-blue/10 flex items-center justify-center">
              <Vote className="w-10 h-10 text-gov-blue" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gov-blue">Select Your Candidate</h2>
          <p className="text-lg text-muted-foreground">Tap on a candidate to select</p>
        </div>

        {candidatesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gov-blue" />
          </div>
        ) : candidates.length === 0 ? (
          <Card className="border-2 border-vote-pending/30">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-vote-pending mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No candidates have been added to this election yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <Card
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className={`cursor-pointer transition-all border-2 ${
                  selectedCandidate?.id === candidate.id
                    ? "border-gov-gold bg-gov-gold/10 shadow-elevated"
                    : "border-gov-blue/20 hover:border-gov-blue/40 hover:shadow-card"
                }`}
              >
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                    selectedCandidate?.id === candidate.id
                      ? "border-gov-gold bg-gov-gold"
                      : "border-gov-blue/40"
                  }`}>
                    {selectedCandidate?.id === candidate.id && (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground">{candidate.name}</h3>
                    <p className="text-lg text-muted-foreground">{candidate.party}</p>
                  </div>
                  {candidate.position && (
                    <div className="text-right">
                      <span className="text-sm font-medium text-gov-blue bg-gov-blue/10 px-3 py-1 rounded-full">
                        {candidate.position}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentScreen("auth")}
            className="flex-1 h-16 text-xl border-2 border-gov-blue/30 text-gov-blue"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentScreen("review")}
            disabled={!selectedCandidate}
            className="flex-1 h-16 text-xl font-semibold bg-gov-blue hover:bg-gov-blue/90 text-white"
          >
            Next
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Review Screen
  const ReviewScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gov-white p-8">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gov-gold/20 flex items-center justify-center">
              <FileCheck className="w-10 h-10 text-gov-gold" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gov-blue">Review Your Vote</h2>
          <p className="text-lg text-muted-foreground">Please confirm your selection before submitting</p>
        </div>

        <Card className="border-2 border-gov-gold shadow-elevated">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground uppercase tracking-wide">Your Selection</p>
              <h3 className="text-3xl font-bold text-foreground">{selectedCandidate?.name}</h3>
              <p className="text-xl text-gov-blue">{selectedCandidate?.party}</p>
              {selectedCandidate?.position && (
                <div className="pt-4">
                  <span className="text-sm font-medium text-gov-gold bg-gov-gold/10 px-4 py-2 rounded-full">
                    {selectedCandidate.position}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-gov-blue/5 border border-gov-blue/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-gov-blue flex-shrink-0 mt-1" />
            <p className="text-muted-foreground">
              Your vote will be securely recorded on the blockchain. Once submitted, it cannot be changed but will remain anonymous and verifiable.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleSubmitVote}
            disabled={isSubmitting}
            className="w-full h-16 text-xl font-semibold bg-vote-success hover:bg-vote-success/90 text-white rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Confirm & Submit Vote
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentScreen("ballot")}
            disabled={isSubmitting}
            className="w-full h-14 text-lg border-2 border-gov-blue/30 text-gov-blue"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );

  // Success Screen
  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-vote-success to-vote-success/80 p-8">
      <div className="text-center space-y-8 max-w-xl">
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-20 h-20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl font-bold text-white">Vote Submitted!</h2>
          <p className="text-xl text-white/90">
            Your vote has been securely recorded on the blockchain.
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <p className="text-white/80 text-sm uppercase tracking-wide mb-2">Receipt Code</p>
            <p className="text-2xl font-mono font-bold text-white tracking-wider">{receiptCode}</p>
            <p className="text-white/60 text-sm mt-2">Save this code for your records</p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-3 text-white/80">
          <Lock className="w-5 h-5" />
          <span>Your vote is anonymous and verified</span>
        </div>

        <Button
          onClick={handleFinish}
          className="mt-8 h-16 px-12 text-xl font-semibold bg-white hover:bg-white/90 text-vote-success rounded-xl"
        >
          Finish
        </Button>
      </div>
    </div>
  );

  // Render current screen
  const screens: Record<Screen, JSX.Element> = {
    welcome: <WelcomeScreen />,
    "select-election": <ElectionSelectScreen />,
    auth: <AuthScreen />,
    ballot: <BallotScreen />,
    review: <ReviewScreen />,
    success: <SuccessScreen />,
  };

  return screens[currentScreen];
}
