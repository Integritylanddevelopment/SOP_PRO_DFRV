import { useState } from "react";
import { Check, Save, Camera, Mic, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";

interface SopChecklistProps {
  sop: any;
}

interface StepCompletion {
  stepId: string;
  completed: boolean;
  notes?: string;
  mediaUrls?: string[];
  completedAt?: Date;
}

export default function SopChecklist({ sop }: SopChecklistProps) {
  const [execution, setExecution] = useState<any>(null);
  const [stepCompletions, setStepCompletions] = useState<StepCompletion[]>([]);
  const [witnessInfo, setWitnessInfo] = useState<Array<{ name: string; phone: string; statement: string }>>([]);
  const { toast } = useToast();

  // Start SOP execution
  const startExecutionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sops/${sop.id}/execute`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setExecution(data);
      // Initialize step completions
      const initialCompletions = sop.steps.map((step: any) => ({
        stepId: step.id,
        completed: false,
        notes: "",
        mediaUrls: [],
      }));
      setStepCompletions(initialCompletions);
    },
    onError: () => {
      toast({
        title: "Failed to start SOP",
        description: "Could not initialize the SOP execution",
        variant: "destructive",
      });
    },
  });

  // Update step completion
  const updateStepMutation = useMutation({
    mutationFn: async (stepData: StepCompletion) => {
      if (!execution) return;
      const response = await apiRequest("POST", `/api/sop-executions/${execution.id}/steps`, stepData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Step Updated",
        description: "Step completion has been recorded",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update step completion",
        variant: "destructive",
      });
    },
  });

  // Complete SOP execution
  const completeSopMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!execution) return;
      const response = await apiRequest("PATCH", `/api/sop-executions/${execution.id}/complete`, { notes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SOP Completed",
        description: "The SOP has been marked as completed",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Completion Failed",
        description: "Could not complete the SOP",
        variant: "destructive",
      });
    },
  });

  const handleStepToggle = (stepId: string, completed: boolean) => {
    const updatedCompletions = stepCompletions.map(completion =>
      completion.stepId === stepId
        ? { ...completion, completed, completedAt: completed ? new Date() : undefined }
        : completion
    );
    setStepCompletions(updatedCompletions);

    const stepData = updatedCompletions.find(c => c.stepId === stepId);
    if (stepData) {
      updateStepMutation.mutate(stepData);
    }
  };

  const handleNotesUpdate = (stepId: string, notes: string) => {
    const updatedCompletions = stepCompletions.map(completion =>
      completion.stepId === stepId ? { ...completion, notes } : completion
    );
    setStepCompletions(updatedCompletions);
  };

  const handleMediaUpload = async (stepId: string) => {
    return {
      method: "PUT" as const,
      url: await getUploadUrl(),
    };
  };

  const getUploadUrl = async (): Promise<string> => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return data.uploadURL;
  };

  const handleUploadComplete = async (stepId: string, result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadUrl = result.successful[0].uploadURL as string;
      
      // Set ACL policy for the uploaded media
      try {
        const response = await apiRequest("PUT", "/api/media", { mediaURL: uploadUrl });
        const data = await response.json();
        
        // Update step completion with media URL
        const updatedCompletions = stepCompletions.map(completion =>
          completion.stepId === stepId
            ? { ...completion, mediaUrls: [...(completion.mediaUrls || []), data.objectPath] }
            : completion
        );
        setStepCompletions(updatedCompletions);

        toast({
          title: "Media Uploaded",
          description: "Media has been attached to this step",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not process the uploaded media",
          variant: "destructive",
        });
      }
    }
  };

  const addWitness = () => {
    setWitnessInfo([...witnessInfo, { name: "", phone: "", statement: "" }]);
  };

  const updateWitness = (index: number, field: string, value: string) => {
    const updated = witnessInfo.map((witness, i) =>
      i === index ? { ...witness, [field]: value } : witness
    );
    setWitnessInfo(updated);
  };

  const getStepCompletion = (stepId: string) => {
    return stepCompletions.find(c => c.stepId === stepId);
  };

  const completedSteps = stepCompletions.filter(c => c.completed).length;
  const totalSteps = sop.steps.length;
  const isAllCompleted = completedSteps === totalSteps;

  if (!execution && !startExecutionMutation.isPending) {
    return (
      <div className="text-center py-8">
        <Button
          data-testid="button-start-sop"
          onClick={() => startExecutionMutation.mutate()}
          className="bg-primary hover:bg-blue-700 text-white px-8 py-3"
        >
          Start SOP Execution
        </Button>
      </div>
    );
  }

  if (startExecutionMutation.isPending) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Initializing SOP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm text-slate-600">{completedSteps}/{totalSteps} steps</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {sop.steps.map((step: any, index: number) => {
          const completion = getStepCompletion(step.id);
          const isCompleted = completion?.completed || false;
          
          return (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Checkbox
                    data-testid={`checkbox-step-${step.id}`}
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleStepToggle(step.id, checked === true)}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${isCompleted ? 'text-green-800' : 'text-slate-900'}`}>
                      {step.title}
                    </p>
                    {isCompleted && completion?.completedAt && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <Check className="mr-1 h-3 w-3" />
                        {new Date(completion.completedAt).toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                      {step.description}
                    </p>
                  )}

                  {/* Notes */}
                  <div className="mt-3">
                    <Textarea
                      data-testid={`textarea-notes-${step.id}`}
                      placeholder="Add notes for this step..."
                      value={completion?.notes || ""}
                      onChange={(e) => handleNotesUpdate(step.id, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Media Upload */}
                  {step.mediaRequired && (
                    <div className="mt-3 flex items-center space-x-2">
                      <ObjectUploader
                        maxNumberOfFiles={5}
                        maxFileSize={10485760}
                        onGetUploadParameters={() => handleMediaUpload(step.id)}
                        onComplete={(result) => handleUploadComplete(step.id, result)}
                        buttonClassName="bg-slate-600 hover:bg-slate-700 text-white text-sm"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Add Photos
                      </ObjectUploader>
                      
                      <Button
                        data-testid={`button-record-${step.id}`}
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Record
                      </Button>
                    </div>
                  )}

                  {/* Display uploaded media */}
                  {completion?.mediaUrls && completion.mediaUrls.length > 0 && (
                    <div className="mt-2 flex space-x-2">
                      {completion.mediaUrls.map((url, i) => (
                        <div key={i} className="w-16 h-12 bg-slate-200 rounded border text-xs flex items-center justify-center">
                          Media {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Witness Information (for incident-related SOPs) */}
      {sop.category === "Emergency" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
            <TriangleAlert className="mr-2 h-4 w-4" />
            Witness Information
          </h4>
          
          {witnessInfo.map((witness, index) => (
            <div key={index} className="space-y-3 mb-4 p-3 bg-white rounded border">
              <div className="flex space-x-3">
                <Input
                  placeholder="Witness name"
                  value={witness.name}
                  onChange={(e) => updateWitness(index, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Phone number"
                  value={witness.phone}
                  onChange={(e) => updateWitness(index, "phone", e.target.value)}
                  className="flex-1"
                />
              </div>
              <Textarea
                placeholder="Statement..."
                value={witness.statement}
                onChange={(e) => updateWitness(index, "statement", e.target.value)}
                rows={3}
              />
            </div>
          ))}
          
          <Button
            data-testid="button-add-witness"
            onClick={addWitness}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Witness
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t">
        <Button
          data-testid="button-complete-sop"
          onClick={() => completeSopMutation.mutate("SOP completed successfully")}
          disabled={!isAllCompleted || completeSopMutation.isPending}
          className="flex-1 bg-success hover:bg-green-700 text-white py-3 px-6 font-medium"
        >
          <Check className="mr-2 h-4 w-4" />
          {completeSopMutation.isPending ? "Completing..." : "Complete SOP"}
        </Button>
        
        <Button
          data-testid="button-save-progress"
          variant="outline"
          className="flex-1 py-3 px-6 font-medium"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
        
        <Button
          data-testid="button-escalate"
          className="bg-accent hover:bg-red-700 text-white py-3 px-6 font-medium"
        >
          <TriangleAlert className="mr-2 h-4 w-4" />
          Escalate
        </Button>
      </div>
    </div>
  );
}
