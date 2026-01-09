import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5,
    confidenceThreshold: 0.75,
    alertNotifications: true,
    dataRetentionDays: 90,
    apiEndpoint: 'http://localhost:8000/api',
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure system parameters and preferences
        </p>
      </div>

      {/* Real-time Monitoring */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Real-time Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto Refresh</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically update dashboard data
              </p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, autoRefresh: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Refresh Interval</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data refresh interval in seconds
              </p>
            </div>
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.refreshInterval}
              onChange={(e) => setSettings(s => ({ ...s, refreshInterval: parseInt(e.target.value) || 5 }))}
              className="w-20 text-center font-mono"
              disabled={!settings.autoRefresh}
            />
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Model Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Confidence Threshold</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              Minimum confidence level to trigger fault alerts
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings(s => ({ ...s, confidenceThreshold: parseFloat(e.target.value) || 0.75 }))}
                className="w-24 font-mono"
              />
              <span className="text-sm text-muted-foreground">
                ({(settings.confidenceThreshold * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alert Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable notifications for detected faults
              </p>
            </div>
            <Switch
              checked={settings.alertNotifications}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, alertNotifications: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">Data Management</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Data Retention Period</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              Number of days to keep historical data
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={7}
                max={365}
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings(s => ({ ...s, dataRetentionDays: parseInt(e.target.value) || 90 }))}
                className="w-24 font-mono"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="industrial-card">
        <h3 className="text-sm font-medium mb-4">API Configuration</h3>
        <div>
          <label className="text-sm font-medium">Backend Endpoint</label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            URL of the ML inference API server
          </p>
          <Input
            type="url"
            value={settings.apiEndpoint}
            onChange={(e) => setSettings(s => ({ ...s, apiEndpoint: e.target.value }))}
            className="font-mono text-sm"
            placeholder="http://localhost:8000/api"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button>Save Settings</Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Changes to API configuration require a page refresh to take effect.
      </p>
    </div>
  );
}
