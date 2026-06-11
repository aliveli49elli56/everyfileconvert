import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolById, getAllToolIds } from "@/lib/tools/registry";
import ToolPageClient from "./ToolPageClient";

interface Props {
  params: { toolId: string };
}

export async function generateStaticParams() {
  return getAllToolIds().map((toolId) => ({ toolId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolById(params.toolId);
  if (!tool) return {};
  return {
    title: `${tool.name} — Free Online Tool | EveryFileConvert`,
    description: tool.longDesc,
  };
}

export default function ToolPage({ params }: Props) {
  const tool = getToolById(params.toolId);
  if (!tool) notFound();
  // Only pass the string ID — the client resolves the full definition from the registry
  return <ToolPageClient toolId={params.toolId} />;
}
