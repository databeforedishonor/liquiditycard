import { Address } from "@vechain/sdk-core";
import { useThor } from "@vechain/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";

export const useVetBalance = (account: string) => {
  const thor = useThor();
  return useQuery({
    queryKey: ["vet-balance", account],
    queryFn: async () => {
      if (!account || !thor) return null;
      const accountData = await thor.accounts.getAccount(Address.of(account));
      return accountData;
    },
    enabled: !!account && !!thor,
  });
}; 