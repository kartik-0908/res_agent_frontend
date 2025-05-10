import React, { useState, ReactElement } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { guestRegex } from '@/lib/constants';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import Link from "next/link";

type BillingCycle = "monthly" | "annual";

interface PricingInfo {
    actual: number;
    discounted: number;
    label: string;
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function Upgrade(): ReactElement {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const { data } = useSession();
    const isGuest = guestRegex.test(data?.user?.email ?? '');
    const pricing: Record<BillingCycle, PricingInfo> = {
        monthly: { actual: 40, discounted: 20, label: "$20 / mo" },
        annual: { actual: 200, discounted: 100, label: "$100 / yr" },
    };

    if (isGuest) {
        return (
            <Link href={'/login'}>
                <Button variant="outline" className="w-full">
                    Upgrade
                </Button>
            </Link>
        )
    }

    if(data?.user?.type === 'subscriber') {
        return (
            <Link href={'https://billing.stripe.com/p/login/00g03Ogjw3Iq7rW6oo'}>
                <Button variant="outline" className="w-full">
                    Managae Subscription
                </Button>
            </Link>
        )
    }

    const handleSubscribe = async () => {
        const stripe = await stripePromise;
        if (!stripe) {
            console.error("Stripe.js has not loaded yet.");
            return;
        }
        const priceId = billingCycle === "monthly" ? "price_1RLheBKurz4bH6ibaqkSAexq" : "price_1RLhtjKurz4bH6ibHjoXEa2z";
        const { sessionId } = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        }).then(res => res.json());
    
        const result = await stripe.redirectToCheckout({ sessionId });
    
        if (result.error) {
          console.error(result.error);
        }
      };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    Upgrade
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upgrade Your Plan</DialogTitle>
                    <DialogDescription>
                        Choose the plan that’s right for you. Paid plans unlock unlimited
                        messages and beta access to all features.
                    </DialogDescription>
                </DialogHeader>

                {/* Billing cycle toggle */}
                <div className="flex justify-center my-4">
                    <ToggleGroup
                        type="single"
                        value={billingCycle}
                        onValueChange={(value) => value && setBillingCycle(value as BillingCycle)}
                        className="bg-muted rounded p-1"
                    >
                        <ToggleGroupItem
                            value="monthly"
                            className="
      px-4 py-1 rounded
      text-muted-foreground               /* default text color */
      data-[state=on]:bg-primary         /* bg when selected */
      data-[state=on]:text-primary-foreground  /* white text when selected */
    "
                        >
                            Monthly
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="annual"
                            className="
      px-4 py-1 rounded
      text-muted-foreground
      data-[state=on]:bg-primary
      data-[state=on]:text-primary-foreground
    "
                        >
                            Annual
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Free Plan */}
                    <Card className="flex flex-col justify-between h-full">
                        <CardHeader>
                            <CardTitle>Free Plan</CardTitle>
                            <CardDescription>5 messages per day</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-2 mb-4">
                            <p className="text-2xl font-bold">$0 / mo</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                Select Free
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col justify-between h-full">
                        <CardHeader>
                            <CardTitle>Pro Plan</CardTitle>
                            <CardDescription>
                                Unlimited messages & beta access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 mt-2 mb-4">
                            <p className="text-sm line-through opacity-50">
                                {`$${pricing[billingCycle].actual} ${billingCycle === "monthly" ? "/ mo" : "/ yr"
                                    }`}
                            </p>
                            <p className="text-3xl font-extrabold">
                                {pricing[billingCycle].label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                50% off for early users
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSubscribe} className="w-full">Upgrade Now</Button>
                        </CardFooter>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
