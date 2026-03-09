"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import type { Lead } from "@/types/database";

interface PipelineCardProps {
  lead: Lead;
}

export function PipelineCard({ lead }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <Link href={`/clinic/${lead.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <p className="font-medium text-foreground truncate text-sm">{lead.clinic_name}</p>
        <p className="text-xs text-muted-foreground truncate">{lead.doctor_name}</p>
        {lead.city && <p className="text-xs text-muted-foreground mt-1">{lead.city}</p>}
      </Link>
    </div>
  );
}
