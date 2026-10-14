import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, ZAxis, Cell,
} from "recharts";
import {
  ChevronDown, ChevronRight, ChevronLeft, Maximize2, Minimize2, Clock, MapPin, Search, Calendar as CalendarIcon, Loader2, HardHat, ExternalLink, X, Telescope, Plus, Minus, Gauge, Activity, User, Folder, ArrowUp, Crown,
} from "lucide-react";

/* ================= TASKTAG DESIGN TOKENS ================= */
/* Source: TaskTag Foundation -> Colors / Typography (Web) */

const C = {
  brand: "#00d9a5",
  brandDark: "#18a87d",
  greenSecondary: "#18a87d", // greenSecondary from design system (same as brandDark)
  brandDarker: "#035b60",
  textPrimary: "#0a1629",
  textSecondary: "#303742",
  white: "#ffffff",
  grey01: "#fafbfc",
  grey02: "#f7f8fa",
  grey03: "#e8e8e8",
  grey04: "#bdbdbd",
  grey05: "#828282",
  grey06: "#5c5c5c",
  overlay: "#00000080",
  blue: "#138eff",
  purple: "#7b61ff",
  lightMagenta: "#c072cd",
  darkMagenta: "#a620b2",
  orange: "#fc7f5b",
  vividYellow: "#fbbd42",
  vividYellowDark: "#dc9a12",
  alertRed: "#ff4444",
  pastelBlue: "#1572a1",
  pastelPurple: "#655d8a",
  pastelMagenta: "#a85796",
  pastelOrange: "#cc7351",
  pastelYellow: "#e6b566",
  lightPeach: "#ffece6",
  lightMint: "#dcf2ec",
  lightSky: "#dceeff",
  lightPink: "#ffdada",
  lightCream: "#fdf4e0",
  slate: "#64748b",
};

const T = {
  h1: { fontSize: 32, fontWeight: 600, lineHeight: "36px" },
  h2: { fontSize: 22, fontWeight: 600, lineHeight: "32px" },
  largeLabel: { fontSize: 18, fontWeight: 500, lineHeight: "24px" },
  emphasizedBody: { fontSize: 16, fontWeight: 600, lineHeight: "24px" },
  button: { fontSize: 16, fontWeight: 500, lineHeight: "24px" },
  body: { fontSize: 16, fontWeight: 400, lineHeight: "24px" },
  labelSmall: { fontSize: 14, fontWeight: 500, lineHeight: "16px" },
  secondaryBody: { fontSize: 14, fontWeight: 400, lineHeight: "16px" },
  metaPrimary: { fontSize: 12, fontWeight: 400, lineHeight: "16px" },
  metaSecondary: { fontSize: 10, fontWeight: 500, lineHeight: "12px" },
};

// Three button types per spec: filled, outlined, ghost — all black, 16px corner radius.
const BTN_RADIUS = "rounded-xl shadow-none"; // Tailwind rounded-xl = 12px, no shadow
const btnStyle = {
  filled: { background: C.textPrimary, color: C.white, border: "none" },
  outlined: { background: "transparent", color: C.textPrimary, border: `1.5px solid ${C.textPrimary}` },
  ghost: { background: "transparent", color: C.textPrimary, border: "none" },
};
function AppButton({ kind = "filled", className = "", style = {}, ...props }, ref) {
  const variantMap = { filled: "default", outlined: "outline", ghost: "ghost" };
  return (
    <Button
      ref={ref}
      variant={variantMap[kind]}
      className={`inline-flex items-center justify-center ${BTN_RADIUS} ${className}`}
      style={{ ...btnStyle[kind], ...style }}
      {...props}
    />
  );
}
AppButton = React.forwardRef(AppButton);

// Pastel avatar palette (from design system Pastel Colors), paired with a readable text color.
const PASTELS = [
  { bg: "#1572a1", fg: "#ffffff" }, // pastelBlue
  { bg: "#655d8a", fg: "#ffffff" }, // pastelPurple
  { bg: "#a85796", fg: "#ffffff" }, // pastelMagenta
  { bg: "#cc7351", fg: "#ffffff" }, // pastelOrange
  { bg: "#c9a227", fg: "#ffffff" }, // darkPastelGold
  { bg: "#2e8b6e", fg: "#ffffff" }, // darkPastelTeal
  { bg: "#b04a4a", fg: "#ffffff" }, // darkPastelRed
  { bg: "#4a7ab5", fg: "#ffffff" }, // darkPastelCornflower
  { bg: "#7a6e3d", fg: "#ffffff" }, // darkPastelOlive
  { bg: "#5c7a5c", fg: "#ffffff" }, // darkPastelSage
  { bg: "#3d6b8a", fg: "#ffffff" }, // darkPastelSlate
  { bg: "#8a5c3d", fg: "#ffffff" }, // darkPastelBrown
  { bg: "#6b3d8a", fg: "#ffffff" }, // darkPastelViolet
  { bg: "#3d8a6b", fg: "#ffffff" }, // darkPastelMint
  { bg: "#8a3d5c", fg: "#ffffff" }, // darkPastelRose
  { bg: "#5c6b3d", fg: "#ffffff" }, // darkPastelFern
  { bg: "#3d5c8a", fg: "#ffffff" }, // darkPastelIndigo
  { bg: "#8a6b3d", fg: "#ffffff" }, // darkPastelAmber
  { bg: "#3d8a8a", fg: "#ffffff" }, // darkPastelCyan
  { bg: "#8a3d3d", fg: "#ffffff" }, // darkPastelCrimson
  { bg: "#4a6b52", fg: "#ffffff" }, // darkPastelForest
  { bg: "#6b4a7a", fg: "#ffffff" }, // darkPastelPlum
  { bg: "#7a4a4a", fg: "#ffffff" }, // darkPastelChestnut
  { bg: "#4a5c7a", fg: "#ffffff" }, // darkPastelSteelBlue
  { bg: "#6b6b3d", fg: "#ffffff" }, // darkPastelMoss
  { bg: "#7a3d6b", fg: "#ffffff" }, // darkPastelMulberry
  { bg: "#3d7a5c", fg: "#ffffff" }, // darkPastelEmerald
  { bg: "#5c3d7a", fg: "#ffffff" }, // darkPastelGrape
  { bg: "#7a5c3d", fg: "#ffffff" }, // darkPastelSienna
  { bg: "#3d5c6b", fg: "#ffffff" }, // darkPastelDenim
  { bg: "#6b5c3d", fg: "#ffffff" }, // darkPastelKhaki
  { bg: "#3d6b6b", fg: "#ffffff" }, // darkPastelSpruce
  { bg: "#6b3d4a", fg: "#ffffff" }, // darkPastelWine
  { bg: "#4a6b6b", fg: "#ffffff" }, // darkPastelPine
  { bg: "#5c4a6b", fg: "#ffffff" }, // darkPastelLavender
];
function memberPastel(name) {
  return MEMBER_COLOR_MAP?.[twoWordName(name)] || PASTELS[0];
}
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}
// Names are limited to two words for both display and initials.
function twoWordName(name) { return (name || "").trim().split(/\s+/).slice(0, 2).join(" "); }
function initialsOf(name) {
  const words = twoWordName(name).split(/\s+/);
  return words.map((w) => w[0] || "").join("").toUpperCase().slice(0, 2);
}
function Avatar({ name, size = 24 }) {
  const displayName = twoWordName(name);
  const { bg, fg } = memberPastel(displayName);
  return (
    <span
      className="inline-flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.42), fontWeight: 600, lineHeight: 1 }}
    >
      {initialsOf(displayName)}
    </span>
  );
}

// Static - this always reflects the current week (these metrics are
// this-week-only) and intentionally does not follow the page's date
// filter, per design decision.
const CURRENT_WEEK_RANGE = "Jul 6 - Jul 12, 2026";

// Burn-rate thresholds: how much of a project's total budgeted hours has
// been used so far - near its limit (85%+), comfortably on track
// (40-84%), early in its budget (under 40%), or no budget set at all to
// compare against.
const NEAR_LIMIT_PCT = 85;
const EARLY_PCT = 40;
// Four burn-rate statuses, based on how much of a project's total budgeted
// hours have been used so far - near its limit, comfortably on track,
// early in its budget, or no budget set to compare against at all.
const burnRateStatusMeta = {
  overBudget: { label: "Over Budget", color: C.alertRed, bg: C.lightPink },
  nearLimit: { label: "Near Limit", color: C.vividYellowDark, bg: C.lightCream },
  onTrack: { label: "On Track", color: C.brandDark, bg: C.lightMint },
  early: { label: "Early", color: C.blue, bg: C.lightSky },
  noData: { label: "No Estimate", color: C.grey05, bg: C.grey02 },
};



// Kept short on purpose - these show inside the expanded panel, right next
// to the chart itself, so they only need to say what the chart doesn't
// already show visually.
const panelMeta = {
  hours: { title: "Hours Logged", subtitle: "Total hours logged by the whole team this week, compared to last week." },
  pace: { title: "Burn Rate", subtitle: "How much of each project's budgeted hours have been used so far." },
  projections: { title: "Labor Projections", subtitle: "Projected hours across total tasks needed next week." },
  activity: { title: "Activity Snapshot", subtitle: "Top 20 contributors by hours logged this week." },
};

function CountUp({ value, duration = 800 }) {
  const match = String(value).match(/^(\d+)(.*)$/);
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value);
  useEffect(() => {
    if (!match) { setDisplay(value); return; }
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    let rafId; let start = null;
    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(`${Math.round(progress * target)}${suffix}`);
      if (progress < 1) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}

// Icon + uppercase label row -> bold value -> muted subtitle. Most cards
// use plain subtitle text; a card can instead pass subtitleSegments (an
// array of {label, color}) to render colored-dot stats side by side, e.g.
// "* 1 over estimate * 1 on track".
function MetricTile({ label, value, valueSegments, valueSuffix, subtitle, subtitleSegments, subtitleBadge, icon: Icon, iconColor, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const showHover = hovered && !active;
  const bg = active ? C.lightMint : showHover ? C.lightMint : C.white;
  const borderColor = active ? C.brandDark : showHover ? C.brandDark : C.grey03;
  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${borderColor}`,
        background: bg,
        borderRadius: 8,
        transform: showHover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: "none",
        transition: "transform 0.2s ease, border-color 0.15s ease, background-color 0.15s ease",
      }}
      className="relative cursor-pointer h-full flex flex-col shadow-none"
    >
      <CardContent className="flex-1 flex flex-col" style={{ padding: 12 }}>
        {/* Row 1: label + icon */}
        <div className="flex items-center justify-between w-full">
          <span style={{ fontSize: 8, fontWeight: 500, lineHeight: "12px", letterSpacing: 0.5, color: C.grey05, textTransform: "uppercase" }}>{label}</span>
          {Icon && <Icon style={{ width: 16, height: 16, strokeWidth: 2, color: C.brandDark, flexShrink: 0 }} />}
        </div>
        {/* Row 2: value — T.h2 (22px/600) down from 28px */}
        {valueSegments ? (
          <span className="block" style={{ ...T.h2, fontWeight: 700, color: C.textPrimary, marginTop: 8, whiteSpace: "nowrap" }}>
            {valueSegments.map((seg, i) => (
              <span key={i} style={seg.style}>{seg.text}</span>
            ))}
          </span>
        ) : (
        <span className="block" style={{ ...T.h2, fontWeight: 700, color: C.textPrimary, marginTop: 8, whiteSpace: "nowrap" }}>
          <>
            <CountUp value={value} />
            {valueSuffix && <span style={{ ...T.largeLabel, color: C.grey05 }}> {valueSuffix}</span>}
          </>
        </span>
        )}
        {/* Row 3: subtitle */}
        {subtitleBadge ? (
          <div className="flex items-center gap-1" style={{ marginTop: 2, fontSize: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: C.brandDark }}>{subtitleBadge.label}</span>
            <ChevronRight style={{ width: 10, height: 10, color: C.brandDark, flexShrink: 0 }} />
          </div>
        ) : subtitleSegments ? (
          <div className="flex items-center gap-1" style={{ marginTop: 2, flexWrap: "wrap", fontSize: 10 }}>
            <p className="flex items-center flex-wrap" style={{ fontSize: 10, lineHeight: "12px", color: C.brandDark, margin: 0, gap: "3px 6px" }}>
              {subtitleSegments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span style={{ color: C.grey04 }}>&middot;</span>}
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                  {seg.label}
                </span>
              ))}
            </p>
            <ChevronRight style={{ width: 10, height: 10, color: C.brandDark, flexShrink: 0 }} />
          </div>
        ) : subtitle && (
          <div className="flex items-center gap-1" style={{ marginTop: 2, fontSize: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 500, lineHeight: "12px", color: C.brandDark }}>{subtitle}</span>
            <ChevronRight style={{ width: 10, height: 10, color: C.brandDark, flexShrink: 0 }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonBlock({ className = "", style = {} }) {
  return <div className={`animate-pulse rounded ${className}`} style={{ background: C.grey03, ...style }} />;
}

function SkeletonMetricsRow() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-full shadow-none" style={{ border: `1px solid ${C.grey03}`, borderRadius: 8 }}>
            <CardContent className="flex flex-col" style={{ padding: 12 }}>
              {/* Row 1: label skeleton — 10px tall */}
              <SkeletonBlock style={{ height: 10, width: "55%", borderRadius: 4 }} />
              {/* Row 2: value skeleton — 32px tall (T.h2 lineHeight), 16px below row 1 */}
              <SkeletonBlock style={{ height: 32, width: "70%", borderRadius: 4, marginTop: 16 }} />
              {/* Row 3: subtitle skeleton — 10px tall, 2px below row 2 */}
              <SkeletonBlock style={{ height: 10, width: "80%", borderRadius: 4, marginTop: 2 }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Custom Hours Logged tooltip: date (plain, not bold), total hours as the
// emphasized headline figure, then that day's project and task counts -
// all pulled from hoursData itself, so it can never disagree with the bar
// it's attached to.
function HoursLoggedTooltip({ active, payload, view }) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;

  // "Total" view: original simple tooltip - day, total hours, project/member counts.
  if (view === "total" || !view) {
    return (
      <div className="rounded-lg" style={{ background: C.white, border: `1px solid ${C.grey03}`, padding: "10px 12px", minWidth: 160 }}>
        <p style={{ ...T.metaPrimary, fontWeight: 400, color: C.textSecondary }}>{d.date}</p>
        <p style={{ ...T.emphasizedBody, color: C.textPrimary, marginTop: 8 }}>{d.hours}h total hours</p>
        <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
          <span style={{ ...T.metaPrimary, color: C.grey05 }}>{d.projects} project{d.projects === 1 ? "" : "s"}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey04, flexShrink: 0 }} />
          <span style={{ ...T.metaPrimary, color: C.grey05 }}>{d.members} member{d.members === 1 ? "" : "s"}</span>
        </div>
      </div>
    );
  }

  // "By project" / "By member" views: same bar, same day, but the
  // tooltip breaks that day's total down by project or by member -
  // looked up from the matching day row in hoursDataByProject /
  // hoursDataByMember so the breakdown can never disagree with the
  // single bar's own total.
  const breakdownRow = (view === "project" ? hoursDataByProject : hoursDataByMember).find((row) => row.day === d.day);
  const keys = view === "project" ? hoursProjectKeys : (hasOthersMembers ? [...hoursMemberKeys, "Others"] : hoursMemberKeys);
  const colorMap = view === "project" ? PROJECT_COLORS : HOURS_MEMBER_COLORS;
  const entries = breakdownRow
    ? keys.map((k) => ({ key: k, value: breakdownRow[k] || 0 })).filter((e) => e.value > 0).sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="rounded-lg" style={{ background: C.white, border: `1px solid ${C.grey03}`, padding: "10px 12px", minWidth: 180, maxWidth: 220 }}>
      <p style={{ ...T.metaPrimary, fontWeight: 400, color: C.textSecondary }}>{d.date}</p>
      <p style={{ ...T.emphasizedBody, color: C.textPrimary, marginTop: 8 }}>{d.hours}h total hours</p>
      {entries.length > 0 && (
        <div className="flex flex-col" style={{ marginTop: 8, gap: 4 }}>
          {entries.map((e) => (
            <div key={e.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5" style={{ minWidth: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: colorMap[e.key] || C.grey05, flexShrink: 0 }} />
                <span className="truncate" style={{ ...T.metaPrimary, color: C.grey05 }}>{e.key}</span>
              </span>
              <span style={{ ...T.metaPrimary, fontWeight: 600, color: C.textSecondary, flexShrink: 0 }}>{e.value}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shared row of filter/status chips, rendered beside a metric detail
// panel's headline/description instead of inside the panel body - so
// switching filters never shifts the list content underneath it.
function FilterChips({ chips, activeKey, onSelect }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5 flex-shrink-0">
      {chips.map((chip) => {
        const active = activeKey === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onSelect(chip.key)}
            className={`tt-chip inline-flex items-center justify-center cursor-pointer transition-colors duration-150 ${active ? "tt-chip-active" : ""}`}
            style={{
              fontSize: 12, fontWeight: active ? 600 : 400, textTransform: chip.capitalize ? "capitalize" : "none",
              padding: "4px 10px", minWidth: chip.minWidth || 56, textAlign: "center", borderRadius: 20, border: active ? `1px solid ${C.grey03}` : "1px solid transparent",
              background: active ? C.white : C.grey02, color: C.textSecondary,
            }}
          >{chip.label}{chip.count != null ? ` (${chip.count})` : ""}</button>
        );
      })}
    </div>
  );
}

// Shared tooltip shell style — all metric detail tooltips use this exact spec.
const TOOLTIP_STYLE = {
  background: C.white,
  border: `1px solid ${C.grey03}`,
  borderRadius: 8,
  padding: "10px 12px",
  minWidth: 160,
  maxWidth: 240,
  pointerEvents: "none",
  zIndex: 50,
  fontFamily: "Inter, sans-serif",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// Shared "no data yet" state for a metric detail panel - icon in a soft
// circle, bold title, muted subtitle - used whenever a panel's underlying
// dataset is genuinely empty (not just filtered down to nothing).
function EmptyPanelState({ icon: Icon, title, subtitle }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center" style={{ padding: "32px 16px" }}>
      <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: "50%", background: C.grey02, marginBottom: 16 }}>
        <Icon style={{ width: 24, height: 24, color: C.grey06, strokeWidth: 1.5 }} />
      </div>
      <p style={{ ...T.emphasizedBody, color: C.textPrimary, margin: 0 }}>{title}</p>
      <p style={{ ...T.secondaryBody, color: C.grey05, margin: 0, marginTop: 4, maxWidth: 280 }}>{subtitle}</p>
    </div>
  );
}

function HoursLoggedPanel() {
  const [tooltip, setTooltip] = useState(null); // { dayIdx, x, y }
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerW(containerRef.current.offsetWidth);
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const data = hoursDataCombined; // [{ day, thisWeek, lastWeek }]
  const hasAnyData = data.some((d) => d.thisWeek > 0 || d.lastWeek > 0);

  // rawMax covers only daily values (Mon–Sun) so the y-axis reflects the
  // highest single-day figure. The Weekly column may exceed this but its
  // exact value is readable in the tooltip.
  const roundedMax = useMemo(() => {
    const rawMax = Math.max(...data.map(d => Math.max(d.thisWeek, d.lastWeek)), 1);
    if (rawMax < 100)   return Math.ceil(rawMax / 10) * 10;
    if (rawMax < 1000)  return Math.ceil(rawMax / 50) * 50;
    return Math.ceil(rawMax / 500) * 500;
  }, [data]);

  const totalHoursWeek = hoursData.reduce((s, d) => s + d.hours, 0);
  const totalLastWeek = hoursDataLastWeek.reduce((s, d) => s + d.hours, 0);

  // Weekly column gets its own scale so it fills the chart height
  // independently of the daily bars.
  const roundedMaxWeekly = useMemo(() => {
    const rawMax = Math.max(totalHoursWeek, totalLastWeek, 1);
    if (rawMax < 100)   return Math.ceil(rawMax / 10) * 10;
    if (rawMax < 1000)  return Math.ceil(rawMax / 50) * 50;
    return Math.ceil(rawMax / 500) * 500;
  }, [totalHoursWeek, totalLastWeek]);

  if (!hasAnyData) {
    return <EmptyPanelState icon={Clock} title="No time logged yet" subtitle="Time entries for this week will appear here once tracked" />;
  }

  // Layout constants
  const YAXIS_W = 36;
  const LABEL_H = 20;    // day label area below baseline
  const PADDING_TOP = 8;
  const BAR_RADIUS = 4;
  const THIS_WEEK_COLOR = C.brandDark;

  // The chart area is split into two stacked zones:
  //   DAILY_ZONE_H  — where Mon–Sun bars live (0h → roundedMax)
  //   WEEKLY_ZONE_H — a smaller band above, where the weekly limit line sits
  // The daily gridline is the separator; the weekly gridline is at the top.
  const DAILY_ZONE_H = 130;
  const WEEKLY_ZONE_H = 56;
  const BAR_AREA_H = DAILY_ZONE_H;
  const TOTAL_H = DAILY_ZONE_H + WEEKLY_ZONE_H;
  const SVG_H = PADDING_TOP + TOTAL_H + LABEL_H; // 24+186+20 = 230px

  // Y positions (SVG top = 0):
  // weeklyLineY = top of chart area
  // dailyLineY  = separator between zones
  // baseY       = bottom baseline (0h)
  const weeklyLineY = PADDING_TOP;
  const dailyLineY  = PADDING_TOP + WEEKLY_ZONE_H;
  const baseY       = PADDING_TOP + WEEKLY_ZONE_H + DAILY_ZONE_H;

  function barH(val) {
    return (val / roundedMax) * DAILY_ZONE_H;
  }
  function barHWeekly(val) {
    return (val / roundedMaxWeekly) * TOTAL_H;
  }

  const lastWeekDeltaPct = (thisW, lastW) => {
    if (!lastW) return null;
    const pct = Math.round(((thisW - lastW) / lastW) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  if (!containerW) return <div ref={containerRef} className="h-full" />;

  const chartW = containerW - YAXIS_W - 8;
  const nDays = data.length;
  const CLUSTER_GAP = 28;
  const BAR_GAP = 3;

  const totalMembersWeek = new Set(hoursData.flatMap((_, i) => {
    const set = [];
    teams.forEach(t => t.members.forEach(m => m.projects.forEach(pr => {
      if (pr.days[i] && pr.days[i].s === "ok") set.push(m.name);
    })));
    return set;
  })).size;
  // 8 clusters: 7 days + 1 "Total" column separated by a wider gap
  const TOTAL_COL_GAP = 20; // extra gap before the Total column
  const nClusters = nDays + 1;
  const clusterWTotal = (chartW - CLUSTER_GAP * (nDays - 1) - TOTAL_COL_GAP - CLUSTER_GAP) / nClusters;
  const barWTotal = (clusterWTotal - BAR_GAP) / 2;

  return (
    <div ref={containerRef} className="flex flex-col w-full" style={{ position: "relative" }}>
      {/* Legend row */}
      <div className="flex items-center justify-end" style={{ marginBottom: 8, flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: C.grey05, fontFamily: "Inter, sans-serif" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: THIS_WEEK_COLOR, display: "inline-block" }} />
            This week
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: C.grey05, fontFamily: "Inter, sans-serif" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: THIS_WEEK_COLOR, opacity: 0.30, display: "inline-block" }} />
            Last week
          </span>
        </div>
      </div>

      {/* Chart SVG */}
      <div style={{ flex: 1, position: "relative", overflow: "visible" }}>
        <svg width={containerW} height={SVG_H} style={{ display: "block", overflow: "visible" }}>
          {/* Y-axis: 3 gridlines — 0h, daily upper limit, weekly upper limit */}
          {[
            { label: "0h",                                    y: baseY },
            { label: `${roundedMax}h`,                        y: dailyLineY },
            { label: `${formatWithComma(roundedMaxWeekly)}h`, y: weeklyLineY },
          ].map(({ label, y }) => (
            <g key={label}>
              <line x1={YAXIS_W} y1={y} x2={containerW} y2={y} stroke={C.grey03} strokeWidth={1} />
              <text x={YAXIS_W - 4} y={y + 4} textAnchor="end"
                style={{ fontSize: 11, fill: C.grey05, fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                {label}
              </text>
            </g>
          ))}

          {/* Daily bars (Mon–Sun) */}
          {data.map((d, i) => {
            const clusterX = YAXIS_W + i * (clusterWTotal + CLUSTER_GAP);
            const lastX = clusterX;
            const thisX = clusterX + barWTotal + BAR_GAP;
            const thisH = barH(d.thisWeek);
            const lastH = barH(d.lastWeek);
            const labelY = baseY + 14;
            const clusterCenterX = clusterX + clusterWTotal / 2;

            return (
              <g key={d.day}>
                {d.lastWeek > 0 && (
                  <rect x={lastX} y={baseY - lastH} width={barWTotal} height={lastH}
                    fill={C.lightMint} rx={BAR_RADIUS} ry={BAR_RADIUS}
                    style={{ transformOrigin: `${lastX + barWTotal / 2}px ${baseY}px`, animation: `tt-col-grow 200ms ease-out ${i * 35}ms both` }}
                  />
                )}
                {d.thisWeek > 0 && (
                  <rect x={thisX} y={baseY - thisH} width={barWTotal} height={thisH}
                    fill={THIS_WEEK_COLOR} rx={BAR_RADIUS} ry={BAR_RADIUS}
                    style={{ transformOrigin: `${thisX + barWTotal / 2}px ${baseY}px`, animation: `tt-col-grow 200ms ease-out ${i * 35}ms both` }}
                  />
                )}
                <text x={clusterCenterX} y={labelY} textAnchor="middle"
                  style={{ fontSize: 12, fontWeight: 500, fill: C.grey05, fontFamily: "Inter, sans-serif" }}>
                  {d.day}
                </text>
                <rect x={clusterX} y={weeklyLineY} width={clusterWTotal} height={TOTAL_H + LABEL_H}
                  fill="transparent" style={{ cursor: "default" }}
                  onMouseEnter={e => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const TOOLTIP_W = 180, TOOLTIP_H = 80, GAP = 12;
                    const cursorX = e.clientX - rect.left, cursorY = e.clientY - rect.top;
                    let x = cursorX + GAP; if (x + TOOLTIP_W > rect.width) x = cursorX - TOOLTIP_W - GAP;
                    let y = cursorY + GAP; if (y + TOOLTIP_H > rect.height) y = cursorY - TOOLTIP_H - GAP;
                    x = Math.max(0, Math.min(x, rect.width - TOOLTIP_W));
                    y = Math.max(0, Math.min(y, rect.height - TOOLTIP_H));
                    setTooltip({ i, x, y });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            );
          })}

          {/* Divider before Weekly column */}
          {(() => {
            const totalClusterX = YAXIS_W + nDays * (clusterWTotal + CLUSTER_GAP) + TOTAL_COL_GAP;
            const dividerX = totalClusterX - TOTAL_COL_GAP / 2 - 4;
            const totalThisH = barHWeekly(totalHoursWeek);
            const totalLastH = barHWeekly(totalLastWeek);
            const lastX = totalClusterX;
            const thisX = totalClusterX + barWTotal + BAR_GAP;
            const labelY = baseY + 14;
            const clusterCenterX = totalClusterX + clusterWTotal / 2;
            const delta = totalLastWeek > 0 ? Math.round(((totalHoursWeek - totalLastWeek) / totalLastWeek) * 100) : 0;
            const deltaLabel = delta >= 0 ? `+${delta}%` : `${delta}%`;
            const deltaColor = delta >= 0 ? C.brandDark : C.alertRed;
            return (
              <g>
                {/* Subtle vertical divider */}
                <line x1={dividerX} y1={weeklyLineY} x2={dividerX} y2={baseY + LABEL_H}
                  stroke={C.grey03} strokeWidth={2} strokeDasharray="3 3" />
                {/* Grey02 background tint behind the Weekly bars */}
                <rect x={totalClusterX - 6} y={weeklyLineY} width={clusterWTotal + 12} height={TOTAL_H + LABEL_H}
                  fill={C.grey02} rx={0} />
                {/* Last week total bar */}
                {totalLastWeek > 0 && (
                  <rect x={lastX} y={baseY - totalLastH} width={barWTotal} height={totalLastH}
                    fill={C.lightMint} rx={BAR_RADIUS} ry={BAR_RADIUS}
                    style={{ transformOrigin: `${lastX + barWTotal / 2}px ${baseY}px`, animation: `tt-col-grow 200ms ease-out ${nDays * 35}ms both` }}
                  />
                )}
                {/* This week total bar */}
                {totalHoursWeek > 0 && (
                  <rect x={thisX} y={baseY - totalThisH} width={barWTotal} height={totalThisH}
                    fill={THIS_WEEK_COLOR} rx={BAR_RADIUS} ry={BAR_RADIUS}
                    style={{ transformOrigin: `${thisX + barWTotal / 2}px ${baseY}px`, animation: `tt-col-grow 200ms ease-out ${nDays * 35}ms both` }}
                  />
                )}
                {/* "Weekly" label */}
                <text x={clusterCenterX} y={labelY} textAnchor="middle"
                  style={{ fontSize: 12, fontWeight: 700, fill: C.textSecondary, fontFamily: "Inter, sans-serif" }}>
                  Total
                </text>
                {/* Hover target */}
                <rect x={totalClusterX} y={weeklyLineY} width={clusterWTotal} height={TOTAL_H + LABEL_H}
                  fill="transparent" style={{ cursor: "default" }}
                  onMouseEnter={e => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const TOOLTIP_W = 180, TOOLTIP_H = 80, GAP = 12;
                    const cursorX = e.clientX - rect.left, cursorY = e.clientY - rect.top;
                    let x = cursorX + GAP; if (x + TOOLTIP_W > rect.width) x = cursorX - TOOLTIP_W - GAP;
                    let y = cursorY + GAP; if (y + TOOLTIP_H > rect.height) y = cursorY - TOOLTIP_H - GAP;
                    x = Math.max(0, Math.min(x, rect.width - TOOLTIP_W));
                    y = Math.max(0, Math.min(y, rect.height - TOOLTIP_H));
                    setTooltip({ i: -1, x, y, totalThisWeek: totalHoursWeek, totalLastWeek, delta: deltaLabel, deltaColor });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            );
          })()}
        </svg>

        {/* Tooltip */}
        {tooltip !== null && (() => {
          if (tooltip.i === -1) {
            return (
              <div style={{ ...TOOLTIP_STYLE, position: "absolute", left: tooltip.x, top: tooltip.y }}>
                <p style={{ ...T.metaPrimary, fontWeight: 400, color: C.textSecondary, marginBottom: 2 }}>Total</p>
                <p style={{ ...T.metaPrimary, color: C.grey05, marginBottom: 6 }}>{CURRENT_WEEK_RANGE}</p>
                <p style={{ ...T.emphasizedBody, color: C.textPrimary }}>{formatWithComma(tooltip.totalThisWeek)}h</p>
                <div className="flex items-center gap-1.5" style={{ marginTop: 4, fontSize: 12 }}>
                  <span style={{ color: C.grey05 }}>Last week: {formatWithComma(tooltip.totalLastWeek)}h</span>
                  <span style={{ fontWeight: 600, color: tooltip.deltaColor }}>{tooltip.delta}</span>
                </div>
              </div>
            );
          }
          const d = data[tooltip.i];
          const delta = lastWeekDeltaPct(d.thisWeek, d.lastWeek);
          const deltaColor = d.thisWeek >= d.lastWeek ? C.brandDark : C.alertRed;
          return (
            <div style={{ ...TOOLTIP_STYLE, position: "absolute", left: tooltip.x, top: tooltip.y }}>
              <p style={{ ...T.metaPrimary, fontWeight: 400, color: C.textSecondary, marginBottom: 2 }}>{d.day}</p>
              <p style={{ ...T.metaPrimary, color: C.grey05, marginBottom: 6 }}>{d.date}</p>
              <p style={{ ...T.emphasizedBody, color: C.textPrimary }}>{d.thisWeek}h</p>
              <div className="flex items-center gap-1.5" style={{ marginTop: 4, fontSize: 12 }}>
                <span style={{ color: C.grey05 }}>Last week: {d.lastWeek}h</span>
                {delta && <span style={{ fontWeight: 600, color: deltaColor }}>{delta}</span>}
              </div>
            </div>
          );
        })()}
      </div>

      <style>{`
        @keyframes tt-col-grow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// Labor Projections: next week's projected hours, grouped and totaled by
// project (from taskProjectionData below) - a project with no projected
// tasks yet shows "No estimates" instead of a silent 0h, same as Burn
// Rate's "No estimate" status for a project with no budget set.
function LaborProjectionsPanel({ filter }) {
  const filtered = laborProjectionGroups.filter((g) => {
    if (filter === "has") return g.hours > 0;
    if (filter === "none") return g.hours === 0;
    return true;
  });

  // "No Estimates" filter — plain list
  if (filter === "none") {
    if (filtered.length === 0) {
      return <EmptyPanelState icon={Telescope} title="No projects without estimates" subtitle="Projects without a projection will appear here" />;
    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {filtered.map((g, i) => (
            <React.Fragment key={g.project}>
              <div className="flex items-center tt-list-row" style={{ padding: "10px 12px", borderRadius: 6, gap: 8 }}>
                <span className="truncate tt-project-name" style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, cursor: "pointer", minWidth: 0 }}>{g.project}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey04, flexShrink: 0 }} />
                <span style={{ ...T.metaPrimary, color: C.grey04, fontStyle: "italic", flexShrink: 0 }}>No estimates</span>
              </div>
              {i < filtered.length - 1 && <div style={{ borderTop: `1px solid ${C.grey03}`, marginTop: 4, marginBottom: 4 }} />}
            </React.Fragment>
          ))}
          <EndOfList count={filtered.length} noun="project" />
        </div>
      </div>
    );
  }

  // Filter out projections under 4h — too small to be actionable on a
  // construction project, and they distort the chart scale. Minimum bar
  // width of 8px is then applied to whatever remains so even a 5h bar
  // next to an 80h one is always visually readable.
  const MIN_HOURS = 4;
  const chartData = filtered
    .filter(g => g.hours >= MIN_HOURS)
    .map(g => ({ name: g.project, hours: g.hours, taskCount: g.taskCount, memberCount: g.members.length }));

  if (chartData.length === 0) {
    return laborProjectionGroups.length === 0
      ? <EmptyPanelState icon={Telescope} title="No labor projections yet" subtitle="Projected hours for next week will appear here once tasks are estimated" />
      : <EmptyPanelState icon={Telescope} title="No projects in this filter" subtitle="Try a different filter above" />;
  }

  const maxHours = Math.max(...chartData.map(d => d.hours));
  const NUMBERS_W = 108;
  const TRACK_H = 14;
  const TRACK_R = 7;

  return (
    <div className="h-full flex flex-col">
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chartData.map((d, i) => {
          const barPct = (d.hours / maxHours) * 100;
          const hoursLabel = `${formatWithComma(d.hours)}h projected`;
          return (
            <React.Fragment key={d.name}>
              <div
                className="flex items-center tt-list-row"
                style={{ padding: "12px 4px", gap: 12, borderTop: i === 0 ? "none" : `1px solid ${C.grey03}` }}
              >
                {/* Left: project name — single line, semi-bold, truncated */}
                <div style={{ flex: "0 0 190px", minWidth: 0, maxWidth: 190 }}>
                  <div className="truncate tt-project-name" style={{
                    fontSize: 13, fontWeight: 600, color: C.textSecondary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    fontFamily: "Inter, sans-serif", cursor: "pointer",
                  }}>{d.name}</div>
                </div>

                {/* Center: pill track */}
                <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                  <div style={{
                    height: TRACK_H,
                    borderRadius: TRACK_R,
                    background: C.grey03,
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {barPct > 0 && (
                      <div style={{
                        position: "absolute", left: 0, top: 0,
                        width: `${barPct}%`, height: "100%",
                        background: C.brandDark,
                        transformOrigin: "left center",
                        animation: "tt-bar-grow 220ms ease-out both",
                      }} />
                    )}
                  </div>
                </div>

                {/* Right: hours projected + tasks/members */}
                <div style={{ flex: `0 0 ${NUMBERS_W}px`, textAlign: "right", fontFamily: "Inter, sans-serif" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: C.textSecondary,
                    fontVariantNumeric: "tabular-nums",
                  }}>{formatWithComma(d.hours)}h</div>
                  <div style={{
                    fontSize: 11, fontWeight: 400, color: C.grey05,
                    marginTop: 2, fontVariantNumeric: "tabular-nums",
                  }}>{d.taskCount} task{d.taskCount === 1 ? "" : "s"} · {d.memberCount} member{d.memberCount === 1 ? "" : "s"}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <EndOfList count={chartData.length} noun="project" />
      </div>
    </div>
  );
}

// End-of-list marker — a thin rule with a centred label, rendered at the
// bottom of any scrollable panel list once all items are visible. Only
// shown when there is at least one item (empty states handle the zero case
// themselves). The label reads "N projects · end of list" so the user
// knows both the total count and that nothing is hidden below.
function EndOfList({ count, noun = "item" }) {
  if (count === 0) return null;
  const label = `${count} ${noun}${count === 1 ? "" : "s"} · end of list`;
  return (
    <div className="flex items-center gap-2" style={{ margin: "12px 4px 4px", flexShrink: 0 }}>
      <div style={{ flex: 1, height: 1, background: C.grey03 }} />
      <span style={{ fontSize: 10, fontWeight: 500, color: C.grey04, whiteSpace: "nowrap", fontFamily: "Inter, sans-serif", letterSpacing: 0.2 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: C.grey03 }} />
    </div>
  );
}

// Burn Rate: each active project's share of its own budgeted hours used
// so far - a status badge (near limit / on track / early / no estimate),
// a progress bar (dashed when there's no budget to compare against), and
// the underlying numbers.
function BurnRatePanel({ filter }) {
  const filtered = (filter === "all" ? projectBurnRateRows : projectBurnRateRows.filter((p) => p.status === filter))
    .filter((p) => filter === "noData" ? p.status === "noData" : p.status !== "noData" && p.budget > 0)
    .sort((a, b) => b.pctUsed - a.pctUsed)
    .slice(0, 12);
  if (filter === "noData") {
    if (filtered.length === 0) {
      return <EmptyPanelState icon={Gauge} title="No projects without estimates" subtitle="Projects without a budget will appear here" />;
    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {filtered.map((p, i) => (
            <React.Fragment key={p.name}>
              <div className="flex items-center tt-list-row" style={{ padding: "10px 12px", borderRadius: 6, gap: 8 }}>
                <span className="truncate tt-project-name" style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, cursor: "pointer", minWidth: 0 }}>{p.name}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey04, flexShrink: 0 }} />
                <span style={{ ...T.labelSmall, flexShrink: 0, whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700, color: C.textPrimary }}>{formatWithComma(p.actual)}h</span>
                  <span style={{ fontWeight: 400, color: C.grey05 }}> actual logged</span>
                </span>
              </div>
              {i < filtered.length - 1 && <div style={{ borderTop: `1px solid ${C.grey03}`, marginTop: 4, marginBottom: 4 }} />}
            </React.Fragment>
          ))}
          <EndOfList count={filtered.length} noun="project" />
        </div>
      </div>
    );
  }

  const chartData = filtered.map((p) => ({
    name: p.name,
    logged: p.actual,
    budget: p.budget,
    pct: p.pctUsed,
    overBudget: p.actual > p.budget,
  }));

  if (chartData.length === 0) {
    return projectBurnRateRows.length === 0
      ? <EmptyPanelState icon={Gauge} title="No burn rate data yet" subtitle="Budget usage will appear here once projects have logged time" />
      : <EmptyPanelState icon={Gauge} title="No projects in this status" subtitle="Try a different filter above" />;
  }

  // Fixed 0–150% domain so severity is comparable across all rows.
  const DOMAIN_MAX_PCT = 150;
  const NUMBERS_W = 108; // fixed right column width for numeric alignment
  const TRACK_H = 14;
  const TRACK_R = 7;

  return (
    <div className="h-full flex flex-col">
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chartData.map((d, i) => {
          const usedPct = Math.min(d.pct ?? 0, DOMAIN_MAX_PCT);
          const overPct = d.overBudget ? Math.min((d.logged - d.budget) / d.budget * 100, DOMAIN_MAX_PCT - 100) : 0;
          const usedBarPct = Math.min(usedPct, 100) / DOMAIN_MAX_PCT * 100; // % of track width
          const overBarPct = overPct / DOMAIN_MAX_PCT * 100;
          const budgetMarkerPct = 100 / DOMAIN_MAX_PCT * 100; // where 100% falls on track
          const deltaLabel = d.overBudget
            ? `+${Math.round((d.logged / d.budget - 1) * 100)}% over`
            : `${Math.round(100 - (d.pct ?? 0))}% left`;
          const deltaColor = d.overBudget ? C.vividYellowDark : C.grey05;

          return (
            <React.Fragment key={d.name}>
              <div
                className="flex items-center tt-list-row"
                style={{ padding: "12px 4px", gap: 12, borderTop: i === 0 ? "none" : `1px solid ${C.grey03}` }}
              >
                {/* Left: project name — single line, semi-bold, truncated */}
                <div style={{ flex: "0 0 190px", minWidth: 0, maxWidth: 190 }}>
                  <div className="truncate tt-project-name" style={{
                    fontSize: 13, fontWeight: 600, color: C.textSecondary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    fontFamily: "Inter, sans-serif", cursor: "pointer",
                  }}>{d.name}</div>
                </div>

                {/* Center: pill track with teal fill + amber overflow + 100% marker */}
                <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                  {/* 100% budget tick mark — sits above the track */}
                  <div style={{
                    position: "absolute",
                    left: `${budgetMarkerPct}%`,
                    top: -5,
                    width: 2,
                    height: 6,
                    background: C.grey04,
                    transform: "translateX(-50%)",
                    borderRadius: 1,
                  }} />
                  {/* Track — pill shape, clips fills */}
                  <div style={{
                    height: TRACK_H,
                    borderRadius: TRACK_R,
                    background: C.grey03,
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {/* Teal used segment (0–100%) */}
                    {usedBarPct > 0 && (
                      <div style={{
                        position: "absolute", left: 0, top: 0,
                        width: `${usedBarPct}%`, height: "100%",
                        background: C.brandDark,
                        transformOrigin: "left center",
                        animation: "tt-bar-grow 220ms ease-out both",
                      }} />
                    )}
                    {/* Amber over-budget segment (100%+) */}
                    {overBarPct > 0 && (
                      <div style={{
                        position: "absolute",
                        left: `${budgetMarkerPct}%`,
                        top: 0,
                        width: `${overBarPct}%`,
                        height: "100%",
                        background: C.vividYellowDark,
                        transformOrigin: "left center",
                        animation: "tt-bar-grow 220ms ease-out 150ms both",
                      }} />
                    )}
                  </div>
                </div>

                {/* Right: delta + raw hours */}
                <div style={{ flex: `0 0 ${NUMBERS_W}px`, textAlign: "right", fontFamily: "Inter, sans-serif" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: d.overBudget ? C.alertRed : C.textSecondary,
                    fontVariantNumeric: "tabular-nums",
                  }}>{deltaLabel}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 400, color: C.grey05,
                    marginTop: 2, fontVariantNumeric: "tabular-nums",
                  }}>{formatWithComma(d.logged)}h / {formatWithComma(d.budget)}h</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <EndOfList count={chartData.length} noun="project" />
      </div>
    </div>
  );
}


// Dot graph for Task Activity - one dot per task, colored by project.
// "All Days" plots hours by day of week; a single day plots hours across
// ================================================================
// TASK ACTIVITY BUBBLE CHART
// ================================================================

// Greedy spiral circle-packing algorithm with column boundary constraint.
// Bubbles are placed in local coords (0,0 = cluster center), then
// constrained so no bubble exceeds ±halfColW from center horizontally.
// This prevents encroachment into neighboring day columns.
function spiralPackLayout(circles, halfColW) {
  if (circles.length === 0) return { placed: [], totalH: 0 };

  const sorted = [...circles].sort((a, b) => b.r - a.r);
  // Negative PAD allows ~20% overlap of the smaller bubble's radius —
  // produces an organic pile rather than adjacent-but-touching circles.
  const minR = Math.min(...sorted.map(c => c.r));
  const PAD = -2; // slight overlap between bubble edges
  const positions = []; // local { x, y, r, ...rest }

  sorted.forEach((c, i) => {
    if (i === 0) {
      // First (largest) bubble: clamp x to column bounds
      const x = Math.max(-halfColW + c.r, Math.min(halfColW - c.r, 0));
      positions.push({ ...c, x, y: 0 });
      return;
    }
    let angle = 0;
    let spiralR = 0;
    const ANGLE_STEP = 0.45;
    const R_STEP = 0.55;
    let bestFit = null;

    for (let step = 0; step < 12000; step++) {
      const cx = spiralR * Math.cos(angle);
      const cy = spiralR * Math.sin(angle);
      // Hard boundary: bubble must stay inside column width
      const inBounds = Math.abs(cx) + c.r <= halfColW;
      if (inBounds) {
        const noOverlap = positions.every(p => {
          const dx = cx - p.x, dy = cy - p.y;
          return Math.sqrt(dx * dx + dy * dy) >= p.r + c.r + PAD;
        });
        if (noOverlap) {
          bestFit = { ...c, x: cx, y: cy };
          break;
        }
      }
      angle += ANGLE_STEP;
      spiralR += R_STEP;
    }
    // Fallback: stack below last placed bubble
    if (!bestFit) {
      const last = positions[positions.length - 1];
      bestFit = { ...c, x: 0, y: last.y + last.r + c.r + PAD };
    }
    positions.push(bestFit);
  });

  // Shift so cluster top is at y=0
  const minY = Math.min(...positions.map(p => p.y - p.r));
  const maxY = Math.max(...positions.map(p => p.y + p.r));
  const shifted = positions.map(p => ({ ...p, y: p.y - minY }));
  return { placed: shifted, totalH: maxY - minY };
}

// Use the same PASTELS palette as the table avatars for consistent identity
function memberBubbleColor(name) {
  return memberPastel(twoWordName(name)).bg;
}
function memberInitials(name) {
  return initialsOf(twoWordName(name));
}

const DAY_FULL_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const INTERNAL_DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
// The full-week demo scenario week ends on Sunday, so Sunday is always
// highlighted as "today" in the Activity Snapshot chart.
const TODAY_KEY = "sun";

function TaskActivityBubbleChart({ tasks }) {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(700);
  const [tooltip, setTooltip] = useState(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerW(containerRef.current.offsetWidth);
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const colW = Math.floor(containerW / 8);
  const halfColW = colW / 2 - 1;

  // 20 tiers stored as diameters — tiers 1-19: 18,19,20,...,36 (increments of 1)
  // tier 20 specifically: 44px. Radii are derived as diameter/2 below.
  const TIER_DIAMETERS = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 44];
  const TIER_RADII = TIER_DIAMETERS.map(d => d / 2);

  const memberDayData = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      const mc = task.members.length || 1;
      task.members.forEach(member => {
        if (!map[member]) map[member] = {};
        INTERNAL_DAY_KEYS.forEach(d => {
          if (!map[member][d]) map[member][d] = { mins: 0, taskCount: 0, topTasks: [] };
          if ((task[d] || 0) > 0) {
            map[member][d].mins += task[d] / mc;
            map[member][d].taskCount += 1;
            map[member][d].topTasks.push({ name: task.name, project: task.project, mins: task[d] / mc });
          }
        });
      });
    });
    const memberTotals = Object.entries(map)
      .map(([name, dayMap]) => ({ name, totalMins: INTERNAL_DAY_KEYS.reduce((s, d) => s + (dayMap[d]?.mins || 0), 0) }))
      .sort((a, b) => b.totalMins - a.totalMins).slice(0, 20).map(m => m.name);
    const filtered = {};
    memberTotals.forEach(name => { filtered[name] = map[name]; });
    Object.values(filtered).forEach(dayMap => {
      Object.values(dayMap).forEach(d => {
        d.topTasks.sort((a, b) => b.mins - a.mins);
        d.topTasks = d.topTasks.slice(0, 3);
      });
    });
    return filtered;
  }, [tasks]);

  const buildColumn = (dayKey) => {
    const members = Object.entries(memberDayData)
      .map(([name, dayMap]) => {
        const mins = dayMap[dayKey]?.mins || 0;
        const hours = mins / 60;
        return { name, hours, taskCount: dayMap[dayKey]?.taskCount || 0, topTasks: dayMap[dayKey]?.topTasks || [] };
      })
      .filter(m => m.hours > 0)
      .sort((a, b) => b.hours - a.hours);
    const totalHours = members.reduce((s, m) => s + m.hours, 0);
    const total = members.length;
    const circles = members.map((m, rank) => {
      const tierIdx = total === 1 ? 19 : Math.round((1 - rank / (total - 1)) * 19);
      const r = TIER_RADII[tierIdx];
      return { ...m, r, fontSize: Math.round(r * 0.65), color: memberBubbleColor(m.name), initials: memberInitials(m.name) };
    });
    const { placed, totalH } = spiralPackLayout(circles, halfColW);
    return { totalHours, placed, totalH };
  };

  const columns = useMemo(() => INTERNAL_DAY_KEYS.map((dayKey) => ({ dayKey, ...buildColumn(dayKey) })), [memberDayData, colW]);

  // Weekly column: members ranked by total hours Mon–Sun
  const weeklyColumn = useMemo(() => {
    const members = Object.entries(memberDayData)
      .map(([name, dayMap]) => {
        const totalMins = INTERNAL_DAY_KEYS.reduce((s, d) => s + (dayMap[d]?.mins || 0), 0);
        const hours = totalMins / 60;
        const taskCount = INTERNAL_DAY_KEYS.reduce((s, d) => s + (dayMap[d]?.taskCount || 0), 0);
        return { name, hours, taskCount, topTasks: [] };
      })
      .filter(m => m.hours > 0)
      .sort((a, b) => b.hours - a.hours);
    const totalHours = members.reduce((s, m) => s + m.hours, 0);
    const total = members.length;
    const circles = members.map((m, rank) => {
      const tierIdx = total === 1 ? 19 : Math.round((1 - rank / (total - 1)) * 19);
      const r = TIER_RADII[tierIdx];
      return { ...m, r, fontSize: Math.round(r * 0.65), color: memberBubbleColor(m.name), initials: memberInitials(m.name) };
    });
    const { placed } = spiralPackLayout(circles, halfColW);
    return { totalHours, placed };
  }, [memberDayData, colW]);

  const COL_PADDING = 16;
  const maxRenderedBottom = Math.max(0,
    ...columns.flatMap(c => c.placed.map(n => n.y + n.r)),
    ...weeklyColumn.placed.map(n => n.y + n.r)
  );
  const maxColH = maxRenderedBottom + COL_PADDING * 2;

  return (
    <div ref={containerRef} className="w-full" style={{ userSelect: "none" }}>
      {/* Column headers — Mon through Sun + Weekly */}
      <div className="flex w-full">
        {INTERNAL_DAY_KEYS.map((dayKey, di) => {
          const col = columns[di];
          const isSun = dayKey === "sun";
          return (
            <div key={dayKey} className="flex flex-col items-center flex-shrink-0"
              style={{ width: colW, padding: "4px 0 4px" }}>
              <span style={{ fontSize: 12, fontWeight: isSun ? 700 : 400, color: C.textPrimary, fontFamily: "Inter, sans-serif" }}>
                {DAY_FULL_LABELS[dayKey]}
              </span>
              {col.totalHours > 0 && (
                <span style={{ fontSize: 10, color: C.grey05, fontFamily: "Inter, sans-serif" }}>{col.totalHours.toFixed(1)}h</span>
              )}
            </div>
          );
        })}
        {/* Weekly total column header */}
        <div className="flex flex-col items-center flex-shrink-0"
          style={{ width: colW, padding: "4px 0 4px", background: C.grey02, borderLeft: `2px solid ${C.grey03}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, fontFamily: "Inter, sans-serif" }}>Total</span>
          {weeklyColumn.totalHours > 0 && (
            <span style={{ fontSize: 10, color: C.grey05, fontFamily: "Inter, sans-serif" }}>{weeklyColumn.totalHours.toFixed(1)}h</span>
          )}
        </div>
      </div>

      {/* Per-column bubble areas — all same height, no clipping */}
      <div className="flex w-full">
        {columns.map((col, di) => {
          const isToday = col.dayKey === TODAY_KEY;
          return (
            <div key={col.dayKey} style={{
              width: colW, flexShrink: 0,
              borderLeft: di > 0 ? `1px solid ${C.grey03}` : "none",
            }}>
              <svg width={colW} height={maxColH} style={{ display: "block" }}>
                {col.placed.map((node, ni) => {
                  const cx = node.x + colW / 2;
                  const cy = node.y + COL_PADDING;
                  return (
                    <g key={node.name}
                      className="tt-bubble"
                      style={{ animationDelay: `${ni * 40}ms`, cursor: "pointer" }}
                      onMouseEnter={e => setTooltip({ ...node, dayKey: col.dayKey, clientX: e.clientX, clientY: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <circle cx={cx} cy={cy} r={node.r} fill={node.color} />
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                        style={{ fontSize: node.fontSize, fontWeight: 500, fill: C.white, fontFamily: "Inter, sans-serif", pointerEvents: "none" }}>
                        {node.initials}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
        {/* Weekly total bubble column */}
        <div style={{ width: colW, flexShrink: 0, background: C.grey02, borderLeft: `2px solid ${C.grey03}` }}>
          <svg width={colW} height={maxColH} style={{ display: "block" }}>
            {weeklyColumn.placed.map((node, ni) => {
              const cx = node.x + colW / 2;
              const cy = node.y + COL_PADDING;
              return (
                <g key={node.name}
                  className="tt-bubble"
                  style={{ animationDelay: `${ni * 40}ms`, cursor: "pointer" }}
                  onMouseEnter={e => setTooltip({ ...node, dayKey: "weekly", clientX: e.clientX, clientY: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle cx={cx} cy={cy} r={node.r} fill={node.color} />
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: node.fontSize, fontWeight: 500, fill: C.white, fontFamily: "Inter, sans-serif", pointerEvents: "none" }}>
                    {node.initials}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          ...TOOLTIP_STYLE,
          position: "fixed",
          left: tooltip.clientX + 14,
          top: tooltip.clientY - 10,
        }}>
          {tooltip.dayKey === "weekly" ? (
            <>
              <p style={{ ...T.metaPrimary, color: C.textSecondary, marginBottom: 2 }}>Total</p>
              <p style={{ ...T.metaPrimary, color: C.grey05, marginBottom: 6 }}>{CURRENT_WEEK_RANGE}</p>
            </>
          ) : (
            <>
              <p style={{ ...T.metaPrimary, color: C.textSecondary, marginBottom: 2 }}>{DAY_FULL_LABELS[tooltip.dayKey]}</p>
              <p style={{ ...T.metaPrimary, color: C.grey05, marginBottom: 6 }}>
                {["Jul 6","Jul 7","Jul 8","Jul 9","Jul 10","Jul 11","Jul 12"][INTERNAL_DAY_KEYS.indexOf(tooltip.dayKey)]}
              </p>
            </>
          )}
          <p style={{ ...T.emphasizedBody, color: C.textPrimary, marginBottom: 4 }}>{tooltip.name}</p>
          <p style={{ ...T.metaPrimary, color: C.grey05 }}>{tooltip.hours.toFixed(1)}h logged</p>
        </div>
      )}
    </div>
  );
}

function TaskActivityPanel() {
  if (taskActivityData.length === 0) {
    return <EmptyPanelState icon={Crown} title="No contributors yet" subtitle="Top contributors will appear here once time is tracked" />;
  }
  // Use the same hoursData source as the Hours Logged tile and panel
  // so all three always show the identical weekly total.
  const totalHours = hoursData.reduce((s, d) => s + d.hours, 0);
  const totalMembers = memberWeeklyTotals.length;
  return (
    <div className="h-full flex flex-col" style={{ marginTop: -4 }}>
      <TaskActivityBubbleChart tasks={taskActivityData} />
    </div>
  );
}



function InsightsMetricsRow({ forceOpen = null, forceBurnFilter = "overBudget", forceLaborFilter = "has" }) {
  const [active, setActive] = useState(forceOpen);
  // Increments every time any panel is opened - used as part of the
  // BurnRatePanel key so Recharts bar animation always re-triggers on open,
  // even when switching back to the same panel with the same filter.
  const [openCount, setOpenCount] = useState(0);

  const [laborFilter, setLaborFilter] = useState(forceLaborFilter);
  const [burnFilter, setBurnFilter] = useState(forceBurnFilter);

  // If the active filter chip refers to a category that has zero items in
  // the current scenario (e.g. "overBudget" selected, then switching to
  // the empty-state scenario), silently fall back to "all" so the panel
  // always shows something rather than an empty-state message.
  const safeBurnFilter = (() => {
    const chip = burnFilterChipsData.find((c) => c.key === burnFilter);
    if (!chip || chip.count === 0) return "all";
    return burnFilter;
  })();
  const safeLaborFilter = (() => {
    const chip = laborFilterChipsData.find((c) => c.key === laborFilter);
    if (!chip || chip.count === 0) return "all";
    return laborFilter;
  })();
  const totalHoursThisWeek = hoursData.reduce((sum, d) => sum + d.hours, 0);
  const totalHoursLastWeek = hoursDataLastWeek.reduce((sum, d) => sum + d.hours, 0);
  const hoursDeltaPct = totalHoursLastWeek > 0 ? Math.round(((totalHoursThisWeek - totalHoursLastWeek) / totalHoursLastWeek) * 100) : 0;
  const overBudgetCount = projectBurnRateRows.filter((p) => p.status === "overBudget").length;
  const nearLimitCount = projectBurnRateRows.filter((p) => p.status === "nearLimit").length;
  const urgentCount = overBudgetCount + nearLimitCount;
  const totalProjectedHours = laborProjectionGroups.reduce((sum, g) => sum + g.hours, 0);
  const projectionProjectCount = laborProjectionGroups.filter((g) => g.taskCount > 0).length;
  const projectionMemberCount = new Set(laborProjectionGroups.flatMap((g) => g.members)).size;
  const totalActivityHours = totalHoursThisWeek;
  const activityMemberCount = new Set(taskActivityData.flatMap((t) => t.members)).size;
  const activityTaskCount = taskActivityData.length;
  const hasHoursData = totalHoursThisWeek > 0;
  const hasBurnData = projectBurnRateRows.length > 0;
  const hasLaborData = laborProjectionGroups.length > 0;
  const hasActivityData = taskActivityData.length > 0;
  // Peak day = the day with the highest hours logged this week
  const peakDay = hasActivityData ? hoursData.reduce((best, d) => d.hours > best.hours ? d : best, hoursData[0]) : null;
  const peakDayLabel = peakDay ? `${peakDay.day} · ${formatWithComma(peakDay.hours)}h` : "—";
  const tabs = [
    { key: "hours", label: "Hours Logged", value: `${formatWithComma(totalHoursThisWeek)}h`, subtitle: hasHoursData ? `${Math.abs(hoursDeltaPct)}% ${hoursDeltaPct >= 0 ? "more" : "less"} than last week` : null, icon: Clock, iconColor: C.brandDark },
    {
      key: "pace", label: "Burn Rate",
      value: overBudgetCount > 0 ? `${overBudgetCount} over budget` : nearLimitCount > 0 ? `${nearLimitCount} near limit` : hasBurnData ? "All projects on track" : "No data yet",
      subtitleBadge: hasBurnData ? (overBudgetCount > 0 ? burnRateStatusMeta.overBudget : nearLimitCount > 0 ? burnRateStatusMeta.nearLimit : burnRateStatusMeta.onTrack) : null,
      icon: Gauge, iconColor: C.brandDark,
    },
    { key: "projections", label: "Labor Projections", value: `${formatWithComma(totalProjectedHours)}h`, valueSuffix: "next week", subtitle: hasLaborData ? `${projectionProjectCount} projects · ${projectionMemberCount} members` : null, icon: Telescope, iconColor: C.brandDark },
    { key: "activity", label: "Activity Snapshot",
      value: hasActivityData ? `${activityTaskCount} tasks · ${activityMemberCount} members` : "—",
      valueSegments: hasActivityData ? [
        { text: `${activityTaskCount}`, style: {} },
        { text: " tasks", style: { fontSize: 18, fontWeight: 500, lineHeight: "24px", color: C.grey05 } },
        { text: " · ", style: { fontSize: 18, fontWeight: 500, lineHeight: "24px", color: C.grey04 } },
        { text: ` ${activityMemberCount}`, style: {} },
        { text: " members", style: { fontSize: 18, fontWeight: 500, lineHeight: "24px", color: C.grey05 } },
      ] : null,
      subtitle: hasActivityData ? `Peaked ${peakDayLabel}` : null, icon: Crown, iconColor: C.brandDark },
  ];
  const meta = active ? panelMeta[active] : null;
  const handleClick = (key) => {
    setActive((cur) => {
      const next = cur === key ? null : key;
      if (next) setOpenCount((n) => n + 1);
      return next;
    });
  };
  const closePanel = () => { setActive(null); };

  const panelBody = (
    <>
      {active === "hours" && <HoursLoggedPanel />}
      {active === "pace" && <BurnRatePanel filter={safeBurnFilter} />}
      {active === "projections" && <LaborProjectionsPanel filter={safeLaborFilter} />}
      {active === "activity" && <TaskActivityPanel />}
    </>
  );

  // The filter/status/day chips for whichever panel is open - rendered
  // once here so they can sit beside the headline in both the docked
  // panel and the maximized modal, instead of live inside each panel's
  // own body.
  const activeChips = active === "pace" && hasBurnData
    ? <FilterChips chips={burnFilterChipsData} activeKey={safeBurnFilter} onSelect={setBurnFilter} />
    : active === "projections" && hasLaborData
      ? <FilterChips chips={laborFilterChipsData} activeKey={safeLaborFilter} onSelect={setLaborFilter} />
      : null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((t) => (
          <MetricTile key={t.key} label={t.label} value={t.value} valueSegments={t.valueSegments} valueSuffix={t.valueSuffix} subtitle={t.subtitle} subtitleSegments={t.subtitleSegments} subtitleBadge={t.subtitleBadge} icon={t.icon} iconColor={t.iconColor} active={active === t.key} onClick={() => handleClick(t.key)} />
        ))}
      </div>
      {active && (
        <div className="relative mt-4">
          <Card className="shadow-none" style={{ border: `1px solid ${C.brandDark}`, background: C.white, boxShadow: "0 4px 16px -4px rgba(3,91,96,0.15)", overflow: "visible" }}>
            <CardContent style={{ padding: 16 }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ ...T.largeLabel, color: C.textSecondary }}>{meta.title}</h3>
                  <p className="mt-1" style={{ ...T.metaPrimary, color: C.grey05 }}>{meta.subtitle}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {activeChips}
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closePanel}
                    className="tt-icon-btn cursor-pointer transition-colors duration-150"
                    style={{ background: "transparent", border: "none", padding: 4, borderRadius: 6, lineHeight: 0 }}
                  ><X className="w-4 h-4" style={{ color: C.grey05 }} /></button>
                </div>
              </div>
              <div style={{ height: active === "activity" ? "auto" : active === "hours" ? "auto" : 240, overflowY: active === "hours" ? "visible" : "hidden" }}>
                {panelBody}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// A clock event: a time, whether it was on-site or off-site (only
// meaningful for a real GPS-backed event), and whether it was typed in
// manually via the Missing Time modal (in which case there's no real
// location to show on a map).
function clockEvent(time, site, manual = false) { return { time, site, manual }; }

// ---- Data generation: 15 projects per team, each with several
// contributing members, standing in for ~20 tasks per project rolled up
// to project-level hours (the table only ever tracks by project - see
// resolvedProjectsFor below). Deterministically seeded (mulberry32) so
// the "random" data is stable across re-renders instead of reshuffling
// on every keystroke or state change. ----
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(rand, min, max) { return min + Math.floor(rand() * (max - min + 1)); }

// Task name pool, shared by the real per-day task generation below
// (generateTaskDay) and the separate next-week Task Projections sample
// data further down - declared up here (rather than down near
// taskProjectionData, where it's also used) since generateTaskDay runs
// during initial data generation, before that later section of the file
// has executed.
const TASK_NAME_TEMPLATES = [
  "Frame interior partition walls", "Rough-in electrical", "Drywall and taping", "Install cabinetry",
  "Plumbing rough-in", "Exterior trim and paint", "Final punch list walkthrough", "Site prep and layout",
  "Install flooring", "Paint interior walls", "Set fixtures and hardware", "Client walkthrough",
  "Insulation install", "Roofing repair", "Grading and drainage",
];

// The single source of truth for a day's total/status: always the
// aggregate of its own tasks, never a separately hand-set figure that
// could drift from what the tasks actually show. A task only contributes
// to the total when both its clock-in and clock-out are known - a task
// missing either side is excluded from the sum (its hours are unknown,
// not zero) rather than blanking out the rest of an otherwise-valid day.
// Only when literally every task that day is incomplete does the day
// fall back to the "Missing Time" ("bad") state, same as before.
function dayFromTasks(tasks) {
  // Project-level entries are display-only — exclude from hour totals
  const hourTasks = tasks.filter((t) => !t.isProjectLevel);
  const completeTasks = hourTasks.filter((t) => t.clockIn && t.clockOut);
  if (completeTasks.length === 0) {
    const anyClockIn = hourTasks.find((t) => t.clockIn);
    return { s: "bad", v: "-", clockIn: anyClockIn ? anyClockIn.clockIn : null, clockOut: null, tasks };
  }
  const totalMin = completeTasks.reduce(
    (sum, t) => sum + (parseTimeFull(t.clockOut.time) - parseTimeFull(t.clockIn.time)), 0
  );
  let envelopeIn = completeTasks[0].clockIn, envelopeOut = completeTasks[0].clockOut;
  completeTasks.forEach((t) => {
    if (parseTimeFull(t.clockIn.time) < parseTimeFull(envelopeIn.time)) envelopeIn = t.clockIn;
    if (parseTimeFull(t.clockOut.time) > parseTimeFull(envelopeOut.time)) envelopeOut = t.clockOut;
  });
  return {
    s: "ok",
    v: formatDuration(totalMin),
    clockIn: envelopeIn,
    clockOut: envelopeOut,
    tasks,
    hasIncompleteTask: hourTasks.length > completeTasks.length,
  };
}

// One day's worth of tasks for a member on a project - 1 to 4 tasks
// (scaled to the day's total span so a short day doesn't fragment into
// implausibly tiny pieces), each with its own clock-in/clock-out. A task
// occasionally (seeded, so it's stable) ends up missing one side of its
// punch, standing in for a crew member who forgot to clock in/out of a
// specific task even though they worked that day - dayFromTasks then
// aggregates whatever's left into the day's real total. Seeded by
// name+project+day-index so it's stable across re-renders.
// Project-level entries (no task name) are injected at display time in
// the day detail panel — they don't affect hour totals here.
function generateTaskDay(seedKey) {
  const rand = mulberry32(hashString(seedKey));
  const roll = rand();
  if (roll < 0.12) return null; // no work logged that day

  const site = rand() < 0.8 ? "on" : "off";
  const inMin = randInt(rand, 7, 9) * 60 + [0, 15, 30, 45][randInt(rand, 0, 3)];
  const durationMin = randInt(rand, 2, 8) * 60 + [0, 15, 30, 45][randInt(rand, 0, 3)];
  const outMin = Math.min(inMin + durationMin, 23 * 60 + 45);
  const span = outMin - inMin;

  const maxTasks = Math.max(1, Math.min(4, Math.floor(span / 60)));
  const taskCount = randInt(rand, 1, maxTasks);
  const boundaries = [inMin];
  for (let i = 1; i < taskCount; i++) boundaries.push(inMin + Math.round((span * i) / taskCount));
  boundaries.push(outMin);

  const usedNames = new Set();
  const tasks = Array.from({ length: taskCount }, (_, i) => {
    let name = TASK_NAME_TEMPLATES[Math.floor(rand() * TASK_NAME_TEMPLATES.length)];
    while (usedNames.has(name) && usedNames.size < TASK_NAME_TEMPLATES.length) {
      name = TASK_NAME_TEMPLATES[Math.floor(rand() * TASK_NAME_TEMPLATES.length)];
    }
    usedNames.add(name);
    let taskIn = clockEvent(minsTo12hLabel(boundaries[i]), site);
    let taskOut = clockEvent(minsTo12hLabel(boundaries[i + 1]), site);
    const missingRoll = rand();
    if (missingRoll < 0.1) taskOut = null;
    else if (missingRoll < 0.16) taskIn = null;
    return { id: `${seedKey}-t${i}`, name, clockIn: taskIn, clockOut: taskOut };
  });

  // Inject a project-level entry (no task name) ~20% of the time.
  // Uses a separate seed so it never shifts the task RNG sequence above.
  // The entry is carved out of the first task's time window so total
  // hours stay unchanged — it's a display-only split, not extra hours.
  return dayFromTasks(tasks);
}

// One week of task-based days for a member working on a project. Days
// from daysWithData onward simply haven't happened yet this week (used by
// the demo scenario switcher), so they're left as "no work logged" without
// even rolling the dice - keeping every earlier day's data identical to the
// full-week version instead of reshuffling it.
function generateWeekDays(seedKey, daysWithData = 7) {
  return Array.from({ length: 7 }, (_, i) => (i < daysWithData ? generateTaskDay(`${seedKey}|d${i}`) : null));
}

// True when a day is actually showing the "Missing Time" prompt - either
// every task that day is incomplete (the "bad" state), or the day has a
// real total but one or more of its underlying tasks still isn't fully
// punched (the "ok" + hasIncompleteTask case). A day with no work logged
// at all (null) is a different state ("-") and doesn't count.
function hasMissingTime(day) {
  if (!day) return false;
  if (day.s === "bad") return true;
  if (day.hasIncompleteTask) return true;
  // Also flag if any project-level entry is missing its clock-out
  return !!(day.tasks || []).some((t) => t.isProjectLevel && !t.clockOut);
}

// generateTaskDay's per-task 10-16% miss rate means a project entry can,
// by chance, come back with all 7 days fully punched - leaving that row
// with no "Missing Time" example to show at all when expanded. Every
// project entry (row) should have at least one, so this deterministically
// forces one in whenever the random data didn't already produce one -
// preferring to just blank out one existing task's clock-out (so it's
// still a plausible, mostly-normal week) over inventing hours from
// nothing.
function ensureMissingTimeExample(days, seedKey) {
  if (days.some(hasMissingTime)) return days;
  const rand = mulberry32(hashString(`${seedKey}|force-missing`));
  const workedIndexes = days.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
  const nextDays = [...days];
  if (workedIndexes.length) {
    const idx = workedIndexes[Math.floor(rand() * workedIndexes.length)];
    const day = days[idx];
    const taskIdx = Math.floor(rand() * day.tasks.length);
    const updatedTasks = day.tasks.map((t, i) => (i === taskIdx ? { ...t, clockOut: null } : t));
    nextDays[idx] = dayFromTasks(updatedTasks);
  } else {
    const task = {
      id: `${seedKey}-forced-t0`,
      name: TASK_NAME_TEMPLATES[Math.floor(rand() * TASK_NAME_TEMPLATES.length)],
      clockIn: clockEvent(minsTo12hLabel(9 * 60), "on"),
      clockOut: null,
    };
    nextDays[0] = dayFromTasks([task]);
  }
  return nextDays;
}

// For every day that has missing time AND more than one task item, ensure
// at least one project-level entry (isProjectLevel=true, clockOut=null)
// exists so the detail panel always demonstrates the project-level missing
// time flow alongside task-level missing time. Days with only a single
// task item are skipped — there's no room to split without losing the
// only task entry. Project-level entries are display-only and don't
// affect hour totals.
function ensureProjectLevelMissingExample(days, seedKey) {
  return days.map((day, di) => {
    if (!day) return day;
    if (!hasMissingTime(day)) return day;
    const nonProjTasks = (day.tasks || []).filter(t => !t.isProjectLevel);
    // Skip if only one task — no room to add a project-level entry
    if (nonProjTasks.length <= 1) return day;
    // Skip if already has a project-level entry with missing clock-out
    const alreadyHasProjMissing = (day.tasks || []).some(t => t.isProjectLevel && !t.clockOut);
    if (alreadyHasProjMissing) return day;
    // Carve a project-level entry from the first complete task
    const firstComplete = nonProjTasks.find(t => t.clockIn && t.clockOut);
    if (!firstComplete) return day;
    const rand = mulberry32(hashString(`${seedKey}|d${di}|proj-missing`));
    const firstInMin = parseTimeFull(firstComplete.clockIn.time);
    const projEntry = {
      id: `${seedKey}-d${di}-proj-missing`,
      name: null,
      clockIn: clockEvent(minsTo12hLabel(firstInMin), firstComplete.clockIn.site),
      clockOut: null, // always missing to demonstrate the flow
      isProjectLevel: true,
    };
    // Prepend project entry to tasks for display — do NOT shift the first
    // task's clock-in and do NOT recalculate totals, so hour figures stay
    // identical to the original generated values.
    const updatedTasks = [projEntry, ...day.tasks];
    return { ...day, tasks: updatedTasks };
  });
}

const EXTRA_STREET_NAMES = [
  "Maple Court", "Cedar Lane", "Birch Way", "Highland Drive", "Sunset Boulevard",
  "Willow Creek Road", "Magnolia Terrace", "Foxglove Lane", "Harbor View Drive",
  "Meadowbrook Lane", "Stonebridge Court", "Aspen Ridge Road", "Juniper Hill Road",
  "Clearwater Lane", "Pinecrest Avenue", "Brookfield Drive", "Hilltop Circle",
  "Lakeview Terrace", "Chestnut Grove", "Ironwood Court", "Sagebrush Trail",
  "Cobblestone Way", "Silverleaf Drive", "Windmill Road", "Autumn Ridge Lane",
];
const PROJECT_NAME_SUFFIXES = ["Renovation", "Remodel", "Restoration", "Makeover", "Refresh"];
function generateProjectNames(count, seed) {
  const rand = mulberry32(seed);
  const used = new Set();
  const names = [];
  while (names.length < count) {
    const street = EXTRA_STREET_NAMES[Math.floor(rand() * EXTRA_STREET_NAMES.length)];
    const number = 100 + Math.floor(rand() * 9800);
    const suffix = PROJECT_NAME_SUFFIXES[Math.floor(rand() * PROJECT_NAME_SUFFIXES.length)];
    const name = `${number} ${street} ${suffix}`;
    if (!used.has(name)) { used.add(name); names.push(name); }
  }
  return names;
}

// Assigns 1-3 members to each project (so every project has real
// contributors, and every member ends up on at least one project), then
// generates that member's week on that project.
function buildTeamData(teamName, memberNames, projectNames, seed, daysWithData = 7) {
  const rand = mulberry32(seed);
  const memberProjects = Object.fromEntries(memberNames.map((m) => [m, []]));
  // When the week hasn't started at all (daysWithData === 0), skip the
  // forced "missing time" example - it would otherwise inject a fake day 0
  // entry into what's supposed to be a genuinely empty week.
  const makeDays = (seedKey) => {
    const raw = generateWeekDays(seedKey, daysWithData);
    return daysWithData === 0 ? raw : ensureProjectLevelMissingExample(ensureMissingTimeExample(raw, seedKey), seedKey);
  };
  projectNames.forEach((proj) => {
    const count = randInt(rand, 1, 3);
    const shuffled = [...memberNames].sort(() => rand() - 0.5);
    shuffled.slice(0, count).forEach((m) => {
      const seedKey = `${m}|${proj}`;
      memberProjects[m].push({ p: proj, days: makeDays(seedKey) });
    });
  });
  // Guarantee every member has at least one project, so nobody shows an
  // all-empty row.
  memberNames.forEach((m) => {
    if (!memberProjects[m].length) {
      const seedKey = `${m}|${projectNames[0]}`;
      memberProjects[m].push({ p: projectNames[0], days: makeDays(seedKey) });
    }
  });
  return { name: teamName, members: memberNames.map((m) => ({ name: m, projects: memberProjects[m] })) };
}

// 15 projects per team - the first few keep their original names (still
// referenced by the Estimate Accuracy / Task Projections sample data), the rest
// are generated.
const TEAM_A_PROJECTS = ["1520 Oliver Street Renovation", "10 Oliver Street Remodel", "Riverside Apartments Restoration", ...generateProjectNames(30, 1001)];
const TEAM_B_PROJECTS = ["220 Elm Street Repaint", ...generateProjectNames(32, 2002)];

const TEAM_A_MEMBERS = [
  "Melissa Harper", "James Okafor", "Leo Nkosi",
  "Diego Fernandez", "Priya Patel", "Tyrone Williams", "Aiko Tanaka",
  "Samuel Osei", "Ingrid Larsen", "Marco Rossi", "Fatima Al-Sayed",
  "Hana Kimura", "Victor Alenko", "Grace Muthoni", "Daniel Cohen",
  "Isabella Conti", "Omar Farouk", "Nadia Petrova", "Liam O'Connor",
  "Zainab Bello", "Erik Johansson", "Mei Lin", "Rafael Souza",
  "Katarina Novak", "Ahmed Hassan", "Yuki Sato", "Lucas Fischer",
  "Adaora Chukwu", "Freya Larsson", "Miguel Santos", "Anjali Rao",
  "Kofi Asante", "Ines Moreau", "Dmitri Volkov", "Sana Sheikh",
];
const TEAM_B_MEMBERS = [
  "Carlos Reyes", "Chika Obi",
  "Noah Bennett", "Layla Haddad", "Kwame Mensah", "Sofia Ibarra",
  "Ravi Chandran", "Elena Popescu", "Oscar Lindqvist", "Amara Nwosu", "Ben Sutherland",
  "Camila Torres", "Hassan Ali", "Ingrid Nielsen", "Tomas Novotny",
  "Aaliyah Johnson", "Petros Dimitriou", "Yara Khalil", "Mateus Silva",
  "Bianca Rossi", "Emeka Obi", "Sakura Yamamoto", "Aleksander Kowalski",
  "Farida Rahman", "Connor Murphy", "Naledi Dlamini", "Ji-woo Kim",
  "Valentina Cruz", "Otto Bergman", "Priyanka Desai", "Mohammed Al-Farsi",
  "Camille Dubois", "Themba Zulu", "Alina Popescu", "Julian Reyes",
];

// Sequential color assignment — every unique member gets a distinct color,
// cycling through all 10 pastels. No hash collisions possible.
const MEMBER_COLOR_MAP = Object.fromEntries(
  [...new Set([...TEAM_A_MEMBERS, ...TEAM_B_MEMBERS])]
    .map((name, i) => [twoWordName(name), PASTELS[i % PASTELS.length]])
);

const PROJECT_COLOR_POOL = [C.pastelBlue, C.pastelPurple, C.pastelMagenta, C.pastelOrange, C.pastelYellow];
const PROJECT_COLORS = Object.fromEntries(
  [...TEAM_A_PROJECTS, ...TEAM_B_PROJECTS].map((name) => [name, PROJECT_COLOR_POOL[hashString(name) % PROJECT_COLOR_POOL.length]])
);

// projects/DAY_SHORT are static (they don't depend on the demo scenario),
// so they stay outside rebuildWorld and are computed once.
const projects = [
  ...TEAM_A_PROJECTS.map((name) => ({ name, team: "Team A - Field Crew" })),
  ...TEAM_B_PROJECTS.map((name) => ({ name, team: "Team B - Interiors" })),
];

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ================= DEMO SCENARIO WORLD BUILDER =================
// Everything below (teams' actual day-by-day hours, and every metric
// derived from them) is rebuilt from scratch whenever the scenario
// dropdown changes. daysWithData controls how many days of the week
// actually have logged hours (0/1/3/7) - which is what the Hours Logged
// and Top Contributors scenario options simulate, and which the main
// table reflects automatically since it reads the same per-day entries.
// burnMode/laborMode independently trim the Burn Rate and Labor
// Projections lists down to a smaller slice or to just their
// "no estimate" cases, for those scenario options.
// teamMode: "full" = both teams with full rosters; "small" = 1 team,
// 5 members, 5 projects — for previewing a compact crew setup.
function rebuildWorld(daysWithData, burnMode, laborMode, teamMode = "full") {
  const smallTeams = teamMode === "small"
    ? [buildTeamData("Team A - Field Crew", TEAM_A_MEMBERS.slice(0, 5), TEAM_A_PROJECTS.slice(0, 5), 11, daysWithData)]
    : [
        buildTeamData("Team A - Field Crew", TEAM_A_MEMBERS, TEAM_A_PROJECTS, 11, daysWithData),
        buildTeamData("Team B - Interiors", TEAM_B_MEMBERS, TEAM_B_PROJECTS, 22, daysWithData),
      ];
  const teams = smallTeams;

  // ---- Metric-card / metric-detail data, derived from the table data above
  // (teams/projects) rather than hand-set, so a project or crew member
  // referenced in a metric always actually exists in the roster, and the
  // numbers can never silently drift from what the table itself shows.

  // Total hours logged per weekday, summed across every team/member/project
  // entry for the (single, stable) generated week - the same data the table
  // renders, just totalled per day.
  const hoursData = DAY_SHORT.map((day, i) => {
    let mins = 0;
    const projectSet = new Set();
    const memberSet = new Set();
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      const dayEntry = pr.days[i];
      if (dayEntry && dayEntry.s === "ok") {
        mins += parseDur(dayEntry.v);
        projectSet.add(pr.p);
        memberSet.add(m.name);
      }
    })));
    return { day, date: `${day}, July ${6 + i}`, hours: Math.round(mins / 60), projects: projectSet.size, members: memberSet.size };
  });
  // No second week of generated data exists, so "last week" is a stable,
  // plausible fraction of this week's real total (seeded per day, so it
  // doesn't reshuffle on re-render) rather than a second hand-written
  // dataset that could disagree with the first.
  const hoursDataLastWeek = hoursData.map((d) => {
    const rand = mulberry32(hashString(`lastweek|${d.day}`));
    const factor = 0.75 + rand() * 0.2; // 75-95% of this week
    return { day: d.day, hours: Math.max(0, Math.round(d.hours * factor)) };
  });
  const hoursDataCombined = hoursData.map((d, i) => ({ day: d.day, thisWeek: d.hours, lastWeek: hoursDataLastWeek[i].hours }));

  // Per-project day-by-day hours for the Hours Logged panel's "By project"
  // view - same underlying entries as hoursData itself, just split by
  // project instead of summed across all of them, so the two views can
  // never disagree on the day totals.
  const hoursProjectKeys = [...new Set(teams.flatMap((team) => team.members.flatMap((m) => m.projects.map((pr) => pr.p))))]
    .filter((name) => totalHoursForProjectQuick(name) > 0)
    .sort((a, b) => totalHoursForProjectQuick(b) - totalHoursForProjectQuick(a));
  function totalHoursForProjectQuick(projectName) {
    let mins = 0;
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      if (pr.p !== projectName) return;
      pr.days.forEach((d) => { if (d && d.s === "ok") mins += parseDur(d.v); });
    })));
    return mins;
  }
  const hoursDataByProject = DAY_SHORT.map((day, i) => {
    const row = { day };
    hoursProjectKeys.forEach((name) => { row[name] = 0; });
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      const d = pr.days[i];
      if (d && d.s === "ok") row[pr.p] = (row[pr.p] || 0) + parseDur(d.v) / 60;
    })));
    hoursProjectKeys.forEach((name) => { row[name] = Math.round(row[name]); });
    return row;
  });

  // Per-member day-by-day hours for the "By member" view - capped to the
  // top 6 members by total weekly hours (matching the Task Activity
  // panel's "top 3" pattern of keeping a stacked view readable), with
  // everyone else folded into a single "Others" series so the bars don't
  // turn into an unreadable wall of thin slivers.
  const MEMBER_STACK_LIMIT = 6;
  const memberTotalsForStack = new Map();
  teams.forEach((team) => team.members.forEach((m) => {
    let mins = 0;
    m.projects.forEach((pr) => pr.days.forEach((d) => { if (d && d.s === "ok") mins += parseDur(d.v); }));
    if (mins > 0) memberTotalsForStack.set(m.name, mins);
  }));
  const hoursMemberKeys = [...memberTotalsForStack.entries()].sort((a, b) => b[1] - a[1]).slice(0, MEMBER_STACK_LIMIT).map(([name]) => name);
  const hasOthersMembers = memberTotalsForStack.size > MEMBER_STACK_LIMIT;
  const hoursDataByMember = DAY_SHORT.map((day, i) => {
    const row = { day };
    hoursMemberKeys.forEach((name) => { row[name] = 0; });
    if (hasOthersMembers) row.Others = 0;
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      const d = pr.days[i];
      if (!d || d.s !== "ok") return;
      const key = hoursMemberKeys.includes(m.name) ? m.name : (hasOthersMembers ? "Others" : null);
      if (key) row[key] = (row[key] || 0) + parseDur(d.v) / 60;
    })));
    Object.keys(row).forEach((k) => { if (k !== "day") row[k] = Math.round(row[k]); });
    return row;
  });
  const HOURS_MEMBER_COLORS = Object.fromEntries(
    hoursMemberKeys.map((name) => [name, memberPastel(twoWordName(name)).bg])
  );
  if (hasOthersMembers) HOURS_MEMBER_COLORS.Others = C.grey04;

  // Burn rate is tracked at the project level, against each project's total
  // budgeted hours (not just this week's pace) - actual hours are the real
  // sum of that project's logged time this week (from the table data
  // above); budget is a stable pseudo-random figure seeded off the project
  // name, sized well beyond a single week's hours (since it covers the
  // project's whole run, not just this week), so usage naturally spreads
  // across near-limit/on-track/early instead of clustering near 100%. A
  // slice of projects deliberately gets no budget at all, landing in the
  // "no estimate" status.
  function totalHoursForProject(projectName) {
    let mins = 0;
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      if (pr.p !== projectName) return;
      pr.days.forEach((dayEntry) => { if (dayEntry && dayEntry.s === "ok") mins += parseDur(dayEntry.v); });
    })));
    return Math.round(mins / 60);
  }
  // Every project the crew actually has real hours against this week, not
  // just a hand-picked few - so the metric reflects the whole active
  // portfolio the table shows, the same way the table does.
  const projectsWithActivity = projects.filter((p) => totalHoursForProject(p.name) > 0);
  const projectBurnRateRowsAll = projectsWithActivity.map((p) => {
    const actual = totalHoursForProject(p.name);
    const rand = mulberry32(hashString(`budget|${p.name}`));
    const roll = rand();
    let status, budget = null, pctUsed = null;
    if (roll < 0.10) {
      status = "noData";
    } else if (roll < 0.10 + 0.10) {
      // Over budget: actual exceeds budget by 5–30%
      status = "overBudget";
      const overPct = 1.05 + rand() * 0.25;
      budget = Math.round(actual / overPct);
      pctUsed = Math.round((actual / budget) * 100);
    } else if (roll < 0.10 + 0.10 + 0.18) {
      status = "nearLimit";
      pctUsed = NEAR_LIMIT_PCT + rand() * (98 - NEAR_LIMIT_PCT);
    } else if (roll < 0.10 + 0.10 + 0.18 + 0.22) {
      status = "early";
      pctUsed = 8 + rand() * (EARLY_PCT - 8);
    } else {
      status = "onTrack";
      pctUsed = EARLY_PCT + rand() * (NEAR_LIMIT_PCT - EARLY_PCT);
    }
    if (budget === null && status !== "noData") budget = Math.max(actual + 1, Math.round((actual / pctUsed) * 100));
    const crewSize = membersOfProject(p.name).length;
    return { name: p.name, actual, budget, pctUsed: budget ? Math.round((actual / budget) * 100) : null, crewSize, status };
  }).sort((a, b) => {
    const rank = { overBudget: 0, nearLimit: 1, onTrack: 2, early: 3, noData: 4 };
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return (b.pctUsed || 0) - (a.pctUsed || 0);
  });
  // Scenario switcher: trim the full, realistic burn-rate list down to a
  // smaller slice or to just the "no estimate" cases, so the demo dropdown
  // can preview those states without a second hand-written dataset.
  let projectBurnRateRows = projectBurnRateRowsAll;
  if (burnMode === "three") projectBurnRateRows = projectBurnRateRowsAll.slice(0, 3);
  else if (burnMode === "noEstimateOnly") projectBurnRateRows = projectBurnRateRowsAll.filter((p) => p.status === "noData");
  // Burn rate/labor projections aren't day-of-week data, so cutting the
  // week down to 1-2 days wouldn't otherwise shrink these lists much (most
  // projects still log *some* hours on day one) - scale them down to
  // roughly the same fraction of the portfolio as days elapsed, so a
  // "just started" scenario actually looks like one here too.
  if (daysWithData < 7) {
    const cap = Math.round(projectBurnRateRows.length * (daysWithData / 7));
    projectBurnRateRows = projectBurnRateRows.slice(0, cap);
  }
  const burnFilterChipsData = [
    { key: "all", label: "All", count: projectBurnRateRows.length, bg: C.grey02 },
    { key: "overBudget", label: burnRateStatusMeta.overBudget.label, count: projectBurnRateRows.filter((p) => p.status === "overBudget").length, bg: burnRateStatusMeta.overBudget.bg },
    { key: "nearLimit", label: burnRateStatusMeta.nearLimit.label, count: projectBurnRateRows.filter((p) => p.status === "nearLimit").length, bg: burnRateStatusMeta.nearLimit.bg },
    { key: "noData", label: burnRateStatusMeta.noData.label, count: projectBurnRateRows.filter((p) => p.status === "noData").length, bg: burnRateStatusMeta.noData.bg },
  ];

  // Who actually works on a given project, from the real per-member
  // assignments above (not a separate hand-maintained list).
  function membersOfProject(projectName) {
    const set = new Set();
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => { if (pr.p === projectName) set.add(m.name); })));
    return [...set];
  }
  // Every member of the same team as a given project - so a task needing
  // more hands than the project's core 1-3 assignees can pull in real
  // teammates instead of running out of real names to use.
  function teammatesFor(projectName) {
    const teamName = (projects.find((p) => p.name === projectName) || {}).team;
    const team = teams.find((t) => t.name === teamName);
    return team ? team.members.map((m) => m.name) : [];
  }

  // Labor Projections: every active project gets 1-2 plausible open/
  // projected tasks for next week (seeded per project, so it's stable
  // rather than reshuffling), covering the same active portfolio the burn
  // rate list uses. A slice of projects deliberately gets none yet, so the
  // list can show a real "no estimates" case. Members are drawn from the
  // project's actual assignees first, topped up from the rest of the team
  // when a task wants more hands than the project's core roster (usually
  // 1-3 people) - which also lets some tasks land at 4 members, to exercise
  // the tooltip's "+N" collapse beyond 3 names.
  const taskProjectionData = projectsWithActivity.flatMap((p) => {
    const rand = mulberry32(hashString(`projection|${p.name}`));
    const coreRoster = membersOfProject(p.name);
    const teammates = teammatesFor(p.name);
    const hasEstimates = rand() >= 0.12;
    const taskCount = hasEstimates ? randInt(rand, 1, 2) : 0;
    return Array.from({ length: taskCount }, (_, i) => {
      const name = TASK_NAME_TEMPLATES[Math.floor(rand() * TASK_NAME_TEMPLATES.length)];
      const hours = randInt(rand, 6, 40);
      const desiredCount = randInt(rand, 1, Math.min(teammates.length || 1, 4));
      const shuffledCore = [...coreRoster].sort(() => rand() - 0.5);
      const members = shuffledCore.slice(0, desiredCount);
      if (members.length < desiredCount) {
        const extras = teammates.filter((n) => !members.includes(n)).sort(() => rand() - 0.5);
        members.push(...extras.slice(0, desiredCount - members.length));
      }
      return { id: `${p.name}-t${i}`, name, project: p.name, members: members.length ? members : [p.team], status: "open", hours };
    });
  }).sort((a, b) => a.project.localeCompare(b.project) || a.name.localeCompare(b.name))
    .map((t) => ({ ...t, memberCount: t.members.length }));

  // Grouped/totaled once at module level (inputs are static) so both the
  // header's filter chips and the panel body's list can read the same
  // numbers without recomputing them separately.
  const laborProjectionGroupsAll = (() => {
    const map = new Map();
    projectsWithActivity.forEach((p) => map.set(p.name, { project: p.name, hours: 0, taskCount: 0, members: new Set() }));
    taskProjectionData.forEach((t) => {
      const g = map.get(t.project);
      if (!g) return;
      g.hours += t.hours;
      g.taskCount += 1;
      t.members.forEach((m) => g.members.add(m));
    });
    return [...map.values()].map((g) => ({ ...g, members: [...g.members] })).sort((a, b) => b.hours - a.hours);
  })();
  // Same idea as the burn-rate slice above, for the Labor Projections panel.
  let laborProjectionGroups = laborProjectionGroupsAll;
  if (laborMode === "three") laborProjectionGroups = laborProjectionGroupsAll.slice(0, 3);
  else if (laborMode === "noEstimateOnly") laborProjectionGroups = laborProjectionGroupsAll.filter((g) => g.hours === 0);
  if (daysWithData < 7) {
    const cap = Math.round(laborProjectionGroups.length * (daysWithData / 7));
    laborProjectionGroups = laborProjectionGroups.slice(0, cap);
  }
  const laborHasEstimateCount = laborProjectionGroups.filter((g) => g.hours > 0).length;
  const laborNoEstimateCount = laborProjectionGroups.length - laborHasEstimateCount;
  const laborFilterChipsData = [
    { key: "all", label: "All", count: laborProjectionGroups.length, bg: C.grey02 },
    { key: "has", label: "Has Estimates", count: laborHasEstimateCount, bg: C.lightMint },
    { key: "none", label: "No Estimates", count: laborNoEstimateCount, bg: C.grey02 },
  ];

  const DAY_ACTIVITY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_ACTIVITY_LABELS = { all: "this week", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  const DAY_ACTIVITY_CHIPS = ["all", ...DAY_ACTIVITY_KEYS];
  const DAY_ACTIVITY_CHIP_LABELS = { all: "All Days" };

  // Real per-project hours for each weekday this week (from the table data
  // above), the same source Hours Logged and Burn Rate use - so Task
  // Activity's day-by-day split can never silently drift from either.
  function dailyHoursForProject(projectName) {
    const perDay = [0, 0, 0, 0, 0, 0, 0];
    teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => {
      if (pr.p !== projectName) return;
      pr.days.forEach((dayEntry, i) => { if (dayEntry && dayEntry.s === "ok") perDay[i] += parseDur(dayEntry.v); });
    })));
    return perDay; // exact minutes - rounded only at final display, never mid-pipeline
  }

  // Task Activity: this week's real per-project minutes, split across 1-3
  // plausible tasks (seeded per project). Each task's day-by-day minutes are
  // a proportional slice of the project's own real per-day total, with the
  // last task absorbing any rounding remainder - so summing any single
  // day's tasks back up always matches that day's real total exactly.
  // Everything here stays in exact minutes; hours are only derived (and
  // rounded) at the point of display, so this can never drift from Hours
  // Logged's total the way summing independently-rounded per-project
  // figures would.
  const taskActivityData = projectsWithActivity.flatMap((p) => {
    const dailyTotals = dailyHoursForProject(p.name); // minutes per day
    if (dailyTotals.reduce((a, b) => a + b, 0) <= 0) return [];
    const rand = mulberry32(hashString(`activity|${p.name}`));
    const coreRoster = membersOfProject(p.name);
    const teammates = teammatesFor(p.name);
    const taskCount = randInt(rand, 1, 3);
    const weights = Array.from({ length: taskCount }, () => 0.5 + rand());
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const tasks = weights.map((w, i) => {
      const name = TASK_NAME_TEMPLATES[Math.floor(rand() * TASK_NAME_TEMPLATES.length)];
      const desiredCount = randInt(rand, 1, Math.min(teammates.length || 1, 4));
      const shuffledCore = [...coreRoster].sort(() => rand() - 0.5);
      const members = shuffledCore.slice(0, desiredCount);
      if (members.length < desiredCount) {
        const extras = teammates.filter((n) => !members.includes(n)).sort(() => rand() - 0.5);
        members.push(...extras.slice(0, desiredCount - members.length));
      }
      return { id: `${p.name}-a${i}`, name, project: p.name, members: members.length ? members : [p.team], weight: w };
    });
    DAY_ACTIVITY_KEYS.forEach((key, di) => {
      const dayTotal = dailyTotals[di];
      let allocated = 0;
      tasks.forEach((t, i) => {
        if (i === tasks.length - 1) { t[key] = Math.max(0, dayTotal - allocated); return; }
        const h = Math.round((t.weight / weightSum) * dayTotal);
        allocated += h;
        t[key] = h;
      });
    });
    return tasks.map((t) => {
      const week = DAY_ACTIVITY_KEYS.reduce((sum, k) => sum + t[k], 0);
      return { ...t, week, all: week, memberCount: t.members.length };
    });
  }).filter((t) => t.week > 0)
    .sort((a, b) => b.week - a.week);

  // Top contributor: member with highest total hours this week
  const memberWeeklyTotals = (() => {
    const map = {};
    taskActivityData.forEach(task => {
      const mc = task.members.length || 1;
      task.members.forEach(member => {
        if (!map[member]) map[member] = { mins: 0, taskCount: 0 };
        map[member].mins += task.week / mc;
        map[member].taskCount += 1;
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, hours: Math.round(d.mins / 60), taskCount: d.taskCount }))
      .sort((a, b) => b.hours - a.hours);
  })();
  const topContributor = memberWeeklyTotals[0] || { name: "—", hours: 0, taskCount: 0 };

  // When a Burn Rate or Labor Projections scenario is active, restrict
  // the main table to just the projects that scenario is demonstrating,
  // so the table visibly matches the amount of data shown in the panel.
  let visibleProjectNames = null;
  if (burnMode !== "full") visibleProjectNames = new Set(projectBurnRateRows.map((r) => r.name));
  else if (laborMode !== "full") visibleProjectNames = new Set(laborProjectionGroups.map((g) => g.project));

  return {
    teams, hoursData, hoursDataLastWeek, hoursDataCombined,
    hoursProjectKeys, hoursDataByProject,
    hoursMemberKeys, hasOthersMembers, hoursDataByMember, HOURS_MEMBER_COLORS,
    projectsWithActivity, projectBurnRateRows, burnFilterChipsData,
    taskProjectionData, laborProjectionGroups, laborHasEstimateCount, laborNoEstimateCount, laborFilterChipsData,
    taskActivityData, memberWeeklyTotals, topContributor,
    visibleProjectNames,
  };
}

// Module-level bindings that every downstream component reads as free
// variables - rebuildWorld() reassigns all of them together (via
// destructuring assignment) whenever the scenario changes, so a
// component simply sees fresh values on its next render without any
// prop-drilling or context needed.
let teams, hoursData, hoursDataLastWeek, hoursDataCombined,
  hoursProjectKeys, hoursDataByProject,
  hoursMemberKeys, hasOthersMembers, hoursDataByMember, HOURS_MEMBER_COLORS,
  projectsWithActivity, projectBurnRateRows, burnFilterChipsData,
  taskProjectionData, laborProjectionGroups, laborHasEstimateCount, laborNoEstimateCount, laborFilterChipsData,
  taskActivityData, memberWeeklyTotals, topContributor,
  visibleProjectNames;

let __lastWorldKey = null;
function applyWorldScenario(daysWithData, burnMode, laborMode, teamMode = "full") {
  const key = `${daysWithData}|${burnMode}|${laborMode}|${teamMode}`;
  if (key === __lastWorldKey) return;
  __lastWorldKey = key;
  const w = rebuildWorld(daysWithData, burnMode, laborMode, teamMode);
  ({
    teams, hoursData, hoursDataLastWeek, hoursDataCombined,
    hoursProjectKeys, hoursDataByProject,
    hoursMemberKeys, hasOthersMembers, hoursDataByMember, HOURS_MEMBER_COLORS,
    projectsWithActivity, projectBurnRateRows, burnFilterChipsData,
    taskProjectionData, laborProjectionGroups, laborHasEstimateCount, laborNoEstimateCount, laborFilterChipsData,
    taskActivityData, memberWeeklyTotals, topContributor,
    visibleProjectNames,
  } = w);
}
applyWorldScenario(7, "full", "full");

// ---- Demo scenario dropdown: 4 preset states for how much of the week
// has logged data, applied uniformly across all four metric tiles and the
// table.
const SCENARIOS = [
  { id: "full", label: "Full week's worth of data" },
  { id: "1day", label: "Just 1 day" },
  { id: "2day", label: "Just 2 days" },
  { id: "none", label: "Empty state / no data yet" },
  { id: "small", label: "Small team (1 team, 5 members, 5 projects)" },
];
const SCENARIO_CONFIG = {
  full:  { daysWithData: 7, burnMode: "full", laborMode: "full", teamMode: "full" },
  "1day": { daysWithData: 1, burnMode: "full", laborMode: "full", teamMode: "full" },
  "2day": { daysWithData: 2, burnMode: "full", laborMode: "full", teamMode: "full" },
  none:  { daysWithData: 0, burnMode: "full", laborMode: "full", teamMode: "full" },
  small: { daysWithData: 7, burnMode: "full", laborMode: "full", teamMode: "small" },
};

// Generates the 7 day-of-week dates/labels for whatever week is currently
// selected, instead of a fixed set of dates - so the table's headers (and
// the detail panels built from them) always match the active date filter
// rather than always showing the same hardcoded week.
function getDayDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return `${MONTHS[d.month].slice(0, 3)} ${d.day}`;
  });
}
function getDayLabels(weekStart) {
  const dates = getDayDates(weekStart);
  return DAY_SHORT.map((short, i) => `${short}, ${dates[i]}`);
}

// Shared column widths so the table header and the nested detail-row grids
// (which aren't real <td> cells) line up pixel-for-pixel instead of relying
// on two different auto-distribution algorithms (table "auto" vs grid "1fr").
const COL_NAME = "24%";
const COL_TOTAL = "10%";
const COL_DAY = `${(100 - 24 - 10) / 7}%`;
const DETAIL_GRID_COLUMNS = `${COL_NAME} ${COL_TOTAL} repeat(7, ${COL_DAY})`;

function parseDur(str) { const m = str.match(/(\d+)h\s*(\d+)m/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0; }
function formatDuration(mins) { const h = Math.floor(mins / 60), m = mins % 60; return `${h}h ${String(m).padStart(2, "0")}m`; }
function formatWithComma(n) { return n.toLocaleString("en-US"); }
function parseTimeFull(str) {
  const m = (str || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2]);
}
function minsTo12hLabel(mins) {
  const h24 = Math.floor(mins / 60), m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}
// Splits total minutes into a TimeField-ready digits string ("08:00") and
// period ("AM"/"PM"), for prefilling a default value.
function minutesToDigitsPeriod(mins) {
  const h24 = Math.floor(mins / 60), m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { digits: `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`, period: h24 >= 12 ? "PM" : "AM" };
}
function parseFlexibleTime(raw) {
  const s = (raw || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):?(\d{2})?(am|pm|a|p)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mins = m[2] !== undefined ? parseInt(m[2], 10) : 0;
  if (isNaN(h) || isNaN(mins) || mins > 59) return null;
  if (m[3]) {
    // explicit AM/PM suffix → always treat as 12-hour
    if (h < 1 || h > 12) return null;
    const isPM = m[3][0] === "p";
    h = h % 12;
    if (isPM) h += 12;
  } else {
    // no suffix: accept both 12-hour (1–12) and 24-hour (0–23)
    if (h > 23) return null;
    // 0 = midnight (keep as 0)
  }
  return h * 60 + mins;
}
function computeWeekTotal(projectEntries) { let mins = 0; projectEntries.forEach((pr) => pr.days.forEach((d) => { if (d && d.s === "ok") mins += parseDur(d.v); })); return formatDuration(mins); }
function totalMinutesForProjects(projectEntries) { let mins = 0; projectEntries.forEach((pr) => pr.days.forEach((d) => { if (d && d.s === "ok") mins += parseDur(d.v); })); return mins; }
function computeDayCell(projectEntries, i) {
  const entries = projectEntries.map((pr) => pr.days[i]).filter(Boolean);
  const oks = entries.filter((d) => d.s === "ok");
  if (oks.length) return { type: "data", label: formatDuration(oks.reduce((s, d) => s + parseDur(d.v), 0)) };
  return { type: "dash" };
}
function memberMatches(m, filter) {
  if (!filter) return true;
  const f = filter.toLowerCase();
  return m.name.toLowerCase().includes(f) || m.projects.some((pr) => pr.p.toLowerCase().includes(f));
}
function allOkEntries(dayLabels) {
  const rows = [];
  teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => pr.days.forEach((d, i) => {
    if (d && d.s === "ok") {
      const detail = `${d.clockIn.site === "on" ? "On" : "Off"} location - ${d.clockIn.time} to ${d.clockOut.time}`;
      rows.push({ team: team.name, member: m.name, project: pr.p, day: dayLabels[i], duration: d.v, detail });
    }
  }))));
  return rows;
}

// Same shape as allOkEntries, but for days that still have missing
// clock-in/clock-out data - reuses the same hasMissingTime check the
// table and the Missing Time modals already rely on, so this export
// filter can never disagree with what the UI itself flags as incomplete.
function allMissingTimeEntries(dayLabels) {
  const rows = [];
  teams.forEach((team) => team.members.forEach((m) => m.projects.forEach((pr) => pr.days.forEach((d, i) => {
    if (d && hasMissingTime(d)) {
      const detail = d.clockIn
        ? `${d.clockIn.site === "on" ? "On" : "Off"} location - ${d.clockIn.time} to missing`
        : "Missing clock-in and clock-out";
      rows.push({ team: team.name, member: m.name, project: pr.p, day: dayLabels[i], duration: d.v || "-", detail });
    }
  }))));
  return rows;
}

function ProjectTag({ name, textStyle = T.metaPrimary, showIcon = true, fullCell = false }) {
  const textRef = useRef(null);
  if (fullCell) {
    // Used for a table row's own Name column: the tooltip trigger spans
    // the whole cell (matching every other table tooltip's "positioned
    // below the cell, not the text" treatment), rather than wrapping just
    // the icon+text pair the way the non-table usages below do. flex-1
    // (not a flat w-full) so it still shares the cell correctly when a
    // sibling like an expand/collapse chevron button sits next to it.
    //
    // Deliberately NOT `relative` here: this tooltip shares its cell with
    // a sibling (an expand/collapse button, or nothing at all depending
    // on context), so its own box isn't a reliable stand-in for "the
    // cell" the way it is for a Total/day cell where it's the sole
    // child - the caller's wrapper div carries `position: relative`
    // instead, so the popup's `top-full`/`left-0` resolve against that
    // (reliable, already used to drive the hover-highlight background)
    // rather than against this element's own possibly-mis-sized box.
    return (
      <TTooltip
        label={name}
        align="left"
        // 60px: both places this renders happen to share the same
        // 40px of "stuff before the icon" (either the row's own pl-10
        // indent, or a px-4 cell padding plus an expand/collapse chevron
        // button of about the same width) - plus this icon's own 14px
        // width and the 6px gap before the name starts.
        leftOffset={60}
        measureRef={textRef}
        className="flex items-center gap-1.5 max-w-full flex-1"
        style={{ ...textStyle, color: C.textSecondary, minWidth: 0, alignSelf: "stretch" }}
      >
        {showIcon && <HardHat className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PROJECT_COLORS[name] || C.grey05 }} />}
        <span ref={textRef} className="truncate block w-full tt-project-name" style={{ minWidth: 0, cursor: "pointer" }}>{name}</span>
      </TTooltip>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 max-w-full" style={{ ...textStyle, color: C.textSecondary, minWidth: 0 }}>
      {showIcon && <HardHat className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PROJECT_COLORS[name] || C.grey05 }} />}
      <TTooltip label={name} measureRef={textRef} className="relative inline-flex" style={{ minWidth: 0 }}>
        <span ref={textRef} className="truncate block w-full tt-project-name" style={{ minWidth: 0, cursor: "pointer" }}>{name}</span>
      </TTooltip>
    </span>
  );
}
function TaskName({ children }) {
  return <span className="block truncate" style={{ ...T.labelSmall, color: C.brandDark, textDecoration: "underline", textDecorationColor: C.brandDark, textUnderlineOffset: 2, minWidth: 0 }}>{children}</span>;
}

function TTooltip({ label, children, className = "relative inline-flex", style, tone = "default", align = "right", measureRef, leftOffset }) {
  const [show, setShow] = useState(false);
  const toneBg = tone === "alert" ? C.alertRed : C.textPrimary;
  // For a name/label that's only sometimes truncated: only bother showing
  // a tooltip when the text is actually cut off (scrollWidth exceeding
  // clientWidth means the ellipsis is doing something) - a tooltip
  // repeating text that's already fully visible is just noise.
  // `measureRef` points at the specific `.truncate` span itself (not this
  // wrapper), since that's the element the ellipsis is applied to.
  function handleEnter() {
    if (measureRef && measureRef.current && measureRef.current.scrollWidth <= measureRef.current.clientWidth) return;
    setShow(true);
  }
  // `leftOffset` (px): when this tooltip's `relative` positioning context
  // is a shared cell wrapper (icon/avatar + name together, not just the
  // name), `left: 0` lands at the wrapper's own left edge - behind the
  // icon/avatar - rather than under the name text. Passing the icon or
  // avatar's own width+gap here shifts the popup to start under the name
  // itself instead.
  const popupUsesLeft = align === "left";
  return (
    <span className={className} style={style} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        // No gap (no margin-top) between the trigger and the tooltip: a gap
        // here would be a dead zone the mouse has to cross with nothing
        // hoverable under it, which fires mouseleave and closes the tooltip
        // before the cursor ever reaches it. `pt-2` keeps the same visual
        // breathing room, but as padding *inside* the hoverable box instead
        // of a margin outside it.
        // Anchored to whichever side the trigger's own content reads from
        // (right for right-aligned values, left for left-aligned labels
        // like a name) - anchoring the opposite side would pop the tooltip
        // up far from the text someone's actually hovering over whenever
        // the trigger itself is wider than its content (e.g. a Name
        // column cell).
        <span
          className={`absolute ${popupUsesLeft && leftOffset == null ? "left-0" : ""} ${!popupUsesLeft ? "right-0" : ""} top-full z-50 whitespace-nowrap rounded-md px-2 pt-2 pb-2`}
          style={{ ...(popupUsesLeft && leftOffset != null ? { left: leftOffset } : {}), background: toneBg, color: C.white, ...T.metaPrimary }}
        >{label}</span>
      )}
    </span>
  );
}

// A single static map screenshot reused across every task card. Real
// clock-in/clock-out coordinates aren't wired up yet, so this one image
// stands in for "the map" everywhere, and only the IN/OUT pin positions
// (inPos/outPos below) move per scenario.
const SITE_MAP_IMAGE = "data:image/jpeg;base64,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";

// Renders the two markers for a clocked session on the sample map - one for
// clock-in, one for clock-out - but only for whichever side(s) are real
// (GPS-backed) rather than typed in manually. A manually entered time has
// no real location, so it gets no marker; if both sides are manual, this
// component is never rendered at all (see TaskTimeCard below).
// A Missing Time card only gets a map once there's an actual on-site
// clock-in to plot - a manual entry has no real location, and if
// clock-in itself is still missing there's nothing to show at all.
// Clock-out being missing is fine; ClockMapPreview below just omits its
// pin until that side is filled in.
// Shared scroll lock for every overlay (side panels, the maximized metric
// modal) that needs to freeze the page behind it. Two problems with each
// overlay independently doing `document.body.style.overflow = "hidden"`
// and restoring its own saved value on close:
//
// 1. No scrollbar-width compensation - hiding overflow removes the
//    browser's vertical scrollbar, so the page reflows wider by however
//    much space that scrollbar occupied, then reflows back on restore.
//    That shift is what reads as the scrollbar "glitching" or looking
//    re-styled between opens/closes.
// 2. No ref-counting - if a second overlay opens while a first is still
//    open (e.g. a Missing Time panel opened from inside DayDetailPanel)
//    and they close out of order, one can restore scroll while the other
//    still expects it locked, leaving the page scrollable underneath a
//    still-open panel.
//
// A single module-level counter and one saved "original" state - captured
// only on the first lock, restored only once the last one releases -
// fixes both: nested overlays share one lock, and the compensation runs
// exactly once per lock/unlock cycle instead of once per overlay.
let bodyScrollLockCount = 0;
let bodyScrollLockOriginal = null;
function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
    bodyScrollLockOriginal = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${currentPaddingRight + scrollBarWidth}px`;
  }
  bodyScrollLockCount++;
}
function unlockBodyScroll() {
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount === 0 && bodyScrollLockOriginal) {
    document.body.style.overflow = bodyScrollLockOriginal.overflow;
    document.body.style.paddingRight = bodyScrollLockOriginal.paddingRight;
    bodyScrollLockOriginal = null;
  }
}
function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

function hasOnsiteClockIn(event) {
  return !!(event && event.site === "on" && !event.manual);
}

function ClockMapPreview({ clockIn, clockOut, project, width = 140, height = 140 }) {
  // Both ends on-site implies the same job site for clock-in and clock-out,
  // so the two pins should read as neighbors. Either end off-site means the
  // clock-in and clock-out locations aren't the same place, so the pins
  // should read as clearly separated. When clock-out doesn't exist yet
  // (still missing), there's only one known point - center it instead of
  // computing a relative offset from a clock-out that isn't there.
  const hasOut = !!clockOut;
  const bothOnSite = hasOut && clockIn.site === "on" && clockOut.site === "on";
  const inPos = !hasOut ? { left: "50%", top: "50%" } : (bothOnSite ? { left: "44%", top: "52%" } : { left: "22%", top: "28%" });
  const outPos = bothOnSite ? { left: "58%", top: "62%" } : { left: "68%", top: "70%" };
  return (
    <div className="relative tt-map-preview" style={{ width, height, flexShrink: 0, cursor: "pointer" }}>
      {/* Static map screenshot, sized to fill its container (rather than
          fixed pixel dimensions) so it can match a task card's full width. */}
      <img
        src={SITE_MAP_IMAGE}
        alt="Sample map"
        style={{ width: "100%", height: "100%", borderRadius: 12, display: "block", objectFit: "cover" }}
      />
      {!clockIn.manual && (
        <div className="absolute flex flex-col items-center" style={{ left: inPos.left, top: inPos.top, transform: "translate(-50%, -100%)" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.white, background: C.brandDark, borderRadius: 4, padding: "1px 4px", marginBottom: 1, whiteSpace: "nowrap" }}>IN</span>
          <MapPin className="w-6 h-6" strokeWidth={2.5} style={{ color: C.brandDark, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }} />
        </div>
      )}
      {hasOut && !clockOut.manual && (
        <div className="absolute flex flex-col items-center" style={{ left: outPos.left, top: outPos.top, transform: "translate(-50%, -100%)" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.white, background: C.alertRed, borderRadius: 4, padding: "1px 4px", marginBottom: 1, whiteSpace: "nowrap" }}>OUT</span>
          <MapPin className="w-6 h-6" strokeWidth={2.5} style={{ color: C.alertRed, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }} />
        </div>
      )}
      <button
        type="button"
        title="Open full map"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project || "")}`, "_blank", "noopener,noreferrer");
        }}
        className="absolute top-1.5 right-1.5 flex items-center justify-center cursor-pointer"
        style={{ width: 22, height: 22, borderRadius: 5, background: C.white, border: `1px solid ${C.grey03}`, zIndex: 60 }}
      >
        <ExternalLink className="w-3 h-3" style={{ color: C.textSecondary }} />
      </button>
      <div
        className="tt-map-overlay absolute inset-0 flex items-center justify-center transition-opacity duration-150 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.5)", borderRadius: 12, opacity: 0, pointerEvents: "none" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project || "")}`, "_blank", "noopener,noreferrer");
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project || "")}`, "_blank", "noopener,noreferrer");
          }}
          className="cursor-pointer"
          style={{ ...T.metaPrimary, fontWeight: 600, color: C.textSecondary, background: C.white, border: "none", borderRadius: 6, padding: "6px 14px" }}
        >View Map</button>
      </div>
    </div>
  );
}

// One side (clock-in or clock-out) of a task's time in the detail panel -
// either the time itself, or a clickable "Missing Time" prompt (matching
// the same red-underline treatment as a fully-missing day cell) when that
// side never got punched for this specific task - clicking it opens the
// per-task modal to fill in just that task's time.
function TimeMarker({ label, event, iconColor, onMissingClick }) {
  const missing = !event;
  return (
    <div className="flex items-center gap-2 flex-1" style={{ minWidth: 0 }}>
      <Clock className="flex-shrink-0" style={{ width: 20, height: 20, color: iconColor }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ ...T.metaPrimary, color: C.grey05, marginBottom: 2 }}>{label}</div>
        {missing ? (
          <button
            type="button"
            onClick={onMissingClick}
            className="tt-clockout-btn tt-missing-cta cursor-pointer"
            style={{ ...T.metaSecondary, fontWeight: 700, color: C.alertRed, background: "transparent", border: "none", padding: 0 }}
          ><span>Missing Time</span></button>
        ) : (
          <div style={{ ...T.emphasizedBody, color: C.textSecondary }}>{event.time}</div>
        )}
      </div>
    </div>
  );
}

// A single entry card inside the detail panel.
// Task-level entries (Image 1): map + task name + clock in/out
// Project-level entries (Image 2): map + clock in/out only, no task name
function TaskTimeCard({ task, project, dateLabel, onUpdateTask }) {
  const [modalOpen, setModalOpen] = useState(false);
  const missingSomething = !task.clockIn || !task.clockOut;
  const showMap = task.clockIn && task.clockOut && !(task.clockIn.manual && task.clockOut.manual);
  const isProjectLevel = !!task.isProjectLevel;
  return (
    <div className="rounded-lg p-4" style={{ border: `1px solid ${C.grey03}`, borderRadius: 12 }}>
      {showMap && (
        <div style={{ marginBottom: 16 }}>
          <ClockMapPreview clockIn={task.clockIn} clockOut={task.clockOut} project={project} width="100%" height={120} />
        </div>
      )}
      {/* Task name only shown for task-level entries */}
      {!isProjectLevel && (
        <p className="truncate tt-task-name" style={{ ...T.largeLabel, color: C.textSecondary, marginBottom: 16, transition: "color 0.15s", cursor: "pointer" }}>{task.name}</p>
      )}
      <div style={{ borderTop: `1px solid ${C.grey03}`, paddingTop: 10 }}>
        <div className="flex items-stretch">
          <TimeMarker label="Clock in" event={task.clockIn} iconColor={C.brandDark} onMissingClick={() => setModalOpen(true)} />
          <div style={{ width: 1, background: C.grey03, flexShrink: 0, margin: "0 12px" }} />
          <TimeMarker label="Clock out" event={task.clockOut} iconColor={C.alertRed} onMissingClick={() => setModalOpen(true)} />
        </div>
      </div>
      {missingSomething && (
        <TaskMissingTimeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          task={task}
          project={project}
          dateLabel={dateLabel}
          onSave={(newClockIn, newClockOut) => onUpdateTask({ ...task, clockIn: newClockIn, clockOut: newClockOut })}
        />
      )}
    </div>
  );
}

// Right-side slide-in panel opened by clicking a completed per-day cell -
// replaces the old hover tooltip's inline clock-in/clock-out + map, which
// had nowhere near enough room once the day's total needed to be broken
// out per task. A dim overlay behind it closes the panel on click, same
// as a modal, but the panel itself docks to the right edge instead of
// centering, so it reads as a detail drawer rather than a dialog.
// Shared drawer shell - same visual language as DayDetailPanel (dimmed
// overlay, panel slides in from the right, header with title + close X,
// scrollable body) plus a footer slot that stays fixed at the bottom
// (e.g. a Save button) instead of scrolling away with long content.
// Used by all the Missing Time entry points so they read as one
// consistent side-panel pattern instead of a mix of drawers and dialogs.
// Shared header subtitle for Missing Time panels - project name, a small
// dot separator, then the date, matching DayDetailPanel's own header line.
function ProjectDateSubtitle({ project, dateLabel }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="tt-project-name" style={{ cursor: "pointer" }}>{project}</span>
      <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey05, flexShrink: 0, display: "inline-block" }} />
      <span>{dateLabel}</span>
    </span>
  );
}

function SidePanelShell({ open, onClose, title, subtitle, children, footer, width = 380 }) {
  useBodyScrollLock(open);
  return (
    <>
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{ background: C.overlay, zIndex: 90, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full flex flex-col transition-transform duration-200"
        style={{ width, maxWidth: "100vw", zIndex: 100, background: C.white, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", transform: open ? "translateX(0)" : "translateX(100%)" }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between p-4" style={{ borderBottom: `1px solid ${C.grey03}`, flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ ...T.largeLabel, color: C.textSecondary, margin: 0 }}>{title}</h3>
            {subtitle && <div style={{ ...T.metaPrimary, color: C.grey05, marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tt-icon-btn flex-shrink-0 cursor-pointer transition-colors duration-150"
            style={{ background: "transparent", border: "none", padding: 4, borderRadius: 6, lineHeight: 0 }}
          ><X className="w-4 h-4" style={{ color: C.grey05 }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 p-4" style={{ borderTop: `1px solid ${C.grey03}`, background: C.white }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

function DayDetailPanel({ open, onClose, project, dateLabel, tasks, onUpdateTask, onToast }) {
  // Locks the page's own scroll while the panel is open - without this,
  // the page behind the dim overlay can still scroll (e.g. via the mouse
  // wheel), showing its own scrollbar at the same time as the panel's
  // internal one, which reads as two scrollbars fighting for the same
  // gesture. Restored the moment the panel closes.
  useBodyScrollLock(open);
  const totalMinutes = tasks.reduce((sum, t) => {
    if (!t.clockIn || !t.clockOut) return sum;
    const inMin = parseTimeFull(t.clockIn.time);
    const outMin = parseTimeFull(t.clockOut.time);
    return sum + (inMin != null && outMin != null && outMin > inMin ? outMin - inMin : 0);
  }, 0);
  return (
    <>
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{ background: C.overlay, zIndex: 90, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full flex flex-col transition-transform duration-200"
        style={{ width: 380, maxWidth: "100vw", zIndex: 100, background: C.white, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", transform: open ? "translateX(0)" : "translateX(100%)" }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between p-4" style={{ borderBottom: `1px solid ${C.grey03}`, flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <ProjectTag name={project} textStyle={T.largeLabel} showIcon={false} />
            <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
              <span style={{ ...T.body, color: C.grey05 }}>{dateLabel}</span>
              {totalMinutes > 0 && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey05, flexShrink: 0 }} />
                  <span style={{ ...T.body, color: C.grey05 }}>{formatDuration(totalMinutes)}</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tt-icon-btn flex-shrink-0 cursor-pointer transition-colors duration-150"
            style={{ background: "transparent", border: "none", padding: 4, borderRadius: 6, lineHeight: 0 }}
          ><X className="w-4 h-4" style={{ color: C.grey05 }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {tasks.map((t) => (
            <TaskTimeCard
              key={t.id}
              task={t}
              project={project}
              dateLabel={dateLabel}
              onUpdateTask={(updated) => { onUpdateTask(updated); if (onToast) onToast("Missing time successfully set."); }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// A single task's card inside MissingTasksModal - a known side renders as
// fixed text (same treatment as the whole-day Missing Time modal's known
// clock-in), a missing side renders as an editable TimeField right there
// in the card, so filling it in doesn't require a further nested dialog.
function MissingTaskEditCard({ task, clockInMin, clockOutMin, onChangeIn, onChangeOut, defaultClockInMin, defaultClockOutMin, autoFocusFirst = false, firstFieldRef, project }) {
  const missingIn = !task.clockIn;
  const missingOut = !task.clockOut;
  const showMap = hasOnsiteClockIn(task.clockIn);
  return (
    <div className="rounded-lg p-3" style={{ border: `1px solid ${C.grey03}` }}>
      {showMap && (
        <div style={{ marginBottom: 12 }}>
          <ClockMapPreview clockIn={task.clockIn} clockOut={task.clockOut || null} project={project} width="100%" height={120} />
        </div>
      )}
      <p className="truncate tt-task-name" style={{ ...T.labelSmall, fontWeight: 600, color: C.textSecondary, marginBottom: 10, cursor: "pointer" }}>{task.name}</p>
      <div className="grid grid-cols-2 gap-3" key={task.id}>
        <TimeField
          label="Clock in"
          autoFocus={missingIn && autoFocusFirst}
          inputRef={missingIn && autoFocusFirst ? firstFieldRef : undefined}
          defaultPeriod={task.clockIn ? (parseTimeFull(task.clockIn.time) >= 12 * 60 ? "PM" : "AM") : "AM"}
          initialMinutes={task.clockIn ? parseTimeFull(task.clockIn.time) : defaultClockInMin}
          onCommit={onChangeIn}
        />
        <TimeField
          label="Clock out"
          autoFocus={!missingIn && autoFocusFirst}
          inputRef={!missingIn && autoFocusFirst ? firstFieldRef : undefined}
          minMinutes={clockInMin}
          defaultPeriod={task.clockOut ? (parseTimeFull(task.clockOut.time) >= 12 * 60 ? "PM" : "AM") : "PM"}
          initialMinutes={task.clockOut ? parseTimeFull(task.clockOut.time) : (clockInMin != null && defaultClockOutMin > clockInMin ? defaultClockOutMin : null)}
          onCommit={onChangeOut}
        />
      </div>
    </div>
  );
}

// Opened from the "Missing Time" trigger inside an otherwise-complete
// day's cell (see DetailCell) - a centered dialog (unlike the full
// DayDetailPanel side panel) that shows only the task card(s) still
// missing a clock-in or clock-out, one card per incomplete task, each
// with its own inline input(s) for whichever side is missing. A single
// Save commits every card at once, rather than opening a further dialog
// per task.
function MissingTasksModal({ open, onOpenChange, tasks, project, dateLabel, onSaveAll }) {
  const DEFAULT_CLOCK_IN_MIN = 8 * 60; // 8:00 AM
  const DEFAULT_CLOCK_OUT_MIN = 17 * 60; // 5:00 PM
  const [inputs, setInputs] = useState({}); // { [taskId]: { clockInMin, clockOutMin } }
  const taskIdsKey = tasks.map((t) => t.id).join(",");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const initial = {};
    tasks.forEach((t) => {
      const initIn = t.clockIn ? parseTimeFull(t.clockIn.time) : DEFAULT_CLOCK_IN_MIN;
      const initOut = t.clockOut ? parseTimeFull(t.clockOut.time) : (DEFAULT_CLOCK_OUT_MIN > initIn ? DEFAULT_CLOCK_OUT_MIN : null);
      initial[t.id] = { clockInMin: initIn, clockOutMin: initOut };
    });
    setInputs(initial);
    // autoFocus only fires on an element's very first mount - since this
    // panel stays mounted (just slid off-screen) between opens, autoFocus
    // alone would only ever work the first time it's ever opened. A
    // rAF-deferred imperative focus here fires every time `open` flips to
    // true, after the panel's own content has rendered.
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskIdsKey]);

  function setField(taskId, field, value) {
    setInputs((prev) => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  }

  const canSaveAll = tasks.length > 0 && tasks.every((t) => {
    const st = inputs[t.id];
    return st && st.clockInMin != null && st.clockOutMin != null && st.clockOutMin > st.clockInMin;
  });

  function handleSaveAll() {
    if (!canSaveAll) return;
    // Build every task's fixed clock-in/clock-out up front and hand them
    // all to the parent in a single call - saving one at a time would
    // have each call recompute the day from the same not-yet-updated
    // task list, so only the last save would actually stick.
    const updatedTasks = tasks.map((t) => {
      const st = inputs[t.id];
      const newClockIn = t.clockIn || clockEvent(minsTo12hLabel(st.clockInMin), null, true);
      const newClockOut = t.clockOut || clockEvent(minsTo12hLabel(st.clockOutMin), null, true);
      return { ...t, clockIn: newClockIn, clockOut: newClockOut };
    });
    onSaveAll(updatedTasks);
    onOpenChange(false);
  }

  return (
    <SidePanelShell
      open={open}
      onClose={() => onOpenChange(false)}
      title="Missing Time"
      subtitle={<ProjectDateSubtitle project={project} dateLabel={dateLabel} />}
      footer={<AppButton kind="filled" onClick={handleSaveAll} disabled={!canSaveAll} className="w-full">Save</AppButton>}
    >
      <div className="flex flex-col" style={{ gap: 16 }}>
        {tasks.map((t, i) => (
          <MissingTaskEditCard
            key={t.id}
            task={t}
            clockInMin={inputs[t.id] ? inputs[t.id].clockInMin : null}
            clockOutMin={inputs[t.id] ? inputs[t.id].clockOutMin : null}
            onChangeIn={(v) => setField(t.id, "clockInMin", v)}
            onChangeOut={(v) => setField(t.id, "clockOutMin", v)}
            defaultClockInMin={DEFAULT_CLOCK_IN_MIN}
            defaultClockOutMin={DEFAULT_CLOCK_OUT_MIN}
            autoFocusFirst={i === 0}
            firstFieldRef={i === 0 ? firstFieldRef : undefined}
            project={project}
          />
        ))}
      </div>
    </SidePanelShell>
  );
}

// A single time input used once (clock-out only) or twice (clock-in and
// clock-out) inside the Missing Time modal. Typing is capped at 4 digits
// (HHMM) with the colon inserted automatically after the first 2 - no
// dropdown of preset times. AM/PM is a standard button next to the field
// that toggles on each click. initialMinutes seeds a prefilled default
// value (the parent sets the matching default state itself, so there's no
// need to also fire onCommit here); defaultPeriod only matters when
// there's no default value.
function TimeField({ label, minMinutes, autoFocus, defaultPeriod = "AM", initialMinutes, onCommit, inputRef }) {
  const initial = initialMinutes != null ? minutesToDigitsPeriod(initialMinutes) : null;
  const [text, setText] = useState(initial ? initial.digits : "");
  const [period, setPeriod] = useState(initial ? initial.period : defaultPeriod);
  const [error, setError] = useState("");

  function commit(mins) {
    if (minMinutes != null && mins <= minMinutes) { setError("Must be after clock-in."); return; }
    if (mins > 23 * 60 + 45) { setError("Latest time is 11:45 PM."); return; }
    setError("");
    onCommit(mins);
  }
  function commitFromText(digits = text, per = period) {
    const raw = (digits || "").replace(/[^0-9]/g, "");
    if (!raw) return;
    let h, m;
    if (raw.length <= 2) {
      // "8" → 8:00, "12" → 12:00
      h = parseInt(raw, 10); m = 0;
    } else if (raw.length === 3) {
      // "830" → 8:30 (first digit = hour, last 2 = minutes)
      h = parseInt(raw[0], 10); m = parseInt(raw.slice(1), 10);
    } else {
      // "0830" or "1530" → 2+2 split
      h = parseInt(raw.slice(0, 2), 10); m = parseInt(raw.slice(2), 10);
    }
    if (isNaN(h) || isNaN(m) || m > 59 || h > 23) { setError("Enter a valid time."); return; }
    // 24-hour → convert to absolute minutes directly
    const totalMins = h * 60 + m;
    // update AM/PM toggle to reflect actual time
    const newPer = totalMins >= 12 * 60 && totalMins < 24 * 60 ? "PM" : "AM";
    if (newPer !== per) setPeriod(newPer);
    commit(totalMins);
    // after commit, reformat display to clean 12-hour with colon
    const { digits: fd, period: fp } = minutesToDigitsPeriod(totalMins);
    setText(fd);
    if (fp !== per) setPeriod(fp);
  }
  // During typing: just raw digits, max 4. No colon — avoids cursor/clamp bugs.
  // Colon is added only after commit (via minutesToDigitsPeriod in commitFromText).
  function formatDigits(raw) {
    return raw.replace(/[^0-9]/g, "").slice(0, 4);
  }
  function handleDigitsChange(raw) {
    const digits = formatDigits(raw);
    setText(digits);
    setError("");
    onCommit(null);
    // Auto-commit at 4 digits so user gets immediate AM/PM feedback
    if (digits.length === 4) commitFromText(digits, period);
  }
  function handlePeriodChange(next) {
    setPeriod(next);
    setError("");
    onCommit(null);
    if (text) commitFromText(text, next);
  }

  return (
    <div>
      <label style={{ ...T.metaPrimary, color: C.grey05 }}>{label}</label>
      <div className="flex items-stretch gap-1.5 mt-1">
        <Input
          ref={inputRef}
          autoFocus={autoFocus}
          value={text}
          inputMode="numeric"
          placeholder="--:--"
          onChange={(e) => handleDigitsChange(e.target.value)}
          onBlur={() => commitFromText()}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commitFromText(); }
          }}
          className={`tt-time-input text-center shadow-none flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          style={{ ...T.metaPrimary, color: C.textSecondary, minWidth: 0, height: 36, textAlign: "center" }}
        />
        <AppButton
          kind="outlined"
          type="button"
          onClick={() => handlePeriodChange(period === "AM" ? "PM" : "AM")}
          className="flex-shrink-0 px-0"
          style={{ ...T.metaPrimary, fontWeight: 600, height: 36, width: 44, border: `1.5px solid ${C.grey03}` }}
        >
          {period}
        </AppButton>
      </div>
      {error && <p style={{ ...T.metaSecondary, color: C.alertRed, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// Edits a single task's clock-in/clock-out from the detail panel - unlike
// the whole-day MissingTimeModal below (which always treats clock-in as
// already known and only ever fills clock-out or both), a task can be
// missing either side independently, so each side is shown as a fixed
// value when known or an editable field when missing. Whatever gets typed
// here is tagged manual - it has no real location, which is what
// suppresses its marker on the map afterward.
function TaskMissingTimeModal({ open, onOpenChange, task, project, dateLabel, onSave }) {
  const missingIn = !task?.clockIn;
  const missingOut = !task?.clockOut;
  const DEFAULT_CLOCK_IN_MIN = 8 * 60; // 8:00 AM
  const DEFAULT_CLOCK_OUT_MIN = 17 * 60; // 5:00 PM
  const [clockInMin, setClockInMin] = useState(null);
  const [clockOutMin, setClockOutMin] = useState(null);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const initialIn = task?.clockIn ? parseTimeFull(task.clockIn.time) : DEFAULT_CLOCK_IN_MIN;
    setClockInMin(initialIn);
    const initialOut = task?.clockOut
      ? parseTimeFull(task.clockOut.time)
      : (DEFAULT_CLOCK_OUT_MIN > initialIn ? DEFAULT_CLOCK_OUT_MIN : null);
    setClockOutMin(initialOut);
    // See MissingTasksModal's matching comment - autoFocus alone only
    // fires on first mount, so this panel needs an imperative refocus
    // every time it reopens.
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canSave = clockInMin != null && clockOutMin != null && clockOutMin > clockInMin;

  function handleSave() {
    if (!canSave) return;
    const newClockIn = clockEvent(minsTo12hLabel(clockInMin), task.clockIn?.site ?? null, !task.clockIn);
    const newClockOut = clockEvent(minsTo12hLabel(clockOutMin), task.clockOut?.site ?? null, !task.clockOut);
    onSave(newClockIn, newClockOut);
    onOpenChange(false);
  }

  return (
    <SidePanelShell
      open={open}
      onClose={() => onOpenChange(false)}
      title="Missing Time"
      subtitle={<ProjectDateSubtitle project={project} dateLabel={dateLabel} />}
      footer={<AppButton kind="filled" onClick={handleSave} disabled={!canSave} className="w-full">Save</AppButton>}
    >
      <div className="rounded-lg p-3" style={{ border: `1px solid ${C.grey03}` }}>
        {hasOnsiteClockIn(task?.clockIn) && (
          <div style={{ marginBottom: 12 }}>
            <ClockMapPreview clockIn={task.clockIn} clockOut={task.clockOut || null} project={project} width="100%" height={120} />
          </div>
        )}
        <p className="truncate" style={{ ...T.labelSmall, fontWeight: 600, color: C.textSecondary, marginBottom: 10 }}>{task?.name}</p>
        <div className="grid grid-cols-2 gap-3" key={open ? "open" : "closed"}>
          <TimeField
            label="Clock in"
            autoFocus={missingIn}
            inputRef={missingIn ? firstFieldRef : undefined}
            defaultPeriod={task?.clockIn ? (parseTimeFull(task.clockIn.time) >= 12 * 60 ? "PM" : "AM") : "AM"}
            initialMinutes={task?.clockIn ? parseTimeFull(task.clockIn.time) : DEFAULT_CLOCK_IN_MIN}
            onCommit={setClockInMin}
          />
          <TimeField
            label="Clock out"
            autoFocus={!missingIn}
            inputRef={!missingIn ? firstFieldRef : undefined}
            minMinutes={clockInMin}
            defaultPeriod={task?.clockOut ? (parseTimeFull(task.clockOut.time) >= 12 * 60 ? "PM" : "AM") : "PM"}
            initialMinutes={task?.clockOut ? parseTimeFull(task.clockOut.time) : (clockInMin != null && DEFAULT_CLOCK_OUT_MIN > clockInMin ? DEFAULT_CLOCK_OUT_MIN : null)}
            onCommit={setClockOutMin}
          />
        </div>
      </div>
    </SidePanelShell>
  );
}

// Handles both missing-time cases: clock-out missing (clock-in shown as
// fixed context) or both clock-in and clock-out missing (two editable
// fields). Whatever gets typed here is tagged manual - it has no real
// location, which is what suppresses its marker on the map afterward.
function MissingTimeModal({ open, onOpenChange, d, project, member, dateLabel, onSetClockOut }) {
  const bothMissing = !d?.clockIn;
  const DEFAULT_CLOCK_IN_MIN = 8 * 60; // 8:00 AM
  const DEFAULT_CLOCK_OUT_MIN = 17 * 60; // 5:00 PM
  const [clockInMin, setClockInMin] = useState(null);
  const [clockOutMin, setClockOutMin] = useState(null);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const initialIn = d?.clockIn ? parseTimeFull(d.clockIn.time) : DEFAULT_CLOCK_IN_MIN;
    setClockInMin(initialIn);
    // Only default clock-out to 5 PM when that's actually after clock-in;
    // otherwise leave it blank for the person to fill in.
    setClockOutMin(DEFAULT_CLOCK_OUT_MIN > initialIn ? DEFAULT_CLOCK_OUT_MIN : null);
    // See MissingTasksModal's matching comment - autoFocus alone only
    // fires on first mount, so this panel needs an imperative refocus
    // every time it reopens.
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canSave = clockInMin != null && clockOutMin != null && clockOutMin > clockInMin;

  function handleSave() {
    if (!canSave) return;
    const inStr = minsTo12hLabel(clockInMin);
    const outStr = minsTo12hLabel(clockOutMin);
    // A clock-in that was already real (GPS-backed) stays exactly as it
    // was; only clock-out (and clock-in, if it was missing too) is a new
    // manual entry with no real location.
    const newClockIn = bothMissing ? clockEvent(inStr, null, true) : clockEvent(inStr, d.clockIn.site, d.clockIn.manual);
    const newClockOut = clockEvent(outStr, null, true);
    // This modal fills in the day as a whole rather than targeting one
    // task among possibly several incomplete ones, so the day's task list
    // collapses to a single reconciled task built from the same
    // manually-entered time as the total below - keeping the "total is
    // always the aggregate of its tasks" rule intact instead of leaving
    // the old, now-superseded incomplete tasks in place.
    const reconciledTask = { id: `${project}|${dateLabel}|manual`, name: project, clockIn: newClockIn, clockOut: newClockOut };
    onSetClockOut(
      { project, member, dateLabel },
      { v: formatDuration(clockOutMin - clockInMin), clockIn: newClockIn, clockOut: newClockOut, tasks: [reconciledTask] }
    );
    onOpenChange(false);
  }

  return (
    <SidePanelShell
      open={open}
      onClose={() => onOpenChange(false)}
      title="Missing Time"
      subtitle={<ProjectDateSubtitle project={project} dateLabel={dateLabel} />}
      footer={<AppButton kind="filled" onClick={handleSave} disabled={!canSave} className="w-full">Save</AppButton>}
    >
      <div className="rounded-lg p-3" style={{ border: `1px solid ${C.grey03}` }}>
        {hasOnsiteClockIn(d?.clockIn) && (
          <div style={{ marginBottom: 12 }}>
            <ClockMapPreview clockIn={d.clockIn} clockOut={d.clockOut || null} project={project} width="100%" height={120} />
          </div>
        )}
        <p className="truncate" style={{ ...T.labelSmall, fontWeight: 600, color: C.textSecondary, marginBottom: 10 }}>{project}</p>
        <div className="grid grid-cols-2 gap-3" key={open ? "open" : "closed"}>
          <TimeField
            label="Clock in"
            autoFocus={bothMissing}
            inputRef={bothMissing ? firstFieldRef : undefined}
            defaultPeriod={d?.clockIn ? (parseTimeFull(d.clockIn.time) >= 12 * 60 ? "PM" : "AM") : "AM"}
            initialMinutes={d?.clockIn ? parseTimeFull(d.clockIn.time) : DEFAULT_CLOCK_IN_MIN}
            onCommit={setClockInMin}
          />
          <TimeField
            label="Clock out"
            autoFocus={!bothMissing}
            inputRef={!bothMissing ? firstFieldRef : undefined}
            minMinutes={clockInMin}
            defaultPeriod={d?.clockOut ? (parseTimeFull(d.clockOut.time) >= 12 * 60 ? "PM" : "AM") : "PM"}
            initialMinutes={d?.clockOut ? parseTimeFull(d.clockOut.time) : (clockInMin != null && DEFAULT_CLOCK_OUT_MIN > clockInMin ? DEFAULT_CLOCK_OUT_MIN : null)}
            onCommit={setClockOutMin}
          />
        </div>
      </div>
    </SidePanelShell>
  );
}

function DetailCell({ d, project, member, dateLabel, onSetClockOut, onToast }) {
  const [hover, setHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [missingOnlyOpen, setMissingOnlyOpen] = useState(false);

  if (!d) return (
    <TTooltip label="No work logged this day" className="relative flex w-full h-full">
      <div
        className="flex items-center justify-end pr-3 w-full h-full cursor-pointer transition-colors duration-150 tt-missing-cta"
        style={{ background: hover ? C.lightMint : "transparent" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      ><span style={{ color: C.grey04 }}>-</span></div>
    </TTooltip>
  );

  // A completed day (has a real total): hovering the total just hints
  // there's more to see - clicking it opens the full right-side panel
  // with every task's clock-in/clock-out breakdown and map. The total is
  // only ever the sum of *complete* tasks (see dayFromTasks), so if one
  // or more of the day's tasks is still missing a punch, showing that
  // partial sum next to "Missing Time" would misrepresent it as the real
  // total - instead, the total is withheld entirely until every task for
  // this project/day has both a clock-in and clock-out, and the cell
  // shows only the "Missing Time" prompt (matching the "bad" state below)
  // until then.
  if (d.s === "ok") {
    const incompleteTasks = (d.tasks || []).filter((t) => !t.clockIn || !t.clockOut);
    const hasIncomplete = incompleteTasks.length > 0;
    // Fixing a task's missing time (from the full panel) re-derives the
    // whole day (status, total, envelope clock-in/out) from its updated
    // task list via dayFromTasks, then saves that recomputed day the same
    // way the whole-day Missing Time modal does - so the total always
    // stays the aggregate of the tasks, even after a task-level edit.
    function handleUpdateTask(updatedTask) {
      const updatedTasks = d.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      const recomputedDay = dayFromTasks(updatedTasks);
      onSetClockOut({ project, member, dateLabel }, recomputedDay);
      if (onToast) onToast("Missing time successfully set.");
    }
    // Same idea, but for the focused missing-only dialog, which can save
    // several fixed tasks at once - apply every one of them to the task
    // list in a single pass before recomputing, rather than recomputing
    // (and saving) once per task.
    function handleSaveMultipleTasks(updatedTasksList) {
      const byId = Object.fromEntries(updatedTasksList.map((t) => [t.id, t]));
      const updatedTasks = d.tasks.map((t) => byId[t.id] || t);
      const recomputedDay = dayFromTasks(updatedTasks);
      onSetClockOut({ project, member, dateLabel }, recomputedDay);
    }

    if (hasIncomplete) {
      return (
        <>
          <TTooltip label="Set the missing time." tone="alert" className="relative flex w-full h-full">
            <button
              type="button"
              className="flex items-center justify-end pr-3 w-full h-full cursor-pointer transition-colors duration-150 tt-missing-cta"
              style={{ background: hover ? C.lightMint : "transparent", border: "none" }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => setMissingOnlyOpen(true)}
            >
              <span style={{ ...T.metaSecondary, color: C.alertRed }}>Missing Time</span>
            </button>
          </TTooltip>
          <MissingTasksModal
            open={missingOnlyOpen}
            onOpenChange={setMissingOnlyOpen}
            tasks={incompleteTasks}
            project={project}
            dateLabel={dateLabel}
            onSaveAll={handleSaveMultipleTasks}
          />
        </>
      );
    }

    return (
      <>
        <TTooltip label="Click to view detail." className="relative flex w-full h-full">
          <button
            type="button"
            className="flex flex-col items-end justify-center w-full h-full pr-3 cursor-pointer transition-colors duration-150"
            style={{ ...T.metaPrimary, color: C.textSecondary, fontWeight: hover ? 700 : T.metaPrimary.fontWeight, background: hover ? C.lightMint : "transparent", border: "none" }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => setPanelOpen(true)}
          >{d.v}</button>
        </TTooltip>
        <DayDetailPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          project={project}
          dateLabel={dateLabel}
          tasks={d.tasks || []}
          onUpdateTask={handleUpdateTask}
          onToast={onToast}
        />
      </>
    );
  }

  // d.s === "bad": either the clock-out is missing (d.clockIn known) or
  // both clock-in and clock-out are missing (d.clockIn absent). Either way,
  // no hours are ever inferred or auto-calculated - "Missing Time" opens a
  // modal for someone to enter the real time(s).
  return (
    <>
      <TTooltip
        label="Set the missing time."
        tone="alert"
        className="relative flex w-full h-full"
      >
        <button
          type="button"
          className="flex items-center justify-end pr-3 w-full h-full cursor-pointer transition-colors duration-150 tt-missing-cta"
          style={{ background: hover ? C.lightMint : "transparent", border: "none" }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => { setHover(false); setModalOpen(true); }}
        >
          <span style={{ ...T.metaSecondary, color: C.alertRed }}>Missing Time</span>
        </button>
      </TTooltip>
      <MissingTimeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        d={d}
        project={project}
        member={member}
        dateLabel={dateLabel}
        onSetClockOut={onSetClockOut}
      />
    </>
  );
}
function SummaryCell({ cell, bold }) {
  if (cell.type === "dash") return <TTooltip label="No work logged this day" className="relative flex items-center justify-end w-full h-full"><span style={{ color: C.grey04 }}>-</span></TTooltip>;
  return <span style={{ color: C.textSecondary, fontWeight: bold ? 700 : T.secondaryBody.fontWeight }}>{cell.label}</span>;
}

// Injected once so the clock-out time input's native text selection reads
// as a solid blue highlight with white text, matching Google Calendar's
// time-field edit state instead of the browser's default selection color.
function TimeInputSelectionStyle() {
  return (
    <style>{`
      button, input, [role="button"] { box-shadow: none !important; }
      .tt-time-input::selection { background: ${C.blue}; color: ${C.white}; }
      .tt-time-input::-moz-selection { background: ${C.blue}; color: ${C.white}; }
      .tt-clockout-btn:hover { background: ${C.lightMint} !important; }
      .tt-icon-btn:hover:not(:disabled) { background: ${C.grey02} !important; }
      .tt-map-preview:hover .tt-map-overlay { opacity: 1 !important; pointer-events: auto !important; }
      .tt-task-name:hover { text-decoration: underline !important; }
      .tt-project-name:hover { text-decoration: underline !important; }
      .tt-missing-cta:hover span { text-decoration: underline !important; text-underline-offset: 2px !important; }
      .tt-list-row:hover { background: ${C.grey02} !important; }
      .tt-team-icon:hover { background: ${C.grey03} !important; }
      .tt-chip:not(.tt-chip-active):hover { background: ${C.grey02} !important; }
      .tt-burn-tick text, .tt-burn-tick tspan { fill: unset; }
      .tt-burn-tick tspan:first-child { fill: ${C.textPrimary} !important; }
      .tt-burn-tick tspan:last-child { fill: ${C.grey05} !important; }
      @keyframes tt-bar-grow {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
      @keyframes tt-bubble-in {
        0%   { transform: scale(0); opacity: 0; }
        70%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      .tt-bubble { transform-box: fill-box; transform-origin: center; animation: tt-bubble-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
    `}</style>
  );
}

function TableHeadRow({ hoverCol, dayDates, needsScrollReserve }) {
  const CARD_RADIUS = 8; // Matches the Card component's own rounded-lg corner radius.
  // Rendered as a CSS Grid (the exact same DETAIL_GRID_COLUMNS template
  // every team's row list below uses), not table-layout:fixed's own
  // column algorithm - <th>/<td> width percentages and CSS Grid track
  // percentages aren't guaranteed to round identically even given the
  // exact same nominal percentage, which was throwing off alignment on
  // columns that had nothing to do with the scrollbar at all. Using the
  // same layout mechanism for both removes that whole class of mismatch.
  // The outer <thead>/<tr>/<th colSpan={9}> shell stays, so semantics
  // (and the skeleton rows, which still use real <td>s) are unaffected.
  return (
    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
      <tr style={{ background: C.white, borderBottom: `1.5px solid ${C.grey03}` }}>
        <th colSpan={9} className="p-0" style={{ background: C.white }}>
          {/* Same paddingRight/boxSizing pattern as every team's scroll
              container below (see scrollingTeams in TimesheetPage) - this
              is the shared header, so it always gets the reserve whenever
              ANY team needs it, the same way a non-scrolling team does. */}
          <div className="grid" style={{ gridTemplateColumns: DETAIL_GRID_COLUMNS, paddingRight: needsScrollReserve ? SCROLLBAR_RESERVE : 0, boxSizing: "border-box" }}>
            <div className="px-4 py-3 text-left" style={{ fontSize: 14, fontWeight: 700, color: C.textSecondary, borderTopLeftRadius: CARD_RADIUS }}></div>
            <div className="flex flex-col justify-end pb-3 pr-4 text-right transition-colors duration-150" style={{ fontSize: 14, fontWeight: 700, color: C.textSecondary, alignSelf: "stretch", background: hoverCol === "total" ? C.grey03 : "transparent" }}>Total</div>
            {DAY_SHORT.map((d, i) => {
              return (
                <div key={i} className="py-3 pr-3 text-right transition-colors duration-150" style={{ background: hoverCol === i ? C.grey03 : "transparent" }}>
                  <span className="inline-flex flex-col items-end" style={{ gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 400, color: C.grey05 }}>{d}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, textTransform: "uppercase" }}>{dayDates[i]}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </th>
      </tr>
    </thead>
  );
}

// Per-cell skeleton rows shown inside the real table shell while a new
// date range is being "fetched" - keeps header + column widths steady so
// only the row contents shimmer, instead of swapping the whole table.
function SkeletonGroupRows({ groups }) {
  return groups.map((g, gi) => (
    <React.Fragment key={gi}>
      <tr><td colSpan={9} className="px-4 py-3" style={{ background: C.grey02, ...T.metaSecondary, color: C.grey05, textTransform: "uppercase", letterSpacing: 0.4 }}>{g.header}</td></tr>
      {Array.from({ length: g.rowCount }).map((_, ri) => (
        <tr key={ri} className="border-t" style={{ borderColor: C.grey03 }}>
          <td className="flex items-center gap-2 px-4 py-4">
            <div style={{ width: 16, height: 16 }} />
            <SkeletonBlock className="rounded-full flex-shrink-0" style={{ width: 36, height: 36 }} />
            <SkeletonBlock className="h-3.5" style={{ width: 120 }} />
          </td>
          <td className="text-right pr-4"><SkeletonBlock className="h-3.5 ml-auto" style={{ width: 36 }} /></td>
          {DAY_SHORT.map((_, di) => (
            <td key={di} className="text-right pr-3"><SkeletonBlock className="h-3.5 ml-auto" style={{ width: 26 }} /></td>
          ))}
        </tr>
      ))}
    </React.Fragment>
  ));
}

// Replaces the old numbered-pages footer: a team's row list (member or
// project rows alike) always starts with 10 items, then loads 10 more at
// a time as the person scrolls near the bottom of that team's own list -
// not the page - no page-number buttons to click. A near-invisible
// sentinel sits right after the loaded rows; an IntersectionObserver
// watches it against the team's own scroll container (scrollRootRef),
// with a little lookahead margin so the next batch is ready before the
// person actually hits bottom, and fires onLoadMore once when it comes
// into view. The text below it just reports progress ("Showing X of Y")
// plus a small spinner while the next batch is "loading".
function TeamScrollFooter({ shownCount, totalCount, itemLabel, hasMore, loadingMore, onLoadMore, scrollRootRef }) {
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { root: (scrollRootRef && scrollRootRef.current) || null, rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, onLoadMore]);

  return (
    <div>
      {hasMore && <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />}
      <div className="flex items-center gap-2 px-4 py-2" style={{ width: "100%" }}>
        {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: C.grey05 }} />}
        <span style={{ ...T.metaSecondary, color: C.grey05 }}>
          {loadingMore ? `Loading more ${itemLabel}...` : `Showing ${shownCount} of ${totalCount} ${itemLabel}`}
        </span>
      </div>
    </div>
  );
}

// Fixed height for each team's own scrollable row list (see
// scrollContainerRefs below) - tall enough to show a comfortable handful
// of rows before the list needs to scroll internally, independent of
// every other team's list and of the page's own scroll position.
const TEAM_LIST_MAX_HEIGHT = 640;
// Reserved unconditionally on the Sunday column's right side, in both the
// header (which never scrolls) and every team's row list (which may or
// may not actually be tall enough to scroll) - a classic scrollbar,
// whenever one does appear in a team's list, needs this much room without
// shifting that column's text out of line with the header above it. Since
// it's applied the same way everywhere regardless of whether a given
// team actually has a visible scrollbar, every row stays consistent with
// the header - there's no per-team "does this one scroll or not" case to
// get out of sync.
const SCROLLBAR_RESERVE = 16;


const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TODAY = { year: 2026, month: 6, day: 14 };
function dateVal(o) { return new Date(o.year, o.month, o.day).getTime(); }
function addDays(o, days) { const d = new Date(o.year, o.month, o.day + days); return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }; }
function formatRangeLabel(s, e) {
  const sLabel = `${MONTHS[s.month].slice(0, 3)} ${s.day}`;
  const eLabel = `${MONTHS[e.month].slice(0, 3)} ${e.day}, ${e.year}`;
  return dateVal(s) === dateVal(e) ? `${sLabel}, ${s.year}` : `${sLabel} - ${eLabel}`;
}

// ---- Quick-range presets (Last week / This week) ----
const THIS_WEEK_START = { year: 2026, month: 6, day: 6 };
const THIS_WEEK_END = { year: 2026, month: 6, day: 12 };
// The oldest date with any recorded activity - this is where the custom
// week list would end if nothing else limited it first.
const FIRST_CLOCK_IN_DATE = { year: 2026, month: 1, day: 5 };
// The date filter shows at most one year of history back from the current
// week, even if activity goes back further than that.
function oneYearBefore(o) {
  const d = new Date(o.year, o.month, o.day);
  d.setFullYear(d.getFullYear() - 1);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}
// Whichever boundary is more recent wins: real activity history if it's
// under a year old, or the one-year cap if activity goes back further.
// "End of list" in the dropdown always lands on this date.
const DATE_FILTER_FLOOR = (() => {
  const oneYearAgo = oneYearBefore(THIS_WEEK_END);
  return dateVal(oneYearAgo) > dateVal(FIRST_CLOCK_IN_DATE) ? oneYearAgo : FIRST_CLOCK_IN_DATE;
})();

function getPresetRange(mode) {
  if (mode === "this-week") return { start: THIS_WEEK_START, end: THIS_WEEK_END };
  if (mode === "last-week") return { start: addDays(THIS_WEEK_START, -7), end: addDays(THIS_WEEK_END, -7) };
  return null;
}
function modeForRange(s, e) {
  const found = ["this-week", "last-week"].find((m) => {
    const r = getPresetRange(m);
    return dateVal(r.start) === dateVal(s) && dateVal(r.end) === dateVal(e);
  });
  return found || "custom";
}
function labelForRange(mode, s, e) {
  if (mode === "this-week") return "This week";
  if (mode === "last-week") return "Last week";
  // Anything else (an older week picked from the list) shows the actual dates.
  return formatRangeLabel(s, e);
}

// Builds every selectable week, most recent first, stopping once a week no
// longer reaches DATE_FILTER_FLOOR (the person's first clock-in date, or
// one year back - whichever is more recent). The first two entries are
// always "This week" and "Last week"; every week before that is labeled
// with its actual date range.
function buildWeekList() {
  const weeks = [];
  let start = { ...THIS_WEEK_START };
  let end = { ...THIS_WEEK_END };
  while (dateVal(end) >= dateVal(DATE_FILTER_FLOOR)) {
    weeks.push({ start: { ...start }, end: { ...end } });
    end = addDays(start, -1);
    start = addDays(start, -7);
  }
  return weeks;
}
function weekListLabel(w, idx) {
  if (idx === 0) return "This week";
  if (idx === 1) return "Last week";
  return formatRangeLabel(w.start, w.end);
}

// A single scrollable dropdown: This week, Last week, then every earlier
// week by date (most recent first), ending in "End of list". Selecting a
// week both confirms and closes the popover in one click - there's no
// separate menu/calendar step anymore.
function WeekListContent({ onSelect, currentStart }) {
  const weeks = useMemo(() => buildWeekList(), []);
  return (
    <div style={{ width: 220, boxSizing: "border-box" }}>
      <div className="overflow-y-auto" style={{ maxHeight: 320, padding: 8 }}>
        {weeks.map((w, i) => {
          const active = dateVal(w.start) === dateVal(currentStart);
          const mode = i === 0 ? "this-week" : i === 1 ? "last-week" : "custom";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(w.start, w.end, mode)}
              className="flex w-full items-center px-3 py-2 text-left whitespace-nowrap rounded-md transition-colors duration-150"
              style={{
                ...T.secondaryBody,
                color: active ? C.brandDark : C.textSecondary,
                fontWeight: active ? 600 : 400,
                background: active ? C.lightMint : "transparent",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.grey02; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {weekListLabel(w, i)}
            </button>
          );
        })}
        <p className="px-3 py-2 text-center" style={{ ...T.metaSecondary, color: C.grey04 }}>End of list</p>
      </div>
    </div>
  );
}

function ExportPopoverContent({ rangeLabel, dayLabels, onExported, onClose }) {
  const [exporting, setExporting] = useState(null);
  const okRows = allOkEntries(dayLabels);
  const missingRows = allMissingTimeEntries(dayLabels);
  const counts = { all: okRows.length, missing: missingRows.length };
  const options = [{ key: "all", label: "All sessions" }, { key: "missing", label: "Missing time" }];
  function runExport(key) {
    setExporting(key);
    setTimeout(() => {
      const rows = key === "missing" ? missingRows : okRows;
      const header = ["Team", "Member", "Project", "Day", "Duration", "Detail"];
      const csv = [header.join(",")].concat(rows.map((r) => [r.team, r.member, r.project, r.day, r.duration, r.detail].map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","))).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key === "missing" ? "missing-time-export.csv" : "payroll-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      setExporting(null); onClose();
      onExported(key === "missing"
        ? `Missing time report ready - ${rows.length} session${rows.length === 1 ? "" : "s"} from ${rangeLabel}.`
        : `Payroll export ready - ${rows.length} sessions from ${rangeLabel}.`);
    }, 900);
  }
  return (
    <div className="w-full" style={{ padding: "16px 0" }}>
      <div style={{ padding: "0 16px" }}>
        <p style={{ ...T.metaPrimary, color: C.grey05 }}>Exporting {rangeLabel}</p>
        <p style={{ ...T.metaSecondary, color: C.grey05, marginTop: 2 }}>Compatible with QuickBooks.</p>
      </div>
      <div className="flex flex-col" style={{ marginTop: 8, gap: 4 }}>
        {options.map((o) => (
          <button key={o.key} onClick={() => runExport(o.key)} className="tt-icon-btn flex w-full items-center justify-between transition-colors duration-150" style={{ ...T.secondaryBody, color: C.textSecondary, padding: "8px 16px" }}>
            <span className="flex items-center gap-2">{exporting === o.key && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: C.grey05 }} />}{o.label}</span>
            <span style={{ ...T.metaPrimary, color: C.grey05 }}>{counts[o.key]} sessions</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MemberDetail({ projectEntries, dayLabels, onSetClockOut, onToast, hoverCol, setHoverCol, keyPrefix, savedCellKey }) {
  const sortedEntries = [...projectEntries].sort((a, b) => a.p.localeCompare(b.p));
  return (
    <div style={{ background: C.grey01 }}>
      <div style={{ background: C.grey02 }}>
        {sortedEntries.map((pr, gi) => {
          const pi = projectEntries.indexOf(pr);
          return (
          <React.Fragment key={gi}>
            {gi > 0 && <div style={{ marginLeft: 36, borderTop: `1px solid ${C.grey03}` }} />}
            <div className="grid items-stretch" style={{ gridTemplateColumns: DETAIL_GRID_COLUMNS }}>
              <div className="pl-9 py-4 relative flex items-center" style={{ minWidth: 0, gap: 8 }}>
                {/* hardhat icon centered in 36px slot — matches by-project main row's 36px hardhat slot */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 36 }}>
                  <HardHat className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PROJECT_COLORS[pr.p] || C.grey05 }} />
                </div>
                <span className="truncate block tt-project-name" style={{ ...T.metaPrimary, color: C.textSecondary, minWidth: 0, flex: 1, cursor: "pointer" }}>{pr.p}</span>
              </div>
              <div
                className="flex items-center justify-end pr-4 w-full h-full transition-colors duration-150"
                style={{ ...T.metaPrimary, color: C.textSecondary, minWidth: 0, background: hoverCol === "total" ? C.grey03 : "transparent" }}
                onMouseEnter={() => setHoverCol("total")}
                onMouseLeave={() => setHoverCol(null)}
              >{computeWeekTotal([pr])}</div>
              {pr.days.map((d, i) => {
                const cellKey = `${keyPrefix}-${pi}-${i}`;
                const justSaved = cellKey === savedCellKey;
                return (
                <div
                  key={i}
                  className="flex items-stretch justify-end w-full h-full transition-colors duration-150"
                  style={{ minWidth: 0, background: justSaved ? C.lightMint : (hoverCol === i ? C.grey03 : "transparent") }}
                  onMouseEnter={() => setHoverCol(i)}
                  onMouseLeave={() => setHoverCol(null)}
                ><DetailCell d={d} project={pr.p} dateLabel={dayLabels[i]} onSetClockOut={onSetClockOut} onToast={onToast} /></div>
                );
              })}
            </div>
          </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
function ProjectDetail({ rows, dayLabels, onSetClockOut, onToast, hoverCol, setHoverCol, keyPrefix, savedCellKey }) {
  const sortedRows = [...rows].sort((a, b) => twoWordName(a.member).localeCompare(twoWordName(b.member)));
  return (
    <div style={{ background: C.grey01 }}>
      <div style={{ background: C.grey02 }}>
        {sortedRows.map((r, ri) => {
          const mi2 = rows.indexOf(r);
          // Plain object (not useRef, since this is inside a loop) - React
          // accepts any object with a `.current` property as a ref, and
          // since it's created and attached within the same render pass,
          // it's populated correctly before any hover can occur.
          const memberTextRef = { current: null };
          return (
          <React.Fragment key={ri}>
            {ri > 0 && <div style={{ marginLeft: 36, borderTop: `1px solid ${C.grey03}` }} />}
            <div className="grid items-stretch" style={{ gridTemplateColumns: DETAIL_GRID_COLUMNS }}>
              <div className="flex items-center pl-9 py-4 relative" style={{ minWidth: 0, gap: 8 }}>
                {/* 24px avatar centered in 36px slot — matches the 36px avatar slot in the main member row */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 36 }}>
                  <Avatar name={r.member} size={24} />
                </div>
                {/* 84px: pl-9 (36px) + 36px slot + 8px gap */}
                <TTooltip label={r.member} align="left" leftOffset={80} measureRef={memberTextRef} className="flex items-center min-w-0" style={{ flex: "1 1 auto", alignSelf: "stretch" }}>
                  <span ref={memberTextRef} className="truncate block w-full" style={{ ...T.metaPrimary, color: C.textSecondary }}>{twoWordName(r.member)}</span>
                </TTooltip>
              </div>
              <div
                className="flex items-center justify-end pr-4 w-full h-full transition-colors duration-150"
                style={{ ...T.metaPrimary, color: C.textSecondary, minWidth: 0, background: hoverCol === "total" ? C.grey03 : "transparent" }}
                onMouseEnter={() => setHoverCol("total")}
                onMouseLeave={() => setHoverCol(null)}
              >{computeWeekTotal([r.pr])}</div>
              {r.pr.days.map((d, i) => {
                const cellKey = `${keyPrefix}-${mi2}-0-${i}`;
                const justSaved = cellKey === savedCellKey;
                return (
                <div
                  key={i}
                  className="flex items-stretch justify-end w-full h-full transition-colors duration-150"
                  style={{ minWidth: 0, background: justSaved ? C.lightMint : (hoverCol === i ? C.grey03 : "transparent") }}
                  onMouseEnter={() => setHoverCol(i)}
                  onMouseLeave={() => setHoverCol(null)}
                ><DetailCell d={d} project={r.pr.p} member={r.member} dateLabel={dayLabels[i]} onSetClockOut={onSetClockOut} onToast={onToast} /></div>
                );
              })}
            </div>
          </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function TimesheetPage() {
  // Demo scenario dropdown (above the header) - lets you preview how the
  // metric tiles and table look at different amounts of logged data.
  // Rebuilding the world here, synchronously, before anything below reads
  // teams/hoursData/etc., means every downstream component just sees the
  // right values on this render - no extra plumbing needed.
  const [scenario, setScenario] = useState(SCENARIOS[0].id);
  const scenarioCfg = SCENARIO_CONFIG[scenario] || SCENARIO_CONFIG[SCENARIOS[0].id];
  applyWorldScenario(scenarioCfg.daysWithData, scenarioCfg.burnMode, scenarioCfg.laborMode, scenarioCfg.teamMode);

  const [group, setGroup] = useState("member");
  const [hoverGroup, setHoverGroup] = useState(null); // "member" | "project" | null - hover feedback for the inactive toggle side
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [teamRowsExpanded, setTeamRowsExpanded] = useState({});
  const [calOpen, setCalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [rangeMode, setRangeMode] = useState("this-week"); // 'last-week' | 'this-week' | 'custom'
  const [rangeLabel, setRangeLabel] = useState(labelForRange("this-week", THIS_WEEK_START, THIS_WEEK_END));
  const [selStart, setSelStart] = useState(THIS_WEEK_START);
  const [selEnd, setSelEnd] = useState(THIS_WEEK_END);
  const [resolved, setResolved] = useState({});
  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  // The cell (same key format as `resolved`) whose clock-in/clock-out was
  // just saved - highlighted in "secondary green mild" for as long as the
  // save toast is showing, then cleared together with it so the two never
  // drift out of sync.
  const [savedCellKey, setSavedCellKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [hoverCol, setHoverCol] = useState(null);
  // How many rows are currently loaded per team (member or project list
  // alike) - starts at TEAM_PAGE_SIZE and grows by TEAM_PAGE_SIZE each time
  // the scroll sentinel fires, replacing the old page-number pagination.
  const [visibleCountByTeam, setVisibleCountByTeam] = useState({});
  const [loadingMoreByTeam, setLoadingMoreByTeam] = useState({});
  // Holds each team's scrollable list container DOM node, keyed by teamKey
  // (set via a callback ref, not useState/useRef-per-team, since the
  // number of teams can change with search/group) - passed to
  // TeamScrollFooter as the IntersectionObserver's scroll root so each
  // team's infinite-scroll trigger fires off its own list, not the page.
  const scrollContainerRefs = useRef({});
  const TEAM_PAGE_SIZE = 8;
  // Fake a brief "loading" beat before revealing the next batch, matching
  // the felt experience of an infinite-scroll list backed by a real API,
  // rather than the next 10 rows just snapping in instantly.
  function loadMoreForTeam(teamKey, totalCount) {
    setVisibleCountByTeam((prev) => {
      const current = prev[teamKey] || TEAM_PAGE_SIZE;
      if (loadingMoreByTeam[teamKey] || current >= totalCount) return prev;
      setLoadingMoreByTeam((l) => ({ ...l, [teamKey]: true }));
      setTimeout(() => {
        setVisibleCountByTeam((p2) => ({ ...p2, [teamKey]: Math.min((p2[teamKey] || TEAM_PAGE_SIZE) + TEAM_PAGE_SIZE, totalCount) }));
        setLoadingMoreByTeam((l) => ({ ...l, [teamKey]: false }));
      }, 500);
      return prev;
    });
  }

  // Reset all per-row and per-cell state whenever the scenario changes so
  // stale clock-out overrides, expanded detail panels, and scroll positions
  // from the previous scenario never bleed into the freshly generated data.
  useEffect(() => {
    setResolved({});
    setSavedCellKey(null);
    setExpanded({});
    setTeamRowsExpanded({});
    setVisibleCountByTeam({});
    setLoadingMoreByTeam({});
  }, [scenario]);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => { setToast(""); setSavedCellKey(null); }, 2500); return () => clearTimeout(t); } }, [toast]);

  // Filtering (or switching by member/by project) can leave a team on a
  // page that no longer exists - reset back to page 1 whenever either
  // changes, rather than showing an empty page.
  useEffect(() => { setVisibleCountByTeam({}); setLoadingMoreByTeam({}); }, [search, group]);
  // Which teams' row lists actually need a scrollbar right now (see
  // TEAM_PAGE_SIZE - normally none do, by design). Tracked per team, not
  // just as one global yes/no, because a team that's genuinely scrolling
  // already gets its own real scrollbar's width taken out of its content
  // automatically - giving it *another* artificial reduction on top would
  // double-count and make it narrower than the header, not match it.
  // Only teams that AREN'T scrolling themselves (while some other team
  // is, and the header has been widened to match) get the artificial
  // SCROLLBAR_RESERVE padding below, so every team's columns land on the
  // same pixel widths as the header regardless of which one actually
  // owns the visible scrollbar.
  const [scrollingTeams, setScrollingTeams] = useState({});
  useEffect(() => {
    const next = {};
    Object.entries(scrollContainerRefs.current).forEach(([key, el]) => {
      if (el) next[key] = el.scrollHeight > el.clientHeight;
    });
    setScrollingTeams(next);
  }, [visibleCountByTeam, group, search, teamRowsExpanded, expanded, loading, tableLoading]);
  const needsScrollReserve = Object.values(scrollingTeams).some(Boolean);

  function toggle(id) { setExpanded((e) => ({ ...e, [id]: !e[id] })); }
  // Expands or collapses the detail panel for every member/project row within
  // a team at once (the team's own row list always stays visible - only the
  // individual rows' detail panels toggle).
  function toggleTeamRows(teamKey, ids) {
    const willExpand = !teamRowsExpanded[teamKey];
    setTeamRowsExpanded((t) => ({ ...t, [teamKey]: willExpand }));
    setExpanded((exp) => {
      const next = { ...exp };
      ids.forEach((id) => { next[id] = willExpand; });
      return next;
    });
  }
  function resolvedProjectsFor(projectEntries, keyPrefix) {
    return projectEntries.map((pr, pi) => ({ ...pr, days: pr.days.map((d, di) => {
      const key = `${keyPrefix}-${pi}-${di}`;
      // Use the recomputed status from dayFromTasks rather than assuming
      // "ok" - a task-level edit almost always resolves to "ok" (the
      // task just got completed), but staying derived keeps this correct
      // even in an edge case where it doesn't.
      return resolved[key] ? { s: resolved[key].s || "ok", v: resolved[key].v, clockIn: resolved[key].clockIn, clockOut: resolved[key].clockOut, tasks: resolved[key].tasks } : d;
    }) }));
  }
  function saveClockOut(key, result) {
    setResolved((r) => ({ ...r, [key]: result }));
    setSavedCellKey(key);
    setToast(result.s === "ok" ? "Missing time successfully set." : `Clock-out saved - ${result.duration} logged.`);
  }

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // Switches the visible date range: the row data (crew, project, task, and
  // date columns can all differ week to week) gets replaced behind a
  // data-level skeleton - no layout-shifting slide/translate animation, so
  // there's nothing pushing content outside the table and causing a
  // horizontal scrollbar mid-transition.
  async function switchRange(newStart, newEnd, newLabel, newMode) {
    setCalOpen(false);
    if (dateVal(newStart) === dateVal(selStart) && dateVal(newEnd) === dateVal(selEnd)) return;

    setExpanded({});
    setTableLoading(true);
    setSelStart(newStart);
    setSelEnd(newEnd);
    setRangeLabel(newLabel);
    setRangeMode(newMode);

    await wait(4000);
    setTableLoading(false);
  }

  // Shifts the visible range one week back/forward.
  function shiftRange(direction) {
    const days = direction * 7;
    const s = addDays(selStart, days), e = addDays(selEnd, days);
    const mode = modeForRange(s, e);
    switchRange(s, e, labelForRange(mode, s, e), mode);
  }

  // When a Burn Rate / Labor Projections scenario is active, visibleProjectNames
  // narrows the table down to just the projects that scenario is demonstrating -
  // so the table visibly matches the amount of data shown in the panel above it.
  const filteredTeams = teams
    .map((team) => ({
      ...team,
      members: team.members
        .map((m) => ({ ...m, projects: visibleProjectNames ? m.projects.filter((pr) => visibleProjectNames.has(pr.p)) : m.projects }))
        .filter((m) => m.projects.length && memberMatches(m, search)),
    }))
    .filter((t) => t.members.length);

  const projectGroups = useMemo(() => {
    return ["Team A - Field Crew", "Team B - Interiors"].map((teamName) => {
      const teamProjects = projects.filter((p) => p.team === teamName && (!visibleProjectNames || visibleProjectNames.has(p.name)));
      const rows = teamProjects.map((p) => {
        const allMembers = [];
        teams.forEach((team) => team.members.forEach((m) => {
          const relevant = m.projects.filter((pr) => pr.p === p.name);
          if (relevant.length) allMembers.push({ name: m.name, projects: relevant });
        }));
        return { ...p, allMembers };
      }).filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.allMembers.some((m) => memberMatches(m, search)));
      return { teamName, rows };
    }).filter((g) => g.rows.length);
  }, [search, scenario]);

  const skeletonGroups = group === "member"
    ? filteredTeams.map((t) => ({ header: t.name, rowCount: Math.min(t.members.length, TEAM_PAGE_SIZE) }))
    : projectGroups.map((g) => ({ header: g.teamName, rowCount: Math.min(g.rows.length, TEAM_PAGE_SIZE) }));

  // The table's day-of-week headers (and every detail panel built from
  // them) always reflect whichever week is currently selected, instead of
  // a fixed set of dates - this is what keeps the filter and the table in
  // sync when an older week is picked from the date dropdown.
  const dayDates = useMemo(() => getDayDates(selStart), [selStart]);
  const dayLabels = useMemo(() => getDayLabels(selStart), [selStart]);

  // Disable "next" whenever advancing another week would move past the most
  // recent week we have data for; re-enables automatically once the person
  // navigates back within range.
  const nextRangeDisabled = dateVal(addDays(selEnd, 7)) > dateVal(THIS_WEEK_END);
  const NAV_SIZE = 48;

  return (
    <div className="mx-auto max-w-5xl p-6" style={{ background: C.white }}>
      <TimeInputSelectionStyle />
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <label className="flex items-center gap-2" style={{ fontSize: 12, fontWeight: 500, color: C.grey05 }}>
          Demo scenario
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            style={{
              fontSize: 13, fontWeight: 500, color: C.textPrimary, background: C.grey02,
              border: `1px solid ${C.grey03}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer",
            }}
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-start justify-between" style={{ marginBottom: 0, paddingBottom: 16, borderBottom: `1px solid ${C.grey03}` }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: "32px", color: C.textSecondary }}>Time</h1>
          <p className="flex items-center gap-1.5" style={{ fontSize: 14, fontWeight: 400, color: C.textSecondary, margin: 0, marginTop: 8 }}>
            <span>Track project hours and upcoming work for</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.brandDark, flexShrink: 0, display: "inline-block" }} />
            <span>Week ending {CURRENT_WEEK_RANGE.split(" - ")[1]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="tt-icon-btn flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.grey03}`, background: C.white, color: C.textSecondary }}
          ><Search className="w-4 h-4" /></button>
          <AppButton kind="filled" className="gap-2" style={T.button}><Plus className="w-4 h-4" />New Task</AppButton>
        </div>
      </div>
      <div style={{ marginTop: 16, marginBottom: 40 }}>{loading ? <SkeletonMetricsRow /> : <InsightsMetricsRow key={scenario} />}</div>

      {/* Filter row: date nav + search + export */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => shiftRange(-1)}
            className="tt-icon-btn flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{ width: NAV_SIZE, height: NAV_SIZE, borderRadius: 10, border: `1px solid ${C.grey03}`, background: C.white, color: C.textSecondary }}
          ><ChevronLeft className="w-4 h-4" /></button>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-xl shadow-none"
                style={calOpen
                  ? { ...T.secondaryBody, height: NAV_SIZE, color: C.textSecondary, borderColor: C.textPrimary, borderWidth: 1.5 }
                  : { ...T.secondaryBody, height: NAV_SIZE, color: C.textSecondary }}
              ><CalendarIcon className="w-4 h-4" />{rangeLabel}<ChevronDown className="w-3.5 h-3.5" style={{ color: C.grey05 }} /></Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="!p-0 shadow-none !w-fit !min-w-0">
              <WeekListContent
                currentStart={selStart}
                onSelect={(s, e, mode) => switchRange(s, e, labelForRange(mode, s, e), mode)}
              />
            </PopoverContent>
          </Popover>
          <button
            type="button"
            aria-label="Next week"
            disabled={nextRangeDisabled}
            onClick={() => { if (!nextRangeDisabled) shiftRange(1); }}
            className="tt-icon-btn flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{
              width: NAV_SIZE, height: NAV_SIZE, borderRadius: 10,
              border: `1px solid ${C.grey03}`, background: C.white,
              color: nextRangeDisabled ? C.grey04 : C.textSecondary,
              opacity: nextRangeDisabled ? 0.5 : 1,
              cursor: nextRangeDisabled ? "not-allowed" : "pointer",
            }}
          ><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative" style={{ width: 260 }}>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: C.grey05 }} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project or member..." className="pl-9 shadow-none" style={{ ...T.secondaryBody, height: NAV_SIZE }} />
          </div>

          <Popover open={exportOpen} onOpenChange={setExportOpen}>
            <PopoverTrigger asChild>
              <AppButton
                kind="filled"
                disabled={exporting}
                className="gap-2"
                style={{ ...T.button, height: NAV_SIZE, minWidth: 100 }}
              >
                {exporting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Export</span><ChevronDown className="w-4 h-4" /></>
                }
              </AppButton>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 shadow-none" style={{ padding: 0, width: 220, minWidth: 220, maxWidth: 220 }}>
              <WeekListContent
                currentStart={selStart}
                onSelect={(s, e, mode) => {
                  switchRange(s, e, labelForRange(mode, s, e), mode);
                  setExportOpen(false);
                  setExporting(true);
                  setTimeout(() => {
                    setExporting(false);
                    setToast("Export successful.");
                  }, 5000);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tab row: By Member / By Project — standalone, own borderBottom */}
      <div className="flex items-end gap-2" style={{ borderTop: `1px solid ${C.grey03}`, borderBottom: `1.5px solid ${C.grey03}`, padding: "0 16px", marginBottom: 0 }}>
        {[
          { key: "member", label: "By Member", icon: User },
          { key: "project", label: "By Project", icon: Folder },
        ].map(({ key, icon: TabIcon, label }) => {
          const isActive = group === key;
          return (
            <button
              key={key}
              onClick={() => setGroup(key)}
              className="inline-flex items-center gap-2 transition-colors duration-150"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: "14px 12px 14px",
                borderBottom: `2px solid ${isActive ? C.brandDark : "transparent"}`,
                color: isActive ? C.brandDark : C.grey05,
                fontWeight: isActive ? 500 : 400, fontSize: 14,
                marginBottom: -1.5,
              }}
            >
              <TabIcon style={{ width: 16, height: 16, strokeWidth: 2 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Table — its own card container below the tabs */}
      <div style={{ marginTop: 16 }}>
        <Card className="shadow-none" style={{ borderColor: C.grey03, borderRadius: 8, overflow: "hidden" }}>
          <table className="w-full table-fixed border-collapse">
            <TableHeadRow hoverCol={hoverCol} dayDates={dayDates} needsScrollReserve={needsScrollReserve} />
            <tbody>
              {(loading || tableLoading) ? (
                <SkeletonGroupRows groups={skeletonGroups} />
              ) : (group === "member" ? filteredTeams.length === 0 : projectGroups.length === 0) ? (
                <tr>
                  <td colSpan={9} style={{ padding: "56px 16px" }}>
                    <EmptyPanelState icon={Clock} title="No time logged yet" subtitle="Time entries for this week will appear here once tracked" />
                  </td>
                </tr>
              ) : (
                <>
                  {group === "member" && filteredTeams.map((team, tiIdx) => {
                    const teamKey = `team-m-${tiIdx}`;
                    const teamExpanded = teamRowsExpanded[teamKey];
                    const memberIds = team.members.map((_, mi) => `m-${tiIdx}-${mi}`);
                    // Sort alphabetically by the displayed name (first
                    // name first, matching what's actually printed) so the
                    // list reads as sorted top-to-bottom, not just by a
                    // last name the person has to look for. Sorting is
                    // done on (member, originalIndex) pairs so ids/state
                    // keys stay tied to the member's original position,
                    // not the sorted display order.
                    const sortedMembers = team.members
                      .map((m, mi) => ({ m, mi, projectEntries: resolvedProjectsFor(m.projects, `m-${tiIdx}-${mi}`) }))
                      .sort((a, b) => twoWordName(a.m.name).localeCompare(twoWordName(b.m.name)));
                    const memberVisibleCount = Math.min(visibleCountByTeam[teamKey] || TEAM_PAGE_SIZE, sortedMembers.length);
                    const pagedMembers = sortedMembers.slice(0, memberVisibleCount);
                    return (
                    <React.Fragment key={tiIdx}>
                      <tr><td colSpan={9} className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleTeamRows(teamKey, memberIds)}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer"
                          style={{ background: C.grey02, ...T.metaSecondary, color: C.grey05, textTransform: "uppercase", letterSpacing: 0.4, border: "none" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="tt-team-icon flex items-center justify-center transition-colors duration-150" style={{ padding: 4, borderRadius: 6, marginLeft: -4 }}>
                              {teamExpanded ? <Minimize2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 flex-shrink-0" />}
                            </span>
                            {team.name}
                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey05, flexShrink: 0 }} />
                            <span>{sortedMembers.length} member{sortedMembers.length === 1 ? "" : "s"}</span>
                          </span>
                        </button>
                      </td></tr>
                      <tr><td colSpan={9} className="p-0">
                        <div
                          ref={(el) => { scrollContainerRefs.current[teamKey] = el; }}
                          className="overflow-y-auto"
                          style={{
                            maxHeight: TEAM_LIST_MAX_HEIGHT,
                            // See the scrollingTeams comment above - only
                            // reserve artificial space here when this
                            // specific team isn't already providing its
                            // own via a real scrollbar.
                            paddingRight: needsScrollReserve && !scrollingTeams[teamKey] ? SCROLLBAR_RESERVE : 0,
                            boxSizing: "border-box",
                          }}
                        >
                          {pagedMembers.map(({ m, mi, projectEntries }) => {
                            const id = `m-${tiIdx}-${mi}`;
                            // Plain object (not useRef, since this is
                            // inside a loop) - see the matching comment in
                            // ProjectDetail.
                            const memberTextRef = { current: null };
                            return (
                              <React.Fragment key={id}>
                                <div className="grid items-stretch border-t" style={{ gridTemplateColumns: DETAIL_GRID_COLUMNS, borderColor: C.grey03 }}>
                                  <div className="flex items-center px-4 py-4 relative" style={{ minWidth: 0, gap: 0 }}>
                                    <button onClick={() => toggle(id)} className="tt-icon-btn transition-colors duration-150 flex-shrink-0" style={{ color: C.grey04, padding: 4, borderRadius: 6, marginLeft: -8, marginRight: 4 }}>{expanded[id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                                    {/* 36px avatar centered in a 36px slot, same left-edge as detail row's 36px icon-slot (pl-10 = 40px offset shared) */}
                                    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 36, marginRight: 8 }}>
                                      <Avatar name={m.name} size={36} />
                                    </div>
                                    {/* 84px: px-4 (16px) + chevron net (16px) + avatar slot (36px) + gap (8px) */}
                                    <TTooltip label={m.name} align="left" leftOffset={80} measureRef={memberTextRef} className="flex items-center min-w-0" style={{ flex: "1 1 auto", alignSelf: "stretch" }}>
                                      <div className="flex flex-col justify-center min-w-0" style={{ gap: 2 }}>
                                        <span ref={memberTextRef} className="truncate block w-full" style={{ ...T.labelSmall, color: C.textSecondary }}>{twoWordName(m.name)}</span>
                                        <span style={{ fontSize: 11, color: C.grey05, lineHeight: "14px" }}>{projectEntries.length} project{projectEntries.length === 1 ? "" : "s"}</span>
                                      </div>
                                    </TTooltip>
                                  </div>
                                  <div
                                    className="flex items-center justify-end pr-4 w-full h-full transition-colors duration-150"
                                    style={{ ...T.secondaryBody, color: C.textSecondary, minWidth: 0, fontWeight: 700, background: hoverCol === "total" ? C.grey03 : "transparent" }}
                                    onMouseEnter={() => setHoverCol("total")}
                                    onMouseLeave={() => setHoverCol(null)}
                                  >{computeWeekTotal(projectEntries)}</div>
                                  {dayLabels.map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-end pr-3 w-full h-full transition-colors duration-150"
                                      style={{ ...T.secondaryBody, minWidth: 0, background: hoverCol === i ? C.grey03 : "transparent" }}
                                      onMouseEnter={() => setHoverCol(i)}
                                      onMouseLeave={() => setHoverCol(null)}
                                    ><SummaryCell cell={computeDayCell(projectEntries, i)} bold={hoverCol === i} /></div>
                                  ))}
                                </div>
                                {expanded[id] && <MemberDetail projectEntries={projectEntries} dayLabels={dayLabels} onSetClockOut={(info, result) => saveClockOut(`${id}-${projectEntries.findIndex((pr) => pr.p === info.project)}-${dayLabels.indexOf(info.dateLabel)}`, result)} onToast={setToast} hoverCol={hoverCol} setHoverCol={setHoverCol} keyPrefix={id} savedCellKey={savedCellKey} />}
                              </React.Fragment>
                            );
                          })}
                          <TeamScrollFooter
                            shownCount={memberVisibleCount}
                            totalCount={sortedMembers.length}
                            itemLabel="members"
                            hasMore={memberVisibleCount < sortedMembers.length}
                            loadingMore={!!loadingMoreByTeam[teamKey]}
                            onLoadMore={() => loadMoreForTeam(teamKey, sortedMembers.length)}
                            scrollRootRef={{ current: scrollContainerRefs.current[teamKey] }}
                          />
                        </div>
                      </td></tr>
                    </React.Fragment>
                    );
                  })}

                  {group === "project" && projectGroups.map((pg, tIdx) => {
                    const teamKey = `team-p-${tIdx}`;
                    const teamExpanded = teamRowsExpanded[teamKey];
                    const projectIds = pg.rows.map((_, pi) => `p-${tIdx}-${pi}`);
                    const sortedRows = pg.rows
                      .map((p, pi) => {
                        const id = `p-${tIdx}-${pi}`;
                        const resolvedMembers = p.allMembers.map((m, mi2) => ({ ...m, projects: resolvedProjectsFor(m.projects, `${id}-${mi2}`) }));
                        const allProjectEntries = resolvedMembers.flatMap((m) => m.projects);
                        const rows = resolvedMembers.map((m) => ({ member: m.name, pr: m.projects[0] }));
                        return { p, pi, id, resolvedMembers, allProjectEntries, rows };
                      })
                      // Sort alphabetically by project name.
                      .sort((a, b) => a.p.name.localeCompare(b.p.name));
                    const projectVisibleCount = Math.min(visibleCountByTeam[teamKey] || TEAM_PAGE_SIZE, sortedRows.length);
                    const pagedRows = sortedRows.slice(0, projectVisibleCount);
                    const groupMemberCount = new Set(sortedRows.flatMap(({ resolvedMembers }) => resolvedMembers.map((m) => m.name))).size;
                    return (
                    <React.Fragment key={tIdx}>
                      <tr><td colSpan={9} className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleTeamRows(teamKey, projectIds)}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer"
                          style={{ background: C.grey02, ...T.metaSecondary, color: C.grey05, textTransform: "uppercase", letterSpacing: 0.4, border: "none" }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="tt-team-icon flex items-center justify-center transition-colors duration-150" style={{ padding: 4, borderRadius: 6, marginLeft: -4 }}>
                              {teamExpanded ? <Minimize2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 flex-shrink-0" />}
                            </span>
                            {pg.teamName}
                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.grey05, flexShrink: 0 }} />
                            <span>{groupMemberCount} member{groupMemberCount === 1 ? "" : "s"}</span>
                          </span>
                        </button>
                      </td></tr>
                      <tr><td colSpan={9} className="p-0">
                        <div
                          ref={(el) => { scrollContainerRefs.current[teamKey] = el; }}
                          className="overflow-y-auto"
                          style={{
                            maxHeight: TEAM_LIST_MAX_HEIGHT,
                            paddingRight: needsScrollReserve && !scrollingTeams[teamKey] ? SCROLLBAR_RESERVE : 0,
                            boxSizing: "border-box",
                          }}
                        >
                          {pagedRows.map(({ p, pi, id, resolvedMembers, allProjectEntries, rows }) => {
                            return (
                              <React.Fragment key={id}>
                                <div className="grid items-stretch border-t" style={{ gridTemplateColumns: DETAIL_GRID_COLUMNS, borderColor: C.grey03 }}>
                                  <div className="flex items-center px-4 py-4 relative" style={{ minWidth: 0, gap: 0 }}>
                                    <button onClick={() => toggle(id)} className="tt-icon-btn transition-colors duration-150 flex-shrink-0" style={{ color: C.grey04, padding: 4, borderRadius: 6, marginLeft: -8, marginRight: 4 }}>{expanded[id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                                    {/* hardhat icon centered in a 36px slot — same slot as the detail row's 36px avatar */}
                                    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 36, marginRight: 8 }}>
                                      <HardHat className="w-4 h-4 flex-shrink-0" style={{ color: PROJECT_COLORS[p.name] || C.grey05 }} />
                                    </div>
                                    <TTooltip label={p.name} align="left" leftOffset={80} className="flex items-center min-w-0" style={{ flex: "1 1 auto", alignSelf: "stretch" }}>
                                      <div className="flex flex-col justify-center min-w-0" style={{ gap: 2 }}>
                                        <span className="truncate block w-full" style={{ ...T.labelSmall, color: C.textSecondary }}>{p.name}</span>
                                        <span style={{ fontSize: 11, color: C.grey05, lineHeight: "14px" }}>{resolvedMembers.length} member{resolvedMembers.length === 1 ? "" : "s"}</span>
                                      </div>
                                    </TTooltip>
                                  </div>
                                  <div
                                    className="flex items-center justify-end pr-4 w-full h-full transition-colors duration-150"
                                    style={{ ...T.secondaryBody, color: C.textSecondary, minWidth: 0, fontWeight: 700, background: hoverCol === "total" ? C.grey03 : "transparent" }}
                                    onMouseEnter={() => setHoverCol("total")}
                                    onMouseLeave={() => setHoverCol(null)}
                                  >{computeWeekTotal(allProjectEntries)}</div>
                                  {dayLabels.map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-end pr-3 w-full h-full transition-colors duration-150"
                                      style={{ ...T.secondaryBody, minWidth: 0, background: hoverCol === i ? C.grey03 : "transparent" }}
                                      onMouseEnter={() => setHoverCol(i)}
                                      onMouseLeave={() => setHoverCol(null)}
                                    ><SummaryCell cell={computeDayCell(allProjectEntries, i)} bold={hoverCol === i} /></div>
                                  ))}
                                </div>
                                {expanded[id] && <ProjectDetail rows={rows} dayLabels={dayLabels} onSetClockOut={(info, result) => {
                                  const mi2 = resolvedMembers.findIndex((m) => m.name === info.member);
                                  const pi2 = mi2 >= 0 ? resolvedMembers[mi2].projects.findIndex((pr) => pr.p === info.project) : -1;
                                  saveClockOut(`${id}-${mi2}-${pi2}-${dayLabels.indexOf(info.dateLabel)}`, result);
                                }} onToast={setToast} hoverCol={hoverCol} setHoverCol={setHoverCol} keyPrefix={id} savedCellKey={savedCellKey} />}
                              </React.Fragment>
                            );
                          })}
                          <TeamScrollFooter
                            shownCount={projectVisibleCount}
                            totalCount={sortedRows.length}
                            itemLabel="projects"
                            hasMore={projectVisibleCount < sortedRows.length}
                            loadingMore={!!loadingMoreByTeam[teamKey]}
                            onLoadMore={() => loadMoreForTeam(teamKey, sortedRows.length)}
                            scrollRootRef={{ current: scrollContainerRefs.current[teamKey] }}
                          />
                        </div>
                      </td></tr>
                    </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-lg px-4 py-3" style={{ background: C.textPrimary, color: C.white, ...T.secondaryBody }}>{toast}</div>
      )}
    </div>
  );
}
