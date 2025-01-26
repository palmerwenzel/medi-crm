'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatSummary } from '@/lib/services/case-from-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary?: ChatSummary;
  isLoading?: boolean;
}

export function ConsentDialog({
  isOpen,
  onClose,
  onConfirm,
  summary,
  isLoading = false,
}: ConsentDialogProps) {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Medical Case</DialogTitle>
          <DialogDescription>
            Review the information below and confirm if you'd like to create a medical case.
            This will help us connect you with the right healthcare provider.
          </DialogDescription>
        </DialogHeader>

        {summary && (
          <ScrollArea className="max-h-[60vh] rounded-md border p-4">
            <div className="space-y-4">
              {/* Case Overview */}
              <div>
                <h3 className="font-semibold">Case Overview</h3>
                <p className="text-sm text-muted-foreground">{summary.description}</p>
              </div>

              {/* Key Information */}
              <div>
                <h3 className="font-semibold">Key Information</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Duration: {summary.duration}</Badge>
                  <Badge variant="outline">Severity: {summary.severity}</Badge>
                  <Badge 
                    variant={summary.urgency_level === 'emergency' ? 'destructive' : 'outline'}
                  >
                    {summary.urgency_level.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold">Reported Symptoms</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.key_symptoms.map((symptom, i) => (
                    <Badge key={i} variant="secondary">{symptom}</Badge>
                  ))}
                </div>
              </div>

              {/* Clinical Details */}
              {summary.clinical_details && (
                <div>
                  <h3 className="font-semibold">Clinical Details</h3>
                  <div className="space-y-2 text-sm">
                    {summary.clinical_details.progression && (
                      <p>Progression: {summary.clinical_details.progression}</p>
                    )}
                    {summary.clinical_details.impact_on_daily_life && (
                      <p>Impact: {summary.clinical_details.impact_on_daily_life}</p>
                    )}
                    {summary.clinical_details.previous_treatments?.length > 0 && (
                      <div>
                        <p className="font-medium">Previous Treatments:</p>
                        <ul className="list-disc pl-4">
                          {summary.clinical_details.previous_treatments.map((treatment, i) => (
                            <li key={i}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Consent Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="consent"
            checked={hasConsented}
            onCheckedChange={(checked) => setHasConsented(checked as boolean)}
          />
          <label
            htmlFor="consent"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand and consent to sharing this information with healthcare providers
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!hasConsented || isLoading}
          >
            {isLoading ? 'Creating Case...' : 'Create Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 