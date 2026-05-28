import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import { MapPin, TrendingUp, ShieldAlert, Star, ChevronRight, X, BarChart2, Zap, Globe, Users, Target, Clock, Download, AlertTriangle, CheckCircle, Info } from "lucide-react";

// ─── DATA LAYER (simulates backend API) ──────────────────────────────────────
const LOCATIONS = {
  anaheim: {
    id: "anaheim",
    name: "Anaheim",
    state: "California",
    tag: "Family Hub",
    tagColor: "#F59E0B",
    scores: {
      consumerDemand: 88,
      tourismTraffic: 85,
      familySpending: 92,
      socialMediaTrend: 90,
      competitionRisk: 62,
      operationalRisk: 55,
    },
    behaviorInsights: [
      { label: "Family Shopping Behavior", value: "High repeat-visit intent; parents spend 40% more when children are present" },
      { label: "Tourism Spending Patterns", value: "Disneyland proximity drives $2.3B annual visitor spend in the corridor" },
      { label: "Impulse Buying Potential", value: "Very High — entertainment-primed mindset elevates discretionary purchases" },
      { label: "Social Media Opportunity", value: "Anaheim ranks top-10 for toy/family hashtag engagement in the US" },
      { label: "Price Sensitivity", value: "Moderate — families budget for experiences but seek value bundles" },
      { label: "Seasonal Toy Demand", value: "Peak Q4, secondary summer peak driven by park tourism" },
    ],
    risks: [
      { risk: "High Cost of Living & Real Estate", concern: "Premium retail space squeezes margins", strategy: "Negotiate revenue-share lease; prioritize flagship ROI over sq footage", action: "Secure lease by Q2 2027" },
      { risk: "Strong Regional Competition", concern: "Disney stores and toy chains capture impulse spend", strategy: "Exclusive SKUs + interactive in-store experiences unavailable at competitors", action: "Lock 3 exclusive product lines by Q3 2027" },
    ],
    recommendation: "Strongest family demographic alignment and social media potential. Priority #1.",
    rank: 1,
  },
  rockefeller: {
    id: "rockefeller",
    name: "Rockefeller Plaza",
    state: "New York",
    tag: "Flagship Icon",
    tagColor: "#6366F1",
    scores: {
      consumerDemand: 82,
      tourismTraffic: 97,
      familySpending: 75,
      socialMediaTrend: 94,
      competitionRisk: 70,
      operationalRisk: 78,
    },
    behaviorInsights: [
      { label: "Tourism Spending Patterns", value: "65M+ annual visitors; NYC tourists spend avg $1,174/trip on retail" },
      { label: "Impulse Buying Potential", value: "Extremely High — iconic setting triggers souvenir and prestige purchasing" },
      { label: "Social Media Opportunity", value: "#1 location for earned media; flagship stores here generate global press" },
      { label: "Parent Purchasing Behavior", value: "Urban parents prioritize premium, educational, and exclusive products" },
      { label: "Convenience Expectations", value: "High demand for mobile checkout, same-day delivery, and pickup lockers" },
      { label: "Local vs Tourist Balance", value: "~70% tourist-driven revenue; resilient to local economic shifts" },
    ],
    risks: [
      { risk: "Highest Operational Cost in Portfolio", concern: "Rent + staffing in NYC among highest globally", strategy: "Mobile checkout, pickup lockers, lean staffing model to offset cost", action: "Model unit economics before lease commitment" },
      { risk: "Purchase Carry Friction", concern: "Tourists avoid large/heavy items they can't take home easily", strategy: "Ship-to-home kiosks; premium gift wrapping with international shipping", action: "Partner with global logistics provider by Q1 2027" },
    ],
    recommendation: "Strongest visibility, tourism, and flagship branding. Iconic media exposure justifies premium cost. Priority #2.",
    rank: 2,
  },
  orlando: {
    id: "orlando",
    name: "Orlando",
    state: "Florida",
    tag: "Tourism Magnet",
    tagColor: "#10B981",
    scores: {
      consumerDemand: 80,
      tourismTraffic: 91,
      familySpending: 88,
      socialMediaTrend: 78,
      competitionRisk: 60,
      operationalRisk: 52,
    },
    behaviorInsights: [
      { label: "Vacation Spending Mindset", value: "Vacation mode removes typical budget inhibitions; spend 30% more on toys" },
      { label: "Family Tourism Behavior", value: "75M+ annual visitors; families with children aged 4–14 are majority demographic" },
      { label: "Emotional Purchase Triggers", value: "Theme-park adjacency creates high emotional recall tied to brand experience" },
      { label: "Impulse Buying Potential", value: "High — vacation-mode consumers prioritize memory-making over frugality" },
      { label: "Seasonal Traffic", value: "Year-round due to Orlando's 365-day tourism cycle; minimal off-peak risk" },
      { label: "Price Sensitivity", value: "Low during vacation; families pre-budget for Orlando experiences" },
    ],
    risks: [
      { risk: "Competition from Attraction Retail", concern: "Universal, Disney, and SeaWorld operate massive in-park retail ecosystems", strategy: "Position outside parks as the 'take-home memory' store; exclusivity angle", action: "Identify non-park-adjacent high-traffic retail corridor by Q2 2027" },
      { risk: "Seasonal Traffic Volatility", concern: "Hurricane season (Aug–Oct) suppresses visitor counts", strategy: "Off-peak promotions, local family events, back-to-school activations", action: "Build local loyalty program to stabilize revenue floor" },
    ],
    recommendation: "Strong family tourism and vacation impulse spending. Lowest operational risk in the portfolio. Priority #3.",
    rank: 3,
  },
};

function calcScore(s) {
  return Math.round(
    s.consumerDemand * 0.25 +
    s.tourismTraffic * 0.20 +
    s.familySpending * 0.20 +
    s.socialMediaTrend * 0.15 +
    (100 - s.competitionRisk) * 0.10 +
    (100 - s.operationalRisk) * 0.10
  );
}

Object.values(LOCATIONS).forEach(l => { l.overallScore = calcScore(l.scores); });

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy: "#0F172A",
  navyMid: "#1E293B",
  navyLight: "#334155",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  white: "#F8FAFC",
  gray: "#94A3B8",
  grayLight: "#E2E8F0",
  accent: "#6366F1",
};

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const ScoreBadge = ({ score, size = "md" }) => {
  const color = score >= 85 ? "#10B981" : score >= 75 ? "#F59E0B" : "#EF4444";
  const sz = size === "lg" ? "text-3xl font-black" : "text-xl font-bold";
  return <span style={{ color }} className={sz}>{score}</span>;
};

const ScoreBar = ({ label, value, max = 100, invert = false }) => {
  const pct = (value / max) * 100;
  const color = invert
    ? value > 65 ? "#EF4444" : value > 45 ? "#F59E0B" : "#10B981"
    : value >= 85 ? "#10B981" : value >= 70 ? "#F59E0B" : "#EF4444";
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span style={{ color: C.gray, fontSize: 12 }}>{label}</span>
        <span style={{ color: C.white, fontSize: 12, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ background: C.navyLight, borderRadius: 4, height: 6 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: 6, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
};

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background: C.navyMid,
    border: `1px solid ${C.navyLight}`,
    borderRadius: 12,
    padding: 24,
    ...style
  }}>{children}</div>
);

const GoldBtn = ({ children, onClick, loading, disabled, small }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      background: loading || disabled ? C.navyLight : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
      color: loading || disabled ? C.gray : C.navy,
      border: "none",
      borderRadius: 8,
      padding: small ? "8px 16px" : "12px 24px",
      fontWeight: 700,
      fontSize: small ? 13 : 14,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      transition: "all 0.2s",
      letterSpacing: "0.02em",
    }}
  >{loading ? "Analyzing…" : children}</button>
);

const NavyBtn = ({ children, onClick, active }) => (
  <button onClick={onClick} style={{
    background: active ? C.gold : "transparent",
    color: active ? C.navy : C.gray,
    border: `1px solid ${active ? C.gold : C.navyLight}`,
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  }}>{children}</button>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ loc, onClose }) => {
  if (!loc) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div style={{
        background: C.navyMid, border: `1px solid ${C.navyLight}`,
        borderRadius: 16, maxWidth: 600, width: "100%", padding: 32, position: "relative"
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: C.gray }}>
          <X size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <ShieldAlert size={22} color={C.gold} />
          <h3 style={{ color: C.white, fontSize: 20, fontWeight: 700, margin: 0 }}>Risk Plan — {loc.name}</h3>
        </div>
        {loc.risks.map((r, i) => (
          <div key={i} style={{ background: C.navy, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} color="#EF4444" />
              <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 14 }}>{r.risk}</span>
            </div>
            <p style={{ color: C.gray, fontSize: 13, margin: "0 0 8px 0" }}><strong style={{ color: C.white }}>Concern:</strong> {r.concern}</p>
            <p style={{ color: C.gray, fontSize: 13, margin: "0 0 8px 0" }}><strong style={{ color: C.gold }}>Strategy:</strong> {r.strategy}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <CheckCircle size={14} color="#10B981" />
              <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>{r.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── EXECUTIVE SUMMARY PANEL ──────────────────────────────────────────────────
const ExecSummary = ({ onClose }) => {
  const locs = Object.values(LOCATIONS).sort((a, b) => a.rank - b.rank);
  return (
    <div style={{
      background: C.navyMid, border: `2px solid ${C.gold}`,
      borderRadius: 16, padding: 40, marginTop: 32,
      fontFamily: "Georgia, serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ color: C.gold, fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Confidential — Executive Summary</div>
          <h2 style={{ color: C.white, fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "Georgia, serif" }}>BeaconIQ Beacon Store Launch Report</h2>
          <p style={{ color: C.gray, marginTop: 8, fontSize: 14 }}>Prepared for: Executive Leadership · Retail Expansion Division · May 2027</p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.gray }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${C.navyLight}`, borderBottom: `1px solid ${C.navyLight}`, padding: "24px 0", marginBottom: 28 }}>
        <p style={{ color: C.grayLight, lineHeight: 1.8, fontSize: 15, margin: 0 }}>
          BeaconIQ's consumer intelligence analysis evaluated three candidate markets for the Beacon Store relaunch initiative. Using a weighted scoring model across six behavioral and operational dimensions, this report presents ranked recommendations with supporting consumer behavior data, risk profiles, and mitigation strategies.
        </p>
      </div>

      <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>Top 3 Recommended Markets</h3>
      {locs.map((loc, i) => (
        <div key={loc.id} style={{
          display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24,
          padding: 20, background: C.navy, borderRadius: 10, border: `1px solid ${C.navyLight}`
        }}>
          <div style={{
            minWidth: 48, height: 48, borderRadius: "50%",
            background: i === 0 ? C.gold : i === 1 ? "#C0C0C0" : "#CD7F32",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 20, color: C.navy
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: C.white, fontSize: 18, fontWeight: 700 }}>{loc.name}, {loc.state}</span>
              <span style={{ color: C.gold, fontWeight: 700 }}>Score: {loc.overallScore}/100</span>
            </div>
            <p style={{ color: C.gray, fontSize: 13, margin: "0 0 8px 0" }}>{loc.recommendation}</p>
            <p style={{ color: C.grayLight, fontSize: 13, margin: 0 }}>
              <strong style={{ color: C.white }}>Key Insight:</strong> {loc.behaviorInsights[0].value}
            </p>
            <p style={{ color: C.grayLight, fontSize: 13, margin: "6px 0 0 0" }}>
              <strong style={{ color: "#EF4444" }}>Primary Risk:</strong> {loc.risks[0].risk} → <span style={{ color: "#10B981" }}>{loc.risks[0].action}</span>
            </p>
          </div>
        </div>
      ))}

      <div style={{ background: C.navy, borderRadius: 10, padding: 20, borderLeft: `4px solid ${C.gold}`, marginBottom: 28 }}>
        <h4 style={{ color: C.gold, margin: "0 0 10px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em" }}>Final Recommendation</h4>
        <p style={{ color: C.grayLight, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
          BeaconIQ recommends proceeding with all three markets in phased order. Anaheim launches first to establish family demographic credibility. Rockefeller Plaza follows to amplify brand prestige and earned media. Orlando rounds the portfolio with stable year-round tourism revenue. Combined projected market coverage reaches approximately 210M annual consumer touchpoints.
        </p>
      </div>

      <p style={{ color: C.navyLight, fontSize: 11, textAlign: "center", margin: 0, letterSpacing: "0.05em" }}>
        BEACONIQ PLATFORM · SIMULATED MARKET DATA · FOR PRESENTATION PURPOSES · {new Date().getFullYear()}
      </p>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BeaconIQ() {
  const [activeTab, setActiveTab] = useState("anaheim");
  const [analyzeState, setAnalyzeState] = useState("idle"); // idle | loading | done
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [recoState, setRecoState] = useState(null);
  const [modalLoc, setModalLoc] = useState(null);
  const [showExec, setShowExec] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const loc = LOCATIONS[activeTab];
  const allLocs = Object.values(LOCATIONS);

  // Simulate /api/analyze
  const handleAnalyze = () => {
    setAnalyzeState("loading");
    setAnalyzeResult(null);
    setTimeout(() => {
      setAnalyzeResult(loc);
      setAnalyzeState("done");
    }, 2200);
  };

  // Simulate /api/recommendations
  const handleReco = () => {
    setRecoState(allLocs.sort((a, b) => a.rank - b.rank));
  };

  // Bar chart data
  const barData = allLocs.map(l => ({
    name: l.name,
    "Overall Score": l.overallScore,
    "Consumer Demand": l.scores.consumerDemand,
    "Tourism Traffic": l.scores.tourismTraffic,
  }));

  // Radar data for active location
  const radarData = [
    { metric: "Consumer Demand", value: loc.scores.consumerDemand },
    { metric: "Tourism Traffic", value: loc.scores.tourismTraffic },
    { metric: "Family Spending", value: loc.scores.familySpending },
    { metric: "Social Media", value: loc.scores.socialMediaTrend },
    { metric: "Low Comp. Risk", value: 100 - loc.scores.competitionRisk },
    { metric: "Low Op. Risk", value: 100 - loc.scores.operationalRisk },
  ];

  // Compare bar data
  const compareData = allLocs.map(l => ({
    name: l.name,
    "Family Spending": l.scores.familySpending,
    "Social Media Trend": l.scores.socialMediaTrend,
    "Tourism Traffic": l.scores.tourismTraffic,
    "Consumer Demand": l.scores.consumerDemand,
  }));

  const TIMELINE = [
    { phase: "Jan–Mar 2027", title: "Research & Data Collection", desc: "Census data analysis, Google Trends ingestion, competitor mapping", color: "#6366F1" },
    { phase: "Apr–Jun 2027", title: "Platform Development", desc: "BeaconIQ dashboard build, data pipeline architecture, stakeholder reviews", color: "#8B5CF6" },
    { phase: "Jul–Aug 2027", title: "Pilot Market Testing", desc: "Pop-up activations in Anaheim, consumer behavior surveys, feedback loops", color: "#F59E0B" },
    { phase: "Sep–Oct 2027", title: "Construction & Staffing", desc: "Lease execution, store build-out, hiring and training programs", color: "#10B981" },
    { phase: "Nov 2027", title: "Advertising Launch", desc: "Influencer campaigns, PR blitz, social media pre-launch content", color: "#EF4444" },
    { phase: "Holiday 2027", title: "Grand Opening", desc: "All three Beacon Stores open for the peak holiday season", color: C.gold },
  ];

  return (
    <div style={{ background: C.navy, minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: C.white }}>
      <Modal loc={modalLoc} onClose={() => setModalLoc(null)} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)`,
        borderBottom: `1px solid ${C.navyLight}`,
        padding: "64px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 24,
          }}>
            <Zap size={14} color={C.gold} />
            <span style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>CONSUMER INTELLIGENCE PLATFORM</span>
          </div>
          <h1 style={{
            fontSize: 72, fontWeight: 900, margin: "0 0 16px 0",
            background: `linear-gradient(135deg, #FFFFFF, ${C.gold})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-2px", lineHeight: 1,
          }}>BeaconIQ</h1>
          <p style={{ fontSize: 20, color: C.gray, maxWidth: 640, margin: "0 auto 12px auto", lineHeight: 1.6 }}>
            Consumer Intelligence & Retail Optimization Platform
          </p>
          <p style={{ fontSize: 14, color: C.navyLight === C.gray ? C.gray : "#64748B", maxWidth: 560, margin: "0 auto 32px auto", lineHeight: 1.7 }}>
            BeaconIQ reduces expansion risk by converting consumer behavior signals into strategic retail decisions. The platform allows leadership to compare markets before committing capital to a physical store launch.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <GoldBtn onClick={handleAnalyze} loading={analyzeState === "loading"}>
              <BarChart2 size={16} /> Analyze Market
            </GoldBtn>
            <button onClick={handleReco} style={{
              background: "transparent", color: C.white, border: `1px solid ${C.navyLight}`,
              borderRadius: 8, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Star size={16} /> Generate Recommendation
            </button>
            <button onClick={() => setShowExec(v => !v)} style={{
              background: "transparent", color: C.white, border: `1px solid ${C.navyLight}`,
              borderRadius: 8, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Download size={16} /> Export Executive Summary
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── ANALYZE RESULT ────────────────────────────────────────────────── */}
        {analyzeState === "loading" && (
          <Card style={{ marginBottom: 32, borderColor: C.gold, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `3px solid ${C.gold}`, borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ color: C.gold, fontWeight: 600 }}>BeaconIQ is analyzing consumer demand, tourism traffic, family spending, and operational risk…</span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </Card>
        )}
        {analyzeState === "done" && analyzeResult && (
          <Card style={{ marginBottom: 32, borderColor: "#10B981" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <CheckCircle size={18} color="#10B981" />
              <span style={{ color: "#10B981", fontWeight: 700 }}>Analysis Complete — {analyzeResult.name}, {analyzeResult.state}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              {[
                { label: "Market Score", value: analyzeResult.overallScore },
                { label: "Consumer Demand", value: analyzeResult.scores.consumerDemand },
                { label: "Tourism Traffic", value: analyzeResult.scores.tourismTraffic },
                { label: "Family Spending", value: analyzeResult.scores.familySpending },
              ].map(item => (
                <div key={item.label} style={{ background: C.navy, borderRadius: 8, padding: 16, textAlign: "center" }}>
                  <div style={{ color: C.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{item.label}</div>
                  <ScoreBadge score={item.value} size="lg" />
                </div>
              ))}
            </div>
            <p style={{ color: C.gray, fontSize: 13, marginTop: 16, marginBottom: 0 }}>
              <strong style={{ color: C.white }}>Recommendation:</strong> {analyzeResult.recommendation}
            </p>
          </Card>
        )}

        {/* ── RECOMMENDATION PANEL ──────────────────────────────────────────── */}
        {recoState && (
          <Card style={{ marginBottom: 32, borderColor: C.gold }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Star size={18} color={C.gold} />
              <span style={{ color: C.gold, fontWeight: 700, fontSize: 16 }}>Final Ranked Recommendation</span>
            </div>
            <p style={{ color: C.gray, fontSize: 13, marginTop: 0, marginBottom: 20 }}>
              Our recommendation is based on predictive consumer behavior, tourism opportunity, and operational feasibility.
            </p>
            {recoState.map((l, i) => (
              <div key={l.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
                background: C.navy, borderRadius: 10, marginBottom: 10,
                border: i === 0 ? `1px solid ${C.gold}` : `1px solid ${C.navyLight}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: i === 0 ? C.gold : i === 1 ? "#94A3B8" : "#B45309",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, color: C.navy, fontSize: 16, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.white }}>{l.name}, {l.state}</div>
                  <div style={{ color: C.gray, fontSize: 12, marginTop: 2 }}>{l.recommendation}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 20 }}>{l.overallScore}</div>
                  <div style={{ color: C.gray, fontSize: 11 }}>/ 100</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* ── EXECUTIVE SUMMARY ─────────────────────────────────────────────── */}
        {showExec && <ExecSummary onClose={() => setShowExec(false)} />}

        {/* ── DASHBOARD KPI CARDS ───────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 40, marginBottom: 32 }}>
          {[
            { icon: <Target size={20} color={C.gold} />, label: "Top Recommended Market", value: "Anaheim, CA", sub: "Score 86/100" },
            { icon: <Users size={20} color="#6366F1" />, label: "Avg Consumer Demand", value: "83.3", sub: "Across 3 markets" },
            { icon: <Globe size={20} color="#10B981" />, label: "Highest Tourism", value: "Rockefeller Plaza", sub: "97 tourism score" },
            { icon: <ShieldAlert size={20} color="#EF4444" />, label: "Highest Op. Risk", value: "Rockefeller Plaza", sub: "78 risk score" },
            { icon: <Star size={20} color={C.gold} />, label: "Best Flagship Potential", value: "Rockefeller Plaza", sub: "Iconic visibility" },
          ].map(card => (
            <Card key={card.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                {card.icon}
                <span style={{ color: C.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</span>
              </div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{card.value}</div>
              <div style={{ color: C.gray, fontSize: 12 }}>{card.sub}</div>
            </Card>
          ))}
        </div>

        {/* ── LOCATION TABS ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          {allLocs.map(l => (
            <NavyBtn key={l.id} active={activeTab === l.id && !compareMode} onClick={() => { setActiveTab(l.id); setCompareMode(false); }}>
              <MapPin size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
              {l.name}
            </NavyBtn>
          ))}
          <NavyBtn active={compareMode} onClick={() => setCompareMode(v => !v)}>
            <BarChart2 size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Compare All
          </NavyBtn>
        </div>

        {compareMode ? (
          /* ── COMPARE VIEW ──────────────────────────────────────────────────*/
          <>
            <h2 style={{ color: C.white, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Location Comparison Dashboard</h2>

            {/* Ranking table */}
            <Card style={{ marginBottom: 24 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.navyLight}` }}>
                      {["Rank", "Market", "Overall", "Consumer Demand", "Tourism", "Family Spending", "Social Media", "Comp. Risk", "Op. Risk"].map(h => (
                        <th key={h} style={{ color: C.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allLocs.sort((a, b) => a.rank - b.rank).map((l, i) => (
                      <tr key={l.id} style={{ borderBottom: `1px solid ${C.navyLight}` }}>
                        <td style={{ padding: "14px 12px", color: C.gold, fontWeight: 700 }}>#{l.rank}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ color: C.white, fontWeight: 600 }}>{l.name}</span>
                          <span style={{ color: C.gray, fontSize: 11, display: "block" }}>{l.state}</span>
                        </td>
                        <td style={{ padding: "14px 12px" }}><ScoreBadge score={l.overallScore} /></td>
                        {[l.scores.consumerDemand, l.scores.tourismTraffic, l.scores.familySpending, l.scores.socialMediaTrend, l.scores.competitionRisk, l.scores.operationalRisk].map((v, vi) => (
                          <td key={vi} style={{ padding: "14px 12px", color: v >= 80 ? "#10B981" : v >= 65 ? "#F59E0B" : "#EF4444", fontWeight: 600 }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Bar chart */}
            <Card style={{ marginBottom: 24 }}>
              <h3 style={{ color: C.white, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Market Score Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight} />
                  <XAxis dataKey="name" stroke={C.gray} tick={{ fill: C.gray, fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke={C.gray} tick={{ fill: C.gray, fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.navyLight}`, borderRadius: 8, color: C.white }} />
                  <Legend wrapperStyle={{ color: C.gray, fontSize: 12 }} />
                  <Bar dataKey="Overall Score" fill={C.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consumer Demand" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tourism Traffic" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Grouped behavior chart */}
            <Card>
              <h3 style={{ color: C.white, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Consumer Behavior Metrics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight} />
                  <XAxis dataKey="name" stroke={C.gray} tick={{ fill: C.gray, fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke={C.gray} tick={{ fill: C.gray, fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.navyLight}`, borderRadius: 8, color: C.white }} />
                  <Legend wrapperStyle={{ color: C.gray, fontSize: 12 }} />
                  <Bar dataKey="Family Spending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Social Media Trend" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tourism Traffic" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consumer Demand" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : (
          /* ── SINGLE LOCATION VIEW ─────────────────────────────────────────*/
          <>
            {/* Location header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ color: C.white, fontSize: 28, fontWeight: 800, margin: 0 }}>{loc.name}</h2>
                  <span style={{
                    background: `${loc.tagColor}22`, border: `1px solid ${loc.tagColor}`,
                    color: loc.tagColor, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700
                  }}>{loc.tag}</span>
                  <span style={{
                    background: "rgba(245,158,11,0.1)", borderRadius: 999, padding: "4px 12px",
                    color: C.gold, fontSize: 12, fontWeight: 700, border: `1px solid ${C.gold}22`
                  }}>Rank #{loc.rank}</span>
                </div>
                <p style={{ color: C.gray, margin: "6px 0 0 0", fontSize: 14 }}>{loc.state} · Overall Market Score: <strong style={{ color: C.gold }}>{loc.overallScore}/100</strong></p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <GoldBtn small onClick={handleAnalyze} loading={analyzeState === "loading"}>
                  <Zap size={14} /> Analyze Market
                </GoldBtn>
                <button onClick={() => setModalLoc(loc)} style={{
                  background: "transparent", color: C.white, border: `1px solid ${C.navyLight}`,
                  borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <ShieldAlert size={14} /> View Risk Plan
                </button>
              </div>
            </div>

            {/* Score cards + radar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <Card>
                <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Performance Scores</h3>
                <ScoreBar label="Consumer Demand" value={loc.scores.consumerDemand} />
                <ScoreBar label="Tourism Traffic" value={loc.scores.tourismTraffic} />
                <ScoreBar label="Family Spending" value={loc.scores.familySpending} />
                <ScoreBar label="Social Media Trend" value={loc.scores.socialMediaTrend} />
                <ScoreBar label="Competition Risk" value={loc.scores.competitionRisk} invert />
                <ScoreBar label="Operational Risk" value={loc.scores.operationalRisk} invert />
                <div style={{ marginTop: 16, padding: 12, background: C.navy, borderRadius: 8, fontSize: 11, color: C.gray, lineHeight: 1.6 }}>
                  <Info size={12} style={{ verticalAlign: "middle", marginRight: 6 }} color={C.gold} />
                  <strong style={{ color: C.gold }}>Formula:</strong> Score = Demand×0.25 + Tourism×0.20 + Family×0.20 + Social×0.15 + (100−Comp)×0.10 + (100−Op)×0.10
                </div>
              </Card>
              <Card>
                <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 8 }}>Capability Radar</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={C.navyLight} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: C.gray, fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: C.gray, fontSize: 10 }} />
                    <Radar dataKey="value" stroke={C.gold} fill={C.gold} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Consumer Behavior Insights */}
            <Card style={{ marginBottom: 24 }}>
              <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Consumer Behavior Insights</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {loc.behaviorInsights.map((b, i) => (
                  <div key={i} style={{ background: C.navy, borderRadius: 8, padding: 16, borderLeft: `3px solid ${loc.tagColor}` }}>
                    <div style={{ color: loc.tagColor, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{b.label}</div>
                    <div style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.6 }}>{b.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Mitigation */}
            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, margin: 0 }}>Risk Mitigation Dashboard</h3>
                <button onClick={() => setModalLoc(loc)} style={{
                  background: "transparent", color: C.gold, border: `1px solid ${C.gold}44`,
                  borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <ChevronRight size={14} /> Full Risk Plan
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {loc.risks.map((r, i) => (
                  <div key={i} style={{ background: C.navy, borderRadius: 10, padding: 18 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 13 }}>{r.risk}</span>
                    </div>
                    <p style={{ color: C.gray, fontSize: 12, margin: "0 0 8px 0" }}><strong style={{ color: C.white }}>Concern:</strong> {r.concern}</p>
                    <p style={{ color: C.gray, fontSize: 12, margin: "0 0 10px 0" }}><strong style={{ color: C.gold }}>Strategy:</strong> {r.strategy}</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <CheckCircle size={13} color="#10B981" />
                      <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>{r.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ── SCORING METHODOLOGY ───────────────────────────────────────────── */}
        <Card style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 8 }}>Scoring Methodology</h3>
              <p style={{ color: C.gray, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                BeaconIQ weights each dimension by strategic importance. Consumer demand and family spending carry the highest weight, reflecting the brand's core demographic. Risk dimensions are inverted so lower risk = higher contribution.
              </p>
            </div>
            <div style={{ background: C.navy, borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12, color: C.gold, minWidth: 320 }}>
              <div style={{ color: C.gray, marginBottom: 8, fontFamily: "inherit" }}>// BeaconIQ Score Formula</div>
              <div>score = consumerDemand × <span style={{ color: "#10B981" }}>0.25</span></div>
              <div>      + tourismTraffic × <span style={{ color: "#10B981" }}>0.20</span></div>
              <div>      + familySpending × <span style={{ color: "#10B981" }}>0.20</span></div>
              <div>      + socialMediaTrend × <span style={{ color: "#10B981" }}>0.15</span></div>
              <div>      + (100 − compRisk) × <span style={{ color: "#10B981" }}>0.10</span></div>
              <div>      + (100 − opRisk) × <span style={{ color: "#10B981" }}>0.10</span></div>
            </div>
          </div>
        </Card>

        {/* ── 2027 TIMELINE ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: C.white, fontSize: 22, fontWeight: 700, marginBottom: 24 }}>2027 Launch Timeline</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{
                background: C.navyMid, border: `1px solid ${C.navyLight}`,
                borderTop: `3px solid ${t.color}`, borderRadius: 10, padding: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Clock size={14} color={t.color} />
                  <span style={{ color: t.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.phase}</span>
                </div>
                <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: "0 0 8px 0" }}>{t.title}</h4>
                <p style={{ color: C.gray, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STRATEGIC RECOMMENDATIONS ─────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: C.white, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Strategic Recommendation</h2>
          <p style={{ color: C.gray, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
            This prototype uses simulated market data, but the full version would integrate public data APIs and live consumer trend monitoring.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {allLocs.sort((a, b) => a.rank - b.rank).map((l, i) => (
              <Card key={l.id} style={{ borderTop: `3px solid ${l.tagColor}`, position: "relative" }}>
                <div style={{
                  position: "absolute", top: -14, left: 20,
                  width: 28, height: 28, borderRadius: "50%",
                  background: i === 0 ? C.gold : i === 1 ? "#94A3B8" : "#B45309",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, color: C.navy, fontSize: 14,
                }}>{i + 1}</div>
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" }}>{l.name}</h3>
                  <p style={{ color: C.gray, fontSize: 12, margin: "0 0 12px 0" }}>{l.state} · Score: <strong style={{ color: C.gold }}>{l.overallScore}</strong></p>
                  <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.7, margin: "0 0 16px 0" }}>{l.recommendation}</p>
                  <GoldBtn small onClick={() => { setActiveTab(l.id); setCompareMode(false); window.scrollTo({ top: 600, behavior: "smooth" }); }}>
                    View Full Analysis <ChevronRight size={14} />
                  </GoldBtn>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── PUBLIC DATA SOURCES ───────────────────────────────────────────── */}
        <Card style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Globe size={18} color={C.gold} />
            <h3 style={{ color: C.white, fontSize: 15, fontWeight: 700, margin: 0 }}>Public Data Sources — Full Version</h3>
          </div>
          <p style={{ color: C.gray, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
            A production deployment of BeaconIQ would integrate live signals from the following data streams:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {["US Census Bureau", "Google Trends API", "Tourism Board Reports", "Social Media Sentiment (Twitter/Instagram)", "Retail Foot Traffic Estimates", "Consumer Review Analysis", "Local Economic Reports", "Competitor Density Data"].map(src => (
              <div key={src} style={{
                background: C.navy, borderRadius: 8, padding: "10px 14px",
                fontSize: 12, color: C.grayLight, display: "flex", alignItems: "center", gap: 8
              }}>
                <CheckCircle size={12} color={C.gold} /> {src}
              </div>
            ))}
          </div>
        </Card>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${C.navyLight}`, paddingTop: 24, textAlign: "center" }}>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", marginBottom: 6 }}>BeaconIQ</div>
          <p style={{ color: C.gray, fontSize: 12, margin: 0 }}>Consumer Intelligence & Retail Optimization Platform · Simulated market data for presentation purposes · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
