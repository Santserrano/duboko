import DraggableWindow from './draggable-window';

interface Task {
  name: string;
  plannedTime: string;
  spentTime: string;
}

interface SessionDetailsProps {
  date: string;
  focusTime: string;
  breakTime: string;
  tasks: Task[];
  onBack: () => void;
  onClose: () => void;
}

export function SessionDetails({
  date,
  focusTime,
  breakTime,
  tasks,
  onBack,
  onClose,
}: SessionDetailsProps) {
  return (
    <DraggableWindow
      title="Session Details"
      onClose={onClose}
      defaultWidth={400}
      defaultHeight={500}
      resizable={true}
    >
      <button onClick={onBack} className="flex items-center text-sm text-zinc-400 hover:text-white">
        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="space-y-6 bg-transparent p-6">
        <div className="text-lg font-medium text-white">{date}</div>

        {/* Time Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Focus Time</div>
            <div className="text-2xl font-bold text-white">{focusTime}</div>
          </div>
          <div className="rounded-lg bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Break Time</div>
            <div className="text-2xl font-bold text-white">{breakTime}</div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-zinc-400">
            <div>All tasks</div>
            <div className="flex gap-6">
              <div>Planned</div>
              <div>Spent</div>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">✦</span>
                  <span className="text-white">{task.name}</span>
                </div>
                <div className="flex gap-6 text-sm text-zinc-400">
                  <div>{task.plannedTime}</div>
                  <div>{task.spentTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DraggableWindow>
  );
}
