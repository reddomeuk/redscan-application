
import { useState, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import { TaskQueueContext } from '@/components/contexts/TaskQueueContext';

// Mock API client demonstrating required features
const apiClient = {
  request: async ({ actionFn, idempotencyKey, traceId, isLongRunning, taskName }) => {
    console.log(`API CALL | Trace: ${traceId} | Idempotency: ${idempotencyKey}`);
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500 + Math.random() * 1000));

    // Simulate various backend responses
    if (actionFn.toString().includes('FAIL_PERMISSION')) {
      throw { status: 403, message: "You don’t have access to perform this action." };
    }
    if (actionFn.toString().includes('FAIL_PLAN_LIMIT')) {
        throw { status: 402, message: "Your plan limit has been reached. Upgrade to proceed." };
    }

    return actionFn();
  }
};


export const useAction = (actionFn, options = {}) => {
  const {
    confirm,
    successToast,
    errorToast = "An unexpected error occurred.",
    isLongRunning = false,
    taskName = 'Processing task...'
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const taskQueue = useContext(TaskQueueContext);

  const execute = useCallback(async (...args) => {
    if (typeof actionFn !== 'function') {
      console.error("useAction: `actionFn` is not a function.", { actionFn });
      toast.error("Action is not configured correctly.");
      return;
    }
    
    const executeAction = async () => {
      setIsLoading(true);
      setError(null);
      
      const idempotencyKey = crypto.randomUUID();
      const traceId = crypto.randomUUID();

      try {
        if (isLongRunning) {
            const taskId = crypto.randomUUID();
            taskQueue.addTask({ id: taskId, name: taskName, startTime: Date.now() });

            // Don't wait for the long-running task, just fire and forget
            // In a real app, the backend would accept the job and we'd poll for status
            (async () => {
                try {
                    // Simulate progress
                    await new Promise(r => setTimeout(r, 1000));
                    taskQueue.updateTask(taskId, { progress: 30 });
                    await new Promise(r => setTimeout(r, 1500));
                    taskQueue.updateTask(taskId, { progress: 70 });
                    
                    const result = await apiClient.request({ actionFn: () => actionFn(...args), idempotencyKey, traceId });

                    taskQueue.updateTask(taskId, { status: 'completed', progress: 100, resultUrl: result.downloadUrl });
                    toast.success(successToast || 'Task completed successfully.');
                } catch (e) {
                    taskQueue.updateTask(taskId, { status: 'failed', error: e.message || errorToast });
                    toast.error(e.message || errorToast);
                }
            })();
            
            // Return immediately for UI responsiveness
            setIsLoading(false);
            return;
        }

        // For short-running tasks
        const result = await apiClient.request({ actionFn: () => actionFn(...args), idempotencyKey, traceId });
        
        if (successToast) {
          toast.success(successToast);
        }
        setIsLoading(false);
        return result;

      } catch (err) {
        setError(err);
        toast.error(err.message || errorToast, {
            description: `Trace ID: ${traceId}`
        });
        setIsLoading(false);
        throw err;
      }
    };

    if (confirm) {
        toast.warning(confirm.title, {
            description: confirm.description,
            action: {
                label: 'Confirm',
                onClick: () => executeAction(),
            },
        });
    } else {
       await executeAction();
    }
  }, [actionFn, confirm, successToast, errorToast, isLongRunning, taskName, taskQueue]);

  return { execute, isLoading, error };
};
