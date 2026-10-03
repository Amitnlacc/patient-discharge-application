import React from "react";

const make = (paths) => ({ size = 18, className = "", ...rest }) =>
  React.createElement("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className, ...rest },
    paths.map((d, i) => d.startsWith("C:")
      ? React.createElement("circle", { key: i, cx: d.split(":")[1], cy: d.split(":")[2], r: d.split(":")[3] })
      : React.createElement("path", { key: i, d })));

export const Search      = make(["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M21 21l-4.3-4.3"]);
export const Plus        = make(["M12 5v14", "M5 12h14"]);
export const Printer     = make(["M6 9V2h12v7", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"]);
export const FileDown    = make(["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M12 12v6", "M9 15l3 3 3-3"]);
export const Save        = make(["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"]);
export const Trash2      = make(["M3 6h18", "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"]);
export const ChevronLeft = make(["M15 18l-6-6 6-6"]);
export const ChevronDown = make(["M6 9l6 6 6-6"]);
export const AlertCircle = make(["C:12:12:10", "M12 8v4", "M12 16h.01"]);
export const Check       = make(["M20 6L9 17l-5-5"]);
export const User        = make(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "C:12:7:4"]);
export const X           = make(["M18 6L6 18", "M6 6l12 12"]);
export const FileText    = make(["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h8", "M8 9h2"]);
export const Zap         = make(["M13 2L3 14h9l-1 8 10-12h-9l1-8z"]);
export const Pencil      = make(["M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"]);
export const Expand      = make(["M7 9l5-5 5 5", "M7 15l5 5 5-5"]);
export const Collapse    = make(["M7 4l5 5 5-5", "M7 20l5-5 5 5"]);
export const LogOut      = make(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]);
export const Loader      = make(["M12 2v4", "M12 18v4", "M4.9 4.9l2.9 2.9", "M16.2 16.2l2.9 2.9", "M2 12h4", "M18 12h4", "M4.9 19.1l2.9-2.9", "M16.2 7.8l2.9-2.9"]);
export const Calendar    = make(["M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]);
export const Mail        = make(["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M22 6l-10 7L2 6"]);
export const Lock        = make(["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 11V7a5 5 0 0 1 10 0v4"]);
export const Eye         = make(["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z", "C:12:12:3"]);
export const EyeOff      = make(["M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 5.1-5.9", "M9.9 4.2A9.8 9.8 0 0 1 12 4c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2", "M1 1l22 22"]);
