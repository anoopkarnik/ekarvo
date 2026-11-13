import { Suspense } from 'react';
import PulseAdmin from '@/components/pulse/PulseAdmin';
export const dynamic='force-dynamic';
export default function Page(){return <Suspense><PulseAdmin/></Suspense>;}
