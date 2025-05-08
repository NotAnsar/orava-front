import { fetchTasks } from '@/api/tasks';
import Kanban from '@/components/kanban/Kanban';
import React from 'react';

export default async function page() {
	const data = await fetchTasks();
	console.log(data);

	return <Kanban data={data} />;
}
