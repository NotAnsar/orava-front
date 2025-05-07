'use client';

import { useState } from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import KanbanItem from '@/components/kanban/KanbanItem';
import { Textarea } from '@/components/ui/textarea';

// Task types - removed 'review'
type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
	id: string;
	title: string;
	description: string;
	status: Status;
	priority: Priority;
	createdAt: Date;
}

// Sample tasks - updated to remove 'review' status
const initialTasks: Task[] = [
	{
		id: '1',
		title: 'Create new product page',
		description: 'Design and implement the new product details page',
		status: 'todo',
		priority: 'high',
		createdAt: new Date(),
	},
	{
		id: '2',
		title: 'Fix checkout flow',
		description: 'Address the payment processing issues on checkout',
		status: 'in-progress',
		priority: 'high',
		createdAt: new Date(),
	},
	{
		id: '3',
		title: 'Update product schema',
		description: 'Add new fields to the product database schema',
		status: 'todo',
		priority: 'medium',
		createdAt: new Date(),
	},
	{
		id: '4',
		title: 'Customer feedback survey',
		description: 'Create a survey to collect customer feedback',
		status: 'todo',
		priority: 'medium',
		createdAt: new Date(),
	},
	{
		id: '5',
		title: 'Optimize database queries',
		description: 'Improve performance of slow database queries',
		status: 'in-progress',
		priority: 'medium',
		createdAt: new Date(),
	},
	{
		id: '6',
		title: 'Update documentation',
		description: 'Update API documentation with new endpoints',
		status: 'in-progress',
		priority: 'low',
		createdAt: new Date(),
	},
	{
		id: '7',
		title: 'Deploy new version',
		description: 'Deploy v2.3 to production servers',
		status: 'done',
		priority: 'high',
		createdAt: new Date(),
	},
	{
		id: '8',
		title: 'Security audit',
		description: 'Complete the quarterly security audit',
		status: 'done',
		priority: 'high',
		createdAt: new Date(),
	},
];

export default function Kanban() {
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const [newTask, setNewTask] = useState<Partial<Task>>({
		title: '',
		description: '',
		priority: 'medium',
		status: 'todo',
	});
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editTask, setEditTask] = useState<Task | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Configure sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Minimum drag distance before activating
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Get tasks filtered by status
	const getTasksByStatus = (status: Status) => {
		return tasks.filter((task) => task.status === status);
	};

	// Handle drag end event
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return;

		// Extract the task ID and target column
		const taskId = active.id.toString();
		const targetColumnId = over.id.toString();

		// Find columns that match our Status type
		if (
			targetColumnId === 'todo' ||
			targetColumnId === 'in-progress' ||
			targetColumnId === 'done'
		) {
			// Update the task status
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId
						? { ...task, status: targetColumnId as Status }
						: task
				)
			);
		}
	};

	// Add new task
	const handleAddTask = () => {
		if (newTask.title) {
			const task: Task = {
				id: Date.now().toString(),
				title: newTask.title,
				description: newTask.description || '',
				status: (newTask.status as Status) || 'todo',
				priority: (newTask.priority as Priority) || 'medium',
				createdAt: new Date(),
			};

			setTasks([...tasks, task]);
			setNewTask({
				title: '',
				description: '',
				priority: 'medium',
				status: 'todo',
			});
			setIsAddDialogOpen(false);
		}
	};

	// Update existing task
	const handleUpdateTask = () => {
		if (editTask) {
			const updatedTasks = tasks.map((task) =>
				task.id === editTask.id ? editTask : task
			);
			setTasks(updatedTasks);
			setEditTask(null);
			setIsEditDialogOpen(false);
		}
	};

	// Delete task
	const handleDeleteTask = (id: string) => {
		setTasks(tasks.filter((task) => task.id !== id));
		setIsEditDialogOpen(false);
	};

	// Open edit dialog
	const handleEditCard = (task: Task) => {
		setEditTask(task);
		setIsEditDialogOpen(true);
	};

	// Column definitions - removed 'review'
	const columns: { id: Status; title: string }[] = [
		{ id: 'todo', title: 'To Do' },
		{ id: 'in-progress', title: 'In Progress' },
		{ id: 'done', title: 'Done' },
	];

	return (
		<main className='flex flex-1 flex-col gap-4'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold'>Kanban Board</h1>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className='mr-2 h-4 w-4' />
							New Task
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Task</DialogTitle>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div>
								<label
									htmlFor='title'
									className='text-sm font-medium block mb-1'
								>
									Title
								</label>
								<Input
									id='title'
									value={newTask.title || ''}
									onChange={(e) =>
										setNewTask({ ...newTask, title: e.target.value })
									}
									placeholder='Task title'
								/>
							</div>
							<div>
								<label
									htmlFor='description'
									className='text-sm font-medium block mb-1'
								>
									Description
								</label>
								<Textarea
									id='description'
									value={newTask.description || ''}
									onChange={(e) =>
										setNewTask({ ...newTask, description: e.target.value })
									}
									placeholder='Task description'
									rows={3}
								/>
							</div>
							<div>
								<label
									htmlFor='priority'
									className='text-sm font-medium block mb-1'
								>
									Priority
								</label>
								<select
									id='priority'
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
									value={newTask.priority || 'medium'}
									onChange={(e) =>
										setNewTask({
											...newTask,
											priority: e.target.value as Priority,
										})
									}
								>
									<option value='low'>Low</option>
									<option value='medium'>Medium</option>
									<option value='high'>High</option>
								</select>
							</div>
							<div>
								<label
									htmlFor='status'
									className='text-sm font-medium block mb-1'
								>
									Status
								</label>
								<select
									id='status'
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
									value={newTask.status || 'todo'}
									onChange={(e) =>
										setNewTask({ ...newTask, status: e.target.value as Status })
									}
								>
									<option value='todo'>To Do</option>
									<option value='in-progress'>In Progress</option>
									<option value='done'>Done</option>
								</select>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant='outline'>Cancel</Button>
							</DialogClose>
							<Button onClick={handleAddTask}>Create Task</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)] '>
					{columns.map((column) => (
						<KanbanColumn
							key={column.id}
							id={column.id}
							title={column.title}
							taskCount={getTasksByStatus(column.id).length}
						>
							<div className='flex-1 overflow-x-hidden p-2 space-y-3 overflow-y-hidden'>
								{getTasksByStatus(column.id).map((task) => (
									<KanbanItem
										key={task.id}
										id={task.id}
										title={task.title}
										description={task.description}
										priority={task.priority}
										onClick={() => handleEditCard(task)}
									/>
								))}
							</div>
						</KanbanColumn>
					))}
				</div>
			</DndContext>

			{/* Edit Task Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Task</DialogTitle>
					</DialogHeader>
					{editTask && (
						<div className='grid gap-4 py-4'>
							<div>
								<label
									htmlFor='edit-title'
									className='text-sm font-medium block mb-1'
								>
									Title
								</label>
								<Input
									id='edit-title'
									value={editTask.title || ''}
									onChange={(e) =>
										setEditTask({ ...editTask, title: e.target.value })
									}
									placeholder='Task title'
								/>
							</div>
							<div>
								<label
									htmlFor='edit-description'
									className='text-sm font-medium block mb-1'
								>
									Description
								</label>
								<Textarea
									id='edit-description'
									value={editTask.description || ''}
									onChange={(e) =>
										setEditTask({ ...editTask, description: e.target.value })
									}
									placeholder='Task description'
									rows={3}
								/>
							</div>
							<div>
								<label
									htmlFor='edit-priority'
									className='text-sm font-medium block mb-1'
								>
									Priority
								</label>
								<select
									id='edit-priority'
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
									value={editTask.priority}
									onChange={(e) =>
										setEditTask({
											...editTask,
											priority: e.target.value as Priority,
										})
									}
								>
									<option value='low'>Low</option>
									<option value='medium'>Medium</option>
									<option value='high'>High</option>
								</select>
							</div>
							<div>
								<label
									htmlFor='edit-status'
									className='text-sm font-medium block mb-1'
								>
									Status
								</label>
								<select
									id='edit-status'
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
									value={editTask.status}
									onChange={(e) =>
										setEditTask({
											...editTask,
											status: e.target.value as Status,
										})
									}
								>
									<option value='todo'>To Do</option>
									<option value='in-progress'>In Progress</option>
									<option value='done'>Done</option>
								</select>
							</div>
						</div>
					)}
					<DialogFooter className='flex justify-between'>
						<Button
							variant='destructive'
							onClick={() => editTask && handleDeleteTask(editTask.id)}
						>
							<Trash2 className='mr-2 h-4 w-4' />
							Delete
						</Button>
						<div className='flex gap-2'>
							<DialogClose asChild>
								<Button variant='outline'>Cancel</Button>
							</DialogClose>
							<Button onClick={handleUpdateTask}>Save Changes</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}
