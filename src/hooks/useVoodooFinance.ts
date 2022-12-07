import { useContext } from 'react';
import { Context } from '../contexts/VoodooFinanceProvider';

const useVoodooFinance = () => {
  const { voodooFinance } = useContext(Context);
  return voodooFinance;
};

export default useVoodooFinance;
