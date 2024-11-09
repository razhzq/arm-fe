import React, { useState, useEffect, useCallback, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ScrollArea } from "../components/ui/scroll-area"
import { Badge } from "../components/ui/badge"
import { useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import axios from 'axios'
import { currencyAtom } from './Home'
import { TradingViewWidget } from './widget/TradingView'

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
  risk_assessment: string
  risk_exposure: RiskExposure
}

const RiskExposureChart = memo<{ data: RiskExposure }>(({ data }) => {
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
})

RiskExposureChart.displayName = 'RiskExposureChart'


// const TradingViewWidget = memo(() => {
//   useEffect(() => {
//     const script = document.createElement("script")
//     script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
//     script.type = "text/javascript"
//     script.async = true
//     script.innerHTML = JSON.stringify({
//       symbols: [
//         ["Apple", "AAPL|1D"],
//         ["Google", "GOOGL|1D"],
//         ["Microsoft", "MSFT|1D"],
//         ["CAPITALCOM:GOLD|1D"]
//       ],
//       chartOnly: false,
//       width: "100%",
//       height: "100%",
//       locale: "en",
//       colorTheme: "dark",
//       autosize: true,
//       showVolume: false,
//       showMA: false,
//       hideDateRanges: false,
//       hideMarketStatus: false,
//       hideSymbolLogo: false,
//       scalePosition: "right",
//       scaleMode: "Normal",
//       fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
//       fontSize: "10",
//       noTimeScale: false,
//       valuesTracking: "1",
//       changeMode: "price-and-percent",
//       chartType: "area",
//       lineWidth: 2,
//       lineType: 0,
//       dateRanges: [
//         "1d|1",
//         "1m|30",
//         "3m|60",
//         "12m|1D",
//         "60m|1W",
//         "all|1M"
//       ]
//     })

//     const container = document.getElementById('tradingview-widget')
//     if (container) {
//       container.appendChild(script)
//     }

//     return () => {
//       if (container && script.parentNode === container) {
//         container.removeChild(script)
//       }
//     }
//   }, [])

//   return (
//     <div id="tradingview-widget" className="tradingview-widget-container h-full">
//       <div className="tradingview-widget-container__widget h-full"></div>
//     </div>
//   )
// })

// TradingViewWidget.displayName = 'TradingViewWidget'

export default function CurrencyDetails() {
  const [searchParams] = useSearchParams()
  const currency = searchParams.get('currency')
  const [details, setDetails] = useState<CurrencySentiment | null>(null)
  const [exposure, setExposure] = useState<RiskExposure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currencyArr = useAtomValue(currencyAtom)

  const fetchRiskExposure = useCallback(async (asset: string, price: number) => {
    try {
      const { data } = await axios.post("http://localhost:8080/riskexposure", { asset, price })
      setExposure(data.data)
    } catch (error) {
      console.error('Error fetching risk exposure:', error)
    }
  }, [])

  useEffect(() => {
    const fetchCurrencyDetails = async () => {
      if (!currency) {
        setError('No currency specified')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const currDetails = currencyArr.find((item) => item.currency === currency)
        if (currDetails) {
          setDetails(currDetails)
          await fetchRiskExposure(currDetails.currency, currDetails.daily_high)
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

    fetchCurrencyDetails()
  }, [currency, currencyArr, fetchRiskExposure])

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
        <Card>
          <CardContent>
            <TradingViewWidget className="h-full w-full" symbol={details.currency.replace("/", "")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">${details.predicted_price.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground">Predicted Price</p>
            <p className="text-2xl font-bold mb-2">{details.overall_sentiment}</p>
            <p className="text-sm text-muted-foreground mb-4">Overall Sentiment</p>
            <p className="font-semibold">{details.average_sentiment_score.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mb-4">Average Sentiment Score</p>
            <p className="font-semibold">{details.total_news}</p>
            <p className="text-sm text-muted-foreground">Total News Articles</p>
            <div className="mt-4 flex justify-between">
              <div>
                <p className="font-semibold">${details.daily_high.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Daily High</p>
              </div>
              <div>
                <p className="font-semibold">${details.daily_low.toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Daily Low</p>
              </div>
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
              <p className="mb-4">{details.risk_assessment}</p>
              <p className="font-semibold mb-2">Volume and Exposure:</p>
              {exposure ? (
                <RiskExposureChart data={exposure} />
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