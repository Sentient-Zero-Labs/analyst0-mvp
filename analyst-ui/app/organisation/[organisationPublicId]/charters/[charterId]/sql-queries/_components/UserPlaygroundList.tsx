"use client";

import { Input } from "@/components/ui/input";
import { CharterListResponseItem } from "@/services/charter/charter.schema";
import { CharterPlaygroundListResponseItem } from "@/services/charterPlayground/charterPlayground.schema";
import Link from "next/link";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateForDisplay } from "@/lib/utils/date.utils";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { cn } from "@/lib/utils";

export function UserPlaygroundList({
  organisationPublicId,
  playgrounds,
  charters,
}: {
  organisationPublicId: string;
  playgrounds: CharterPlaygroundListResponseItem[];
  charters: CharterListResponseItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedPlaygrounds, setSelectedPlaygrounds] = useState<string[]>([]);

  const chartersMap = charters.reduce((acc, charter) => {
    acc[charter.id] = charter;
    return acc;
  }, {} as Record<string, CharterListResponseItem>);

  if (playgrounds.length === 0) return null;

  const filteredPlaygrounds = playgrounds.filter((playground) => {
    return (
      playground.name.toLowerCase().includes(search.toLowerCase()) ||
      chartersMap[playground.charter_id]?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const togglePlayground = (publicId: string) => {
    setSelectedPlaygrounds((current) =>
      current.includes(publicId) ? current.filter((id) => id !== publicId) : [...current, publicId]
    );
  };

  return (
    <div>
      <div className="px-3 py-1 flex justify-between gap-1 mt-1 bg-background items-center">
        <h3 className="text-lg font-semibold bg-background">Saved Queries</h3>
        <div className="flex flex-row gap-2 relative h-[50px] items-center">
          <Input
            placeholder="Search by Query Name"
            className="w-full pr-7"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <LuSearch className="absolute right-2 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      <div className="px-3 py-1">
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-[50px] pl-4 pt-1">
                  <Checkbox
                    checked={
                      filteredPlaygrounds.length > 0 &&
                      filteredPlaygrounds.every((p) => selectedPlaygrounds.includes(p.public_id))
                    }
                    onCheckedChange={(checked) => {
                      setSelectedPlaygrounds(checked ? filteredPlaygrounds.map((p) => p.public_id) : []);
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Query</TableHead>
                <TableHead className="w-40">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaygrounds?.map((playground) => {
                const highlightedCode = Prism.highlight(playground.query!, Prism.languages.sql, "sql");

                return (
                  <TableRow className={cn("h-16")} key={playground.public_id}>
                    <TableCell className="pl-4 pt-3">
                      <Checkbox
                        checked={selectedPlaygrounds.includes(playground.public_id)}
                        onCheckedChange={() => togglePlayground(playground.public_id)}
                      />
                    </TableCell>
                    <TableCell className="min-w-52">
                      <Link
                        href={`/organisation/${organisationPublicId}/charters/${playground.charter_id}/playground/${playground.public_id}`}
                        className="hover:underline"
                      >
                        {playground.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {playground.query ? (
                        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} className="line-clamp-4"></code>
                      ) : (
                        <div className="text-muted-foreground">No query</div>
                      )}
                    </TableCell>
                    <TableCell>{formatDateForDisplay(playground.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
