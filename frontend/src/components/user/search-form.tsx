import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

interface SearchFormProps extends React.ComponentProps<"form"> {
  value: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; // Add placeholder prop
}

export function SearchForm({
  value = "",
  onInputChange,
  placeholder = "Find Assets..", // Default placeholder
  ...props
}: SearchFormProps) {
  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0 px-0 h-full">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder={placeholder} // Use the placeholder prop
            className="pl-8"
            value={value}
            onChange={onInputChange}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}