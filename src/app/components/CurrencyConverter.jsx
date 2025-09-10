"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

// helper to build URL using a base currency
const getUrl = (base) =>
  `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/${base}`;

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrencies = async () => {
    try {
      // fetch list using USD as a base (just to get available currency codes)
      const response = await axios.get(getUrl("USD"));
      const currencyList = Object.keys(response.data.conversion_rates || {});
      setCurrencies(currencyList);
    } catch (error) {
      console.error("fetchCurrencies error:", error);
      toast.error(`Error getting exchange rates: ${error.message}`);
    }
  };

  const detectCurrency = async () => {
    try {
      const response = await axios.get("https://ipapi.co/json/");
      setFrom(response.data.currency || "USD");
    } catch (error) {
      console.error("detectCurrency error:", error);
      toast.error("Error detecting user location", { description: error.message });
    }
  };

  useEffect(() => {
    fetchCurrencies();
    detectCurrency();
  }, []);

  const getFlagUrl = (currency) => {
    const specialFlags = {
      XAF: "https://flagcdn.com/w40/cm.png",
      XCD: "https://flagcdn.com/w40/ag.png",
      XDR: "https://static.currencyrate.today/f/flags/xdr.svg",
      XOF: "https://currency.world/img/flags/tg.png",
      XPF: "https://flagpedia.net/data/flags/w580/pf.webp",
    };
    if (!currency) return "";
    return specialFlags[currency] || `https://flagcdn.com/w40/${currency.slice(0, 2).toLowerCase()}.png`;
  };

  const convertCurrency = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return toast.error("Enter a valid amount");

    if (!from) return toast.error("Select a source currency (From)");
    if (!to) return toast.error("Select a target currency (To)");

    setLoading(true);
    try {
      // Use the selected `from` currency as the base
      const response = await axios.get(getUrl(from));
      const rates = response.data.conversion_rates || {};
      const rate = rates[to];

      if (!rate) {
        toast.error("Rate not available for selected currency pair");
        console.error("Rates object:", rates);
        return;
      }

      console.log("Converting:", numericAmount, from, "to", to, "at rate", rate);
      setConvertedAmount((numericAmount * rate).toFixed(2));
    } catch (error) {
      console.error("convertCurrency error:", error);
      toast.error("Error converting currency", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFrom((prevFrom) => {
      setTo(prevFrom || to);
      return to || prevFrom;
    });
    // Note: we intentionally avoid calling setTo(from) directly because setFrom is async;
    // the above closure handles both.
  };

  return (
    <div className="px-6 py-20">
      <Card className="mx-auto max-w-4xl p-6 shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">Currency Converter</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="1"
            />

            <div className="flex justify-between gap-3">
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  {from && getFlagUrl(from) && (
                    <Image src={getFlagUrl(from)} alt={from} width={24} height={16} className="mr-2 inline-block object-contain" />
                  )}
                  <SelectValue>{from || "Select currency"}</SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {currencies.length > 0 ? (
                    currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {getFlagUrl(currency) && (
                          <Image src={getFlagUrl(currency)} alt={currency} width={24} height={16} className="mr-2 inline-block object-contain" />
                        )}
                        {currency}
                      </SelectItem>
                    ))
                  ) : (
                    <CardDescription>Loading....</CardDescription>
                  )}
                </SelectContent>
              </Select>

              <Button onClick={swapCurrencies} variant="outline">
                <ArrowLeft className="size-6" />
              </Button>

              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  {to && getFlagUrl(to) && (
                    <Image src={getFlagUrl(to)} alt={to} width={24} height={16} className="mr-2 inline-block object-contain" />
                  )}
                  <SelectValue>{to || "Select currency"}</SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {currencies.length > 0 ? (
                    currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {getFlagUrl(currency) && (
                          <Image src={getFlagUrl(currency)} alt={currency} width={24} height={16} className="mr-2 inline-block object-contain" />
                        )}
                        {currency}
                      </SelectItem>
                    ))
                  ) : (
                    <CardDescription>Loading....</CardDescription>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={convertCurrency} variant="default">
              {loading ? "Converting..." : "Convert"}
            </Button>

            {convertedAmount && (
              <CardDescription className="mt-12 text-center text-4xl font-normal text-neutral-800 dark:text-white">
                <span className="text-6xl font-bold">{amount}</span> {from} ={" "}
                <span className="text-6xl font-bold ml-2">{convertedAmount}</span> {to}
              </CardDescription>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
