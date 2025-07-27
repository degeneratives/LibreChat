import React from 'react';
import { useAgentPanelContext, AgentPanelProvider } from '~/Providers';

function AgentPanelSwitchWithContext() {
  const { activePanel, setActivePanel } = useAgentPanelContext();
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">Agent Panel</h3>
      <p className="text-sm text-gray-600">Agent panel functionality coming soon...</p>
    </div>
  );
}

export default function AgentPanelSwitch() {
  return (
    <AgentPanelProvider>
      <AgentPanelSwitchWithContext />
    </AgentPanelProvider>
  );
}