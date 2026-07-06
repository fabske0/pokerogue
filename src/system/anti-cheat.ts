import { VoucherType } from "./voucher";

const antiCheatVoucherCounts: Record<VoucherType, number> = {
  [VoucherType.REGULAR]: 0,
  [VoucherType.PLUS]: 0,
  [VoucherType.PREMIUM]: 0,
  [VoucherType.GOLDEN]: 0,
};

/**
 * Check if the new voucher count is consistent with the expected count.
 * @param voucherType - The type of voucher being checked
 * @param newCount - The new count of vouchers
 * @param diff - The difference between the previous count and the new count
 * @returns The expected count if it differs from the new count, otherwise null
 */
export function checkCheatedVouchers(voucherType: VoucherType, newCount: number, diff: number): number | null {
  const expectedCount = antiCheatVoucherCounts[voucherType] + diff;
  if (expectedCount !== newCount) {
    antiCheatVoucherCounts[voucherType] = expectedCount;
    return expectedCount;
  }
  antiCheatVoucherCounts[voucherType] = expectedCount;
  return null;
}
