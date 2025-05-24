'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DraggableWindow from './draggable-window';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface DailyTasksProps {
  onClose: () => void;
}

export default function DailyTasks({ onClose }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <DraggableWindow
      title="Daily Tasks"
      onClose={onClose}
      defaultWidth={400}
      defaultHeight={500}
      resizable={true}
    >
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
          />
          <Button onClick={addTask}>Agregar</Button>
        </div>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}
              >
                {task.text}
              </label>
              <Button variant="destructive" size="sm" onClick={() => removeTask(task.id)}>
                Borrar
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </DraggableWindow>
  );
}
