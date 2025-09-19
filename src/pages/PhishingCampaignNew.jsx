import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CampaignBuilder from '../components/phishing/CampaignBuilder';

export default function PhishingCampaignNewPage() {
  const navigate = useNavigate();

  const handleComplete = (campaign) => {
    navigate(createPageUrl(`PhishingCampaignDetail?id=${campaign.id}`));
  };

  const handleCancel = () => {
    navigate(createPageUrl('PhishingSimulator'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#1E1E1E] p-6">
      <CampaignBuilder onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}