'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ScrollArea } from "../components/ui/scroll-area"
import { Badge } from "../components/ui/badge"
import { useAtomValue } from 'jotai'
import { currencyAtom } from './Home'
import { Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface NewsItem {
  text: string
  sentiment: string
  sentiment_score: number
}

interface RiskExposure {
  buy_volume_usd: string
  sell_volume_usd: string
  net_exposure: string
}

interface CurrencySentiment {
  currency: string
  predicted_price: number
  daily_high: number
  daily_low: number
  sentiment: string
  company_name: string
  news_items: NewsItem[]
  total_news: number
  overall_sentiment: string
  average_sentiment_score: number
  risk_assesment: string
  risk_exposure: RiskExposure
}

const RiskExposureChart: React.FC<{ data: RiskExposure }> = ({ data }) => {
  const chartData = [
    { name: 'Buy Volume', value: parseFloat(data.buy_volume_usd), color: '#3b82f6' },
    { name: 'Sell Volume', value: parseFloat(data.sell_volume_usd), color: '#ef4444' },
    { name: 'Net Exposure', value: parseFloat(data.net_exposure), color: '#d946ef' },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip 
          formatter={(value, name, props) => [`$${value.toLocaleString()}`, props.payload.name]}
          labelFormatter={() => ''}
        />
        <Bar dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const TradingViewWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          [
            "Apple",
            "AAPL|1D"
          ],
          [
            "Google",
            "GOOGL|1D"
          ],
          [
            "Microsoft",
            "MSFT|1D"
          ],
          [
            "CAPITALCOM:GOLD|1D"
          ]
        ],
        "chartOnly": false,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "colorTheme": "dark",
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "10",
        "noTimeScale": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": "#2962FF",
        "maLineWidth": 1,
        "maLength": 9,
        "headerFontSize": "medium",
        "lineWidth": 2,
        "lineType": 0,
        "dateRanges": [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ]
      }`;
    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default function CurrencyDetails() {
  const [searchParams] = useSearchParams()
  const currency = searchParams.get('currency')
  const [details, setDetails] = useState<CurrencySentiment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currencyArr = useAtomValue(currencyAtom)

  useEffect(() => {
    const fetchCurrencyDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const currDetails = currencyArr.find((item) => item.currency === currency)
        if (currDetails) {
          setDetails(currDetails)
        } else {
          setError('Currency details not found')
        }
      } catch (error) {
        console.error('Error fetching currency details:', error)
        setError('Failed to fetch currency details')
      } finally {
        setIsLoading(false)
      }
    }

    if (currency) {
      fetchCurrencyDetails()
    } else {
      setError('No currency specified')
      setIsLoading(false)
    }
  }, [currency, currencyArr])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (error || !details) {
    return <div className="flex justify-center items-center h-screen">{error || 'Currency details not found'}</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">{details.currency} Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <TradingViewWidget />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price and Sentiment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold mb-2">${details.predicted_price.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">Predicted Price</p>
            </div>
            <div className="mb-4 flex justify-between">
              <div>
                <p className="font-semibold">${details.daily_high.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Daily High</p>
              </div>
              <div>
                <p className="font-semibold">${details.daily_low.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Daily Low</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xl font-bold mb-2">{details.overall_sentiment}</p>
              <p className="text-sm text-muted-foreground">Overall Sentiment</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">{details.average_sentiment_score.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Average Sentiment Score</p>
            </div>
            <div>
              <p className="font-semibold">{details.total_news}</p>
              <p className="text-sm text-muted-foreground">Total News Articles</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs defaultValue="news-sentiment">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="news-sentiment">News Sentiment</TabsTrigger>
              <TabsTrigger value="risk-exposure">Risk Exposure</TabsTrigger>
            </TabsList>
            <TabsContent value="news-sentiment" className="p-4">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="flex flex-wrap gap-2">
                  {details.news_items && details.news_items.length > 0 ? (
                    details.news_items.map((item, index) => (
                      <Badge
                        key={index}
                        variant={item.sentiment === 'positive' ? 'default' : item.sentiment === 'negative' ? 'destructive' : 'secondary'}
                        className="py-2 px-4 text-sm whitespace-normal text-left max-w-full"
                      >
                        {item.text}
                        <span className="block mt-1 text-xs opacity-70">
                          Sentiment: {item.sentiment} ({item.sentiment_score.toFixed(2)})
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <p>No news items available.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="risk-exposure" className="p-4">
              <p className="font-semibold mb-2">Risk Assessment:</p>
              <p className="mb-4">{details.risk_assesment}</p>
              <p className="font-semibold mb-2">Volume and Exposure:</p>
              {details.risk_exposure ? (
                <RiskExposureChart data={details.risk_exposure} />
              ) : (
                <p>No risk exposure data available.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}