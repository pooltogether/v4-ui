import { BigNumber } from '@ethersproject/bignumber';

export const sortByBigNumber = (a: BigNumber, b: BigNumber) => {
    const aSubB = a.sub(b);
    if (aSubB.isZero()) return 0;
    if (aSubB.isNegative()) return -1;
    return 1;
};
