import UssdSimulator from "@/components/ussd-simulator";

export default function UssdPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">USSD Interaction Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          This is a visual simulation of how workers can interact with Mkononi Connect using a standard USSD menu on any mobile phone. No internet required.
        </p>
      </header>
      <UssdSimulator />
    </div>
  );
}
