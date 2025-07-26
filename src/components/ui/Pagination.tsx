'use client';

import {
  Group,
  Text,
  Pagination as MantinePagination,
  Stack,
  Paper,
  Flex,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPrevious,
  onNext
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Stack gap="md">
        {/* Mobile View */}
        <Group justify="space-between" hiddenFrom="sm">
          <ActionIcon
            onClick={onPrevious}
            disabled={currentPage === 1}
            variant="light"
            color="white"
            size="lg"
            radius="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>

          <Badge
            size="lg"
            variant="light"
            color="white"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {currentPage} / {totalPages}
          </Badge>

          <ActionIcon
            onClick={onNext}
            disabled={currentPage === totalPages}
            variant="light"
            color="white"
            size="lg"
            radius="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>

        {/* Desktop View */}
        <Group justify="space-between" visibleFrom="sm">
          <Flex align="center" gap="sm">
            <Text
              size="sm"
              c="white"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                fontWeight: 500,
              }}
            >
              Showing
            </Text>
            <Badge
              variant="light"
              color="white"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {startItem} - {endItem}
            </Badge>
            <Text
              size="sm"
              c="white"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                fontWeight: 500,
              }}
            >
              of {totalItems.toLocaleString()} results
            </Text>
          </Flex>

          <Group gap="xs" align="center">
            <ActionIcon
              onClick={onPrevious}
              disabled={currentPage === 1}
              variant="light"
              color="white"
              size="md"
              radius="md"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>

            <MantinePagination
              value={currentPage}
              onChange={onPageChange}
              total={totalPages}
              siblings={1}
              boundaries={1}
              size="sm"
              radius="md"
              styles={{
                control: {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',

                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },

                  '&[data-active]': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  },

                  '&[data-disabled]': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            />

            <ActionIcon
              onClick={onNext}
              disabled={currentPage === totalPages}
              variant="light"
              color="white"
              size="md"
              radius="md"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Additional Info */}
        <Group justify="center" gap="xl" visibleFrom="md">
          <Flex align="center" gap="xs">
            <Text size="xs" c="rgba(255, 255, 255, 0.8)" fw={500}>
              Items per page:
            </Text>
            <Badge
              size="sm"
              variant="light"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {itemsPerPage}
            </Badge>
          </Flex>

          <Flex align="center" gap="xs">
            <Text size="xs" c="rgba(255, 255, 255, 0.8)" fw={500}>
              Total pages:
            </Text>
            <Badge
              size="sm"
              variant="light"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {totalPages}
            </Badge>
          </Flex>
        </Group>
      </Stack>
    </Paper>
  );
}