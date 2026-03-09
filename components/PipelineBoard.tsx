"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { updateLeadStatus } from "@/app/actions/leads";
import { PIPELINE_STAGES, LEAD_STATUS_LABELS } from "@/types/database";
import type { Lead, LeadStatus } from "@/types/database";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineCard } from "./PipelineCard";

interface PipelineBoardProps {
  initialLeads: Lead[];
  repId: string | null;
}

export function PipelineBoard({ initialLeads, repId }: PipelineBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const leadsByStatus = useCallback(
    (status: LeadStatus) => leads.filter((l) => l.lead_status === status),
    [leads]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over?.id || !repId) return;
    const leadId = String(active.id);
    const newStatus = String(over.id) as LeadStatus;
    if (!PIPELINE_STAGES.includes(newStatus)) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.lead_status === newStatus) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l))
    );
    const { error } = await updateLeadStatus(leadId, newStatus, repId);
    if (error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...lead } : l))
      );
    }
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[400px]">
        {PIPELINE_STAGES.map((status) => (
          <PipelineColumn
            key={status}
            id={status}
            title={LEAD_STATUS_LABELS[status]}
            leads={leadsByStatus(status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? (
          <div className="rounded-button border border-border bg-card p-3 shadow-card w-[220px] opacity-95">
            <p className="font-medium text-foreground truncate">{activeLead.clinic_name}</p>
            <p className="text-xs text-muted-foreground truncate">{activeLead.doctor_name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
