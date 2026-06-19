import { get } from './authService';
import { AgentOption } from '../types';

type RawAgentRecord = {
  id?: string;
  agentId?: string;
  name?: string;
  agentName?: string;
  displayName?: string;
  status?: string | null;
  state?: string | null;
  isActive?: boolean | null;
  active?: boolean | null;
  enabled?: boolean | null;
  isAvailable?: boolean | null;
  available?: boolean | null;
  online?: boolean | null;
};

const AGENT_ENDPOINTS = ['Agent/GetAgentList', 'Agent', 'Agents'] as const;
const UNAVAILABLE_STATUSES = new Set(['inactive', 'disabled', 'offline', 'unavailable']);

const normalizeAgent = (agent: RawAgentRecord): AgentOption | null => {
  const id = agent.agentId ?? agent.id;
  if (!id) {
    return null;
  }

  const status = (agent.status ?? agent.state ?? 'Unknown').trim();
  const normalizedStatus = status.toLowerCase();
  const isActive = agent.isActive ?? agent.active ?? agent.enabled ?? !UNAVAILABLE_STATUSES.has(normalizedStatus);
  const isAvailable = agent.isAvailable ?? agent.available ?? agent.online ?? !UNAVAILABLE_STATUSES.has(normalizedStatus);

  return {
    id,
    name: agent.agentName ?? agent.displayName ?? agent.name ?? id,
    status,
    isActive,
    isAvailable,
  };
};

const extractAgentList = (payload: unknown): RawAgentRecord[] => {
  if (Array.isArray(payload)) {
    return payload as RawAgentRecord[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nestedList = record.items ?? record.data ?? record.value ?? record.agents;
    if (Array.isArray(nestedList)) {
      return nestedList as RawAgentRecord[];
    }
  }

  return [];
};

export async function getAvailableAgents(): Promise<AgentOption[]> {
  for (const endpoint of AGENT_ENDPOINTS) {
    try {
      const response = await get(endpoint);
      const agents = extractAgentList(response)
        .map(normalizeAgent)
        .filter((agent): agent is AgentOption => !!agent)
        .filter(agent => agent.isActive && agent.isAvailable);

      if (agents.length > 0) {
        return agents;
      }
    } catch {
      continue;
    }
  }

  return [];
}