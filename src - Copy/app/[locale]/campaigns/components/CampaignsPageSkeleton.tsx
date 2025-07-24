// src/app/[locale]/campaigns/components/CampaignsPageSkeleton.tsx
import { Stack, Skeleton, SimpleGrid, Group } from '@mantine/core';

export default function CampaignsPageSkeleton() {
  return (
    <Stack gap="xl">
      {/* Stats skeleton */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={100} radius="md" />
        ))}
      </SimpleGrid>

      {/* Actions skeleton */}
      <Group justify="space-between">
        <Skeleton height={40} width={200} />
        <Group gap="xs">
          <Skeleton height={36} width={36} />
          <Skeleton height={36} width={120} />
        </Group>
      </Group>

      {/* Table skeleton */}
      <Stack gap="xs">
        <Skeleton height={40} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={60} />
        ))}
      </Stack>
    </Stack>
  );
}