import {
  Container,
  EmptyState,
  Flex,
  Heading,
  VStack,
  Box,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { PhraseService } from "../../client/services/PhraseService";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";
import AddPhrase from "../../components/Phrases/AddPhrase";
import DeletePhrase from "../../components/Phrases/DeletePhrase";

const phrasesSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getPhrasesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      PhraseService.getAllPhrases(
        (page - 1) * PER_PAGE,
        PER_PAGE
      ),
    queryKey: ["phrases", { page }],
  };
}

export const Route = createFileRoute("/_layout/phrases")({
  component: Phrases,
  validateSearch: (search) => phrasesSearchSchema.parse(search),
});

function PhrasesTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data: phrases, isLoading, isPlaceholderData } = useQuery({
    ...getPhrasesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });
  
  // Log phrases data for debugging
  console.log("Phrases data:", phrases);

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (!phrases || phrases.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Non hai ancora frasi</EmptyState.Title>
            <EmptyState.Description>
              Aggiungi una nuova frase per iniziare
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
              <th style={{ padding: '8px', textAlign: 'left' }}>Testo</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>PECS</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase) => {
              // Trova la traduzione nella lingua corrente o la prima disponibile
              const translation = phrase.translations && phrase.translations.length > 0
                ? phrase.translations[0]
                : null;
              
              return (
                <tr key={phrase.id} style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
                  <td style={{ padding: '8px' }}>
                    {translation ? translation.text : "Nessun testo"}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {phrase.pecs_items && phrase.pecs_items.length > 0 ? (
                      <Flex gap={2}>
                        {phrase.pecs_items.slice(0, 3).map((item) => (
                          <img 
                            key={item.pecs_id}
                            src={item.pecs_info?.image_url as string || ''}
                            alt={item.pecs_info?.name as string || ''}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'contain',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px'
                            }}
                          />
                        ))}
                        {phrase.pecs_items.length > 3 && (
                          <Flex 
                            alignItems="center" 
                            justifyContent="center"
                            width="40px"
                            height="40px"
                            bg="gray.100"
                            borderRadius="4px"
                            fontSize="sm"
                          >
                            +{phrase.pecs_items.length - 3}
                          </Flex>
                        )}
                      </Flex>
                    ) : (
                      "Nessun PECS"
                    )}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <DeletePhrase 
                        phraseId={phrase.id} 
                        phraseText={translation ? translation.text : ""}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={phrases.length}
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

function Phrases() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Gestione Frasi
      </Heading>
      <AddPhrase />
      <PhrasesTable />
    </Container>
  );
}
