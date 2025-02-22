"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  NodeProps,
} from "reactflow";

import "reactflow/dist/style.css";
import { ColumnInfo, DataEntityResponse, ForeignKeyInfo } from "@/services/dataEntity/dataEntity.schema";
import { useDataEntitiesQuery } from "@/services/dataEntity/dataEntity.service";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DataEntityForm } from "../data-entities/edit/DataEntityForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LuPencil } from "react-icons/lu";

// Custom node to display table information
const DataEntityNode = ({
  data,
}: NodeProps<{
  dataEntity: DataEntityResponse;
  dataEntities: DataEntityResponse[];
  edges: Edge[];
  onClick: () => void;
}>) => {
  const { dataEntity, dataEntities, edges, onClick } = data;

  const hasConnection = (columnName: string, type: "source" | "target") => {
    const nodeId = dataEntity.id.toString();
    const handleId = `${nodeId}-${columnName}`;
    return edges?.some((edge) => (type === "source" ? edge.sourceHandle : edge.targetHandle) === handleId);
  };

  return (
    <div className="z-10 shadow-md w-[250px] border bg-background rounded hover:border-blue-500 cursor-pointer overflow-hidden">
      <div onClick={onClick} className="flex justify-between items-center bg-blue-200 p-2 hover:bg-blue-300 ">
        <div className="font-bold rounded-t line-clamp-1 break-all">{dataEntity.name}</div>
        <LuPencil className="size-4 shrink-0 hover:scale-110 hover:opacity-80" strokeWidth={2.5} />
      </div>
      <div className="my-1">
        {dataEntity?.columns?.map((column) => {
          const toRelations = dataEntity.foreign_keys?.filter((fk) => fk.column === column.name);
          const fromRelations = dataEntities?.flatMap((entity) =>
            entity.foreign_keys
              ?.filter((fk) => fk.referred_column === column.name && fk.referred_table_name === dataEntity.name)
              .map((fk) => ({
                ...fk,
                referred_from_table_name: entity.name,
              }))
          );

          return (
            <div key={column.name} className="relative">
              <ColumnPopover column={column} toRelations={toRelations} fromRelations={fromRelations} />

              {hasConnection(column.name, "source") && (
                <Handle type="source" position={Position.Right} id={`${dataEntity.id}-${column.name}`} />
              )}
              {hasConnection(column.name, "target") && (
                <Handle type="target" position={Position.Left} id={`${dataEntity.id}-${column.name}`} />
              )}
            </div>
          );
        })}

        <div className="mt-2">
          {dataEntity?.foreign_keys?.length > 0 && (
            <h3 className="text-sm font-medium px-2 text-foreground/70">Relationships</h3>
          )}

          {dataEntity?.foreign_keys?.map((foreignKey, index) => {
            return (
              <div key={`${foreignKey.column}-${index}`} className="relative">
                <RelationshipPopover relationship={foreignKey} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ColumnPopover = ({
  column,
  toRelations,
  fromRelations,
}: {
  column: ColumnInfo;
  toRelations: ForeignKeyInfo[];
  fromRelations: (ForeignKeyInfo & { referred_from_table_name: string })[];
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="text-sm p-2 hover:bg-blue-50">
          <span className="line-clamp-1 break-all">
            <span className="font-semibold">{column.name}:</span>{" "}
            <span className="text-foreground/70">{column.type}</span>
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="rounded flex flex-col gap-1">
          <div>
            <h3 className="text-sm font-semibold p-2 bg-blue-100 rounded-t-sm">Column</h3>
          </div>
          <div className="p-2 pb-4 flex flex-col gap-1 max-h-72 overflow-y-auto">
            <p className="text-sm">
              <span className="font-medium opacity-70">Name:</span> <span className="font-semibold">{column.name}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium opacity-70">Type:</span> <span className="font-semibold">{column.type}</span>
            </p>
            <p className="break-words text-sm">
              <span className="font-medium opacity-70">Description:</span> {column.description}
            </p>
            {(toRelations?.length > 0 || fromRelations?.length > 0) && (
              <div className="mt-2">
                <span className="font-medium text-foreground/70 text-2base">Relationships:</span>{" "}
                {toRelations?.map((relation) => (
                  <div
                    key={`${relation.referred_table_name}-${relation.referred_column}`}
                    className="flex flex-col gap-1 text-sm"
                  >
                    <span>
                      To: <span className="font-semibold">{relation.referred_table_name}</span>
                      <span>.{relation.referred_column}</span>
                    </span>
                  </div>
                ))}
                {fromRelations?.map((relation) => (
                  <div
                    key={`${relation.referred_table_name}-${relation.referred_column}`}
                    className="flex flex-col gap-1 text-sm mb-0.5"
                  >
                    <span>
                      From: <span className="font-semibold">{relation.referred_from_table_name}</span>
                      <span>.{relation.referred_column}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const RelationshipPopover = ({ relationship }: { relationship: ForeignKeyInfo }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="text-sm p-2 hover:bg-blue-50 line-clamp-2">
          <span className="font-semibold">{relationship.column} → </span>
          <span className="text-foreground/70">
            {relationship.referred_table_name}.{relationship.referred_column}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 overflow-hidden">
        <div className=" flex flex-col gap-1">
          <div>
            <h3 className="text-sm font-semibold p-2 bg-blue-100">Relationship</h3>
          </div>
          <div className="p-2 pb-4 flex flex-col gap-1">
            <p className="text-sm">
              <span className="font-medium opacity-70">From:</span>{" "}
              <span className="font-semibold">{relationship.column}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium opacity-70">To:</span>{" "}
              <span className="font-semibold">{relationship.referred_table_name}</span>.{relationship.referred_column}
            </p>
            <p className="break-words text-sm">
              <span className="font-medium opacity-70">Description:</span> {relationship.description}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const nodeTypes = { tableNode: DataEntityNode };

export default function ModelingPage({ params }: { params: { organisationPublicId: string; dataSourceId: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEntity, setSelectedEntity] = useState<DataEntityResponse | null>(null);

  // Replace the manual fetch with useDataEntitiesQuery
  const { data: dataEntities } = useDataEntitiesQuery({
    organisationPublicId: params.organisationPublicId,
    dataSourceId: Number(params.dataSourceId),
    type: "detailed",
  });

  const getDataEntityIdUsingName = useCallback(
    (name: string) => {
      return dataEntities?.find((entity) => entity.name === name)?.id?.toString();
    },
    [dataEntities]
  );

  // Create nodes and edges from data entities
  useEffect(() => {
    if (!dataEntities?.length) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const spacing = 350;
    const nodesPerRow = 4;

    const rowColumnHeightMap: Record<string, number> = {};

    // Create nodes
    dataEntities.forEach((entity, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;

      const totalHeightRowsCount = (entity.columns?.length || 0) + (entity.foreign_keys?.length || 0) * 2 + 1;
      const previousRowHeight = rowColumnHeightMap[`${row - 1}-${col}`] || 0;

      // Calculate the height of the node based on the number of columns.
      // Subtract the number of columns from 51 to get the height of the node,
      // because for more columns, the height of the node should be less.
      const entityHeight = previousRowHeight + totalHeightRowsCount * (54 - totalHeightRowsCount / 2);

      rowColumnHeightMap[`${row}-${col}`] = entityHeight;

      // Create edges from foreign keys
      entity.foreign_keys?.forEach((fk) => {
        const targetId = getDataEntityIdUsingName(fk.referred_table_name) ?? "";
        if (targetId) {
          newEdges.push({
            id: `${entity.id}-${fk.referred_table_name}-${fk.column}`,
            source: entity.id.toString(),
            target: targetId,
            sourceHandle: `${entity.id}-${fk.column}`,
            targetHandle: `${targetId}-${fk.referred_column}`,
            type: "smoothstep",
            style: {
              strokeWidth: 1.5,
            },
          });
        }
      });

      newNodes.push({
        id: entity.id.toString(),
        type: "tableNode",
        position: { x: col * spacing, y: rowColumnHeightMap[`${row - 1}-${col}`] || 0 },
        data: {
          dataEntity: entity,
          onClick: () => setSelectedEntity(entity as DataEntityResponse),
          edges: newEdges,
          dataEntities,
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [dataEntities, setNodes, setEdges, getDataEntityIdUsingName]);

  return (
    <div className="w-full h-[calc(100vh-50px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      <Sheet open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <SheetContent className="h-full sm:max-w-[55vw] pt-0 pr-0">
          <div className="h-screen overflow-y-auto">
            <div className="h-2 w-full" />
            {selectedEntity && (
              <DataEntityForm
                organisationPublicId={params.organisationPublicId}
                dataEntity={selectedEntity}
                isInSheet
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
