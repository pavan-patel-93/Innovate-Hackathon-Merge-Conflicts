"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Column structure
// {
//   key: string,
//   label: string,
//   sortable?: boolean,
//   render?: (value, row) => React.ReactNode,
//   className?: string
// }

// DataTable props structure
// {
//   data: any[],
//   columns: Column[],
//   searchable?: boolean,
//   searchPlaceholder?: string,
//   onEdit?: (row) => void,
//   onDelete?: (row) => void,
//   loading?: boolean,
//   emptyMessage?: string,
//   className?: string
// }

export function DataTable({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = "No data available",
  className
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Search */}
        {searchable && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Table */}
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">
              {searchTerm ? "No matching results found" : emptyMessage}
            </p>
            <p className="text-sm">
              {searchTerm ? "Try adjusting your search terms" : "Data will appear here when available"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "text-left py-4 px-6 font-semibold text-gray-900 dark:text-white",
                        column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                        column.className
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.label}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="py-4 px-6">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(row)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label={`Edit ${row.name || row.title || "item"}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(row)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              aria-label={`Delete ${row.name || row.title || "item"}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
