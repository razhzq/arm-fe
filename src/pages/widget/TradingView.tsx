import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  width?: number;
  height?: number;
  locale?: string;
  dateRange?: string;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  autosize?: boolean;
  largeChartUrl?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  width = 350,
  height = 220,
  locale = 'en',
  dateRange = '12M',
  colorTheme = 'dark',
  isTransparent = false,
  autosize = false,
  largeChartUrl = ''
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      symbol,
      width: "100%",
      height : "375",
      locale,
      dateRange,
      colorTheme,
      isTransparent,
      autosize,
      largeChartUrl
    };

    script.innerHTML = JSON.stringify(config);

    if (container.current) {
      container.current.appendChild(script);
    }

    return () => {
      if (container.current) {
        const scriptElement = container.current.querySelector('script');
        if (scriptElement) {
          container.current.removeChild(scriptElement);
        }
      }
    };
  }, [symbol, width, height, locale, dateRange, colorTheme, isTransparent, autosize, largeChartUrl]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      
    </div>
  );
};