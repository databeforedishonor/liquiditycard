"use client"

import { useWallet, WalletButton } from "@vechain/dapp-kit-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WalletConnection() {
  const { account, source, disconnect } = useWallet()

  if (account) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Connected Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Account</p>
            <p className="font-mono text-sm break-all">
              {account}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Source</p>
            <p className="text-sm capitalize">
              {source || 'Unknown'}
            </p>
          </div>
          <Button 
            onClick={disconnect} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <WalletButton />
      </CardContent>
    </Card>
  )
} 