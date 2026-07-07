package com.voting.model;

public class User {

    private int id;
    private String fullName;
    private String mobile;
    private String email;
    private String voterId;
    private String province;
    private String district;
    private String municipality;
    private String passwordHash;
    private String role;
    private boolean hasVoted;

    public User() {
    }

    public User(int id, String fullName, String mobile, String email, String voterId,
                String province, String district, String municipality,
                String passwordHash, String role, boolean hasVoted) {
        this.id = id;
        this.fullName = fullName;
        this.mobile = mobile;
        this.email = email;
        this.voterId = voterId;
        this.province = province;
        this.district = district;
        this.municipality = municipality;
        this.passwordHash = passwordHash;
        this.role = role;
        this.hasVoted = hasVoted;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVoterId() {
        return voterId;
    }

    public void setVoterId(String voterId) {
        this.voterId = voterId;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(boolean hasVoted) {
        this.hasVoted = hasVoted;
    }
}
