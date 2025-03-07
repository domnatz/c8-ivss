"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

// Unified tag interface that works with the backend
export interface Tags {
  tag_id: number;
  tag_name: string;
  description?: string;
  units?: string;
  file_id?: number;
  tag_type?: string;
  tag_data?: Record<string, unknown>;
}

// Mock tag data for development and testing
const mockTags: Tags[] = [
  {
    tag_id: 1,
    tag_name: "Temperature",
    description: "Temperature reading",
    units: "°C",
  },
  {
    tag_id: 2,
    tag_name: "Pressure",
    description: "Pressure reading",
    units: "kPa",
  },
  { tag_id: 3, tag_name: "Flow", description: "Flow rate", units: "m³/s" },
  { tag_id: 4, tag_name: "Level", description: "Fluid level", units: "m" },
  {
    tag_id: 5,
    tag_name: "Voltage",
    description: "Electrical voltage",
    units: "V",
  },
  {
    tag_id: 6,
    tag_name: "Current",
    description: "Electrical current",
    units: "A",
  },
  { tag_id: 7, tag_name: "Power", description: "Electrical power", units: "W" },
  {
    tag_id: 8,
    tag_name: "Frequency",
    description: "Electrical frequency",
    units: "Hz",
  },
  {
    tag_id: 9,
    tag_name: "Humidity",
    description: "Relative humidity",
    units: "%",
  },
  {
    tag_id: 10,
    tag_name: "Speed",
    description: "Rotational speed",
    units: "RPM",
  },
];

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
  buttonText?: string;
}

export function TagDetails({
  onAddTag,
  buttonText = "Add Tag",
}: TagDetailsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tags, setTags] = React.useState<Tags[]>(mockTags);
  const [loading, setLoading] = React.useState(false);

  // Fetch real tags from API if available
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        // Try to fetch tags from backend, fall back to mock tags if error
        const response = await fetch("http://localhost:8000/tags");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setTags(data);
            return;
          }
        }
        // If we get here, either the response wasn't ok or the data wasn't valid
        console.log("Using mock tag data instead of API data");
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = (tag: Tags) => {
    try {
      onAddTag(tag);
      setOpen(false);
      toast.success(`Tag "${tag.tag_name}" was added successfully`);
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Select tags to add to the selected subgroup
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading tags...
              </p>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag.tag_id}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{tag.tag_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {tag.units}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddTag(tag)}
                  >
                    Add
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No tags found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
