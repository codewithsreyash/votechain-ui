import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Election {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string | null;
  position: string | null;
}

export interface VoteResult {
  candidate_id: string;
  candidate_name: string;
  party: string | null;
  vote_count: number;
}

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("elections-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "elections" },
        () => fetchElections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchElections = async () => {
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setElections(data);
    }
    setLoading(false);
  };

  const createElection = async (
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    userId: string
  ) => {
    const { data, error } = await supabase
      .from("elections")
      .insert({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
        created_by: userId
      })
      .select()
      .single();

    if (!error) {
      fetchElections();
    }
    return { data, error };
  };

  const updateElectionStatus = async (electionId: string, status: string) => {
    const { error } = await supabase
      .from("elections")
      .update({ status })
      .eq("id", electionId);

    if (!error) {
      fetchElections();
    }
    return { error };
  };

  const getVoteCount = async (electionId: string) => {
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("election_id", electionId);

    return { count: count ?? 0, error };
  };

  return {
    elections,
    loading,
    createElection,
    updateElectionStatus,
    getVoteCount,
    refetch: fetchElections
  };
}

export function useCandidates(electionId?: string) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (electionId) {
      fetchCandidates();
    } else {
      setLoading(false);
    }
  }, [electionId]);

  const fetchCandidates = async () => {
    if (!electionId) return;
    
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId);

    if (!error && data) {
      setCandidates(data);
    }
    setLoading(false);
  };

  const addCandidate = async (
    name: string,
    party: string,
    position: string
  ) => {
    if (!electionId) return { error: new Error("No election selected") };

    const { data, error } = await supabase
      .from("candidates")
      .insert({
        election_id: electionId,
        name,
        party,
        position
      })
      .select()
      .single();

    if (!error) {
      fetchCandidates();
    }
    return { data, error };
  };

  const deleteCandidate = async (candidateId: string) => {
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", candidateId);

    if (!error) {
      fetchCandidates();
    }
    return { error };
  };

  return {
    candidates,
    loading,
    addCandidate,
    deleteCandidate,
    refetch: fetchCandidates
  };
}

export function useElectionResults(electionId: string) {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (electionId) {
      fetchResults();
      
      // Subscribe to vote updates
      const channel = supabase
        .channel(`votes-${electionId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "votes", filter: `election_id=eq.${electionId}` },
          () => fetchResults()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [electionId]);

  const fetchResults = async () => {
    const { data, error } = await supabase.rpc("get_election_results", {
      election_uuid: electionId
    });

    if (!error && data) {
      setResults(data);
      setTotalVotes(data.reduce((sum: number, r: VoteResult) => sum + Number(r.vote_count), 0));
    }
    setLoading(false);
  };

  return { results, totalVotes, loading, refetch: fetchResults };
}
