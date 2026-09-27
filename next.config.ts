import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't let `next dev` recreate AGENTS.md / CLAUDE.md at the project root
  agentRules: false,
};

export default nextConfig;
