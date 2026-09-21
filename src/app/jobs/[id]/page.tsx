import JobDetailClient from './JobDetailClient';
import { DataStore } from '@/lib/storage';

export function generateStaticParams() {
  const jobs = DataStore.getJobs();
  return jobs.map((job) => ({ id: job.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <JobDetailClient id={resolvedParams.id} />;
}
