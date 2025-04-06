import { FileWithPath } from "react-dropzone";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";

interface Props {
	files: readonly FileWithPath[];
	setFiles: React.Dispatch<React.SetStateAction<FileWithPath[]>>;
}

export default function ImageList({ files, setFiles }: Props) {
	const handleDelete = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setFiles(newFiles);
	};

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(files);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setFiles(items);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="imageDroppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col px-12 max-lg:px-0 max-md:px-12 max-[32rem]:px-0">
						{files.map((file, index) => (
							<Draggable key={file.name} draggableId={file.name} index={index}>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										className="w-full p-4 rounded-xl bg-orange-100 border-2 border-amber-500 flex gap-2 shadow-md my-1"
									>
										<img
											src={URL.createObjectURL(file)}
											alt={file.name}
											className="aspect-[3/2] object-contain w-24 rounded-md bg-orange-300 border-2 border-orange-400"
										/>
										<div className="flex flex-col justify-center w-full min-w-0">
											<span className="font-semibold text overflow-hidden text-ellipsis">{file.name}</span>
											<button
												onClick={() => handleDelete(index)}
												className="pill button text-xs w-min !px-3 !py-1 !bg-red-300 !border-red-400 hover:!bg-red-400"
											>
												Delete
											</button>
										</div>

										<div
											{...provided.dragHandleProps}
											className="h-full w-11 px-1 cursor-grab flex items-center justify-center rounded transition-colors hover:bg-black/10"
										>
											<Icon icon="tabler:grip-horizontal" className="size-6 text-black/50" />
										</div>
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
