"use client";

import { useEffect } from 'react';
import { initOtel } from '@/lib/otel-setup';

export default function OtelProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initOtel();
    }, []);

    return <>{children}</>;
}
