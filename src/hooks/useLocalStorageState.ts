import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorageState<T>(
  load: () => T,
  save: (value: T) => void,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(load);

  useEffect(() => {
    save(state);
  }, [state, save]);

  return [state, setState];
}
