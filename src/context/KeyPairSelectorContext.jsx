import { createContext, useContext, useMemo, useState } from "react";

export const KeyPairSelectorContext = createContext(null);

export const KeyPairSelectorProvider = ({ children }) => {
  const [isAllSelectActive, setIsAllSelectActive] = useState(false);
  const [explicitSelectedMap, setExplicitSelectedMap] = useState(new Map());
  const [explicitUnselectedSet, setExplicitUnselectedSet] = useState(new Set());
  const [totalSelectedItem, setTotalSelectedItem] = useState(0);

  const selectedData = useMemo(() => {
    return Array.from(explicitSelectedMap.values());
  }, [explicitSelectedMap]);

  const unSelectedData = useMemo(() => {
    return Array.from(explicitUnselectedSet.values());
  }, [explicitUnselectedSet]);

  const handleAdd = ({ key, value }) => {
    setExplicitSelectedMap((prev) => {
      const map = new Map(prev);
      map.set(key, value);
      return map;
    });
  };

  const handleSelectAll = (totalItems = 0) => {
    setExplicitSelectedMap(new Map());
    setExplicitUnselectedSet(new Set());

    if(!isAllSelectActive || (isAllSelectActive && explicitUnselectedSet.size)){
      setIsAllSelectActive(true)
      setTotalSelectedItem(totalItems)
      return
    }

    if(isAllSelectActive && !explicitUnselectedSet.size){
      setIsAllSelectActive(false)
      setTotalSelectedItem(0)
      return
    }
  };

  const handleSelect = ({ key, value }) => {
    if (isAllSelectActive) {
      setExplicitUnselectedSet((prev) => {
        const set = new Set(prev);
        set.has(key) ? set.delete(key) : set.add(key);
        return set;
      });
    } else {
      setExplicitSelectedMap((prev) => {
        const map = new Map(prev);
        map.has(key) ? map.delete(key) : map.set(key, value);
        return map;
      });
    }
  };

  const handleRemove = (key) => {
    setExplicitSelectedMap((prev) => {
      const map = new Map(prev);
      map.delete(key);
      return map;
    });
  };

  const isSelected = (id) => {
    if (isAllSelectActive) {
      return !explicitUnselectedSet.has(id);
    }
    return explicitSelectedMap.has(id);
  };





  const clear = () => {
    setIsAllSelectActive(false);
    setTotalSelectedItem(0);
    setExplicitSelectedMap(new Map());
    setExplicitUnselectedSet(new Set());
  };

  const isAllSelected = isAllSelectActive && !explicitUnselectedSet.size;

  const size = isAllSelectActive
    ? totalSelectedItem - explicitUnselectedSet.size
    : explicitSelectedMap.size;

  const value = {
    isAllSelectActive,
    isAllSelected,
    selectedData, // array for UI
    unSelectedData,
    explicitSelectedMap, // map for power users
    explicitUnselectedSet,
    size,
    handleSelectAll,
    handleSelect,
    handleAdd,
    isSelected,
    handleRemove,
    clear,
  };

  return (
    <KeyPairSelectorContext.Provider value={value}>
      {children}
    </KeyPairSelectorContext.Provider>
  );
};

export const useKeyPairSelector = () => {
  const context = useContext(KeyPairSelectorContext);

  if (!context) return null;

  return context;
};
