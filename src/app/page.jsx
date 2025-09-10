import Image from "next/image";
import CurrencyConverter from "./components/CurrencyConverter";
import { ModeToggle } from "./components/ModeToggle";

export default function Home() {
  return (
    <div>
      <ModeToggle />
      <CurrencyConverter />
    </div>
  );
}
