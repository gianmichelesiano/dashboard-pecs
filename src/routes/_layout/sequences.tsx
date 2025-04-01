import React from "react";
import AddSequenceGroup from "@/components/Sequences/AddSequenceGroup";
import { SequenceGroupActionsMenu } from "@/components/Common/SequenceGroupActionsMenu";
import {
  Button,
  Container,
  EmptyState,
  Flex,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { SequenceService } from "@/client/services/SequenceService";
import { FaPlus } from "react-icons/fa";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";

const sequencesSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getSequenceGroupsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      SequenceService.readSequenceGroups({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["sequenceGroups", { page }],
  };
}

export const Route = createFileRoute("/_layout/sequences")({
  component: Sequences,
  validateSearch: (search) => sequencesSearchSchema.parse(search),
});

function SequenceGroupsTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getSequenceGroupsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const groups = data ?? [];
  const count = groups.length;

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (groups.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Non hai ancora gruppi di sequenze</EmptyState.Title>
            <EmptyState.Description>
              Aggiungi un nuovo gruppo per iniziare
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Colore</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Icona</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} style={{ opacity: isPlaceholderData ? 0.5 : 1 }} data-testid={`sequence-group-${group.id}`}>
                <td style={{ padding: '8px' }}>
                  {group.name}
                </td>
                <td style={{ padding: '8px' }}>
                  <div
                    style={{
                      backgroundColor: group.color,
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  {group.icon === "" ? "(Nessuna icona)" : group.icon}
                </td>
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="ghost"
                      onClick={() => navigate({
                        to: "/group-sequences",
                        search: { groupId: group.id }
                      })}
                    >
                      <FaPlus fontSize="16px" />
                      Sequenze
                    </Button>
                    <SequenceGroupActionsMenu group={group} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function Sequences() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Gestione Sequenze
      </Heading>
      <AddSequenceGroup />
      <SequenceGroupsTable />
    </Container>
  );
}
