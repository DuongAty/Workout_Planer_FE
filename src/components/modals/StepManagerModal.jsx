import React, { useState, useEffect } from 'react';
import { X, GripVertical, Plus, Save, Trash2, Loader2, ListOrderedIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { stepOfExerciseApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const SortableStepItem = ({ step, index, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.tempId });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 }} 
         className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 group">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-blue-500"><GripVertical size={20} /></div>
      <div className="flex-none bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</div>
      <input type="text" value={step.description} onChange={(e) => onUpdate(index, e.target.value)} 
      className="flex-1 bg-transparent border-b-2 border-transparent outline-none focus:border-blue-200 focus:bg-blue-50/50 px-2 py-1 rounded-lg transition-all duration-300 font-medium text-gray-700 placeholder:text-gray-300" />
      <button onClick={() => onDelete(index)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
    </div>
  );
};

export default function StepManagerModal({ isOpen, exerciseId, onClose, onSuccess }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  useEffect(() => {
    const fetchSteps = async () => {
      if (isOpen && exerciseId) {
        try {
          setLoading(true);
          const res = await stepOfExerciseApi.getByExercise(exerciseId);
          setSteps(res.data.map(s => ({ ...s, tempId: s.id || Math.random().toString() })));
        } catch (error) {
          toast.error("Unable to load the list of steps");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSteps();
  }, [isOpen, exerciseId]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    setSteps([...steps, { tempId: Math.random().toString(), description: '', order: steps.length + 1 }]);
  };

  const handleUpdateDescription = (index, val) => {
    const newSteps = [...steps];
    newSteps[index].description = val;
    setSteps(newSteps);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.tempId === active.id);
        const newIndex = items.findIndex((i) => i.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const payload = steps.map((s, idx) => ({ id: s.id, description: s.description, order: idx + 1 }));
      await stepOfExerciseApi.saveMany(exerciseId, payload);
      toast.success("Save successful!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Error saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-50 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 flex justify-between items-center bg-white border-b">
          <h2 className="text-xl font-black uppercase italic flex items-center gap-2"><ListOrderedIcon size={20} /> Manage Steps</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(s => s.tempId)} strategy={verticalListSortingStrategy}>
                  {steps.map((step, index) => (
                    <SortableStepItem key={step.tempId} step={step} index={index} onUpdate={handleUpdateDescription} onDelete={(idx) => setSteps(steps.filter((_, i) => i !== idx))} />
                  ))}
                </SortableContext>
              </DndContext>
              <button onClick={handleAddStep} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-all font-bold mt-2">
                <Plus size={18} /> Add Steps
              </button>
            </>
          )}
        </div>

        <div className="p-6 bg-white border-t flex gap-4">
          <button onClick={onClose} className="flex-1 font-bold text-gray-400 uppercase text-[11px] hover:text-red-500">Cancel</button>
          <button onClick={handleSave} disabled={isSubmitting || loading} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-2">
            {isSubmitting ? "Saving..." : <><Save size={16} /> Save & Update</>}
          </button>
        </div>
      </div>
    </div>
  );
}