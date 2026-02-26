package model;

public class Candidate {
    private int id;
    private String name;
    private String party;
    private int electionId;

    public Candidate() {}

    public Candidate(int id, String name, String party, int electionId) {
        this.id = id;
        this.name = name;
        this.party = party;
        this.electionId = electionId;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getParty() { return party; }
    public void setParty(String party) { this.party = party; }

    public int getElectionId() { return electionId; }
    public void setElectionId(int electionId) { this.electionId = electionId; }

    @Override
    public String toString() {
        return name + " - " + party;
    }

}