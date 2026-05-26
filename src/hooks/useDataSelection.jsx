import { useCallback, useEffect, useMemo, useState } from "react";

export const useDataSelection = ({ data, key }) => {
  const allData = useMemo(() => {
    return data?.length ? data?.map((s) => s[key]) : []
  }, [data, key]);

  const [selectedData, setSelectedData] = useState(new Set());

  useEffect(() => {
    setSelectedData(new Set(allData));
  }, [allData]);

  const handleSelect = useCallback((value) => {
    setSelectedData((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }

      return newSet;
    });
  }, []);

  const handleAllSelect = useCallback(() => {
    if (selectedData.size === allData.length) {
      setSelectedData(new Set([]));
    } else {
      setSelectedData(new Set(allData));
    }
  }, [selectedData, allData]);

  const isSelected = useCallback(
    (value) => {
      return selectedData.has(value);
    },
    [selectedData],
  );

  return {
    isAllSelected: allData?.length === selectedData.size,
    selectedData,
    selectedLength: selectedData.size,
    isSelected,
    handleSelect,
    handleAllSelect,
  };
};
