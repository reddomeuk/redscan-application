import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Region, User, GeolocationAuditLog, Organization } from '@/api/entities';
import { Globe, MapPin, Plane, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const GeolocationPolicyCard = ({ organization, onUpdate }) => {
  const [regions, setRegions] = useState([]);
  const [policy, setPolicy] = useState(organization?.geolocation_policy || {
    default_allowed_regions: [],
    allow_vpn_proxies: true,
    trust_corporate_ips: []
  });

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (organization?.geolocation_policy) {
      setPolicy(organization.geolocation_policy);
    }
  }, [organization]);

  const loadRegions = async () => {
    try {
      const regionData = await Region.list();
      setRegions(regionData);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const handleRegionToggle = (regionCode, checked) => {
    const newRegions = checked
      ? [...policy.default_allowed_regions, regionCode]
      : policy.default_allowed_regions.filter(r => r !== regionCode);
    
    setPolicy({
      ...policy,
      default_allowed_regions: newRegions
    });
  };

  const handleCorporateIpsChange = (value) => {
    const cidrs = value.split('\n').filter(line => line.trim()).map(line => line.trim());
    setPolicy({
      ...policy,
      trust_corporate_ips: cidrs
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate({ geolocation_policy: policy });
      toast.success('Geolocation policy updated successfully');
    } catch (error) {
      toast.error('Failed to update geolocation policy');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Geolocation Access Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-slate-300 mb-3 block">Default Allowed Regions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regions.map(region => (
              <div key={region.code} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`region-${region.code}`}
                  checked={policy.default_allowed_regions.includes(region.code)}
                  onChange={(e) => handleRegionToggle(region.code, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800"
                />
                <Label htmlFor={`region-${region.code}`} className="text-sm text-slate-300 cursor-pointer">
                  {region.name} ({region.code})
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg">
          <Label className="text-white">
            <div>Allow VPN/Proxy Access</div>
            <div className="text-xs text-slate-400">Permit logins from VPN and proxy servers</div>
          </Label>
          <Switch
            checked={policy.allow_vpn_proxies}
            onCheckedChange={(checked) => setPolicy({...policy, allow_vpn_proxies: checked})}
          />
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Trusted Corporate IP Ranges (CIDR)</Label>
          <Textarea
            placeholder="10.0.0.0/8&#10;192.168.1.0/24&#10;203.0.113.0/24"
            value={policy.trust_corporate_ips?.join('\n') || ''}
            onChange={(e) => handleCorporateIpsChange(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white font-mono text-sm"
            rows={4}
          />
          <p className="text-xs text-slate-400 mt-2">
            One CIDR range per line. Logins from these IPs will bypass geolocation restrictions.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full bg-[var(--color-primary)] hover:bg-red-700">
          <Shield className="w-4 h-4 mr-2" />
          Save Geolocation Policy
        </Button>
      </CardContent>
    </Card>
  );
};

const UserGeolocationCard = ({ users, onUpdate }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [regions, setRegions] = useState([]);
  const [travelSettings, setTravelSettings] = useState({
    travel_mode: false,
    travel_regions: [],
    travel_start: '',
    travel_end: ''
  });

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedUser?.geolocation_settings) {
      setTravelSettings({
        travel_mode: selectedUser.geolocation_settings.travel_mode || false,
        travel_regions: selectedUser.geolocation_settings.travel_regions || [],
        travel_start: selectedUser.geolocation_settings.travel_start || '',
        travel_end: selectedUser.geolocation_settings.travel_end || ''
      });
    }
  }, [selectedUser]);

  const loadRegions = async () => {
    try {
      const regionData = await Region.list();
      setRegions(regionData);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleTravelPreset = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    
    setTravelSettings({
      ...travelSettings,
      travel_mode: true,
      travel_start: start.toISOString().split('T')[0],
      travel_end: end.toISOString().split('T')[0]
    });
  };

  const handleSaveTravelSettings = async () => {
    if (!selectedUser) return;
    
    try {
      await User.update(selectedUser.id, {
        geolocation_settings: {
          ...selectedUser.geolocation_settings,
          ...travelSettings
        }
      });
      toast.success('Travel settings updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update travel settings');
    }
  };

  const getTravelStatus = (user) => {
    const settings = user.geolocation_settings;
    if (!settings?.travel_mode) return { status: 'Inactive', color: 'text-slate-400' };
    
    const now = new Date();
    const start = new Date(settings.travel_start);
    const end = new Date(settings.travel_end);
    
    if (now >= start && now <= end) {
      return { status: 'Active', color: 'text-green-400' };
    }
    return { status: 'Scheduled', color: 'text-yellow-400' };
  };

  const getRegionPolicy = (user) => {
    if (user.geolocation_settings?.allowed_regions?.length > 0) {
      return { policy: 'Custom', color: 'text-blue-400' };
    }
    return { policy: 'Inherited', color: 'text-slate-400' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            User Geolocation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Region Policy</TableHead>
                <TableHead className="text-slate-300">Travel Mode</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 5).map(user => {
                const travel = getTravelStatus(user);
                const policy = getRegionPolicy(user);
                return (
                  <TableRow key={user.id} className="border-slate-700">
                    <TableCell className="text-white">{user.full_name}</TableCell>
                    <TableCell>
                      <Badge className={`bg-slate-500/20 ${policy.color}`}>
                        {policy.policy}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`bg-slate-500/20 ${travel.color}`}>
                        {travel.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserSelect(user)}
                        className="border-slate-600 text-slate-300"
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-orange-400" />
              Travel Mode: {selectedUser.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Enable Travel Mode</Label>
              <Switch
                checked={travelSettings.travel_mode}
                onCheckedChange={(checked) => setTravelSettings({...travelSettings, travel_mode: checked})}
              />
            </div>

            {travelSettings.travel_mode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Start Date</Label>
                    <Input
                      type="date"
                      value={travelSettings.travel_start}
                      onChange={(e) => setTravelSettings({...travelSettings, travel_start: e.target.value})}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">End Date</Label>
                    <Input
                      type="date"
                      value={travelSettings.travel_end}
                      onChange={(e) => setTravelSettings({...travelSettings, travel_end: e.target.value})}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Button size="sm" variant="outline" onClick={() => handleTravelPreset(7)}>
                    7 Days
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleTravelPreset(14)}>
                    14 Days
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleTravelPreset(30)}>
                    30 Days
                  </Button>
                </div>

                <div>
                  <Label className="text-slate-300 mb-3 block">Additional Travel Regions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {regions.map(region => (
                      <div key={region.code} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`travel-${region.code}`}
                          checked={travelSettings.travel_regions.includes(region.code)}
                          onChange={(e) => {
                            const newRegions = e.target.checked
                              ? [...travelSettings.travel_regions, region.code]
                              : travelSettings.travel_regions.filter(r => r !== region.code);
                            setTravelSettings({...travelSettings, travel_regions: newRegions});
                          }}
                          className="rounded border-slate-600 bg-slate-800"
                        />
                        <Label htmlFor={`travel-${region.code}`} className="text-xs text-slate-300">
                          {region.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSaveTravelSettings} className="w-full bg-orange-600 hover:bg-orange-700">
              Save Travel Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const GeolocationAuditCard = ({ auditLogs }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Geolocation Audit Log (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Time</TableHead>
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Location</TableHead>
              <TableHead className="text-slate-300">Decision</TableHead>
              <TableHead className="text-slate-300">Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.slice(0, 10).map(log => (
              <TableRow key={log.id} className="border-slate-700">
                <TableCell className="text-slate-400 text-xs">
                  {new Date(log.created_date).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-white text-sm">{log.user_email}</TableCell>
                <TableCell className="text-slate-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {log.geo_country_name} ({log.geo_country_code})
                  </div>
                </TableCell>
                <TableCell>
                  {log.decision === 'allowed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell className="text-slate-400 text-xs">{log.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { GeolocationPolicyCard, UserGeolocationCard, GeolocationAuditCard };

// Default export for backward compatibility
export default GeolocationPolicyCard;