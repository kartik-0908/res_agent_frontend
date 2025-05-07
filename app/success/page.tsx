'use client';

import { useEffect, useState, ReactElement } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react'
import { useSession } from 'next-auth/react';

type Status = 'loading' | 'succeeded' | 'failed';

export default function WrappedSuccessPage() {
    return (
        <Suspense fallback={null}>
            <SuccessPage />
        </Suspense>
    )
}

function SuccessPage(): ReactElement {
    const { update } = useSession();
    const [status, setStatus] = useState<Status>('loading');
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const router = useRouter();

    useEffect(() => {
        if (sessionId) {
            fetchSessionStatus();
        }
    }, [sessionId]);

    async function fetchSessionStatus() {
        setStatus('loading');
        try {
            const res = await fetch('/api/check-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
            const { session, error } = await res.json();
            if (error || !session) throw new Error(error || 'No session data');
            setStatus('succeeded');
            update({ ...session, user: { ...session.user, type: 'subscriber' } });
        } catch {
            setStatus('failed');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            {status === 'loading' && (
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center space-y-4 py-8">
                        <Loader2 className="animate-spin h-10 w-10" />
                        <p className="text-center">Processing your subscription…</p>
                    </CardContent>
                </Card>
            )}

            {status === 'failed' && (
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle>
                            <XCircle className="inline-block h-8 w-8 mr-2" />
                            Subscription Failed
                        </CardTitle>
                        <CardDescription>
                            We couldn’t process your subscription. Please try again.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button onClick={fetchSessionStatus}>Retry</Button>
                    </CardFooter>
                </Card>
            )}

            {status === 'succeeded' && (
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle>
                            <CheckCircle2 className="inline-block h-8 w-8 mr-2" />
                            Subscription Successful!
                        </CardTitle>
                        <CardDescription>
                            A confirmation email has been sent.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => router.push('/')}>Go to Home</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
