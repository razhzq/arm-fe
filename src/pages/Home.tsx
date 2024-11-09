'use client'

import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { cn } from "../lib/utils"
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { atom, useAtom } from 'jotai'

export const currencyAtom = atom<CurrencySentiment[]>([]);

interface Currency {
  id: string
  name: string
  price: number
  status: 'bullish' | 'bearish'
  volume: number
}

const currencies: Currency[] = [
  { id: 'EURUSD', name: 'EUR/USD', price: 1.1234, status: 'bullish', volume: 1000000 },
  { id: 'GBPUSD', name: 'GBP/USD', price: 1.3456, status: 'bearish', volume: 750000 },
  { id: 'USDJPY', name: 'USD/JPY', price: 109.87, status: 'bullish', volume: 1200000 },
  { id: 'AUDUSD', name: 'AUD/USD', price: 0.7890, status: 'bearish', volume: 500000 },
  { id: 'USDCAD', name: 'USD/CAD', price: 1.2345, status: 'bullish', volume: 600000 },
  { id: 'USDCHF', name: 'USD/CHF', price: 0.9876, status: 'bearish', volume: 450000 },
  { id: 'NZDUSD', name: 'NZD/USD', price: 0.7123, status: 'bullish', volume: 300000 },
  { id: 'EURJPY', name: 'EUR/JPY', price: 130.45, status: 'bearish', volume: 800000 },
  { id: 'GBPJPY', name: 'GBP/JPY', price: 150.67, status: 'bullish', volume: 700000 },
  { id: 'EURGBP', name: 'EUR/GBP', price: 0.8765, status: 'bearish', volume: 550000 },
]

interface NewsItem {
  text: string
  sentiment: string
  sentiment_score: number
}

interface CurrencySentiment {
   currency: string
  predicted_price: number
  daily_high: number
  daily_low: number
  sentiment: string
  company_name: string
  news_item: NewsItem[]
  total_news: number
  overall_sentiment: string
  average_sentiment_score: number
  risk_assesment: string
}

interface CurrencyBoxProps {
  currency: CurrencySentiment
}

const CurrencyBox: React.FC<CurrencyBoxProps> = ({ currency }) => {
  const [amount, setAmount] = useState<string>('')

  const handleTrade = (action: 'Buy' | 'Short') => {
    alert(`${action} ${amount} ${currency.currency} at ${currency.daily_high}`)
    setAmount('')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{currency.currency}</span>
          <Badge variant={currency.sentiment === 'Neutral' ? 'default' : 'destructive'}>
            {currency.sentiment.toUpperCase()}
          </Badge>
        </div>
        <div className="text-2xl font-bold mb-2">{currency.daily_low.toFixed(4)}</div>
        {/* <div className="text-sm text-muted-foreground mb-4">Volume: {currency..toLocaleString()}</div> */}
        {/* <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24"
          />
          <Button size="sm" onClick={() => handleTrade('Buy')}>Buy</Button>
          <Button size="sm" variant="outline" onClick={() => handleTrade('Short')}>Short</Button>
        </div> */}
        <Button
          variant="link"
          asChild
          className="p-0 mt-4"
        >
          <Link to={`/currency?currency=${currency.currency}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ForexDashboard() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [overallCurrency, setOverallCurrency] = useAtom(currencyAtom);
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleCurrencySelect = (value: string) => {
    setSelectedCurrency(value)
    // You can add additional logic here, such as scrolling to the selected currency box
    // or highlighting it
  }

  const getSymbolsSentimentData = async () => {
    try {
      setIsLoading(true)
      const result = await axios.get("http://localhost:8080/symbols")
      setOverallCurrency(result.data.data)
      console.log(result.data)
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching symbol sentiment data:", error)
  }
}

  useEffect(() => {    
    getSymbolsSentimentData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-lg">Loading currency data...</span>
      </div>
    )
  }

  return (
    <div className={cn("container mx-auto p-4 max-w-6xl")}>
      <h1 className="text-2xl font-bold mb-6">Forex Risk Assessment</h1>
      <div className="mb-6">
        <Select onValueChange={handleCurrencySelect} value={selectedCurrency}>
          <SelectTrigger className={cn("w-full md:w-[300px]")}>
            <SelectValue placeholder="Search for a currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.id} value={currency.id}>
                {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overallCurrency.map((currency) => (
          <CurrencyBox key={currency.currency} currency={currency} />
        ))}
      </div>
    </div>
  )
}