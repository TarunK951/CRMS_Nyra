"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Lead, LeadStatus } from "@/types/database";
import { PipelineCard } from "./PipelineCard";

interface PipelineColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export function PipelineColumn({ id, title, leads }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex shrink-0 w-[260px] flex-col rounded-xl border border-border bg-muted/30 p-3 ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      <h3 className="mb-2 text-sm font-medium text-foreground">{title}</h3>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[80px]">
          {leads.map((lead) => (
            <PipelineCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
