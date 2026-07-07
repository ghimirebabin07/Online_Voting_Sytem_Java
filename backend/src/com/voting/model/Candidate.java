package com.voting.model;

public class Candidate {

    private int id;
    private String name;
    private String party;
    private String imagePath;
    private String symbolPath;
    private String description;
    private String province;
    private String district;
    private String municipality;
    private int voteCount;

    public Candidate() {
    }

    public Candidate(int id, String name, String party, String imagePath, String symbolPath, String description,
                     String province, String district, String municipality, int voteCount) {
        this.id = id;
        this.name = name;
        this.party = party;
        this.imagePath = imagePath;
        this.symbolPath = symbolPath;
        this.description = description;
        this.province = province;
        this.district = district;
        this.municipality = municipality;
        this.voteCount = voteCount;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParty() {
        return party;
    }

    public void setParty(String party) {
        this.party = party;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getSymbolPath() {
        return symbolPath;
    }

    public void setSymbolPath(String symbolPath) {
        this.symbolPath = symbolPath;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getMunicipality() {
        return municipality;
    }

    public void setMunicipality(String municipality) {
        this.municipality = municipality;
    }

    public int getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(int voteCount) {
        this.voteCount = voteCount;
    }
}
