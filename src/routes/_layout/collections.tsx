import {
  Container,
  EmptyState,
  Flex,
  Heading,
  VStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiFolder } from "react-icons/fi";
import { z } from "zod";

import { CollectionService } from "../../client/services/CollectionService";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";
import AddCollection from "../../components/Collections/AddCollection";
import EditCollection from "../../components/Collections/EditCollection";
import DeleteCollection from "../../components/Collections/DeleteCollection";
import ViewCollection from "../../components/Collections/ViewCollection";
import useAuth from "../../hooks/useAuth";

const collectionsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 10;

function getCollectionsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      CollectionService.getAllCollections(
        (page - 1) * PER_PAGE,
        PER_PAGE
      ),
    queryKey: ["collections", { page }],
  };
}

export const Route = createFileRoute("/_layout/collections")({
  component: Collections,
  validateSearch: (search) => collectionsSearchSchema.parse(search),
});

function CollectionsTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();
  const { user } = useAuth();

  const { data: collections, isLoading, isPlaceholderData } = useQuery({
    ...getCollectionsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (!collections || collections.length === 0) {
    return (
      <>
        <AddCollection />
        
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiFolder />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Non hai ancora collezioni</EmptyState.Title>
              <EmptyState.Description>
                Aggiungi una nuova collezione per iniziare
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </>
    );
  }

  return (
    <>
      <AddCollection />
      
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Frasi</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => {
              // Get the Italian translation or first available
              const translation = collection.translations && collection.translations.length > 0
                ? collection.translations.find(t => t.language_code === "it") || collection.translations[0]
                : null;
              
              return (
                <tr key={collection.id} style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
                  <td style={{ padding: '8px' }}>
                    <Flex alignItems="center">
                      <Box 
                        bg={collection.color || "blue.500"} 
                        w="16px" 
                        h="16px" 
                        borderRadius="md" 
                        mr={2}
                      />
                      <Text>
                        {collection.name_custom || translation?.name || "Senza nome"}
                      </Text>
                    </Flex>
                  </td>
                  <td style={{ padding: '8px' }}>
                    {collection.phrase_count || 0}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Flex gap={2}>
                      <ViewCollection collection={collection} />
                      
                      {(user?.is_superuser || user?.id === collection.user_id) && (
                        <>
                          <EditCollection collection={collection} />
                          <DeleteCollection collection={collection} />
                        </>
                      )}
                    </Flex>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={collections.length}
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

function Collections() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Gestione Collezioni
      </Heading>
      <CollectionsTable />
    </Container>
  );
}
