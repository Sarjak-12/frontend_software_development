import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

const columns = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" }
];

function sortByPosition(tasks = []) {
  return [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function KanbanBoard({ tasks, onMove, onEdit, onDelete }) {
  const grouped = columns.reduce((acc, column) => {
    acc[column.id] = sortByPosition(tasks.filter((task) => task.status === column.id));
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const nextStatus = destination.droppableId;
    const nextPosition = destination.index;
    onMove?.(draggableId, nextStatus, nextPosition);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="heading-font text-lg">{column.label}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-[var(--text-muted)]">
                {grouped[column.id].length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-8">
                  {grouped[column.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
