"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LoadingState() {
  return (
    <Card className="w-full max-w-md mx-auto border-gray-200 shadow-md">
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading tokens...</p>
        </div>
      </CardContent>
    </Card>
  )
} 