
import React, { useContext } from 'react';
import { TaskQueueContext } from '@/components/contexts/TaskQueueContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertTriangle, Loader, Download } from 'lucide-react';

const TaskItem = ({ task }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'processing': return <Loader className="w-4 h-4 animate-spin text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Loader className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-3 bg-slate-800 rounded-lg mb-2">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-white">{task.name}</span>
        </div>
        <span className="text-xs text-slate-400">{new Date(task.startTime).toLocaleTimeString()}</span>
      </div>
      {task.status === 'processing' && (
        <Progress value={task.progress} className="w-full h-1" />
      )}
      {task.status === 'failed' && (
        <p className="text-xs text-red-400 mt-1">{task.error}</p>
      )}
      {task.status === 'completed' && task.resultUrl && (
         <Button size="sm" variant="outline" className="mt-2" asChild>
            <a href={task.resultUrl} download>
                <Download className="w-3 h-3 mr-2" /> Download Result
            </a>
         </Button>
      )}
    </div>
  );
};

export default function TaskDrawer({ isOpen, onClose }) {
  const { tasks } = useContext(TaskQueueContext);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-[#1A1A1A] border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <Card className="h-full bg-transparent border-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <CardTitle className="text-white">Active Tasks</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <ScrollArea className="h-full">
            {tasks.length > 0 ? (
              tasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
              <div className="text-center text-slate-400 pt-10">
                <p>No active or recent tasks.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
