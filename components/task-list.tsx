'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './task-card';

interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTasksReorder: (tasks: Task[]) => void;
  onTaskDelete: (id: string) => void;
  onTaskComplete: (id: string) => void;
}

export function TaskList({ tasks, onTasksReorder, onTaskDelete, onTaskComplete }: TaskListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onTasksReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      id={task.id}
                      title={task.title}
                      estimatedTime={task.estimatedTime}
                      onDelete={onTaskDelete}
                      onComplete={onTaskComplete}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
