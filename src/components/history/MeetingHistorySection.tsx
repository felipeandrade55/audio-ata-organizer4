import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MeetingsList } from "../meeting/MeetingsList";
import { MeetingTypeFilter } from "../filters/MeetingTypeFilter";
import { Button } from "@/components/ui/button";
import type { MeetingMinutes } from "@/types/meeting";
import { DeleteMinutesDialog } from "../meeting/DeleteMinutesDialog";

interface MeetingHistorySectionProps {
  meetingSearch: string;
  setMeetingSearch: (value: string) => void;
  meetingType: string;
  setMeetingType: (value: string) => void;
  filteredMinutes: MeetingMinutes[];
  isLoading: boolean;
  error: Error | null;
}

export const MeetingHistorySection = ({
  meetingSearch,
  setMeetingSearch,
  meetingType,
  setMeetingType,
  filteredMinutes,
  isLoading,
  error
}: MeetingHistorySectionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMinutes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMinutes.map(minute => minute.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Histórico de Atas
          </h3>
          <MeetingTypeFilter 
            value={meetingType} 
            onValueChange={setMeetingType} 
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por título ou conteúdo..."
              value={meetingSearch}
              onChange={(e) => setMeetingSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {filteredMinutes.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-sm whitespace-nowrap"
                >
                  {selectedIds.length === filteredMinutes.length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
                <DeleteMinutesDialog
                  selectedIds={selectedIds}
                  onDeleteComplete={() => {
                    // Trigger a refetch in the parent component
                    window.location.reload();
                  }}
                  onClearSelection={() => setSelectedIds([])}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-3" />
          Carregando suas atas...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          Erro ao carregar atas: {error.message}
        </div>
      ) : (
        <MeetingsList 
          minutes={filteredMinutes} 
          selectedIds={selectedIds}
          onSelectMinute={(id) => {
            setSelectedIds(prev =>
              prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
            );
          }}
        />
      )}
    </div>
  );
};