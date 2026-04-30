'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Send, CheckCircle, DollarSign, MapPinned, MessageSquare, Globe, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';

const categories = [
  'Food', 'Cafés', 'Nightlife', 'Culture', 'Art', 'Shopping', 'Nature', 'Viewpoints', 'Wellness & Experience',
];

const budgetLevels = [
  { value: '$',   label: 'Budget-friendly', description: 'Under 50 RMB' },
  { value: '$$',  label: 'Mid-range',       description: '50–150 RMB' },
  { value: '$$$', label: 'Splurge',         description: '150+ RMB' },
];

const neighborhoods = [
  'French Concession', "Jing'an", 'The Bund', 'North Bund',
  'Xintiandi', 'Xuhui', 'West Bund', 'Pudong', 'Old Town', 'Other',
];

export default function SubmitSpotPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    spotName: '', chineseName: '', category: '', neighborhood: '',
    address: '', budget: '', description: '', whyRecommend: '',
    localTip: '', submitterName: '', submitterEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitError('Could not submit right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Thank you!</h1>
            <p className="text-muted-foreground mb-8">
              Your spot recommendation has been submitted. Our team will review it and add it to Spotly if it meets our quality standards. We will notify you by email once it is live.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore"><Button variant="outline">Explore Spots</Button></Link>
              <Button onClick={() => {
                setSubmitted(false);
                setFormData({ spotName: '', chineseName: '', category: '', neighborhood: '', address: '', budget: '', description: '', whyRecommend: '', localTip: '', submitterName: '', submitterEmail: '' });
              }}>Submit Another</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl mb-4">Submit a Spot</h1>
            <p className="text-muted-foreground">
              Found an amazing place that other foreigners should know about? Share it with the Spotly community.
              Our team reviews every submission to ensure quality — if approved, we will add it to the platform and credit you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="font-medium text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" /> Basic Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Spot Name (English) *</label>
                  <input type="text" required value={formData.spotName} onChange={e => updateField('spotName', e.target.value)}
                    placeholder="e.g., Lost Heaven"
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chinese Name (if known)</label>
                  <input type="text" value={formData.chineseName} onChange={e => updateField('chineseName', e.target.value)}
                    placeholder="e.g., 花马天堂"
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Do not worry if you do not know it — we will find it</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => updateField('category', cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="font-medium text-lg flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-primary" /> Location
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Neighborhood *</label>
                  <div className="flex flex-wrap gap-2">
                    {neighborhoods.map(hood => (
                      <button key={hood} type="button" onClick={() => updateField('neighborhood', hood)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.neighborhood === hood ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                        {hood}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address or Location Description</label>
                  <input type="text" value={formData.address} onChange={e => updateField('address', e.target.value)}
                    placeholder="e.g., Near Jing'an Temple station, Exit 2"
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  <p className="text-xs text-muted-foreground mt-1">As specific as you can — exact address or nearby landmarks</p>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="font-medium text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Price Range
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {budgetLevels.map(level => (
                  <button key={level.value} type="button" onClick={() => updateField('budget', level.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${formData.budget === level.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}>
                    <p className="font-medium text-lg mb-1">{level.value}</p>
                    <p className="text-sm text-muted-foreground">{level.label}</p>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tell Us More */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="font-medium text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Tell Us More
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What is this place? *</label>
                  <textarea required rows={3} value={formData.description} onChange={e => updateField('description', e.target.value)}
                    placeholder="e.g., A cozy Yunnan restaurant known for its authentic Dai cuisine..."
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Why do you recommend it? *</label>
                  <textarea required rows={3} value={formData.whyRecommend} onChange={e => updateField('whyRecommend', e.target.value)}
                    placeholder="e.g., The crossing-the-bridge noodles are incredible, English menu available, staff is friendly..."
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Local Tip (optional)</label>
                  <textarea rows={2} value={formData.localTip} onChange={e => updateField('localTip', e.target.value)}
                    placeholder="e.g., Go before 6pm to avoid the wait. Ask for the secret menu..."
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  <p className="text-xs text-muted-foreground mt-1">Any insider knowledge that would help other visitors</p>
                </div>
              </div>
            </div>

            {/* About You */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="font-medium text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> About You
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input type="text" required value={formData.submitterName} onChange={e => updateField('submitterName', e.target.value)}
                    placeholder="First name or nickname"
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input type="email" required value={formData.submitterEmail} onChange={e => updateField('submitterEmail', e.target.value)}
                    placeholder="We will notify you when it is live"
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your email is only used to notify you about your submission. We will never share it.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-6">
              {submitError && (
                <p className="text-sm text-red-500 text-center mb-3">{submitError}</p>
              )}
              <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                By submitting, you confirm this is a genuine recommendation and you have visited this place.
              </p>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}