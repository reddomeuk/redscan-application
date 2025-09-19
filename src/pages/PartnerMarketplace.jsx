import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  Award, 
  Search,
  Filter,
  Globe,
  Clock,
  DollarSign,
  CheckCircle,
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  ArrowRight,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock data for vetted pentest partners
const pentestPartners = [
  {
    id: 1,
    name: "CyberGuard Security",
    logo: "🛡️",
    location: { country: "United States", state: "California", city: "San Francisco" },
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Web Application", "Network Security", "Cloud Security", "Mobile Security"],
    certifications: ["CISSP", "CEH", "OSCP", "CISA"],
    teamSize: "15-25",
    experience: "8+ years",
    hourlyRate: "$150-250",
    availability: "Available",
    completedEngagements: 89,
    averageDelivery: "14 days",
    compliance: ["SOC 2", "ISO 27001", "PCI DSS"],
    description: "Leading cybersecurity firm specializing in comprehensive penetration testing and vulnerability assessments.",
    languages: ["English", "Spanish"],
    timeZone: "PST (UTC-8)",
    verified: true,
    featured: true
  },
  {
    id: 2,
    name: "SecureTest Labs",
    logo: "🔬",
    location: { country: "United Kingdom", state: "England", city: "London" },
    rating: 4.8,
    reviewCount: 203,
    specialties: ["API Security", "DevSecOps", "Cloud Native", "IoT Security"],
    certifications: ["OSCP", "GPEN", "GWEB", "CISSP"],
    teamSize: "25-50",
    experience: "12+ years",
    hourlyRate: "$120-200",
    availability: "Available",
    completedEngagements: 156,
    averageDelivery: "10 days",
    compliance: ["ISO 27001", "CREST"],
    description: "Premier testing laboratory with expertise in modern application security and cloud environments.",
    languages: ["English", "French", "German"],
    timeZone: "GMT (UTC+0)",
    verified: true,
    featured: false
  },
  {
    id: 3,
    name: "RedTeam Specialists",
    logo: "🎯",
    location: { country: "Australia", state: "New South Wales", city: "Sydney" },
    rating: 4.7,
    reviewCount: 94,
    specialties: ["Red Team Operations", "Social Engineering", "Physical Security", "SCADA/ICS"],
    certifications: ["OSCP", "CRTP", "CRTE", "CISSP"],
    teamSize: "10-15",
    experience: "6+ years",
    hourlyRate: "$130-220",
    availability: "Busy",
    completedEngagements: 67,
    averageDelivery: "21 days",
    compliance: ["ISO 27001", "NIST"],
    description: "Specialized red team operations focusing on advanced persistent threat simulation.",
    languages: ["English"],
    timeZone: "AEST (UTC+10)",
    verified: true,
    featured: false
  },
  {
    id: 4,
    name: "Nordic Cyber Solutions",
    logo: "❄️",
    location: { country: "Sweden", state: "Stockholm", city: "Stockholm" },
    rating: 4.6,
    reviewCount: 78,
    specialties: ["Industrial Security", "Critical Infrastructure", "Automotive", "Healthcare"],
    certifications: ["CISSP", "CISM", "GIAC", "CEH"],
    teamSize: "20-30",
    experience: "10+ years",
    hourlyRate: "$140-240",
    availability: "Available",
    completedEngagements: 112,
    averageDelivery: "16 days",
    compliance: ["ISO 27001", "NIS Directive", "GDPR"],
    description: "Leading Nordic cybersecurity consultancy with deep expertise in critical infrastructure protection.",
    languages: ["English", "Swedish", "Norwegian", "Danish"],
    timeZone: "CET (UTC+1)",
    verified: true,
    featured: true
  },
  {
    id: 5,
    name: "TechSec India",
    logo: "🇮🇳",
    location: { country: "India", state: "Karnataka", city: "Bangalore" },
    rating: 4.5,
    reviewCount: 186,
    specialties: ["Cost-Effective Testing", "OWASP Top 10", "Mobile Apps", "Startups"],
    certifications: ["CEH", "ECSA", "CISSP", "OSCP"],
    teamSize: "50+",
    experience: "5+ years",
    hourlyRate: "$50-100",
    availability: "Available",
    completedEngagements: 234,
    averageDelivery: "12 days",
    compliance: ["ISO 27001", "CMMI Level 3"],
    description: "High-volume testing provider offering cost-effective security assessments for growing businesses.",
    languages: ["English", "Hindi", "Tamil"],
    timeZone: "IST (UTC+5:30)",
    verified: true,
    featured: false
  }
];

const engagementTypes = [
  { id: 'web-app', name: 'Web Application', icon: Globe, description: 'Full web application security assessment' },
  { id: 'network', name: 'Network Security', icon: Shield, description: 'Network infrastructure penetration testing' },
  { id: 'mobile', name: 'Mobile Security', icon: Phone, description: 'iOS and Android application security' },
  { id: 'cloud', name: 'Cloud Security', icon: Building, description: 'Cloud infrastructure and configuration review' },
  { id: 'api', name: 'API Security', icon: Zap, description: 'REST and GraphQL API security testing' },
  { id: 'redteam', name: 'Red Team', icon: Target, description: 'Advanced persistent threat simulation' }
];

const PartnerCard = ({ partner, onSelect, onViewProfile }) => (
  <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 relative">
    {partner.featured && (
      <div className="absolute top-3 right-3">
        <Badge className="bg-yellow-600 text-black">Featured</Badge>
      </div>
    )}
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{partner.logo}</div>
          <div>
            <CardTitle className="text-white text-lg">{partner.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">
                {partner.location.city}, {partner.location.country}
              </span>
              {partner.verified && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white font-semibold">{partner.rating}</span>
            <span className="text-slate-400 text-sm">({partner.reviewCount})</span>
          </div>
          <Badge variant="outline" className={`mt-1 text-xs ${
            partner.availability === 'Available' ? 'text-green-400 border-green-400' : 'text-yellow-400 border-yellow-400'
          }`}>
            {partner.availability}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-slate-300 text-sm mb-4">{partner.description}</p>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-white text-sm font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {partner.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs text-blue-400 border-blue-400">
                {specialty}
              </Badge>
            ))}
            {partner.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs text-slate-400 border-slate-400">
                +{partner.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Experience:</span>
            <span className="text-white ml-1">{partner.experience}</span>
          </div>
          <div>
            <span className="text-slate-400">Team Size:</span>
            <span className="text-white ml-1">{partner.teamSize}</span>
          </div>
          <div>
            <span className="text-slate-400">Rate:</span>
            <span className="text-white ml-1">{partner.hourlyRate}/hr</span>
          </div>
          <div>
            <span className="text-slate-400">Delivery:</span>
            <span className="text-white ml-1">{partner.averageDelivery}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
          <Button variant="outline" size="sm" onClick={() => onViewProfile(partner)}>
            <Eye className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSelect(partner)}>
            <ArrowRight className="w-4 h-4 mr-1" />
            Select Partner
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EngagementTypeCard = ({ type, selected, onSelect }) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 ${
      selected 
        ? 'bg-blue-600/20 border-blue-400' 
        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
    }`}
    onClick={() => onSelect(type.id)}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-blue-600' : 'bg-slate-700'}`}>
          <type.icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-white font-medium">{type.name}</h4>
          <p className="text-slate-400 text-sm">{type.description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function PartnerMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedEngagementType, setSelectedEngagementType] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerDetails, setShowPartnerDetails] = useState(false);

  const filteredPartners = pentestPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCountry = selectedCountry === "all" || partner.location.country === selectedCountry;
    
    const matchesSpecialty = selectedSpecialty === "all" || 
                            partner.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    
    const matchesAvailability = selectedAvailability === "all" || partner.availability === selectedAvailability;
    
    return matchesSearch && matchesCountry && matchesSpecialty && matchesAvailability;
  });

  const uniqueCountries = [...new Set(pentestPartners.map(p => p.location.country))];
  const uniqueSpecialties = [...new Set(pentestPartners.flatMap(p => p.specialties))];

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    // In real implementation, this would navigate to engagement creation
    console.log('Selected partner:', partner);
    alert(`Starting engagement setup with ${partner.name}`);
  };

  const handleViewProfile = (partner) => {
    setSelectedPartner(partner);
    setShowPartnerDetails(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pentest Partner Marketplace</h1>
          <p className="text-slate-400 mt-1">Select vetted cybersecurity partners for your penetration testing needs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Request Custom Partner
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Vetted Partners</p>
                <p className="text-2xl font-bold text-white mt-1">{pentestPartners.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Global Coverage</p>
                <p className="text-2xl font-bold text-white mt-1">{uniqueCountries.length}</p>
                <p className="text-slate-400 text-xs">Countries</p>
              </div>
              <Globe className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg. Rating</p>
                <p className="text-2xl font-bold text-white mt-1">4.7</p>
                <div className="flex items-center mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Available Now</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {pentestPartners.filter(p => p.availability === 'Available').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger value="partners" className="text-white data-[state=active]:bg-slate-700">
            Browse Partners
          </TabsTrigger>
          <TabsTrigger value="engagements" className="text-white data-[state=active]:bg-slate-700">
            Plan Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Search & Filter Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Specialties</SelectItem>
                    {uniqueSpecialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Availability</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="budget">$50-100/hr</SelectItem>
                    <SelectItem value="mid">$100-200/hr</SelectItem>
                    <SelectItem value="premium">$200+/hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Partner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPartners.map(partner => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onSelect={handleSelectPartner}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No partners found</h3>
                <p className="text-slate-400">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagements" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Engagement Type</CardTitle>
              <p className="text-slate-400">Choose the type of security assessment you need</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engagementTypes.map(type => (
                  <EngagementTypeCard
                    key={type.id}
                    type={type}
                    selected={selectedEngagementType === type.id}
                    onSelect={setSelectedEngagementType}
                  />
                ))}
              </div>
              
              {selectedEngagementType && (
                <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Recommended Partners</h4>
                  <p className="text-slate-300 text-sm mb-4">
                    Based on your selected engagement type, we recommend these specialized partners:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pentestPartners
                      .filter(partner => 
                        partner.specialties.some(specialty => 
                          specialty.toLowerCase().includes(selectedEngagementType) ||
                          (selectedEngagementType === 'web-app' && specialty.includes('Web')) ||
                          (selectedEngagementType === 'network' && specialty.includes('Network')) ||
                          (selectedEngagementType === 'redteam' && specialty.includes('Red Team'))
                        )
                      )
                      .slice(0, 3)
                      .map(partner => (
                        <Button
                          key={partner.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPartner(partner)}
                          className="border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          {partner.name}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
