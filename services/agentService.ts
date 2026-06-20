import { get } from './authService';
import { AgentOption } from '../types';

type RawAgentRecord = {
  // New API format fields
  id?: string;
  machineName?: string;
  currentUser?: string;
  macAddress?: string;
  operatingSystem?: string;
  osVersion?: string;
  agentVersion?: string;
  registeredAt?: string;
  
  // Legacy API format fields
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

const AGENT_ENDPOINTS = ['agent', 'Agent/GetAgentList', 'Agent', 'Agents'] as const;
const UNAVAILABLE_STATUSES = new Set(['inactive', 'disabled', 'offline', 'unavailable']);

const normalizeAgent = (agent: RawAgentRecord): AgentOption | null => {
  const id = agent.id ?? agent.agentId;
  if (!id) {
    return null;
  }

  // For new API format (has machineName)
  if (agent.machineName) {
    return {
      id,
      name: `${agent.machineName} (${agent.currentUser || 'System'})`,
      status: 'Active',
      isActive: true,
      isAvailable: true,
    };
  }

  // For legacy API formats
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
    // Try to extract from nested structures - data is the most common for API responses
    const nestedList = record.data ?? record.items ?? record.value ?? record.agents;
    if (Array.isArray(nestedList)) {
      return nestedList as RawAgentRecord[];
    }
  }

  return [];
};

export async function getAvailableAgents(): Promise<AgentOption[]> {
  for (const endpoint of AGENT_ENDPOINTS) {
    try {
      console.log(`[Agent Service] Fetching agents from: ${endpoint}`);
      const response = await get(endpoint);
      console.log(`[Agent Service] Response from ${endpoint}:`, response);
      
      const agents = extractAgentList(response)
        .map(normalizeAgent)
        .filter((agent): agent is AgentOption => !!agent);
      
      console.log(`[Agent Service] Normalized agents from ${endpoint}:`, agents);

      if (agents.length > 0) {
        console.log(`[Agent Service] Successfully loaded ${agents.length} agents from ${endpoint}`);
        return agents;
      }
    } catch (error) {
      console.error(`[Agent Service] Failed to fetch from ${endpoint}:`, error);
      continue;
    }
  }

  console.warn('[Agent Service] No agents found from any endpoint');
  return [];
}