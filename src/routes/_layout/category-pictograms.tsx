import React from "react";
import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import { PictogramService } from "../../client/services/PictogramService";
import { CategoryService } from "../../client/services/CategoryService";
import AddPictogram from "../../components/Pictograms/AddPictogram";
import { PictogramActionsMenu } from "../../components/Common/PictogramActionsMenu";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";

const categoryPictogramsSearchSchema = z.object({
  categoryId: z.string(),
  page: z.number().catch(1),
});

const PER_PAGE = 10;

function getPictogramsQueryOptions({ categoryId, page }: { categoryId: string; page: number }) {
  return {
    queryFn: () =>
      PictogramService.readPictograms({
        category_id: categoryId,
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["pictograms", { categoryId, page }],
  };
}

function getCategoryQueryOptions({ categoryId }: { categoryId: string }) {
  return {
    queryFn: () => CategoryService.readCategory({ id: categoryId }),
    queryKey: ["category", categoryId],
  };
}

export const Route = createFileRoute("/_layout/category-pictograms")({
  component: CategoryPictograms,
  validateSearch: (search) => categoryPictogramsSearchSchema.parse(search),
});

function PictogramsGrid() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { categoryId, page } = Route.useSearch();

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    ...getCategoryQueryOptions({ categoryId }),
  });

  const { data: pictogramsData, isLoading: isPictogramsLoading } = useQuery({
    ...getPictogramsQueryOptions({ categoryId, page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  console.log("Raw pictograms data:", pictogramsData);
  
  // Gestisci sia il caso in cui pictogramsData è un array che il caso in cui ha una proprietà data
  const pictograms = Array.isArray(pictogramsData) 
    ? pictogramsData.slice(0, PER_PAGE) 
    : (pictogramsData?.data?.slice(0, PER_PAGE) ?? []);
  
  // Gestisci sia il caso in cui count esiste che il caso in cui dobbiamo usare la lunghezza dell'array
  const count = pictogramsData?.count ?? (Array.isArray(pictogramsData) ? pictogramsData.length : 0);
  
  console.log("Pictograms data:", pictograms);
  console.log("Pictograms count:", count);

  if (isCategoryLoading || isPictogramsLoading) {
    return <div>Caricamento in corso...</div>;
  }

  if (pictograms.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Nessun pittogramma in questa categoria</EmptyState.Title>
            <EmptyState.Description>
              Aggiungi un nuovo pittogramma per iniziare
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
        {pictograms?.map((pictogram) => (
          <div key={pictogram.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src={pictogram.image_url}
              alt={pictogram.word}
              boxSize="120px"
              objectFit="contain"
              mb={3}
              onError={(e) => {
                // Utilizzo di placehold.co invece di via.placeholder.com
                e.currentTarget.src = "https://placehold.co/120x120/e2e8f0/718096?text=Immagine+non+disponibile";
              }}
            />
            <Heading size="sm" mb={2}>{pictogram.word}</Heading>
            <PictogramActionsMenu pictogram={pictogram} />
          </div>
        ))}
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

function CategoryPictograms() {
  const { categoryId } = Route.useSearch();
  const { data: categoryData, isLoading } = useQuery({
    ...getCategoryQueryOptions({ categoryId }),
  });

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  const categoryName = categoryData?.name || "Categoria";

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" pt={12}>
        <Heading size="lg">
          Pittogrammi: {categoryName}
        </Heading>
        <Link
          to="/categories"
          style={{
            padding: '8px 16px',
            backgroundColor: '#718096',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Torna alle Categorie
        </Link>
      </Flex>
      <AddPictogram categoryId={categoryId} />
      <PictogramsGrid />
    </Container>
  );
}