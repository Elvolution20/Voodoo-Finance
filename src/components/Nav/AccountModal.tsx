import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

import Label from '../Label';
import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import useVoodooFinance from '../../hooks/useVoodooFinance';
import TokenSymbol from '../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const voodooFinance = useVoodooFinance();

  const voodooBalance = useTokenBalance(voodooFinance.VOODOO);
  const displayVoodooBalance = useMemo(() => getDisplayBalance(voodooBalance), [voodooBalance]);

  const vshareBalance = useTokenBalance(voodooFinance.VSHARE);
  const displayVshareBalance = useMemo(() => getDisplayBalance(vshareBalance), [vshareBalance]);

  const vbondBalance = useTokenBalance(voodooFinance.VBOND);
  const displayVbondBalance = useMemo(() => getDisplayBalance(vbondBalance), [vbondBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="VOODOO" />
          <StyledBalance>
            <StyledValue>{displayVoodooBalance}</StyledValue>
            <Label text="VOODOO Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="VSHARE" />
          <StyledBalance>
            <StyledValue>{displayVshareBalance}</StyledValue>
            <Label text="VSHARE Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="VBOND" />
          <StyledBalance>
            <StyledValue>{displayVbondBalance}</StyledValue>
            <Label text="VBOND Available" />
          </StyledBalance>
        </StyledBalanceWrapper>
      </Balances>
    </Modal>
  );
};

const StyledValue = styled.div`
  //color: ${(props) => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

export default AccountModal;
