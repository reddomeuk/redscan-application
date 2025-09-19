import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Step6InviteTeam({ data, updateData, nextStep, prevStep }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  
  const seatLimit = data.plan === 'free' ? 3 : data.plan === 'pro_trial' ? data.seats : 100;
  const seatsUsed = 1 + data.invites.length; // 1 for the current user

  const handleAddInvite = () => {
    if (seatsUsed >= seatLimit) {
      toast.error("Seat limit reached", { 
        description: `Your ${data.plan} plan allows for ${seatLimit} users total.` 
      });
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (data.invites.some(invite => invite.email === email)) {
      toast.error("This email has already been invited");
      return;
    }

    if (email === data.user?.email) {
      toast.error("You can't invite yourself");
      return;
    }

    updateData({ 
      invites: [...data.invites, { email, role }] 
    });
    setEmail('');
    setRole('viewer');
    toast.success("Team member added to invite list");
  };
  
  const removeInvite = (emailToRemove) => {
    updateData({ 
      invites: data.invites.filter(invite => invite.email !== emailToRemove) 
    });
    toast.success("Invitation removed");
  };

  const getRoleBadge = (userRole) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400',
      analyst: 'bg-blue-500/20 text-blue-400',
      viewer: 'bg-gray-500/20 text-gray-400'
    };
    return <Badge className={colors[userRole]}>{userRole.toUpperCase()}</Badge>;
  };

  const bulkInvite = () => {
    const emails = prompt("Enter comma-separated email addresses:")?.split(',').map(e => e.trim()).filter(Boolean);
    if (emails) {
      const validEmails = emails.filter(email => email.includes('@') && !data.invites.some(invite => invite.email === email));
      const newInvites = validEmails.slice(0, seatLimit - seatsUsed).map(email => ({ email, role: 'viewer' }));
      updateData({ invites: [...data.invites, ...newInvites] });
      toast.success(`Added ${newInvites.length} invitations`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Invite your team</h2>
      <p className="text-slate-400 mb-8">
        Add team members now or invite them later from Settings → Users.
      </p>
      
      <div className="space-y-6">
        {/* Add invitation form */}
        <div className="bg-[#1E1E1E]/50 p-4 rounded-lg border border-[#8A8A8A]/20">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Team member's email</Label>
              <Input 
                id="inviteEmail"
                type="email"
                placeholder="colleague@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1E1E1E] border-[#8A8A8A]/20 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAddInvite()}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-[#1E1E1E] border-[#8A8A8A]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#8A8A8A]/20">
                  <SelectItem value="viewer" className="text-white">
                    Viewer - View reports and findings
                  </SelectItem>
                  <SelectItem value="analyst" className="text-white">
                    Analyst - Manage findings and run scans
                  </SelectItem>
                  <SelectItem value="admin" className="text-white">
                    Admin - Full access and user management
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddInvite}
                disabled={seatsUsed >= seatLimit}
                className="bg-[#B00020] hover:bg-[#8B0000]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Invitation
              </Button>
              <Button onClick={bulkInvite} variant="outline" size="sm">
                Bulk Add
              </Button>
            </div>
          </div>
        </div>

        {/* Seat usage indicator */}
        <div className="flex items-center justify-between p-3 bg-[#1E1E1E]/30 rounded-lg border border-[#8A8A8A]/10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Seats used:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${seatsUsed >= seatLimit ? 'text-red-400' : 'text-white'}`}>
              {seatsUsed} / {seatLimit}
            </span>
            {seatsUsed >= seatLimit && (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Current user */}
        <div className="space-y-3">
          <h3 className="text-white font-medium">Team Members</h3>
          
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-medium text-sm">
                  {data.user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">{data.user?.full_name}</div>
                <div className="text-slate-400 text-xs">{data.user?.email}</div>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">OWNER</Badge>
          </div>

          {/* Invited users */}
          {data.invites.map((invite, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#1E1E1E]/50 rounded-lg border border-[#8A8A8A]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-300 font-medium text-sm">
                    {invite.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-white text-sm">{invite.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleBadge(invite.role)}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeInvite(invite.email)}
                  className="h-6 w-6 text-slate-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {data.invites.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team invitations yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
          Continue to Finish
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        Invitations will be sent after you complete setup
      </p>
    </div>
  );
}