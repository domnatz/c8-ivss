import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchForm } from "@/components/user/search-form";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export type Tags = {
  tag_id: number;
  file_id: number; // Foreign key referencing Masterlist.file_id
  tag_type: "classified" | "unclassified"; // Classification field
  tag_name: string;
  tag_data: Record<string, unknown>; // JSON data type
};

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
}

export function TagDetails({ onAddTag }: TagDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tags[]>([]);
  const [fileId, setFileId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the latest uploaded masterlist
    fetch(`http://localhost:8000/masterlist/latest`)
      .then((response) => response.json())
      .then((data) => {
        setFileId(data.file_id);
      })
      .catch((error) => console.error("Error fetching latest masterlist:", error));
  }, []);

  useEffect(() => {
    if (fileId) {
      fetch(`http://localhost:8000/tags/${fileId}`)
        .then((response) => response.json())
        .then((data) => setTags(data))
        .catch((error) => console.error("Error fetching tags:", error));
    }
  }, [fileId]);

  const filteredTags = tags.filter((tag) => tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><PlusCircleIcon className="h-5 w-5"/>Add Tag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add raw tags</DialogTitle>
          <DialogDescription>
            Please select a tag to add to the subgroup
          </DialogDescription>
        </DialogHeader>

        <SearchForm value={searchQuery} onInputChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter tags..." />

        <div className="overflow-auto max-h-[300px]">
          {filteredTags.map((tag) => (
            <span key={tag.tag_id} className="border-b flex flex-row justify-between">
              <div className="p-2">{tag.tag_name}</div>
              <div className="p-2">
                <Button size="sm" variant="ghost" onClick={() => onAddTag(tag)}>
                  <PlusCircleIcon className="w-5 h-5" />
                  Add
                </Button>
              </div>
            </span>
          ))}
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}