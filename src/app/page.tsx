"use client";

import { useState, useRef } from "react";

interface VoterData {
  epicId: string;
  name: string;
  ward: string;
  partNo: string;
  serialNo: number;
  pollingSchool: string;
}

type Step = "search" | "result" | "mobile" | "confirm" | "saved";

export default function Home() {
  const [epic, setEpic] = useState("");
  const [voter, setVoter] = useState<VoterData | null>(null);
  const [mobile, setMobile] = useState("");
  const [existingMobile, setExistingMobile] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<Step>("search");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  async function handleSearch() {
    if (!epic.trim()) return;
    setLoading(true);
    setError("");
    setVoter(null);
    // Always reset mobile state on every new search
    setMobile("");
    setExistingMobile(null);
    setIsEditing(false);
    setStep("search");

    try {
      const res = await fetch("/api/voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epic: epic.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch voter data");
        setLoading(false);
        return;
      }

      setVoter(data);

      // Fetch existing mobile from DB
      const mobileRes = await fetch(
        "/api/mobile?epicId=" + encodeURIComponent(data.epicId),
      );
      if (mobileRes.ok) {
        const mobileData = await mobileRes.json();
        if (mobileData.mobile) {
          setExistingMobile(mobileData.mobile);
        }
      }

      setStep("result");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!voter || !mobile) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...voter, mobile }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        setStep("mobile");
        setSaving(false);
        return;
      }

      setSavedId(data.id);
      setExistingMobile(mobile);
      setIsEditing(false);
      setStep("saved");
    } catch {
      setError("Network error while saving.");
      setStep("mobile");
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setMobile("");
    setIsEditing(true);
    setError("");
    setStep("mobile");
    setTimeout(() => mobileInputRef.current?.focus(), 100);
  }

  function cancelEdit() {
    setMobile("");
    setIsEditing(false);
    setError("");
    setStep("result");
  }

  function reset() {
    setEpic("");
    setVoter(null);
    setMobile("");
    setExistingMobile(null);
    setIsEditing(false);
    setStep("search");
    setError("");
    setSavedId("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const mobileValid = /^\d{10}$/.test(mobile);

  return (
    <main className="min-h-screen grid-bg flex flex-col items-center justify-start pt-12 pb-20 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 10px var(--accent)",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              color: "var(--text-dim)",
              textTransform: "uppercase",
            }}
          >
            Karnataka Electoral Registry
          </span>
        </div>
        <h1
          className="mono"
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "var(--text-bright)",
            lineHeight: 1.2,
          }}
        >
          EPIC Voter Lookup
        </h1>
        <p
          style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: 6 }}
        >
          Search BBMP electoral records by EPIC ID
        </p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Search Box */}
        <div className="card p-6 mb-4 relative">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 24,
              height: 1,
              background: "var(--accent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1,
              height: 24,
              background: "var(--accent)",
            }}
          />

          <label
            className="mono"
            style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-dim)",
              marginBottom: 10,
            }}
          >
            Enter EPIC ID
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              ref={inputRef}
              className="epic-input"
              type="text"
              placeholder="e.g. KAR1234567"
              value={epic}
              onChange={(e) => {
                setEpic(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              maxLength={20}
              disabled={loading}
              autoFocus
            />
            <button
              className="btn-primary"
              onClick={handleSearch}
              disabled={loading || !epic.trim()}
            >
              {loading ? <span className="loader" /> : "SEARCH"}
            </button>
          </div>

          {error && (
            <div
              className="slide-in"
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "rgba(255,82,82,0.08)",
                border: "1px solid rgba(255,82,82,0.25)",
                borderRadius: 2,
                color: "var(--error)",
                fontSize: "0.85rem",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Voter Result Card */}
        {voter &&
          (step === "result" || step === "mobile" || step === "confirm") && (
            <div className="card p-6 mb-4 slide-in">
              {/* Voter header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    className="badge badge-success"
                    style={{ marginBottom: 8 }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--success)",
                        display: "inline-block",
                      }}
                    />
                    Record Found
                  </div>
                  <h2
                    className="mono"
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--text-bright)",
                      fontWeight: 600,
                    }}
                  >
                    {voter.name}
                  </h2>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--accent)",
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    padding: "4px 10px",
                    borderRadius: 2,
                  }}
                >
                  {voter.epicId}
                </span>
              </div>

              {/* Fields */}
              <div>
                {[
                  { label: "Ward", value: voter.ward },
                  { label: "Part No.", value: voter.partNo },
                  { label: "Serial No.", value: String(voter.serialNo) },
                  { label: "Polling School", value: voter.pollingSchool },
                ].map(({ label, value }) => (
                  <div className="field-row" key={label}>
                    <span className="field-label">{label}</span>
                    <span className="field-value">{value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* Mobile Section */}
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    height: 1,
                    background: "var(--border)",
                    marginBottom: 20,
                  }}
                />

                {/* Existing mobile display */}
                {existingMobile && !isEditing && step === "result" && (
                  <div className="slide-in">
                    <label
                      className="mono"
                      style={{
                        display: "block",
                        fontSize: "0.7rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--text-dim)",
                        marginBottom: 10,
                      }}
                    >
                      Mobile Number
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 18px",
                        background: "rgba(0,230,118,0.06)",
                        border: "1px solid rgba(0,230,118,0.25)",
                        borderRadius: 2,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--success)",
                          flexShrink: 0,
                          boxShadow: "0 0 6px var(--success)",
                        }}
                      />
                      <span
                        className="mono"
                        style={{
                          fontSize: "1.1rem",
                          color: "var(--success)",
                          letterSpacing: "0.08em",
                          flex: 1,
                        }}
                      >
                        +91 {existingMobile}
                      </span>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: "0.75rem", padding: "6px 14px" }}
                        onClick={startEdit}
                      >
                        ✎ EDIT
                      </button>
                    </div>
                    <p
                      className="mono"
                      style={{
                        marginTop: 6,
                        fontSize: "0.68rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      ✓ Already saved in database
                    </p>
                  </div>
                )}

                {/* No existing mobile — show Add button */}
                {!existingMobile && !isEditing && step === "result" && (
                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setMobile("");
                      setStep("mobile");
                      setTimeout(() => mobileInputRef.current?.focus(), 100);
                    }}
                  >
                    + ADD MOBILE NUMBER
                  </button>
                )}

                {/* Mobile input (new or editing) */}
                {step === "mobile" && (
                  <div className="slide-in">
                    <label
                      className="mono"
                      style={{
                        display: "block",
                        fontSize: "0.7rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--text-dim)",
                        marginBottom: 10,
                      }}
                    >
                      {isEditing ? "New Mobile Number" : "Mobile Number"}
                    </label>

                    {isEditing && existingMobile && (
                      <div
                        style={{
                          marginBottom: 10,
                          padding: "8px 14px",
                          background: "rgba(255,196,0,0.06)",
                          border: "1px solid rgba(255,196,0,0.2)",
                          borderRadius: 2,
                        }}
                      >
                        <span
                          className="mono"
                          style={{ fontSize: "0.75rem", color: "var(--warn)" }}
                        >
                          Current: +91 {existingMobile}
                        </span>
                      </div>
                    )}

                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <div style={{ position: "relative", flex: 1 }}>
                        <span
                          className="mono"
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-dim)",
                            fontSize: "0.9rem",
                            pointerEvents: "none",
                          }}
                        >
                          +91
                        </span>
                        <input
                          ref={mobileInputRef}
                          className="epic-input"
                          style={{
                            paddingLeft: 50,
                            textTransform: "none",
                            letterSpacing: "0.06em",
                          }}
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={mobile}
                          onChange={(e) => {
                            setMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            );
                            setError("");
                          }}
                          maxLength={10}
                        />
                      </div>
                      <button
                        className="btn-success"
                        disabled={!mobileValid}
                        onClick={() => setStep("confirm")}
                      >
                        SAVE
                      </button>
                      {isEditing && (
                        <button className="btn-ghost" onClick={cancelEdit}>
                          CANCEL
                        </button>
                      )}
                    </div>

                    {mobile.length > 0 && !mobileValid && (
                      <p
                        className="mono"
                        style={{
                          marginTop: 6,
                          fontSize: "0.75rem",
                          color: "var(--error)",
                        }}
                      >
                        Enter exactly 10 digits
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Saved confirmation */}
        {step === "saved" && (
          <div className="card p-8 slide-in" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--success-glow)",
                border: "2px solid var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "1.5rem",
              }}
            >
              ✓
            </div>
            <h2
              className="mono"
              style={{
                fontSize: "1.1rem",
                color: "var(--success)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {isEditing ? "Number Updated" : "Record Saved"}
            </h2>
            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "0.85rem",
                marginBottom: 6,
              }}
            >
              {voter?.name} — {voter?.epicId}
            </p>
            <p
              className="mono"
              style={{
                color: "var(--accent)",
                fontSize: "0.8rem",
                marginBottom: 24,
              }}
            >
              +91 {mobile}
            </p>
            {savedId && (
              <p
                className="mono"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-dim)",
                  marginBottom: 24,
                }}
              >
                DB ID: {savedId}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn-ghost"
                onClick={() => {
                  setStep("result");
                  setIsEditing(false);
                }}
              >
                ← BACK TO RECORD
              </button>
              <button className="btn-primary" onClick={reset}>
                SEARCH ANOTHER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {step === "confirm" && voter && (
        <div className="modal-backdrop" onClick={() => setStep("mobile")}>
          <div
            className="card slide-in"
            style={{
              maxWidth: 420,
              width: "90%",
              padding: 28,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 20,
                height: 1,
                background: "var(--accent)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1,
                height: 20,
                background: "var(--accent)",
              }}
            />

            <p
              className="mono"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                marginBottom: 16,
              }}
            >
              {isEditing ? "Confirm Update" : "Confirm & Save"}
            </p>
            <h3
              className="mono"
              style={{
                fontSize: "1rem",
                color: "var(--text-bright)",
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              Is this number correct?
            </h3>

            {isEditing && existingMobile && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(255,196,0,0.05)",
                  border: "1px solid rgba(255,196,0,0.15)",
                  borderRadius: 2,
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "0.72rem",
                    marginBottom: 2,
                  }}
                >
                  Replacing
                </p>
                <p
                  className="mono"
                  style={{
                    fontSize: "1rem",
                    color: "var(--warn)",
                    letterSpacing: "0.08em",
                    textDecoration: "line-through",
                  }}
                >
                  +91 {existingMobile}
                </p>
              </div>
            )}

            <div
              style={{
                background: "rgba(0,212,255,0.06)",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 2,
                padding: "16px 20px",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.75rem",
                  marginBottom: 4,
                }}
              >
                {isEditing ? "New Mobile Number" : "Mobile Number"}
              </p>
              <p
                className="mono"
                style={{
                  fontSize: "1.4rem",
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                }}
              >
                +91 {mobile}
              </p>
            </div>

            <div style={{ padding: "10px 0", marginBottom: 20 }}>
              <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                For voter{" "}
                <span className="mono" style={{ color: "var(--text)" }}>
                  {voter.name}
                </span>{" "}
                (
                <span
                  className="mono"
                  style={{ color: "var(--accent)", fontSize: "0.8rem" }}
                >
                  {voter.epicId}
                </span>
                )
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,82,82,0.08)",
                  border: "1px solid rgba(255,82,82,0.2)",
                  borderRadius: 2,
                  color: "var(--error)",
                  fontSize: "0.8rem",
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setStep("mobile")}
              >
                ← EDIT
              </button>
              <button
                className="btn-success"
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <span className="loader" /> : "✓ CONFIRM & SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="mono"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 20px",
          background: "rgba(10,14,20,0.9)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
        }}
      >
        <span>BBMP ELECTORAL API</span>
        <span style={{ color: "var(--accent)" }}>● LIVE</span>
        <span>Karnataka Electoral 2026</span>
      </div>
    </main>
  );
}
