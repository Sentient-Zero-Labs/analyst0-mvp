import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LuCheck, LuTable } from "react-icons/lu";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { FiPlus } from "react-icons/fi";

interface EntitySearchDropdownProps {
  dataEntities: DataEntityListResponseItem[];
  onSelect: (entityId: number) => void;
  selectedEntityIds: number[];
}

export function EntitySearchDropdown({ dataEntities, onSelect, selectedEntityIds }: EntitySearchDropdownProps) {
  const [open, setOpen] = useState(false);

  // Ensure dataEntities is an array
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="space-x-1 justify-between text-3xs h-5 px-2 rounded-sm">
          <FiPlus className="size-3.5" />
          <span>Data Entity</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-w-64" side="top">
        <Command>
          <CommandInput placeholder="Search tables..." className="h-9" />
          <CommandList>
            <CommandEmpty>No table found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {dataEntities.map((entity) => (
                <CommandItem
                  key={entity.id}
                  onSelect={() => {
                    onSelect(entity.id);
                  }}
                  // disabled={selectedEntityIds.includes(entity.id)}
                  className="text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {selectedEntityIds.includes(entity.id) ? (
                      <LuCheck className="size-4" strokeWidth={1.5} />
                    ) : (
                      <div className="size-4" />
                    )}
                    <LuTable className="h-4 w-4" strokeWidth={1.5} />
                    <span className="text-xs">{entity.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
