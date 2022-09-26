import { getAddress } from "@ethersproject/address";
const ADDRESS_ALIAS_OFFSET = "0x1111000000000000000000000000000000001111";

export const addressAlias = (address: string, forward: boolean = true) => {
  const ADDRESS_ALIAS_OFFSET_BIG_INT = BigInt(ADDRESS_ALIAS_OFFSET);
  const ADDRESS_BIT_LENGTH = 160;
  const ADDRESS_NIBBLE_LENGTH = ADDRESS_BIT_LENGTH / 4;

  // we use BigInts in here to allow for proper under/overflow behaviour
  // BigInt.asUintN calculates the correct positive modulus
//   @ts-ignore
  return getAddress(
    "0x" +
      BigInt.asUintN(
        ADDRESS_BIT_LENGTH,
        forward
          ? BigInt(address) + ADDRESS_ALIAS_OFFSET_BIG_INT
          : BigInt(address) + ADDRESS_ALIAS_OFFSET_BIG_INT
      )
        .toString(16)
        .padStart(ADDRESS_NIBBLE_LENGTH, "0")
  );
};
