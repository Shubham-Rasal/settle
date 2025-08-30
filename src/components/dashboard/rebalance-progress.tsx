"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const crossChainSteps = [
  { 
    name: 'Initiating', 
    statusKey: 'initiating',
    description: 'Setting up the transaction...'
  },
  { 
    name: 'Approval', 
    statusKey: 'approving',
    description: 'Approving USDC for transfer...'
  },
  { 
    name: 'Transfer', 
    statusKey: 'transferring',
    description: 'Burning USDC on source chain...'
  },
  { 
    name: 'Attestation', 
    statusKey: 'waiting-attestation',
    description: 'Waiting for Circle attestation...'
  },
  { 
    name: 'Minting', 
    statusKey: 'minting',
    description: 'Minting USDC on destination chain...'
  },
];

const sameChainSteps = [
  { 
    name: 'Initiating', 
    statusKey: 'initiating',
    description: 'Setting up the transaction...'
  },
  { 
    name: 'Transfer', 
    statusKey: 'transferring',
    description: 'Transferring USDC...'
  },
];

export type RebalanceStep = 
  | "idle"
  | "initiating" 
  | "approving"
  | "transferring"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

export function RebalanceProgress({ 
  currentStep, 
  isSameChain = false,
  open = false,
  onOpenChange
}: { 
  currentStep: RebalanceStep
  isSameChain?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const steps = isSameChain ? sameChainSteps : crossChainSteps;
  
  const getStepState = (index: number) => {
    const currentIndex = steps.findIndex(s => s.statusKey === currentStep);
    
    if (currentStep === 'completed') return 'completed';
    if (currentStep === 'error') return 'error';
    if (currentIndex === index) return 'active';
    if (currentIndex > index) return 'done';
    return 'pending';
  };

  const getStepIcon = (state: string, index: number) => {
    switch (state) {
      case 'done':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.statusKey === currentStep);
  };

  const progressPercentage = currentStep === 'completed' 
    ? 100 
    : currentStep === 'error' 
      ? 0 
      : Math.max(0, (getCurrentStepIndex() / (steps.length - 1)) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStep === 'completed' ? 'Rebalance Complete!' : 
             currentStep === 'error' ? 'Rebalance Failed' :
             'Rebalancing in Progress...'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="bg-muted rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-500 ease-out",
                  currentStep === 'completed' ? 'bg-primary' :
                  currentStep === 'error' ? 'bg-destructive' :
                  'bg-primary'
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const state = getStepState(index);
              const isActive = state === 'active';
              const isDone = state === 'done' || state === 'completed';
              const isError = state === 'error';
              
              return (
                <div 
                  key={step.name} 
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300",
                    isActive && "bg-primary/5 border-primary/20",
                    isDone && "bg-primary/5 border-primary/20",
                    isError && "bg-destructive/5 border-destructive/20",
                    state === 'pending' && "bg-muted/50 border-border"
                  )}
                >
                  {/* Step Number + Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all duration-300 text-sm font-medium",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && "bg-primary text-primary-foreground",
                    isError && "bg-destructive text-destructive-foreground",
                    state === 'pending' && "bg-muted text-muted-foreground"
                  )}>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isError ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive && "text-foreground",
                      isDone && "text-primary",
                      isError && "text-destructive",
                      state === 'pending' && "text-muted-foreground"
                    )}>
                      {step.name}
                    </div>
                    <div className={cn(
                      "text-xs mt-1 transition-colors duration-300",
                      isActive && "text-muted-foreground",
                      isDone && "text-primary/80", 
                      isError && "text-destructive/80",
                      state === 'pending' && "text-muted-foreground/60"
                    )}>
                      {isActive ? step.description : 
                       isDone ? 'Completed successfully' :
                       isError ? 'Failed to complete' :
                       'Waiting...'}
                    </div>
                  </div>

                  {/* Status indicator */}
                  {isActive && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Status */}
          {currentStep === 'completed' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                Transaction Successful
              </div>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-4 h-4 mr-2" />
                Transaction Failed
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}