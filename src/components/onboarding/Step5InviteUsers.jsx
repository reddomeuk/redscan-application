import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Step5InviteUsers({ data, updateData, finishOnboarding, prevStep, loading }) {
  const [email, setEmail] = useState('');
  
  const seatLimit = data.plan === 'pro_trial' ? 10 : 3;
  const seatsUsed = 1 + data.invites.length; // 1 for the current user

  const handleAddInvite = () => {
    if (seatsUsed >= seatLimit) {
      toast.error("Seat limit reached", { description: `Your selected plan allows for ${seatLimit} users.` });
      return;
    }
    if (email && !data.invites.includes(email)) {
      updateData({ invites: [...data.invites, email] });
      setEmail('');
    }
  };
  
  const removeInvite = (emailToRemove) => {
    updateData({ invites: data.invites.filter(e => e !== emailToRemove) });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Invite your team</h2>
      <p className="text-slate-400 mb-6">You can invite more teammates later from settings.</p>
      
      <div className="space-y-2 mb-4">
        <Label htmlFor="inviteEmail">Team member's email</Label>
        <div className="flex gap-2">
          <Input 
            id="inviteEmail"
            type="email"
            placeholder="colleague@yourcompany.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900/50 border-slate-700"
          />
          <Button type="button" onClick={handleAddInvite}>Add</Button>
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        {data.invites.map(invite => (
          <div key={invite} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md">
            <span className="text-sm text-slate-300">{invite}</span>
            <Button variant="ghost" size="icon" onClick={() => removeInvite(invite)}>
              <X className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-slate-400 mb-8">
        Seats used: {seatsUsed} / {seatLimit}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Button onClick={finishOnboarding} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Finish Setup & Launch
        </Button>
        <Button variant="outline" onClick={prevStep} disabled={loading}>Back</Button>
      </div>
    </div>
  );
}