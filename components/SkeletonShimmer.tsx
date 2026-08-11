"use client";

import { motion } from "framer-motion";

const WIDTHS = ["92%", "78%", "88%", "65%", "84%", "40%"];

export default function SkeletonShimmer() {
  return (
    <div className="space-y-3">
      {WIDTHS.map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="h-3.5 rounded-full shimmer-bg animate-shimmer"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}
